/* eslint-disable prefer-destructuring */
import { HookContext } from '@feathersjs/feathers';

export default (mediaArray: string[]) =>
  async (context: HookContext): Promise<HookContext> => {
    console.log('=== SAVE PROFILE PICTURES HOOK TRIGGERED ===');
    console.log('Initial context.data:', context.data);
    if (!mediaArray) throw new Error('Please specify mediaArrays');
    const documentFiles = context.data.UploadedMedia;
    if (!documentFiles) return context;

    console.log('=== SAVE PROFILE PICTURES HOOK ===');
    console.log('UploadedMedia:', documentFiles);

    const { generateS3Url, uploadToS3Async } = require('../storage/s3');

    mediaArray.forEach((mediaGroup) => {
      if (documentFiles[mediaGroup]) {
        console.log(`Processing media group: ${mediaGroup}`);
        console.log('Document files for this group:', documentFiles[mediaGroup]);
        const file = documentFiles[mediaGroup][0];
        console.log(`Found file for ${mediaGroup}:`, file);
        
        // Generate S3 URL immediately
        const { url, key } = generateS3Url(mediaGroup, file.originalname, 'profile');
        
        console.log(`Processing ${mediaGroup}:`);
        console.log('- File object:', file);
        console.log('- Generated S3 URL:', url);
        console.log('- S3 Key:', key);
        
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

    console.log('Final context.data:', context.data);
    console.log('=== END SAVE PROFILE PICTURES HOOK ===');

    return context;
  };
