/**
 * Places API Route
 *
 * RESTful API endpoints for travel places/destinations management.
 * Supports: GET (list/paginate), POST (create)
 *
 * Endpoints:
 * - GET  /api/places       - List all places with pagination & filtering
 * - POST /api/places       - Create a new place
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

// ============================================
// GET /api/places - List places with pagination
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
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const categoryId = searchParams.get("categoryId");
    const isFeatured = searchParams.get("isFeatured");
    const isActive = searchParams.get("isActive");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const priceLevel = searchParams.get("priceLevel");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.PlaceWhereInput = {};

    if (country) {
      where.country = { contains: country, mode: "insensitive" };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    } else {
      // Default to only active places
      where.isActive = true;
    }

    if (minRating) {
      where.rating = {
        ...((where.rating as object) || {}),
        gte: Number(minRating),
      };
    }

    if (maxRating) {
      where.rating = {
        ...((where.rating as object) || {}),
        lte: Number(maxRating),
      };
    }

    if (priceLevel) {
      where.priceLevel = Number(priceLevel);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const validSortFields = [
      "name",
      "rating",
      "reviewCount",
      "createdAt",
      "priceLevel",
    ];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy = { [orderByField]: sortOrder };

    // Execute queries in parallel
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.place.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info("Places fetched successfully", { page, limit, total });

    return NextResponse.json({
      success: true,
      data: places,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        country,
        city,
        categoryId,
        isFeatured:
          isFeatured === "true" ? true : isFeatured === "false" ? false : null,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : null,
        minRating: minRating ? Number(minRating) : null,
        maxRating: maxRating ? Number(maxRating) : null,
        priceLevel: priceLevel ? Number(priceLevel) : null,
        search,
        sortBy: orderByField,
        sortOrder,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch places", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/places - Create a new place
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
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
    } = body;

    if (!name || !country || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: {
            name: !name ? "Name is required" : null,
            country: !country ? "Country is required" : null,
            categoryId: !categoryId ? "Category ID is required" : null,
          },
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.place.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create place
    const place = await prisma.place.create({
      data: {
        name,
        slug,
        description,
        address,
        city,
        country,
        categoryId,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        imageUrl,
        priceLevel: priceLevel ? Number(priceLevel) : null,
        isFeatured: isFeatured || false,
      },
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

    logger.info("Place created successfully", { placeId: place.id });

    return NextResponse.json(
      {
        success: true,
        message: "Place created successfully",
        data: place,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create place", { error });
    return NextResponse.json(
      { success: false, error: "Failed to create place" },
      { status: 500 }
    );
  }
}
