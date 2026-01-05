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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

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
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    logger.info("Booking fetched successfully", { bookingId: id });

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    logger.error("Failed to fetch booking", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
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
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // Validate dates if being updated
    if (updateData.checkIn && updateData.checkOut) {
      if (
        new Date(updateData.checkOut as string) <=
        new Date(updateData.checkIn as string)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Check-out date must be after check-in date",
          },
          { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    logger.error("Failed to update booking", { error });
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
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
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    if (existingBooking.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a completed booking" },
        { status: 400 }
      );
    }

    if (existingBooking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Soft delete by changing status to CANCELLED
    await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    logger.info("Booking cancelled successfully", { bookingId: id });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    logger.error("Failed to cancel booking", { error });
    return NextResponse.json(
      { success: false, error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
