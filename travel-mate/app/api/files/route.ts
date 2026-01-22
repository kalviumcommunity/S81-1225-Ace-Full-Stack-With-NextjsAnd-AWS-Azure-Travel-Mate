/**
 * Files API Route
 *
 * RESTful API endpoints for managing uploaded file metadata.
 * Stores file information in the database after successful S3 uploads.
 *
 * Endpoints:
 * - GET  /api/files       - List all files with pagination
 * - POST /api/files       - Store file metadata after upload
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendPaginatedSuccess,
  sendSuccess,
  sendError,
  validateSchema,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createFileSchema } from "@/lib/schemas/file.schema";

// ============================================
// GET /api/files - List files with pagination
// ============================================

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );
    const skip = (page - 1) * limit;

    // Filtering parameters
    const mimeType = searchParams.get("mimeType");
    const uploadedBy = searchParams.get("uploadedBy");
    const isPublic = searchParams.get("isPublic");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.FileWhereInput = {};

    if (mimeType) {
      where.mimeType = { contains: mimeType, mode: "insensitive" };
    }

    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === "true";
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // Build orderBy clause
    const validSortFields = ["name", "size", "createdAt", "mimeType"];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy: Prisma.FileOrderByWithRelationInput = {
      [orderByField]: sortOrder,
    };

    // Execute queries in parallel
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.file.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const duration = performance.now() - startTime;
    logger.info("Files fetched", {
      count: files.length,
      total,
      page,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendPaginatedSuccess(
      files,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      "Files retrieved successfully",
      { mimeType, uploadedBy, isPublic, search }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Failed to fetch files", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendError(
      "Failed to retrieve files",
      ERROR_CODES.DATABASE_ERROR,
      500
    );
  }
}

// ============================================
// POST /api/files - Store file metadata
// ============================================

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await request.json();

    // Validate request body
    const validation = validateSchema(createFileSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { name, url, key, size, mimeType, uploadedBy, isPublic } =
      validation.data;

    // Check if file with same key already exists
    const existingFile = await prisma.file.findFirst({
      where: { key },
    });

    if (existingFile) {
      return sendError(
        "File with this key already exists",
        ERROR_CODES.ALREADY_EXISTS,
        409
      );
    }

    // Create file record
    const file = await prisma.file.create({
      data: {
        name,
        url,
        key,
        size,
        mimeType,
        uploadedBy,
        isPublic: isPublic ?? true,
      },
    });

    const duration = performance.now() - startTime;
    logger.info("File metadata stored", {
      id: file.id,
      name: file.name,
      key: file.key,
      size: file.size,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendSuccess(file, "File metadata stored successfully", 201);
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Failed to store file metadata", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration.toFixed(2)}ms`,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return sendError(
          "File with this key already exists",
          ERROR_CODES.ALREADY_EXISTS,
          409
        );
      }
    }

    return sendError(
      "Failed to store file metadata",
      ERROR_CODES.DATABASE_ERROR,
      500
    );
  }
}
