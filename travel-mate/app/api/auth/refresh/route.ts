/**
 * Auth Refresh Token API Route
 *
 * POST /api/auth/refresh
 *
 * Refreshes an expired access token using a valid refresh token.
 * Returns new JWT tokens without requiring re-authentication.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError, validateRequest } from "@/lib/responseHandler";
import { refreshTokenSchema } from "@/lib/schemas";
import { verifyRefreshToken, generateTokenPair } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * POST /api/auth/refresh
 *
 * Refresh access token using refresh token
 *
 * @param request - Next.js request with refresh token
 * @returns New token pair or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validationResult = await validateRequest(request, refreshTokenSchema);

    if (!validationResult.success) {
      return validationResult.error;
    }

    const { refreshToken } = validationResult.data;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return sendError(
        "Invalid or expired refresh token",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
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

    // Generate new token pair
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    logger.info(`Token refreshed for user: ${user.email}`);

    return sendSuccess(tokens, "Token refreshed successfully");
  } catch (error) {
    logger.error("Token refresh error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return sendError(
      "Failed to refresh token",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}
