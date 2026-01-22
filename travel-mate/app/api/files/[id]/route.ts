/**
 * File Detail API Route
 *
 * RESTful API endpoints for individual file operations.
 * Supports: GET (retrieve), PATCH (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/files/:id - Get file by ID
 * - PATCH  /api/files/:id - Update file metadata
 * - DELETE /api/files/:id - Delete file record
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendSuccess,
  sendNotFound,
  sendError,
  validateSchema,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { updateFileSchema } from "@/lib/schemas/file.schema";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, S3_CONFIG, validateS3Config } from "@/lib/s3";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/files/:id - Get file by ID
// ============================================

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();
  const { id } = await params;

  try {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return sendNotFound("File not found");
    }

    const duration = performance.now() - startTime;
    logger.info("File retrieved", {
      id: file.id,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendSuccess(file, "File retrieved successfully");
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Failed to retrieve file", {
      id,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendError(
      "Failed to retrieve file",
      ERROR_CODES.DATABASE_ERROR,
      500
    );
  }
}

// ============================================
// PATCH /api/files/:id - Update file metadata
// ============================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();
  const { id } = await params;

  try {
    // Check if file exists
    const existingFile = await prisma.file.findUnique({
      where: { id },
    });

    if (!existingFile) {
      return sendNotFound("File not found");
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateSchema(updateFileSchema, body);

    if (!validation.success) {
      return validation.error;
    }

    const updateData = validation.data;

    // Update file
    const file = await prisma.file.update({
      where: { id },
      data: updateData,
    });

    const duration = performance.now() - startTime;
    logger.info("File updated", {
      id: file.id,
      updates: Object.keys(updateData),
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendSuccess(file, "File updated successfully");
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Failed to update file", {
      id,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration.toFixed(2)}ms`,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return sendNotFound("File not found");
      }
    }

    return sendError("Failed to update file", ERROR_CODES.DATABASE_ERROR, 500);
  }
}

// ============================================
// DELETE /api/files/:id - Delete file
// ============================================

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();
  const { id } = await params;

  try {
    // Check if file exists
    const existingFile = await prisma.file.findUnique({
      where: { id },
    });

    if (!existingFile) {
      return sendNotFound("File not found");
    }

    // Try to delete from S3 first (if configured)
    if (validateS3Config()) {
      const s3Client = getS3Client();
      if (s3Client) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_CONFIG.bucketName,
            Key: existingFile.key,
          });
          await s3Client.send(deleteCommand);
          logger.info("File deleted from S3", {
            key: existingFile.key,
          });
        } catch (s3Error) {
          // Log but don't fail - we still want to delete the DB record
          logger.warn("Failed to delete file from S3", {
            key: existingFile.key,
            error: s3Error instanceof Error ? s3Error.message : "Unknown error",
          });
        }
      }
    }

    // Delete from database
    await prisma.file.delete({
      where: { id },
    });

    const duration = performance.now() - startTime;
    logger.info("File deleted", {
      id,
      key: existingFile.key,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendSuccess(
      { id, key: existingFile.key },
      "File deleted successfully"
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Failed to delete file", {
      id,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration.toFixed(2)}ms`,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return sendNotFound("File not found");
      }
    }

    return sendError("Failed to delete file", ERROR_CODES.DATABASE_ERROR, 500);
  }
}
