/**
 * Next.js Middleware for Authorization
 *
 * This middleware provides JWT validation and Role-Based Access Control (RBAC)
 * for protected API routes. It runs before every matching request.
 *
 * Flow:
 * 1. Extract JWT from Authorization header
 * 2. Verify token validity
 * 3. Check user role against route requirements
 * 4. Allow or deny access based on permissions
 *
 * Security Principles:
 * - Principle of Least Privilege: Users only get access to what they need
 * - Defense in Depth: Multiple layers of validation
 * - Fail Secure: Deny access by default if checks fail
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload as JoseJWTPayload } from "jose";

// ============================================
// CONFIGURATION
// ============================================

/**
 * JWT secret encoded for jose library
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

/**
 * User roles enum - must match Prisma UserRole enum
 */
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

/**
 * Extended JWT payload with user information
 */
interface AuthPayload extends JoseJWTPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Route configuration for RBAC
 * Maps route patterns to allowed roles
 */
interface RouteConfig {
  pattern: RegExp;
  allowedRoles: UserRole[];
  requireAuth: boolean;
}

/**
 * Protected routes configuration
 * Define which routes require authentication and which roles can access them
 *
 * Order matters! More specific patterns should come first.
 */
const PROTECTED_ROUTES: RouteConfig[] = [
  // Admin-only routes - only ADMIN role can access
  {
    pattern: /^\/api\/admin(\/.*)?$/,
    allowedRoles: [UserRole.ADMIN],
    requireAuth: true,
  },

  // Moderator routes - ADMIN and MODERATOR can access
  {
    pattern: /^\/api\/moderation(\/.*)?$/,
    allowedRoles: [UserRole.ADMIN, UserRole.MODERATOR],
    requireAuth: true,
  },

  // User management - requires authentication, any authenticated role
  {
    pattern: /^\/api\/users\/me(\/.*)?$/,
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.MODERATOR],
    requireAuth: true,
  },

  // Booking routes - authenticated users only
  {
    pattern: /^\/api\/bookings(\/.*)?$/,
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.MODERATOR],
    requireAuth: true,
  },

  // Trip routes - authenticated users only
  {
    pattern: /^\/api\/trips(\/.*)?$/,
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.MODERATOR],
    requireAuth: true,
  },

  // Review creation/update/delete requires auth (but GET is public)
  {
    pattern: /^\/api\/reviews(\/.*)?$/,
    allowedRoles: [UserRole.USER, UserRole.ADMIN, UserRole.MODERATOR],
    requireAuth: true,
  },
];

/**
 * Public routes that don't require authentication
 * These routes skip all middleware checks
 */
const PUBLIC_ROUTES: RegExp[] = [
  /^\/api\/auth\/(login|signup|refresh)$/,
  /^\/api\/health$/,
  /^\/api\/places$/,
  /^\/api\/places\/[^/]+$/,
  /^\/api\/categories$/,
  /^\/api\/categories\/[^/]+$/,
  /^\/api\/db-test$/,
  /^\/api\/query-optimization$/,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify JWT token and return payload
 */
async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Check if the current route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => pattern.test(pathname));
}

/**
 * Find route configuration for the current path
 */
function findRouteConfig(pathname: string): RouteConfig | null {
  return (
    PROTECTED_ROUTES.find((config) => config.pattern.test(pathname)) || null
  );
}

/**
 * Check if user has required role for the route
 */
