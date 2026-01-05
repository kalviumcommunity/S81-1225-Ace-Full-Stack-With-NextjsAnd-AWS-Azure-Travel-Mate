/**
 * Review by ID API Route
 *
 * RESTful API endpoints for individual review operations.
 * Supports: GET (read), PUT (update), DELETE (remove)
 *
 * Endpoints:
 * - GET    /api/reviews/[id]  - Get a specific review
 * - PUT    /api/reviews/[id]  - Update a review
 * - DELETE /api/reviews/[id]  - Delete a review
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET /api/reviews/[id] - Get a specific review
// ============================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
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
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    logger.info("Review fetched successfully", { reviewId: id });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    logger.error("Failed to fetch review", { error });
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/reviews/[id] - Update a review
// ============================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Extract updatable fields
    const { rating, title, comment, status, visitDate } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: "Rating must be between 1 and 5" },
          { status: 400 }
        );
      }
      updateData.rating = Number(rating);
    }
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;
    if (status !== undefined) updateData.status = status;
    if (visitDate !== undefined)
      updateData.visitDate = visitDate ? new Date(visitDate) : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
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

    logger.info("Review updated successfully", { reviewId: id });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    logger.error("Failed to update review", { error });
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/reviews/[id] - Delete a review
// ============================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Hard delete the review
    await prisma.review.delete({
      where: { id },
    });

    logger.info("Review deleted successfully", { reviewId: id });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete review", { error });
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
