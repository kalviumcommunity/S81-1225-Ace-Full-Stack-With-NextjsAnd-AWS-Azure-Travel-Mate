/**
 * JWT Authentication Utilities
 *
 * This module provides utilities for JWT token generation, verification,
 * and authentication middleware for protecting API routes.
 */

import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Environment variables with fallbacks (use proper secrets in production!)
const JWT_SECRET: jwt.Secret =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_REFRESH_SECRET: jwt.Secret =
  process.env.JWT_REFRESH_SECRET ||
  "your-refresh-secret-key-change-in-production";
const JWT_EXPIRES_IN = "1h";
const JWT_REFRESH_EXPIRES_IN = "7d";

/**
 * User payload structure for JWT tokens
 */
export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Token pair returned after successful authentication
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Authentication result structure
 */
export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  message?: string;
}

/**
 * Generate an access token for a user
 *
 * @param payload - User data to encode in the token
 * @param options - Optional JWT sign options
 * @returns Signed JWT access token
 */
export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
  options?: SignOptions
): string {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  };
  return jwt.sign(tokenPayload, JWT_SECRET, signOptions);
}

/**
 * Generate a refresh token for a user
 *
 * @param payload - User data to encode in the token
 * @param options - Optional JWT sign options
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
  options?: SignOptions
): string {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
  const signOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    ...options,
  };
  return jwt.sign(tokenPayload, JWT_REFRESH_SECRET, signOptions);
}

/**
 * Generate both access and refresh tokens
 *
 * @param user - User data to encode in the tokens
 * @returns Object containing access token, refresh token, and expiry info
 */
export function generateTokenPair(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): TokenPair {
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: JWT_EXPIRES_IN,
  };
}

/**
 * Verify an access token
 *
 * @param token - JWT access token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verify a refresh token
 *
 * @param token - JWT refresh token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract bearer token from Authorization header
 *
 * @param request - Next.js request object
 * @returns Token string if found, null otherwise
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7); // Remove "Bearer " prefix
}

/**
 * Authenticate a request and extract user information
 *
 * @param request - Next.js request object
 * @returns AuthResult with success status and user data or error message
 */
export function authenticateRequest(request: NextRequest): AuthResult {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      success: false,
      message: "Authorization token is missing",
    };
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return {
      success: false,
      message: "Invalid or expired token",
    };
  }

  return {
    success: true,
    user: decoded,
  };
}

/**
 * Higher-order function to protect API routes with JWT authentication
 *
 * @param handler - The route handler function to protect
 * @param options - Optional configuration (e.g., required roles)
 * @returns Protected route handler
 *
 * @example
 * ```ts
 * export const GET = withAuth(async (request, user) => {
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ data: "protected" });
 * });
 * ```
 */
export function withAuth<T extends unknown[]>(
  handler: (
    request: NextRequest,
    user: JWTPayload,
    ...args: T
  ) => Promise<NextResponse>,
  options?: { requiredRoles?: string[] }
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message || "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // Check role-based access if required
    if (options?.requiredRoles && options.requiredRoles.length > 0) {
      if (!options.requiredRoles.includes(authResult.user.role)) {
        return NextResponse.json(
          {
            success: false,
            message: "Insufficient permissions",
            code: "FORBIDDEN",
          },
          { status: 403 }
        );
      }
    }

    return handler(request, authResult.user, ...args);
  };
}

/**
 * Decode a token without verification (useful for debugging)
 *
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired (without full verification)
 *
 * @param token - JWT token to check
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
}
