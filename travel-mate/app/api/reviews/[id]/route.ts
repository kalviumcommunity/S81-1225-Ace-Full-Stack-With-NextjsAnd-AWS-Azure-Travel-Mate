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
      return sendNotFound("Review not found", ERROR_CODES.REVIEW_NOT_FOUND);
    }

    logger.info("Review fetched successfully", { reviewId: id });

    return sendSuccess(review, "Review fetched successfully");
  } catch (error) {
    logger.error("Failed to fetch review", { error });
    return sendError(
      "Failed to fetch review",
      ERROR_CODES.REVIEW_FETCH_ERROR,
      500
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
      return sendNotFound("Review not found", ERROR_CODES.REVIEW_NOT_FOUND);
    }

    // Extract updatable fields
    const { rating, title, comment, status, visitDate } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return sendBadRequest(
          "Rating must be between 1 and 5",
          ERROR_CODES.REVIEW_INVALID_RATING
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
      return sendBadRequest(
        "No fields to update",
        ERROR_CODES.VALIDATION_ERROR
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

    return sendSuccess(review, "Review updated successfully");
  } catch (error) {
    logger.error("Failed to update review", { error });
    return sendError(
      "Failed to update review",
      ERROR_CODES.REVIEW_UPDATE_ERROR,
      500
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
      return sendNotFound("Review not found", ERROR_CODES.REVIEW_NOT_FOUND);
    }

    // Hard delete the review
    await prisma.review.delete({
      where: { id },
    });

    logger.info("Review deleted successfully", { reviewId: id });

    return sendSuccess(null, "Review deleted successfully");
  } catch (error) {
    logger.error("Failed to delete review", { error });
    return sendError(
      "Failed to delete review",
      ERROR_CODES.REVIEW_DELETE_ERROR,
      500
    );
  }
}
