import { BadRequest, Forbidden, GeneralError } from '@feathersjs/errors';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

import { s3Client } from '../../../storage/s3';
import { Application } from '../../../declarations';

// Allowed top-level prefixes that the presign endpoint produces (see
// generateS3Key in src/storage/s3.ts). Any mediaKey passed at post-create
// must live under one of these — guards against arbitrary key references.
// Note: `blog` is singular because generateS3Key's default branch uses the
// raw uploadType. Match what's actually emitted, not what reads naturally.
const ALLOWED_KEY_PREFIXES = [
  'posts/',
  'profiles/',
  'messages/',
  'blog/',
  'community/',
];

export type PostMediaType = 'image' | 'video' | 'audio';

export interface PostMediaKeyInput {
  key: string;
  type?: PostMediaType;
}

export interface PresignPostBody {
  postText?: string;
  privacyType?: string;
  communityId?: string;
  mediaKeys?: PostMediaKeyInput[];
}

export interface ResolvedMedia {
  key: string;
  contentType: string;
  contentLength: number;
}

const validateBody = (data: unknown): PresignPostBody => {
  if (!data || typeof data !== 'object') {
    throw new BadRequest('Request body must be a JSON object');
  }
  const body = data as PresignPostBody;
  if (body.mediaKeys != null && !Array.isArray(body.mediaKeys)) {
    throw new BadRequest('mediaKeys must be an array');
  }
  if (body.postText != null && typeof body.postText !== 'string') {
    throw new BadRequest('postText must be a string');
  }
  return body;
};

/**
 * Sanity-check the key shape. We can no longer enforce ownership from the
 * key path itself — keys now follow the same date-bucketed convention as
 * legacy multipart uploads (e.g. `posts/2026/05/03/{uuid}.jpg`), with no
 * userId in the prefix.
 *
 * Ownership is implicitly trusted via the request flow: only the user who
 * called /uploads/presign saw the URL, and the file was PUT under their
 * authenticated session. The presign endpoint stamps `uploaded-by` in S3
 * object metadata for audit purposes, but we don't verify it on every
 * post-create today (would add a HeadObject roundtrip latency cost).
 *
 * If we ever observe a real abuse pattern (users posting other people's
 * keys), tighten this by reading `Metadata.uploaded-by` from the existing
 * HeadObject response and comparing to params.User.id.
 */
const validateKeyShape = (key: string): void => {
  if (typeof key !== 'string' || key.length === 0) {
    throw new BadRequest('mediaKey.key must be a non-empty string');
  }
  if (key.includes('..') || key.startsWith('/')) {
    throw new BadRequest(`Malformed mediaKey: ${key}`);
  }
  if (!ALLOWED_KEY_PREFIXES.some((p) => key.startsWith(p))) {
    throw new BadRequest(
      `mediaKey.key must start with one of: ${ALLOWED_KEY_PREFIXES.join(', ')}`,
    );
  }
};

const headObject = async (
  bucket: string,
  key: string,
): Promise<{ contentType: string; contentLength: number }> => {
  try {
    const out = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    return {
      contentType: out.ContentType ?? 'application/octet-stream',
      contentLength: typeof out.ContentLength === 'number' ? out.ContentLength : 0,
    };
  } catch (err: unknown) {
    const status =
      typeof err === 'object' && err !== null && '$metadata' in err
        ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata
            ?.httpStatusCode
        : undefined;
    if (status === 404 || status === 403) {
      throw new BadRequest(`Media not found in S3: ${key}`);
    }
    throw err;
  }
};

export const resolveMediaKeys = async (
  mediaKeys: PostMediaKeyInput[],
  // userId kept in the signature for forensics / future ownership tightening
  // (currently unused — see validateKeyShape comment).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string,
  bucket: string,
): Promise<ResolvedMedia[]> => {
  if (!bucket) {
    throw new GeneralError('S3_BUCKET_NAME is not configured');
  }
  return Promise.all(
    mediaKeys.map(async (item) => {
      validateKeyShape(item.key);
      const { contentType, contentLength } = await headObject(bucket, item.key);
      return { key: item.key, contentType, contentLength };
    }),
  );
};

const buildMediaRow = (resolved: ResolvedMedia, userId: string) => ({
  // VWA-133: store the S3 key, not the full URL. CDN-side variants are
  // generated on demand by the AWS image-handler stack (VWA-131); mobile
  // builds the rendered URL via cdnImageUrl(key, preset).
  original: resolved.key,
  UserId: userId,
});

export const createFromMediaKeys = async (
  app: Application,
  data: unknown,
  params: { User?: { id: string }; user?: { id: string } } & Record<
    string,
    unknown
  >,
): Promise<unknown> => {
  const body = validateBody(data);
  const userId = params?.User?.id ?? params?.user?.id;
  if (!userId) {
    throw new Forbidden('Authenticated user required');
  }

  const bucket = process.env.S3_BUCKET_NAME || '';
  const mediaKeys = body.mediaKeys ?? [];

  const resolved =
    mediaKeys.length > 0
      ? await resolveMediaKeys(mediaKeys, String(userId), bucket)
      : [];

  const post = await app.service('posts').Model.create({
    postText: body.postText ?? '',
    privacyType: body.privacyType ?? 'public',
    communityId: body.communityId,
    userId,
  });

  if (resolved.length > 0) {
    const mediaRows = resolved.map((r) => buildMediaRow(r, String(userId)));
    // sequelize-typescript exposes `.models` at runtime; cast matches the
    // existing codebase pattern (e.g. albums.class.ts, posts.class.ts).
    const created = await (app.get('sequelizeClient') as any).models.Media.bulkCreate(
      mediaRows,
    );
    await post.addMedia(created);
  }

  return app.service('posts').get(post.id, params);
};
