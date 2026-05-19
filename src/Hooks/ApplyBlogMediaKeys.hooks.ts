import { HookContext } from '@feathersjs/feathers';
import { BadRequest, GeneralError } from '@feathersjs/errors';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

import { s3Client } from '../storage/s3';

const ALLOWED_KEY_PREFIXES = [
  'posts/',
  'profiles/',
  'messages/',
  'blog/',
  'community/',
];

const validateKeyShape = (key: string, field: string): void => {
  if (typeof key !== 'string' || key.length === 0) {
    throw new BadRequest(`${field} must be a non-empty string`);
  }
  if (key.includes('..') || key.startsWith('/')) {
    throw new BadRequest(`Malformed ${field}: ${key}`);
  }
  if (!ALLOWED_KEY_PREFIXES.some((p) => key.startsWith(p))) {
    throw new BadRequest(
      `${field} must start with one of: ${ALLOWED_KEY_PREFIXES.join(', ')}`,
    );
  }
};

const headObject = async (bucket: string, key: string): Promise<void> => {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
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

/**
 * Before-hook for the blogs service. When a create/patch body contains
 * `titlePictureKey`, validates the key (allowed prefix, file exists in S3)
 * and rewrites the body to persist the bare key in the existing
 * `titlePicture` column. Mobile renders via cdnImageUrl(key, preset).
 *
 * If the key isn't present, no-op so non-media patches (title, content,
 * publishedAt, interests) pass through untouched.
 *
 * Also defensively strips any client-supplied `titlePicture` value that
 * isn't an external http(s) URL — protects against old/buggy clients
 * writing local file URIs into the DB. Real S3-hosted images can only be
 * set via the *Key flow above.
 */
const applyBlogMediaKeys = async (
  context: HookContext,
): Promise<HookContext> => {
  const data = context.data ?? {};
  const bucket = process.env.S3_BUCKET_NAME || '';

  const key = data.titlePictureKey;
  if (key !== undefined && key !== null) {
    if (!bucket) {
      throw new GeneralError('S3_BUCKET_NAME is not configured');
    }
    validateKeyShape(key, 'titlePictureKey');
    await headObject(bucket, key);
    // VWA-133: store the bare S3 key in the DB column (not the full URL).
    data.titlePicture = key;
    delete data.titlePictureKey;
  }

  if (context.params?.provider) {
    const value = data.titlePicture;
    if (
      typeof value === 'string' &&
      value.length > 0 &&
      !/^https?:\/\//i.test(value) &&
      !ALLOWED_KEY_PREFIXES.some((p) => value.startsWith(p))
    ) {
      delete data.titlePicture;
    }
  }

  context.data = data;
  return context;
};

export default applyBlogMediaKeys;
