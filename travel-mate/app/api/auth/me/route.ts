/**
 * Auth Me API Route
 *
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile.
 * Requires a valid JWT access token in the Authorization header.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { authenticateRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * GET /api/auth/me
 *
 * Get current authenticated user's profile
 *
 * @param request - Next.js request with Authorization header
 * @returns User profile data or error response
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return sendError(
        authResult.message || "Authentication required",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Fetch full user profile from database
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        // Include counts for related data
        _count: {
          select: {
            reviews: true,
            trips: true,
            bookings: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    if (!user.isActive) {
      return sendError(
        "Account has been deactivated",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    return sendSuccess(
      {
        user,
      },
      "User profile retrieved successfully"
    );
  } catch (error) {
    logger.error("Get user profile error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return sendError(
      "Failed to retrieve user profile",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
