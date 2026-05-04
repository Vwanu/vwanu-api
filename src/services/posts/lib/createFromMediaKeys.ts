import { BadRequest, Forbidden, GeneralError } from '@feathersjs/errors';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

import { s3Client } from '../../../storage/s3';
import { Application } from '../../../declarations';

const PENDING_PREFIX = 'pending/';

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

const validateKeyOwnership = (key: string, userId: string): void => {
  if (typeof key !== 'string' || key.length === 0) {
    throw new BadRequest('mediaKey.key must be a non-empty string');
  }
  if (!key.startsWith(PENDING_PREFIX)) {
    throw new BadRequest(
      `mediaKey.key must start with '${PENDING_PREFIX}': ${key}`,
    );
  }
  // pending/{userId}/{uuid}.{ext}
  const segments = key.slice(PENDING_PREFIX.length).split('/');
  if (segments.length < 2) {
    throw new BadRequest(`Malformed mediaKey: ${key}`);
  }
  const keyOwner = segments[0];
  if (keyOwner !== String(userId)) {
    throw new Forbidden(
      `mediaKey ownership mismatch (key belongs to a different user)`,
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
  userId: string,
  bucket: string,
): Promise<ResolvedMedia[]> => {
  if (!bucket) {
    throw new GeneralError('S3_BUCKET_NAME is not configured');
  }
  return Promise.all(
    mediaKeys.map(async (item) => {
      validateKeyOwnership(item.key, userId);
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
