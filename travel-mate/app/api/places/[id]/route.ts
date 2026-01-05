/**
 * Place by ID API Route
 *
 * RESTful API endpoints for individual place operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/places/[id]  - Get a specific place
 * - PUT    /api/places/[id]  - Update a place
 * - DELETE /api/places/[id]  - Delete a place
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/places/[id] - Get a specific place
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const place = await prisma.place.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        rating: true,
        reviewCount: true,
        priceLevel: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
          },
        },
        amenities: {
          select: {
            amenity: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          where: { status: "APPROVED" },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
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
            reviews: true,
            favorites: true,
            bookings: true,
          },
        },
      },
    });

    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    logger.info("Place fetched successfully", { placeId: id });

    return NextResponse.json({
      success: true,
      data: place,
    });
  } catch (error) {
    logger.error("Failed to fetch place", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch place" },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/places/[id] - Update a place
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    });

    if (!existingPlace) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    // Extract updatable fields
    const {
      name,
      description,
      address,
      city,
      country,
      categoryId,
      latitude,
      longitude,
      imageUrl,
      priceLevel,
      isFeatured,
      isActive,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (latitude !== undefined)
      updateData.latitude = latitude ? Number(latitude) : null;
    if (longitude !== undefined)
      updateData.longitude = longitude ? Number(longitude) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (priceLevel !== undefined)
      updateData.priceLevel = priceLevel ? Number(priceLevel) : null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // If categoryId is being updated, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        );
      }
    }

    const place = await prisma.place.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        city: true,
        country: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        rating: true,
        reviewCount: true,
        priceLevel: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    logger.info("Place updated successfully", { placeId: id });

    return NextResponse.json({
      success: true,
      message: "Place updated successfully",
      data: place,
    });
  } catch (error) {
    logger.error("Failed to update place", { error });
    return NextResponse.json(
      { success: false, error: "Failed to update place" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/places/[id] - Delete a place
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    });

    if (!existingPlace) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.place.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("Place deleted successfully", { placeId: id });

    return NextResponse.json({
      success: true,
      message: "Place deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete place", { error });
    return NextResponse.json(
      { success: false, error: "Failed to delete place" },
      { status: 500 }
    );
  }
}
