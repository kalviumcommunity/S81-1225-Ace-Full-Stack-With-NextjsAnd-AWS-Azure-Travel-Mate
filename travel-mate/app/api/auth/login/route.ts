/**
 * Auth Login API Route
 *
 * POST /api/auth/login
 *
 * Authenticates a user with email and password.
 * Returns JWT tokens upon successful authentication.
 */

import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  sendSuccess,
  sendDatabaseError,
  sendError,
  validateRequest,
} from "@/lib/responseHandler";
import { loginSchema } from "@/lib/schemas";
import { generateTokenPair } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * POST /api/auth/login
 *
 * Authenticate a user and return JWT tokens
 *
 * @param request - Next.js request with login credentials
 * @returns User data with JWT tokens or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validationResult = await validateRequest(request, loginSchema);

    if (!validationResult.success) {
      return validationResult.error;
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        avatarUrl: true,
        bio: true,
        phoneNumber: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    // User not found - use generic message to prevent email enumeration
    if (!user) {
      return sendError(
        "Invalid email or password",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return sendError(
        "Your account has been deactivated. Please contact support.",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    // Check if password hash exists (user might have signed up via OAuth)
    if (!user.passwordHash) {
      return sendError(
        "Please use your original sign-in method or reset your password",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for: ${email}`);
      return sendError(
        "Invalid email or password",
        ERROR_CODES.UNAUTHORIZED,
        401
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Remove sensitive data before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(
      {
        user: userWithoutPassword,
        ...tokens,
      },
      "Login successful"
    );
  } catch (error) {
    logger.error("Login error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return sendDatabaseError("Failed to authenticate. Please try again.");
  }
}
