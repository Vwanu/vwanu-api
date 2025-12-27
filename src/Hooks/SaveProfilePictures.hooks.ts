/* eslint-disable prefer-destructuring */
import { HookContext } from '@feathersjs/feathers';
import { generateS3Url, uploadToS3Async } from '../storage/s3';

export default (mediaArray: string[]) =>
  async (context: HookContext): Promise<HookContext> => {
    if (!mediaArray) throw new Error('Please specify mediaArrays');
    const documentFiles = context.data.UploadedMedia;
    if (!documentFiles) {
        delete context.data.UploadedMedia;
        return context;
    }
    mediaArray.forEach((mediaGroup) => {
      if (documentFiles[mediaGroup]) {
        const file = documentFiles[mediaGroup][0];
        const { url, key } = generateS3Url(mediaGroup, file.originalname, 'profile');
        // Set the generated URL immediately
        context.data[mediaGroup] = url;
        // Upload to S3 asynchronously (don't wait)
        setImmediate(() => {
          uploadToS3Async(file, key).catch((error) => {
            console.error(`Background upload failed for ${mediaGroup}:`, error);
          });
        });
      }
    });

    delete context.data.UploadedMedia;
    return context;
  };
