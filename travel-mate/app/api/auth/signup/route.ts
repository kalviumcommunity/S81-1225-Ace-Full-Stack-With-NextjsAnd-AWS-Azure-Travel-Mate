/**
 * Auth Signup API Route
 *
 * POST /api/auth/signup
 *
 * Creates a new user account with secure password hashing.
 * Uses bcrypt for password hashing and returns JWT tokens upon success.
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
import { signupSchema } from "@/lib/schemas";
import { generateTokenPair } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { ERROR_CODES } from "@/lib/errorCodes";

// Salt rounds for bcrypt (higher = more secure but slower)
const SALT_ROUNDS = 12;

/**
 * POST /api/auth/signup
 *
 * Create a new user account
 *
 * @param request - Next.js request with signup credentials
 * @returns User data with JWT tokens or error response
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validationResult = await validateRequest(request, signupSchema);

    if (!validationResult.success) {
      return validationResult.error;
    }

    const { email, name, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(
        "An account with this email already exists",
        ERROR_CODES.CONFLICT,
        409,
        {
          field: "email",
          suggestion: "Please use a different email or try logging in",
        }
      );
    }

    // Hash the password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: "USER",
        isActive: true,
        emailVerified: false,
      },
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
        createdAt: true,
      },
    });

    // Generate JWT tokens
    const tokens = generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    logger.info(`New user registered: ${newUser.email}`);

    return sendSuccess(
      {
        user: newUser,
        ...tokens,
      },
      "Account created successfully",
      201
    );
  } catch (error) {
    logger.error("Signup error", {
      error: error instanceof Error ? error.message : String(error),
    });

    // Handle Prisma unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return sendError(
        "An account with this email already exists",
        ERROR_CODES.CONFLICT,
        409
      );
    }

    return sendDatabaseError("Failed to create account. Please try again.");
  }
}
