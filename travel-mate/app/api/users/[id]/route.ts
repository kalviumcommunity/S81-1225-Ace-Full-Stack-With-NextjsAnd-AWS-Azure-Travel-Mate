/**
 * User by ID API Route
 *
 * RESTful API endpoints for individual user operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/users/[id]  - Get a specific user
 * - PUT    /api/users/[id]  - Update a user
 * - DELETE /api/users/[id]  - Delete a user
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendSuccess,
  sendNotFound,
  sendError,
  validateRequest,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { updateUserSchema } from "@/lib/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/users/[id] - Get a specific user
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reviews: true,
            trips: true,
            favorites: true,
            bookings: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            title: true,
            createdAt: true,
            place: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        trips: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!user) {
      return sendNotFound("User");
    }

    logger.info("User fetched successfully", { userId: id });

    return sendSuccess(user, "User fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch user", { error });
    return sendError("Failed to fetch user", ERROR_CODES.USER_FETCH_ERROR, 500);
  }
}

// ============================================
// PUT /api/users/[id] - Update a user
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate request body with Zod schema
    const validation = await validateRequest(request, updateUserSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return sendNotFound("User");
    }

    const { name, bio, phoneNumber, avatarUrl, role, isActive, emailVerified } =
      validation.data;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info("User updated successfully", { userId: id });

    return sendSuccess(user, "User updated successfully");
  } catch (error) {
    logger.error("Failed to update user", { error });
    return sendError(
      "Failed to update user",
      ERROR_CODES.USER_UPDATE_ERROR,
      500
    );
  }
}

// ============================================
// DELETE /api/users/[id] - Delete a user
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return sendNotFound("User");
    }

    // Soft delete by setting isActive to false
    // For hard delete, use prisma.user.delete()
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("User deleted successfully", { userId: id });

    return sendSuccess(null, "User deleted successfully");
  } catch (error) {
    logger.error("Failed to delete user", { error });
    return sendError(
      "Failed to delete user",
      ERROR_CODES.USER_DELETE_ERROR,
      500
    );
  }
}
