/**
 * Admin Users API Routes
 *
 * Protected admin-only endpoints for user management.
 * Provides full CRUD operations on users with filtering.
 *
 * Endpoints:
 * - GET    /api/admin/users         - List all users with advanced filters
 * - POST   /api/admin/users         - Create a new user (with any role)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

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

/**
 * GET /api/admin/users
 *
 * List all users with advanced filtering (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = getUserFromHeaders(request);
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 20)
    );
    const skip = (page - 1) * limit;

    // Filtering parameters
    const role = searchParams.get("role") as UserRole | null;
    const isActive = searchParams.get("isActive");
    const emailVerified = searchParams.get("emailVerified");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (role && Object.values(UserRole).includes(role)) {
      where.role = role;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (emailVerified !== null && emailVerified !== undefined) {
      where.emailVerified = emailVerified === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const validSortFields = [
      "name",
      "email",
      "createdAt",
      "role",
      "lastLoginAt",
    ];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy = { [orderByField]: sortOrder };

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
              bookings: true,
              trips: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info(
      `Admin ${admin.email} fetched ${users.length} users (page ${page})`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Users retrieved successfully",
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          role,
          isActive: isActive !== null ? isActive === "true" : undefined,
          emailVerified:
            emailVerified !== null ? emailVerified === "true" : undefined,
          search,
          sortBy: orderByField,
          sortOrder,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Admin users list error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve users",
        error: {
          code: "ADMIN_USERS_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 *
 * Create a new user with specified role (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = getUserFromHeaders(request);
    const body = await request.json();

    const { email, name, password, role = "USER", phoneNumber, bio } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: email, name, and password",
          error: { code: "VALIDATION_ERROR" },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
          error: { code: "VALIDATION_ERROR" },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists",
          error: { code: "CONFLICT" },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: role as UserRole,
        phoneNumber,
        bio,
        isActive: true,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        bio: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    logger.info(
      `Admin ${admin.email} created user: ${newUser.email} with role ${newUser.role}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Admin create user error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: {
          code: "ADMIN_CREATE_USER_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
