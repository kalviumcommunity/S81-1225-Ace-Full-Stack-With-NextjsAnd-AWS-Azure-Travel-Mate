/**
 * Bookings API Route
 *
 * RESTful API endpoints for booking management.
 * Supports: GET (list/paginate), POST (create)
 *
 * Endpoints:
 * - GET  /api/bookings       - List all bookings with pagination & filtering
 * - POST /api/bookings       - Create a new booking
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import {
  sendPaginatedSuccess,
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendBadRequest,
  sendError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

// ============================================
// GET /api/bookings - List bookings with pagination
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
    const placeId = searchParams.get("placeId");
    const status = searchParams.get("status") as
      | "PENDING"
      | "CONFIRMED"
      | "CANCELLED"
      | "COMPLETED"
      | "REFUNDED"
      | null;
    const paymentStatus = searchParams.get("paymentStatus") as
      | "PENDING"
      | "UNPAID"
      | "PAID"
      | "FAILED"
      | "REFUNDED"
      | null;
    const checkInFrom = searchParams.get("checkInFrom");
    const checkInTo = searchParams.get("checkInTo");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.BookingWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (placeId) {
      where.placeId = placeId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (checkInFrom || checkInTo) {
      where.checkIn = {};
      if (checkInFrom) {
        where.checkIn.gte = new Date(checkInFrom);
      }
      if (checkInTo) {
        where.checkIn.lte = new Date(checkInTo);
      }
    }

    // Build orderBy clause
    const validSortFields = [
      "checkIn",
      "checkOut",
      "totalAmount",
      "createdAt",
      "status",
    ];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy = { [orderByField]: sortOrder };

    // Execute queries in parallel
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          bookingRef: true,
          checkIn: true,
          checkOut: true,
          guestCount: true,
          totalAmount: true,
          currency: true,
          status: true,
          paymentStatus: true,
          specialRequests: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          place: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              country: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info("Bookings fetched successfully", { page, limit, total });

    return sendPaginatedSuccess(
      bookings,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      "Bookings fetched successfully",
      {
        userId,
        placeId,
        status,
        paymentStatus,
        checkInFrom,
        checkInTo,
        sortBy: orderByField,
        sortOrder,
      }
    );
  } catch (error) {
    logger.error("Failed to fetch bookings", { error });
    return sendError(
      "Failed to fetch bookings",
      ERROR_CODES.BOOKING_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// POST /api/bookings - Create a new booking
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      userId,
      placeId,
      checkIn,
      checkOut,
      guestCount,
      totalAmount,
      currency,
      specialRequests,
    } = body;

    if (!userId || !placeId || !checkIn || !checkOut || !totalAmount) {
      return sendValidationError({
        userId: !userId ? "User ID is required" : null,
        placeId: !placeId ? "Place ID is required" : null,
        checkIn: !checkIn ? "Check-in date is required" : null,
        checkOut: !checkOut ? "Check-out date is required" : null,
        totalAmount: !totalAmount ? "Total amount is required" : null,
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return sendBadRequest(
        "Check-out date must be after check-in date",
        ERROR_CODES.BOOKING_INVALID_DATES
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendNotFound("User not found", ERROR_CODES.USER_NOT_FOUND);
    }

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      return sendNotFound("Place not found", ERROR_CODES.PLACE_NOT_FOUND);
    }

    // Generate unique booking reference
    const bookingRef = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId,
        placeId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount: guestCount || 1,
        totalAmount: Number(totalAmount),
        currency: currency || "USD",
        specialRequests,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
      select: {
        id: true,
        bookingRef: true,
        checkIn: true,
        checkOut: true,
        guestCount: true,
        totalAmount: true,
        currency: true,
        status: true,
        paymentStatus: true,
        specialRequests: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            country: true,
          },
        },
      },
    });

    logger.info("Booking created successfully", { bookingId: booking.id });

    return sendSuccess(booking, "Booking created successfully", 201);
  } catch (error) {
    logger.error("Failed to create booking", { error });
    return sendError(
      "Failed to create booking",
      ERROR_CODES.BOOKING_CREATE_ERROR,
      500
    );
  }
}
