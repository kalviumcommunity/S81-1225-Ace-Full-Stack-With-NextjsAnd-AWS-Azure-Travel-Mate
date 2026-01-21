/**
 * Admin User Detail API Routes
 *
 * Protected admin-only endpoints for individual user management.
 *
 * Endpoints:
 * - GET    /api/admin/users/[id]    - Get user details
 * - PATCH  /api/admin/users/[id]    - Update user
 * - DELETE /api/admin/users/[id]    - Delete user
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { UserRole } from "@prisma/client";

/**
 * Helper function to get user info from headers (set by middleware)
 */
function getUserFromHeaders(request: NextRequest) {
  return {
    id: request.headers.get("x-user-id"),
    email: request.headers.get("x-user-email"),
    name: request.headers.get("x-user-name"),
    role: request.headers.get("x-user-role"),
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]
 *
 * Get detailed user information (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = getUserFromHeaders(request);
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
            bookings: true,
            trips: true,
            favorites: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            place: {
              select: {
                name: true,
              },
            },
          },
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            place: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          error: { code: "NOT_FOUND" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    logger.info(`Admin ${admin.email} viewed user details: ${user.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "User details retrieved successfully",
        data: user,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Admin get user error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve user details",
        error: {
          code: "ADMIN_GET_USER_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 *
 * Update user information (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = getUserFromHeaders(request);
    const { id } = await params;
    const body = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          error: { code: "NOT_FOUND" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Validate role if provided
    if (body.role && !Object.values(UserRole).includes(body.role)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role. Must be one of: ${Object.values(UserRole).join(", ")}`,
          error: { code: "VALIDATION_ERROR" },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Allowed fields to update
    const allowedFields = [
      "name",
      "bio",
      "phoneNumber",
      "role",
      "isActive",
      "emailVerified",
    ];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedUser = await prisma.user.update({
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
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(
      `Admin ${admin.email} updated user ${updatedUser.email}: ${JSON.stringify(updateData)}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Admin update user error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: {
          code: "ADMIN_UPDATE_USER_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 *
 * Delete a user (admin only)
 * Note: This is a soft delete (sets isActive to false)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = getUserFromHeaders(request);
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          error: { code: "NOT_FOUND" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (existingUser.id === admin.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account",
          error: { code: "FORBIDDEN" },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Soft delete - deactivate user instead of hard delete
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    logger.info(`Admin ${admin.email} deactivated user: ${deletedUser.email}`);

    return NextResponse.json(
      {
        success: true,
        message: "User deactivated successfully",
        data: deletedUser,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Admin delete user error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: {
          code: "ADMIN_DELETE_USER_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
