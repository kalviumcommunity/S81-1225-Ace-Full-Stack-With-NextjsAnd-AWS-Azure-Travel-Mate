/**
 * Users API Route
 *
 * RESTful API endpoints for user management.
 * Supports: GET (list/paginate), POST (create)
 * Implements Redis caching with cache-aside pattern.
 *
 * Endpoints:
 * - GET  /api/users       - List all users with pagination & filtering
 * - POST /api/users       - Create a new user
 *
 * This route demonstrates the centralized error handling system.
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendPaginatedSuccess,
  sendSuccess,
  validateRequest,
} from "@/lib/responseHandler";
import { createUserSchema } from "@/lib/schemas";
import { handleError, ConflictError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  cacheAside,
  buildListCacheKey,
  CachePrefix,
  CacheTTL,
  invalidateUsersCache,
} from "@/lib/cache";

// ============================================
// GET /api/users - List users with pagination
// ============================================
export async function GET(request: NextRequest) {
  const context = { method: "GET", path: "/api/users", operation: "listUsers" };
  const startTime = performance.now();

  try {
    const timer = logger.time("GET /api/users");
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );
    const skip = (page - 1) * limit;

    // Filtering parameters
    const role = searchParams.get("role") as
      | "USER"
      | "ADMIN"
      | "MODERATOR"
      | null;
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Skip cache for requests with bypass flag
    const skipCache = searchParams.get("_bypass_cache") === "true";

    // Simulate error for testing (remove in production)
    if (searchParams.get("_simulate_error") === "true") {
      throw new Error("Simulated database connection failure!");
    }

    // Build cache key
    const cacheKey = buildListCacheKey(CachePrefix.USERS, {
      page: String(page),
      limit: String(limit),
      role,
      isActive,
      search,
      sortBy,
      sortOrder,
    });

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const validSortFields = ["name", "email", "createdAt", "role"];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy = { [orderByField]: sortOrder };

    // Use cache-aside pattern for data fetching
    const {
      data: result,
      cached,
      duration,
    } = await cacheAside({
      key: cacheKey,
      ttl: CacheTTL.SHORT, // 60 seconds TTL for users list
      skipCache,
      fetchFn: async () => {
        // Execute queries in parallel
        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy,
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
            },
          }),
          prisma.user.count({ where }),
        ]);
        return { users, total };
      },
    });

    const { users, total } = result;

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const totalDuration = performance.now() - startTime;
    timer.end({
      usersCount: users.length,
      total,
      cached,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendPaginatedSuccess(
      users,
      { page, limit, total, totalPages, hasNextPage, hasPrevPage },
      "Users fetched successfully",
      {
        role,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : null,
        search,
        sortBy: orderByField,
        sortOrder,
        _cache: {
          hit: cached,
          key: cacheKey,
          ttl: CacheTTL.SHORT,
          duration: `${duration.toFixed(2)}ms`,
          totalDuration: `${totalDuration.toFixed(2)}ms`,
        },
      }
    );
  } catch (error) {
    // Use centralized error handler
    return handleError(error, context);
  }
}

// ============================================
// POST /api/users - Create a new user
// ============================================
export async function POST(request: NextRequest) {
  const context = {
    method: "POST",
    path: "/api/users",
    operation: "createUser",
  };

  try {
    const timer = logger.time("POST /api/users");

    // Validate request body with Zod schema
    const validation = await validateRequest(request, createUserSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { email, name, role, bio, phoneNumber, avatarUrl } = validation.data;

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Use custom ConflictError
      throw new ConflictError(
        "User with this email already exists",
        ERROR_CODES.USER_DUPLICATE_EMAIL
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || "USER",
        bio,
        phoneNumber,
        avatarUrl,
      },
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

    timer.end({ userId: user.id });

    // Invalidate users cache after creating new user
    await invalidateUsersCache();

    return sendSuccess(user, "User created successfully", 201);
  } catch (error) {
    // Use centralized error handler
    return handleError(error, context);
  }
}
