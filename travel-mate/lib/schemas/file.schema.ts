/**
 * File Upload Validation Schemas
 *
 * Zod schemas for validating file upload requests and file storage operations.
 * Includes validation for file types, sizes, and metadata.
 */

import { z } from "zod";

// ============================================
// Constants for File Validation
// ============================================

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Minimum file size in bytes (1 byte - prevent empty files)
 */
export const MIN_FILE_SIZE = 1;

// ============================================
// Pre-Signed URL Request Schema
// ============================================

/**
 * Schema for requesting a pre-signed upload URL
 */
export const presignedUrlRequestSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be less than 255 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Filename can only contain letters, numbers, dots, underscores, and hyphens"
    ),
  fileType: z
    .string()
    .min(1, "File type is required")
    .refine(
      (type) =>
        ALLOWED_MIME_TYPES.includes(
          type as (typeof ALLOWED_MIME_TYPES)[number]
        ),
      {
        message: `File type must be one of: ${ALLOWED_MIME_TYPES.join(", ")}`,
      }
    ),
  fileSize: z
    .number()
    .int("File size must be an integer")
    .min(MIN_FILE_SIZE, "File cannot be empty")
    .max(
      MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    ),
});

export type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;

// ============================================
// File Storage Schema
// ============================================

/**
 * Schema for storing file metadata in the database
 */
export const createFileSchema = z.object({
  name: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be less than 255 characters"),
  url: z.string().url("Invalid file URL format"),
  key: z
    .string()
    .min(1, "File key is required")
    .max(500, "File key must be less than 500 characters"),
  size: z
    .number()
    .int()
    .min(MIN_FILE_SIZE)
    .max(MAX_FILE_SIZE)
    .optional()
    .nullable(),
  mimeType: z.string().max(100).optional().nullable(),
  uploadedBy: z.string().uuid("Invalid user ID format").optional().nullable(),
  isPublic: z.boolean().optional().default(true),
});

export type CreateFileInput = z.infer<typeof createFileSchema>;

// ============================================
// File Update Schema
// ============================================

/**
 * Schema for updating file metadata
 */
export const updateFileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateFileInput = z.infer<typeof updateFileSchema>;