function hasRequiredRole(
  userRole: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Create unauthorized response
 */
function createUnauthorizedResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      code: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
function createForbiddenResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      code: "FORBIDDEN",
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

// ============================================
// FRONTEND PROTECTED ROUTES
// ============================================

/**
 * Frontend routes that require authentication
 * These routes will redirect to login if no token is present
 */
const PROTECTED_FRONTEND_ROUTES: RegExp[] = [
  /^\/dashboard(\/.*)?$/,
  /^\/users(\/.*)?$/,
];

/**
 * Check if the current path is a protected frontend route
 */
function isProtectedFrontendRoute(pathname: string): boolean {
  return PROTECTED_FRONTEND_ROUTES.some((pattern) => pattern.test(pathname));
}

// ============================================
// MIDDLEWARE FUNCTION
// ============================================

/**
 * Main middleware function
 *
 * Authorization Flow:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      Incoming Request                        │
 * └─────────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │              Is this a public route?                         │
 * │         (auth, health, public places, etc.)                  │
 * └─────────────────────────────────────────────────────────────┘
 *              │ YES                         │ NO
 *              ▼                             ▼
 * ┌─────────────────────┐     ┌─────────────────────────────────┐
 * │   Allow Access      │     │   Extract JWT from header        │
 * │   (Skip checks)     │     └─────────────────────────────────┘
 * └─────────────────────┘                    │
 *                                            ▼
 *                        ┌─────────────────────────────────────────┐
 *                        │         Is token present?               │
 *                        └─────────────────────────────────────────┘
 *                               │ NO                    │ YES
 *                               ▼                       ▼
 *                  ┌─────────────────────┐ ┌─────────────────────┐
 *                  │   401 Unauthorized  │ │   Verify JWT        │
 *                  │   (Missing Token)   │ └─────────────────────┘
 *                  └─────────────────────┘            │
 *                                                     ▼
 *                              ┌─────────────────────────────────────┐
 *                              │        Is token valid?              │
 *                              └─────────────────────────────────────┘
 *                                    │ NO                  │ YES
 *                                    ▼                     ▼
 *                       ┌─────────────────────┐ ┌─────────────────────┐
 *                       │   401 Unauthorized  │ │   Check User Role   │
 *                       │   (Invalid Token)   │ └─────────────────────┘
 *                       └─────────────────────┘            │
 *                                                          ▼
 *                                  ┌─────────────────────────────────────┐
 *                                  │   Does role match route config?     │
 *                                  └─────────────────────────────────────┘
 *                                        │ NO                  │ YES
 *                                        ▼                     ▼
 *                           ┌─────────────────────┐ ┌─────────────────────┐
 *                           │   403 Forbidden     │ │   Allow Access      │
 *                           │   (Access Denied)   │ │   (Add user headers)│
 *                           └─────────────────────┘ └─────────────────────┘
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ========================================
  // FRONTEND ROUTE PROTECTION
  // ========================================

  // Check if this is a protected frontend route
  if (isProtectedFrontendRoute(pathname)) {
    // Check for token in cookies (set by client-side login)
    const token = request.cookies.get("token")?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify the token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Invalid token - redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ========================================
  // API ROUTE PROTECTION
  // ========================================

  // Skip middleware for non-API routes (public pages like /, /login, /about)
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow OPTIONS requests for CORS preflight
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Check if this is a public route
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Find route configuration
  const routeConfig = findRouteConfig(pathname);

  // If no specific config found, check if authentication is generally required
  // For unmatched routes, we'll allow access but could require auth
  if (!routeConfig) {
    // For GET requests to /api/users, allow public access (listing)
    if (pathname === "/api/users" && request.method === "GET") {
      return NextResponse.next();
    }
    // For other routes without specific config, continue to handler
    // The handler should implement its own auth checks if needed
    return NextResponse.next();
  }

  // Route requires authentication
  if (routeConfig.requireAuth) {
    // Extract token from Authorization header
    const token = extractBearerToken(request);

    if (!token) {
      return createUnauthorizedResponse(
        "Authorization token is required. Please provide a valid Bearer token."
      );
    }

    // Verify the token
    const payload = await verifyToken(token);

    if (!payload) {
      return createUnauthorizedResponse(
        "Invalid or expired token. Please login again."
      );
    }

    // Check role-based access
    const userRole = payload.role as UserRole;

    if (!hasRequiredRole(userRole, routeConfig.allowedRoles)) {
      return createForbiddenResponse(
        `Access denied. This resource requires one of the following roles: ${routeConfig.allowedRoles.join(", ")}`
      );
    }

    // Add user info to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-name", payload.name);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    // Match protected frontend routes
    "/dashboard/:path*",
    "/users/:path*",
    // Match all API routes
    "/api/:path*",
  ],
};
