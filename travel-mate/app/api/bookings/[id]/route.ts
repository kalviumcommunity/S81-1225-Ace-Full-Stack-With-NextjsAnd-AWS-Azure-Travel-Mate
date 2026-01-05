/**
 * Booking by ID API Route
 *
 * RESTful API endpoints for individual booking operations.
 * Supports: GET (read), PUT (update), DELETE (cancel)
 *
 * Endpoints:
 * - GET    /api/bookings/[id]  - Get a specific booking
 * - PUT    /api/bookings/[id]  - Update a booking
 * - DELETE /api/bookings/[id]  - Cancel a booking
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendSuccess,
  sendNotFound,
  sendBadRequest,
  sendError,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/bookings/[id] - Get a specific booking
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
            phoneNumber: true,
            avatarUrl: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            address: true,
            city: true,
            country: true,
            imageUrl: true,
            rating: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
            transactionId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return sendNotFound("Booking not found", ERROR_CODES.BOOKING_NOT_FOUND);
    }

    logger.info("Booking fetched successfully", { bookingId: id });

    return sendSuccess(booking, "Booking fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch booking", { error });
    return sendError(
      "Failed to fetch booking",
      ERROR_CODES.BOOKING_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// PUT /api/bookings/[id] - Update a booking
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return sendNotFound("Booking not found", ERROR_CODES.BOOKING_NOT_FOUND);
    }

    // Extract updatable fields
    const {
      checkIn,
      checkOut,
      guestCount,
      totalAmount,
      currency,
      status,
      paymentStatus,
      specialRequests,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (checkIn !== undefined)
      updateData.checkIn = checkIn ? new Date(checkIn) : null;
    if (checkOut !== undefined)
      updateData.checkOut = checkOut ? new Date(checkOut) : null;
    if (guestCount !== undefined) updateData.guestCount = guestCount;
    if (totalAmount !== undefined)
      updateData.totalAmount = totalAmount ? Number(totalAmount) : null;
    if (currency !== undefined) updateData.currency = currency;
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (specialRequests !== undefined)
      updateData.specialRequests = specialRequests;

    if (Object.keys(updateData).length === 0) {
      return sendBadRequest(
        "No fields to update",
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Validate dates if being updated
    if (updateData.checkIn && updateData.checkOut) {
      if (
        new Date(updateData.checkOut as string) <=
        new Date(updateData.checkIn as string)
      ) {
        return sendBadRequest(
          "Check-out date must be after check-in date",
          ERROR_CODES.BOOKING_INVALID_DATES
        );
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
          },
        },
      },
    });

    logger.info("Booking updated successfully", { bookingId: id });

    return sendSuccess(booking, "Booking updated successfully");
  } catch (error) {
    logger.error("Failed to update booking", { error });
    return sendError(
      "Failed to update booking",
      ERROR_CODES.BOOKING_UPDATE_ERROR,
      500
    );
  }
}

// ============================================
// DELETE /api/bookings/[id] - Cancel a booking
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return sendNotFound("Booking not found", ERROR_CODES.BOOKING_NOT_FOUND);
    }

    // Check if booking can be cancelled
    if (existingBooking.status === "COMPLETED") {
      return sendBadRequest(
        "Cannot cancel a completed booking",
        ERROR_CODES.BOOKING_ALREADY_COMPLETED
      );
    }

    if (existingBooking.status === "CANCELLED") {
      return sendBadRequest(
        "Booking is already cancelled",
        ERROR_CODES.BOOKING_ALREADY_CANCELLED
      );
    }

    // Soft delete by changing status to CANCELLED
    await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    logger.info("Booking cancelled successfully", { bookingId: id });

    return sendSuccess(null, "Booking cancelled successfully");
  } catch (error) {
    logger.error("Failed to cancel booking", { error });
    return sendError(
      "Failed to cancel booking",
      ERROR_CODES.BOOKING_DELETE_ERROR,
      500
    );
  }
}
