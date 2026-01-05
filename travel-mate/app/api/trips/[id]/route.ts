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

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

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
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    logger.info("Trip fetched successfully", { tripId: id });

    return NextResponse.json({
      success: true,
      data: trip,
    });
  } catch (error) {
    logger.error("Failed to fetch trip", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/trips/[id] - Update a trip
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    // Extract updatable fields
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
    } = body;

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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });
  } catch (error) {
    logger.error("Failed to update trip", { error });
    return NextResponse.json(
      { success: false, error: "Failed to update trip" },
      { status: 500 }
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
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    // Soft delete by changing status to CANCELLED
    await prisma.trip.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    logger.info("Trip deleted successfully", { tripId: id });

    return NextResponse.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete trip", { error });
    return NextResponse.json(
      { success: false, error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
