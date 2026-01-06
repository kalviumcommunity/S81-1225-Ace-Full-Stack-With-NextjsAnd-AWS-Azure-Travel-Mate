/**
 * Trips API Route
 *
 * RESTful API endpoints for trip management.
 * Supports: GET (list/paginate), POST (create)
 *
 * Endpoints:
 * - GET  /api/trips       - List all trips with pagination & filtering
 * - POST /api/trips       - Create a new trip
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendPaginatedSuccess,
  sendSuccess,
  sendNotFound,
  sendError,
  validateRequest,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createTripSchema } from "@/lib/schemas";

// ============================================
// GET /api/trips - List trips with pagination
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
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as
      | "PLANNING"
      | "UPCOMING"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "CANCELLED"
      | null;
    const isPublic = searchParams.get("isPublic");
    const search = searchParams.get("search");
    const startDateFrom = searchParams.get("startDateFrom");
    const startDateTo = searchParams.get("startDateTo");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.TripWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (isPublic !== null && isPublic !== undefined) {
      where.isPublic = isPublic === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    // Build orderBy clause
    const validSortFields = [
      "name",
      "startDate",
      "endDate",
      "createdAt",
      "budget",
    ];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy = { [orderByField]: sortOrder };

    // Execute queries in parallel
    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          budget: true,
          currency: true,
          status: true,
          isPublic: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              tripPlaces: true,
              tripMembers: true,
            },
          },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info("Trips fetched successfully", { page, limit, total });

    return sendPaginatedSuccess(
      trips,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      "Trips fetched successfully",
      {
        userId,
        status,
        isPublic:
          isPublic === "true" ? true : isPublic === "false" ? false : null,
        search,
        startDateFrom,
        startDateTo,
        sortBy: orderByField,
        sortOrder,
      }
    );
  } catch (error) {
    logger.error("Failed to fetch trips", { error });
    return sendError(
      "Failed to fetch trips",
      ERROR_CODES.TRIP_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// POST /api/trips - Create a new trip
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Validate request body with Zod schema
    const validation = await validateRequest(request, createTripSchema);
    if (!validation.success) {
      return validation.error;
    }

    const {
      name,
      description,
      userId,
      startDate,
      endDate,
      budget,
      currency,
      status,
      isPublic,
      coverImage,
    } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendNotFound("User not found", ERROR_CODES.USER_NOT_FOUND);
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        userId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? Number(budget) : null,
        currency: currency || "USD",
        status: status || "PLANNING",
        isPublic: isPublic || false,
        coverImage,
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        budget: true,
        currency: true,
        status: true,
        isPublic: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info("Trip created successfully", { tripId: trip.id });

    return sendSuccess(trip, "Trip created successfully", 201);
  } catch (error) {
    logger.error("Failed to create trip", { error });
    return sendError(
      "Failed to create trip",
      ERROR_CODES.TRIP_CREATE_ERROR,
      500
    );
  }
}
