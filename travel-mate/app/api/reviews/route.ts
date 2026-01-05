/**
 * Reviews API Route
 *
 * RESTful API endpoints for review management.
 * Supports: GET (list/paginate), POST (create)
 *
 * Endpoints:
 * - GET  /api/reviews       - List all reviews with pagination & filtering
 * - POST /api/reviews       - Create a new review
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

// ============================================
// GET /api/reviews - List reviews with pagination
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
      | "APPROVED"
      | "REJECTED"
      | null;
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build where clause
    const where: Prisma.ReviewWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (placeId) {
      where.placeId = placeId;
    }

    if (status) {
      where.status = status;
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

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const validSortFields = ["rating", "createdAt", "visitDate"];
    const orderByField = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const orderBy = { [orderByField]: sortOrder };

    // Execute queries in parallel
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          status: true,
          visitDate: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
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
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info("Reviews fetched successfully", { page, limit, total });

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        userId,
        placeId,
        status,
        minRating: minRating ? Number(minRating) : null,
        maxRating: maxRating ? Number(maxRating) : null,
        search,
        sortBy: orderByField,
        sortOrder,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch reviews", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/reviews - Create a new review
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { userId, placeId, rating, title, comment, visitDate } = body;

    if (!userId || !placeId || rating === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: {
            userId: !userId ? "User ID is required" : null,
            placeId: !placeId ? "Place ID is required" : null,
            rating: rating === undefined ? "Rating is required" : null,
          },
        },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      return NextResponse.json(
        { success: false, error: "Place not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this place
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_placeId: {
          userId,
          placeId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "User has already reviewed this place" },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        placeId,
        rating: Number(rating),
        title,
        comment,
        visitDate: visitDate ? new Date(visitDate) : null,
        status: "PENDING",
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        status: true,
        visitDate: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
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

    logger.info("Review created successfully", { reviewId: review.id });

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create review", { error });
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
