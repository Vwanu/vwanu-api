import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Check if S3 credentials are available
const hasS3Credentials = !!(
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.S3_BUCKET_NAME
);

// S3 Client configuration (only if credentials are available)
const s3Client = hasS3Credentials ? new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}) : null;

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name';
const ALL_ALLOW_FORMAT = ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'm4v', 'mov', 'avi', 'mp3', 'wav'];

// File filter to restrict file types
const fileFilter = (req: any, file: any, cb: any) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (ALL_ALLOW_FORMAT.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${ALL_ALLOW_FORMAT.join(', ')}`), false);
  }
};

// S3 storage configuration for posts (only if S3 is available)
const postS3Storage = hasS3Credentials && s3Client ? multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  // acl: 'public-read', // Removed: ACLs disabled on bucket
  key: function (req, file, cb) {
    // Generate unique filename: posts/YYYY/MM/DD/uuid-originalname
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const key = `posts/${year}/${month}/${day}/${uniqueFilename}`;
    
    cb(null, key);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
    });
  },
}) : null;

// Fallback to memory storage if S3 is not configured
const memoryStorage = multer.memoryStorage();

// Create multer instance with S3 storage or memory storage fallback
export const postStorage = multer({
  storage: postS3Storage || memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

console.log(`📁 Storage configured: ${hasS3Credentials ? 'AWS S3' : 'Memory Storage'}`);
if (hasS3Credentials) {
  console.log(`🪣 S3 Bucket: ${BUCKET_NAME}`);
}

// Storage for different media types (with fallback to memory storage)
const profileS3Storage = hasS3Credentials && s3Client ? multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  // acl: 'public-read', // Removed: ACLs disabled on bucket
  key: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const key = `profiles/${uniqueFilename}`;
    cb(null, key);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
}) : null;

const messageS3Storage = hasS3Credentials && s3Client ? multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  // acl: 'public-read', // Removed: ACLs disabled on bucket
  key: function (req, file, cb) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const key = `messages/${year}/${month}/${uniqueFilename}`;
    cb(null, key);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
}) : null;

export const profileStorage = multer({
  storage: profileS3Storage || memoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for profiles
});

export const messageStorage = multer({
  storage: messageS3Storage || memoryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB for messages
});

// Helper function to get S3 URL
export const getS3Url = (key: string): string => {
  // Use CloudFront URL if configured, otherwise use direct S3 URL
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${key}`;
  }
  
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

// Helper function to extract S3 key from URL
export const getS3KeyFromUrl = (url: string): string => {
  const urlParts = url.split('.amazonaws.com/');
  return urlParts.length > 1 ? urlParts[1] : '';
};

// Generate pre-signed URL for private access (alternative to public bucket)
export const generatePresignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  if (!s3Client) {
    throw new Error('S3 client not configured');
  }
  
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn });
};
