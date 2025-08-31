/* eslint-disable prefer-destructuring */
import { HookContext } from '@feathersjs/feathers';

export default (mediaArray: string[]) =>
  async (context: HookContext): Promise<HookContext> => {
    if (!mediaArray) throw new Error('Please specify mediaArrays');
    const documentFiles = context.data.UploadedMedia;
    if (!documentFiles) return context;

    console.log('=== SAVE PROFILE PICTURES HOOK ===');
    console.log('UploadedMedia:', documentFiles);

    mediaArray.forEach((mediaGroup) => {
      if (documentFiles[mediaGroup]) {
        // For S3: doc.location contains the full S3 URL
        // For Cloudinary: doc.path contains the URL
        const file = documentFiles[mediaGroup][0];
        const fileUrl = file.location || file.path;
        
        console.log(`Processing ${mediaGroup}:`);
        console.log('- File object:', file);
        console.log('- Extracted URL:', fileUrl);
        
        context.data[mediaGroup] = fileUrl;
      }
    });

    console.log('Final context.data:', context.data);
    console.log('=== END SAVE PROFILE PICTURES HOOK ===');

    return context;
  };
