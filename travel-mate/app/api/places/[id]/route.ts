/**
 * Place by ID API Route
 *
 * RESTful API endpoints for individual place operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 * Implements Redis caching with cache-aside pattern.
 *
 * Endpoints:
 * - GET    /api/places/[id]  - Get a specific place
 * - PUT    /api/places/[id]  - Update a place
 * - DELETE /api/places/[id]  - Delete a place
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
import { updatePlaceSchema } from "@/lib/schemas";
import {
  cacheAside,
  buildItemCacheKey,
  CachePrefix,
  CacheTTL,
  invalidatePlacesCache,
} from "@/lib/cache";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/places/[id] - Get a specific place
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = performance.now();

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const skipCache = searchParams.get("_bypass_cache") === "true";

    // Build cache key for individual place
    const cacheKey = buildItemCacheKey(CachePrefix.PLACES, id);

    // Use cache-aside pattern
    const {
      data: place,
      cached,
      duration,
    } = await cacheAside({
      key: cacheKey,
      ttl: CacheTTL.MEDIUM, // 5 minutes for individual place details
      skipCache,
      fetchFn: async () => {
        return prisma.place.findUnique({
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
      },
    });

    if (!place) {
      return sendNotFound("Place");
    }

    const totalDuration = performance.now() - startTime;
    logger.info("Place fetched successfully", {
      placeId: id,
      cached,
      duration: `${duration.toFixed(2)}ms`,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
    });

    return sendSuccess(
      {
        ...place,
        _cache: {
          hit: cached,
          key: cacheKey,
          ttl: CacheTTL.MEDIUM,
          duration: `${duration.toFixed(2)}ms`,
        },
      },
      "Place fetched successfully"
    );
  } catch (error) {
    logger.error("Failed to fetch place", { error });
    return sendError(
      "Failed to fetch place",
      ERROR_CODES.PLACE_FETCH_ERROR,
      500
    );
  }
}

// ============================================
// PUT /api/places/[id] - Update a place
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate request body with Zod schema
    const validation = await validateRequest(request, updatePlaceSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    });

    if (!existingPlace) {
      return sendNotFound("Place");
    }

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
    } = validation.data;

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

    // If categoryId is being updated, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return sendNotFound("Category");
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

    // Invalidate cache after updating place
    await invalidatePlacesCache(id);

    return sendSuccess(place, "Place updated successfully");
  } catch (error) {
    logger.error("Failed to update place", { error });
    return sendError(
      "Failed to update place",
      ERROR_CODES.PLACE_UPDATE_ERROR,
      500
    );
  }
}

// ============================================
// DELETE /api/places/[id] - Delete a place
// ============================================
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if place exists
    const existingPlace = await prisma.place.findUnique({
      where: { id },
    });

    if (!existingPlace) {
      return sendNotFound("Place");
    }

    // Soft delete by setting isActive to false
    await prisma.place.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info("Place deleted successfully", { placeId: id });

    // Invalidate cache after deleting place
    await invalidatePlacesCache(id);

    return sendSuccess(null, "Place deleted successfully");
  } catch (error) {
    logger.error("Failed to delete place", { error });
    return sendError(
      "Failed to delete place",
      ERROR_CODES.PLACE_DELETE_ERROR,
      500
    );
  }
}
