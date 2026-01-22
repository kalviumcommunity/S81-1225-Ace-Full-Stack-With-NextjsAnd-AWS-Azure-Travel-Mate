/**
 * AWS S3 Client Configuration
 *
 * Centralized S3 client setup for file upload operations.
 * Uses AWS SDK v3 for modern, modular client architecture.
 */

import { S3Client } from "@aws-sdk/client-s3";

/**
 * AWS S3 Configuration from environment variables
 */
export const S3_CONFIG = {
  region: process.env.AWS_REGION || "ap-south-1",
  bucketName: process.env.AWS_BUCKET_NAME || "",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
};

/**
 * Validate S3 configuration
 */
export const validateS3Config = (): boolean => {
  const { bucketName, accessKeyId, secretAccessKey } = S3_CONFIG;
  return Boolean(bucketName && accessKeyId && secretAccessKey);
};

/**
 * Create S3 client instance
 * Only creates if credentials are available
 */
export const createS3Client = (): S3Client | null => {
  if (!validateS3Config()) {
    console.warn(
      "AWS S3 credentials not configured. File uploads will not work."
    );
    return null;
  }

  return new S3Client({
    region: S3_CONFIG.region,
    credentials: {
      accessKeyId: S3_CONFIG.accessKeyId,
      secretAccessKey: S3_CONFIG.secretAccessKey,
    },
  });
};

/**
 * Singleton S3 client instance
 */
let s3ClientInstance: S3Client | null = null;

/**
 * Get S3 client (lazy initialization)
 */
export const getS3Client = (): S3Client | null => {
  if (!s3ClientInstance) {
    s3ClientInstance = createS3Client();
  }
  return s3ClientInstance;
};

/**
 * Generate the public URL for an uploaded file
 *
 * @param key - The S3 object key
 * @returns The public URL for the file
 */
export const getPublicFileUrl = (key: string): string => {
  return `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
};

/**
 * Generate a unique file key with timestamp and random suffix
 *
 * @param originalFilename - The original filename
 * @param folder - Optional folder prefix (default: "uploads")
 * @returns A unique S3 key
 */
export const generateUniqueKey = (
  originalFilename: string,
  folder: string = "uploads"
): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = originalFilename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();

  return `${folder}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
};

/**
 * Pre-signed URL expiration times (in seconds)
 */
export const URL_EXPIRY = {
  UPLOAD: 60, // 1 minute for upload URLs
  DOWNLOAD: 3600, // 1 hour for download URLs
} as const;

export default getS3Client;
