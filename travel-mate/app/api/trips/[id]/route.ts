/**
 * Trip by ID API Route
 *
 * RESTful API endpoints for individual trip operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/trips/[id]  - Get a specific trip
 * - PUT    /api/trips/[id]  - Update a trip
 * - DELETE /api/trips/[id]  - Delete a trip
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendSuccess,
  sendNotFound,
  sendError,
  validateRequest,
} from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { updateTripSchema } from "@/lib/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/trips/[id] - Get a specific trip
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id },
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
            email: true,
            avatarUrl: true,
          },
        },
        tripPlaces: {
          orderBy: { visitOrder: "asc" },
          select: {
            id: true,
            visitOrder: true,
            visitDate: true,
            duration: true,
            notes: true,
            place: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                city: true,
                country: true,
                rating: true,
              },
            },
          },
        },
        tripMembers: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            tripPlaces: true,
            tripMembers: true,
          },
        },
      },
    });

    if (!trip) {
      return sendNotFound("Trip not found", ERROR_CODES.TRIP_NOT_FOUND);
    }

    logger.info("Trip fetched successfully", { tripId: id });

    return sendSuccess(trip, "Trip fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch trip", { error });
    return sendError("Failed to fetch trip", ERROR_CODES.TRIP_FETCH_ERROR, 500);
  }
}

// ============================================
// PUT /api/trips/[id] - Update a trip
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate request body with Zod schema
    const validation = await validateRequest(request, updateTripSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return sendNotFound("Trip not found", ERROR_CODES.TRIP_NOT_FOUND);
    }

    const {
      name,
      description,
      startDate,
      endDate,
      budget,
      currency,
      status,
      isPublic,
      coverImage,
    } = validation.data;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (budget !== undefined)
      updateData.budget = budget ? Number(budget) : null;
    if (currency !== undefined) updateData.currency = currency;
    if (status !== undefined) updateData.status = status;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    const trip = await prisma.trip.update({
      where: { id },
      data: updateData,
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

    logger.info("Trip updated successfully", { tripId: id });

    return sendSuccess(trip, "Trip updated successfully");
  } catch (error) {
    logger.error("Failed to update trip", { error });
    return sendError(
      "Failed to update trip",
      ERROR_CODES.TRIP_UPDATE_ERROR,
      500
    );
  }
}

// ============================================
// DELETE /api/trips/[id] - Delete a trip
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return sendNotFound("Trip not found", ERROR_CODES.TRIP_NOT_FOUND);
    }

    // Soft delete by changing status to CANCELLED
    await prisma.trip.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    logger.info("Trip deleted successfully", { tripId: id });

    return sendSuccess(null, "Trip deleted successfully");
  } catch (error) {
    logger.error("Failed to delete trip", { error });
    return sendError(
      "Failed to delete trip",
      ERROR_CODES.TRIP_DELETE_ERROR,
      500
    );
  }
}
