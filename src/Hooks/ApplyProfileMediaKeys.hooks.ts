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

const publicUrlFor = (bucket: string, key: string): string =>
  `https://${bucket}.s3.amazonaws.com/${key}`;

/**
 * Before-hook for the users service. When a patch body contains
 * `profilePictureKey` or `coverPictureKey`, validates each key (allowed
 * prefix, file exists in S3) and rewrites the body to set the matching
 * URL column instead.
 *
 * If neither key is present, no-op (other patches like name/email
 * updates pass through untouched).
 *
 * Also defensively strips any client-supplied `profilePicture` /
 * `coverPicture` URL fields — these can only be set via the key flow
 * to prevent old/buggy clients from writing arbitrary strings (e.g.
 * local file URIs) into the DB.
 */
const applyProfileMediaKeys = async (
  context: HookContext,
): Promise<HookContext> => {
  const data = context.data ?? {};
  const bucket = process.env.S3_BUCKET_NAME || '';

  const fieldMap: Array<[string, string]> = [
    ['profilePictureKey', 'profilePicture'],
    ['coverPictureKey', 'coverPicture'],
  ];

  const writes: Record<string, string> = {};
  for (const [keyField, urlField] of fieldMap) {
    const key = data[keyField];
    if (key === undefined || key === null) continue;
    if (!bucket) {
      throw new GeneralError('S3_BUCKET_NAME is not configured');
    }
    validateKeyShape(key, keyField);
    await headObject(bucket, key);
    writes[urlField] = publicUrlFor(bucket, key);
    delete data[keyField];
  }

  // Reject local file URIs sent directly in profilePicture/coverPicture.
  // External http(s) URLs (e.g. UI-Avatars defaults) and null clears
  // remain allowed for backwards compat. Real S3-hosted images can only
  // be set via the *Key flow above.
  if (context.params?.provider) {
    for (const field of ['profilePicture', 'coverPicture']) {
      const value = data[field];
      if (
        typeof value === 'string' &&
        value.length > 0 &&
        !/^https?:\/\//i.test(value)
      ) {
        delete data[field];
      }
    }
  }

  Object.assign(data, writes);
  context.data = data;
  return context;
};

export default applyProfileMediaKeys;
