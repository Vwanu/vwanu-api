/**
 * S3 Storage Configuration with Memory-First Upload Strategy
 * 
 * Architecture:
 * 1. Files are stored in memory via multer.memoryStorage() for immediate response
 * 2. S3 URLs are generated instantly using predetermined keys
 * 3. Database is updated with S3 URLs and response sent to client (FAST!)
 * 4. Files are uploaded to S3 asynchronously in the background
 * 
 * Benefits:
 * - Fast API responses (no waiting for S3 upload)
 * - Improved user experience
 * - Reduced server blocking
 * - Reliable file uploads with error handling
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ===== TYPES AND INTERFACES =====

export type UploadType = 'post' | 'profile' | 'message';
export type FileFieldType = 'profilePicture' | 'coverPicture' | 'postImage' | 'postVideo' | 'postAudio' | 'messageImage';

export interface S3UrlResult {
  key: string;
  url: string;
}

export interface UploadConfiguration {
  maxFileSize: number;
  maxFiles: number;
  allowedTypes: string[];
}

// ===== CONSTANTS =====

const MEMORY_THRESHOLD = 10 * 1024 * 1024; // 10MB
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

const ALLOWED_FILE_TYPES = {
  images: ['jpg', 'png', 'jpeg', 'gif'] as string[],
  videos: ['mp4', 'm4v', 'mov', 'avi'] as string[],
  audio: ['mp3', 'wav'] as string[],
  all: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'm4v', 'mov', 'avi', 'mp3', 'wav'] as string[],
};

const UPLOAD_CONFIGS: Record<UploadType, UploadConfiguration> = {
  post: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    allowedTypes: ALLOWED_FILE_TYPES.all,
  },
  profile: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 2,
    allowedTypes: ALLOWED_FILE_TYPES.images,
  },
  message: {
    maxFileSize: 15 * 1024 * 1024, // 15MB
    maxFiles: 3,
    allowedTypes: ALLOWED_FILE_TYPES.all,
  },
};

// ===== ENVIRONMENT VALIDATION =====

/**
 * Validates that all required S3 environment variables are present
 */
