/**
 * Category by ID API Route
 *
 * RESTful API endpoints for individual category operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/categories/[id]  - Get a specific category
 * - PUT    /api/categories/[id]  - Update a category
 * - DELETE /api/categories/[id]  - Delete a category
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendSuccess,
  sendNotFound,
  sendBadRequest,
  sendError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/categories/[id] - Get a specific category
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        places: {
          take: 10,
          where: { isActive: true },
          orderBy: { rating: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            city: true,
            country: true,
            rating: true,
            reviewCount: true,
          },
        },
        _count: {
          select: {
            places: true,
          },
        },
      },
    });

    if (!category) {
      return sendNotFound("Category not found", ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    logger.info("Category fetched successfully", { categoryId: id });

    return sendSuccess(category, "Category fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch category", { error });
    return sendError(
      "Failed to fetch category",
      ERROR_CODES.CATEGORY_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// PUT /api/categories/[id] - Update a category
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return sendNotFound("Category not found", ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    // Extract updatable fields
    const { name, description, iconUrl, isActive, sortOrder } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    if (Object.keys(updateData).length === 0) {
      return sendBadRequest(
        "No fields to update",
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info("Category updated successfully", { categoryId: id });

    return sendSuccess(category, "Category updated successfully");
  } catch (error) {
    logger.error("Failed to update category", { error });
    return sendError(
      "Failed to update category",
      ERROR_CODES.CATEGORY_UPDATE_ERROR,
      500
    );
  }
}

// ============================================
// DELETE /api/categories/[id] - Delete a category
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { places: true },
        },
      },
    });

    if (!existingCategory) {
      return sendNotFound("Category not found", ERROR_CODES.CATEGORY_NOT_FOUND);
    }

    // Check if category has places
    if (existingCategory._count.places > 0) {
      return sendBadRequest(
        "Cannot delete category with associated places",
        ERROR_CODES.CATEGORY_HAS_PLACES,
        { placeCount: existingCategory._count.places }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("Category deleted successfully", { categoryId: id });

    return sendSuccess(null, "Category deleted successfully");
  } catch (error) {
    logger.error("Failed to delete category", { error });
    return sendError(
      "Failed to delete category",
      ERROR_CODES.CATEGORY_DELETE_ERROR,
      500
    );
  }
}
