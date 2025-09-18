import { generateS3Url, uploadToS3Async } from '../../storage/s3';
import isValidUrl from './validUrl';

/**
 * Process uploaded files with immediate S3 URL generation
 * 
 * Flow:
 * 1. Handle media links from URLs (external links)
 * 2. Process uploaded files:
 *    - Generate S3 URLs immediately
 *    - Add to Media array with generated URLs
 *    - Upload to S3 asynchronously in background
 * 
 * @param mediaArray - Array of media field names to process
 * @param data - Request data containing UploadedMedia
 * @returns Modified data object with Media array
 */

// Types and Interfaces
export interface MediaItem {
  original: string;
  large: string;
  medium: string;
  small: string;
  tiny: string;
  UserId: string; // Keep consistent with existing codebase naming
}

export type MediaFieldType = 
  | 'postImage' 
  | 'postVideo' 
  | 'postAudio'
  | 'profilePicture' 
  | 'coverPicture'
  | 'messageImage';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  fieldname: string;
}

export interface MediaProcessingData {
  Media?: MediaItem[];
  userId?: string;
  UserId?: string; // Support both naming conventions
  UploadedMedia?: Record<string, UploadedFile[]>;
  mediaLinks?: string[];
}

export interface ProcessedMediaData extends Omit<MediaProcessingData, 'UploadedMedia'> {
  Media: MediaItem[];
}


/**
 * Convert URL links to MediaItem objects
 */
const processMediaLinks = (mediaUrls: string[], targetUserId: string): MediaItem[] => {
  return mediaUrls.map(mediaUrl => createMediaItem(mediaUrl, targetUserId));
};

/**
 * Process uploaded files and generate S3 URLs
 */
const processUploadedFiles = (
  fieldNames: MediaFieldType[], 
  filesByField: Record<string, UploadedFile[]>, 
  targetUserId: string
): MediaItem[] => {
  const mediaItems: MediaItem[] = [];

  for (const fieldName of fieldNames) {
    const filesForField = filesByField[fieldName];
    if (!filesForField?.length) continue;

    for (const uploadedFile of filesForField) {
      try {
        const { url, key } = generateS3Url(fieldName, uploadedFile.originalname, 'post');
        mediaItems.push(createMediaItem(url, targetUserId));
        uploadFileToS3Async(uploadedFile, key, fieldName);
        
      } catch (error) {
        console.error(`Failed to process file ${uploadedFile.originalname} for ${fieldName}:`, error);
      }
    }
  }

  return mediaItems;
};

/**
 * Create a standardized MediaItem object
 */
const createMediaItem = (mediaUrl: string, ownerId: string): MediaItem => ({
  original: mediaUrl,
  large: mediaUrl,
  medium: mediaUrl,
  small: mediaUrl,
  tiny: mediaUrl,
  UserId: ownerId,
});

/**
 * Upload file to S3 asynchronously with error handling
 */
const uploadFileToS3Async = (
  fileData: UploadedFile, 
  s3Key: string, 
  fieldName: string
): void => {
  setImmediate(() => {
    uploadToS3Async(fileData, s3Key).catch((error) => {
      console.error(`Background upload failed for ${fieldName} (${fileData.originalname}):`, error);
      // TODO: Implement retry logic or failure notification
    });
  });
};


/**
 * Main function to process uploaded files and media links
 */
export const getUploadedFiles = (
    mediaFieldNames: MediaFieldType[], 
    requestData: MediaProcessingData
  ): ProcessedMediaData => {

    const processedMediaResponse: ProcessedMediaData = {
      mediaLinks: requestData.mediaLinks,
      userId: requestData.userId,
      Media: []
    };
  
    // Get user ID (support both naming conventions)
    const extractedUserId = requestData.UserId || requestData.userId;
    if (!extractedUserId) {
      throw new Error('User ID is required for media processing');
    }
  
    // Process external media links
    if (requestData.mediaLinks?.length) {
      const validMediaUrls = requestData.mediaLinks.filter(isValidUrl);
      processedMediaResponse.Media.push(...processMediaLinks(validMediaUrls, extractedUserId));
    }
  
    // Process uploaded files
    if (requestData.UploadedMedia) {
      const processedFileMedia = processUploadedFiles(mediaFieldNames, requestData.UploadedMedia, extractedUserId);
      processedMediaResponse.Media.push(...processedFileMedia);
    }
  
    return processedMediaResponse;
  };
  

export default getUploadedFiles;