const validateS3Environment = (): void => {
  const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required S3 environment variables: ${missingVars.join(', ')}`);
  }
};

// Validate environment on module load
validateS3Environment();

// ===== S3 CLIENT CONFIGURATION =====

/**
 * S3 Client instance configured with environment variables
 */
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// ===== UTILITY FUNCTIONS =====

/**
 * Generates date-based folder structure
 */
const generateDatePath = (includeDay = false): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return includeDay ? `${year}/${month}/${day}` : `${year}/${month}`;
};

/**
 * Generates unique filename with extension
 */
const generateUniqueFilename = (originalFilename: string): string => {
  const fileExtension = path.extname(originalFilename);
  return `${uuidv4()}${fileExtension}`;
};

/**
 * Formats file size in MB for display
 */
const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

/**
 * Extracts file extension from filename
 */
const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// ===== FILE VALIDATION =====

/**
 * Creates a file filter function with validation for file types and sizes
 */
const createFileFilter = (config: UploadConfiguration) => {
  return (req: Request, file: any, cb: multer.FileFilterCallback) => {
    const fileExtension = getFileExtension(file.originalname);
    
    // Validate file type
    if (!config.allowedTypes.includes(fileExtension)) {
      const error = new Error(
        `File type .${fileExtension} is not allowed. Allowed: ${config.allowedTypes.join(', ')}`
      );
      return cb(error, false);
    }
    
    // Validate file size (if available)
    if (file.size && file.size > config.maxFileSize) {
      const error = new Error(
        `File too large: ${formatFileSize(file.size)}. Maximum: ${formatFileSize(config.maxFileSize)}`
      );
      return cb(error, false);
    }
    
    cb(null, true);
  };
};

// ===== S3 KEY GENERATION =====

/**
 * Generates S3 key based on upload type and file type
 */
const generateS3Key = (uploadType: UploadType, fileType: string, filename: string): string => {
  const uniqueFilename = generateUniqueFilename(filename);
  
  switch (uploadType) {
    case 'post':
      return `posts/${generateDatePath(true)}/${uniqueFilename}`;
      
    case 'profile': {
      const datePath = generateDatePath(false);
      if (fileType === 'profilePicture') {
        return `profiles/pictures/${datePath}/${uniqueFilename}`;
      } else if (fileType === 'coverPicture') {
        return `profiles/covers/${datePath}/${uniqueFilename}`;
      } else {
        return `profiles/other/${datePath}/${uniqueFilename}`;
      }
    }
      
    case 'message':
      return `messages/${generateDatePath(false)}/${uniqueFilename}`;
      
    default:
      return `misc/${generateDatePath(false)}/${uniqueFilename}`;
  }
};

// ===== PUBLIC API FUNCTIONS =====

/**
 * Generates S3 URL immediately without waiting for upload
 */
export const generateS3Url = (
  fileType: string, 
  fileName: string, 
  uploadType: UploadType = 'post'
): S3UrlResult => {
  const key = generateS3Key(uploadType, fileType, fileName);
  const url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  
  return { key, url };
};

/**
 * Extracts S3 key from full S3 URL
 */
export const getS3KeyFromUrl = (url: string): string => {
  const urlParts = url.split('.amazonaws.com/');
  return urlParts.length > 1 ? urlParts[1] : '';
};

/**
 * Uploads file to S3 asynchronously using predetermined key
 */
export const uploadToS3Async = async (file: any, s3Key: string): Promise<void> => {
  if (!s3Client) {
    console.warn('⚠️ S3 client not available, skipping upload');
    return;
  }
  
  try {
    console.log(`🔄 Starting S3 upload: ${s3Key}`);
    
    // Validate file buffer
    if (!file.buffer) {
      throw new Error('File buffer is missing - ensure multer is using memory storage');
    }
    
    // Log file details
    console.log('📄 File details:', {
      name: file.originalname,
      type: file.mimetype,
      size: formatFileSize(file.size),
      method: file.size > MEMORY_THRESHOLD ? 'STREAM' : 'MEMORY',
    });
    
    // Warn about large files
    if (file.size > MEMORY_THRESHOLD) {
      console.warn(`⚠️ Large file detected: ${formatFileSize(file.size)}. Consider streaming upload.`);
    }
    
    // Prepare upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/octet-stream',
      Metadata: {
        originalName: file.originalname || 'unknown',
        uploadDate: new Date().toISOString(),
        fieldName: file.fieldname || 'unknown',
        fileSize: file.size?.toString() || '0',
      },
    };
    
    // Execute upload
    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    
    console.log(`✅ Upload successful: ${s3Key}`, {
      ETag: result.ETag,
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
    });
    
  } catch (error) {
    console.error(`❌ Upload failed: ${s3Key}`, error);
    // TODO: Implement retry logic or failure notification system
    throw error;
  }
};

// ===== MULTER CONFIGURATIONS =====

/**
 * Shared memory storage instance
 */
const memoryStorage = multer.memoryStorage();

/**
 * Creates multer configuration for specific upload type
 */
const createMulterConfig = (uploadType: UploadType): multer.Multer => {
  const config = UPLOAD_CONFIGS[uploadType];
  
  return multer({
    storage: memoryStorage, // Always use memory for immediate response
    limits: { 
      fileSize: config.maxFileSize,
      files: config.maxFiles,
    },
    fileFilter: createFileFilter(config),
  });
};

// ===== EXPORTED MULTER INSTANCES =====

/**
 * Multer configuration for post media uploads
 */
export const postStorage = createMulterConfig('post');

/**
 * Multer configuration for profile picture uploads
 */
export const profileStorage = createMulterConfig('profile');

/**
 * Multer configuration for message media uploads
 */
export const messageStorage = createMulterConfig('message');

// ===== INITIALIZATION LOGGING =====

console.log('🔧 S3 Storage initialized:', {
  region: AWS_REGION,
  bucket: BUCKET_NAME,
  strategy: 'Memory-First Upload',
  threshold: formatFileSize(MEMORY_THRESHOLD),
});