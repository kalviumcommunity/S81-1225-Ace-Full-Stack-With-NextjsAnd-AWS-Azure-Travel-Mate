/**
 * Users API Route
 *
 * RESTful API endpoints for user management.
 * Supports: GET (list/paginate), POST (create)
 *
 * Endpoints:
 * - GET  /api/users       - List all users with pagination & filtering
 * - POST /api/users       - Create a new user
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendPaginatedSuccess,
  sendSuccess,
  sendValidationError,
  sendBadRequest,
  sendConflict,
  sendError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

// ============================================
// GET /api/users - List users with pagination
// ============================================
export async function GET(request: NextRequest) {
  try {
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

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info("Users fetched successfully", { page, limit, total });

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
      }
    );
  } catch (error) {
    logger.error("Failed to fetch users", { error });
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.USER_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// POST /api/users - Create a new user
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { email, name, role, bio, phoneNumber, avatarUrl } = body;

    if (!email || !name) {
      return sendValidationError({
        email: !email ? "Email is required" : null,
        name: !name ? "Name is required" : null,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendBadRequest("Invalid email format");
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendConflict("User with this email already exists");
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

    logger.info("User created successfully", { userId: user.id });

    return sendSuccess(user, "User created successfully", 201);
  } catch (error) {
    logger.error("Failed to create user", { error });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return sendConflict("User with this email already exists");
      }
    }

    return sendError(
      "Failed to create user",
      ERROR_CODES.USER_CREATE_ERROR,
      500
    );
  }
}
