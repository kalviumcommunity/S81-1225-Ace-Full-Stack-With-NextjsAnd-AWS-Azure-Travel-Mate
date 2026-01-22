/**
 * File Upload API Route
 *
 * Generates pre-signed URLs for secure, direct file uploads to AWS S3.
 * The client uploads directly to S3 without exposing credentials.
 *
 * Endpoints:
 * - POST /api/upload - Generate a pre-signed upload URL
 *
 * Security:
 * - File type validation (images and documents only)
 * - File size validation (max 10MB)
 * - Short-lived URLs (60 seconds)
 * - Unique file keys to prevent overwrites
 */

import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sendSuccess, sendError, validateSchema } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { logger } from "@/lib/logger";
import {
  getS3Client,
  S3_CONFIG,
  generateUniqueKey,
  getPublicFileUrl,
  URL_EXPIRY,
  validateS3Config,
} from "@/lib/s3";
import {
  presignedUrlRequestSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/schemas/file.schema";

// ============================================
// POST /api/upload - Generate Pre-Signed Upload URL
// ============================================

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Check if S3 is configured
    if (!validateS3Config()) {
      logger.error("S3 configuration missing", {
        hasRegion: !!S3_CONFIG.region,
        hasBucket: !!S3_CONFIG.bucketName,
        hasAccessKey: !!S3_CONFIG.accessKeyId,
        hasSecretKey: !!S3_CONFIG.secretAccessKey,
      });

      return sendError(
        "File upload service is not configured",
        ERROR_CODES.SERVICE_UNAVAILABLE,
        503
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateSchema(presignedUrlRequestSchema, body);

    if (!validation.success) {
      return validation.error;
    }

    const { filename, fileType, fileSize } = validation.data;

    // Additional validation logging
    logger.info("Upload request received", {
      filename,
      fileType,
      fileSize,
      maxSize: MAX_FILE_SIZE,
    });

    // Validate file type is in allowed list
    if (
      !ALLOWED_MIME_TYPES.includes(
        fileType as (typeof ALLOWED_MIME_TYPES)[number]
      )
    ) {
      return sendError(
        `Unsupported file type: ${fileType}. Allowed types: images (jpeg, png, gif, webp, svg) and documents (pdf, doc, docx, xls, xlsx)`,
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return sendError(
        `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Get S3 client
    const s3Client = getS3Client();
    if (!s3Client) {
      return sendError(
        "Failed to initialize file upload service",
        ERROR_CODES.INTERNAL_ERROR,
        500
      );
    }

    // Generate unique key for the file
    const key = generateUniqueKey(filename);

    // Create PutObject command with metadata
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucketName,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
      ACL: "public-read", // Make file publicly accessible
      Metadata: {
        originalFilename: filename,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRY.UPLOAD,
    });

    // Generate the public URL that will be used after upload
    const publicUrl = getPublicFileUrl(key);

    const duration = performance.now() - startTime;
    logger.info("Pre-signed URL generated", {
      key,
      fileType,
      fileSize,
      expiresIn: URL_EXPIRY.UPLOAD,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendSuccess(
      {
        uploadUrl,
        publicUrl,
        key,
        expiresIn: URL_EXPIRY.UPLOAD,
        maxSize: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_MIME_TYPES,
      },
      "Pre-signed upload URL generated successfully",
      200
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Failed to generate pre-signed URL", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendError(
      "Failed to generate upload URL",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : undefined
    );
  }
}

// ============================================
// GET /api/upload - Get upload configuration
// ============================================

export async function GET() {
  try {
    const isConfigured = validateS3Config();

    return sendSuccess(
      {
        configured: isConfigured,
        maxFileSize: MAX_FILE_SIZE,
        maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
        allowedTypes: ALLOWED_MIME_TYPES,
        urlExpirySeconds: URL_EXPIRY.UPLOAD,
      },
      "Upload configuration retrieved",
      200
    );
  } catch (error) {
    logger.error("Failed to get upload configuration", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return sendError(
      "Failed to get upload configuration",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
