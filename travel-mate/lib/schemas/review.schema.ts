/**
 * Review Validation Schemas
 *
 * Zod schemas for validating review-related API requests.
 * These schemas ensure data integrity for review creation and updates.
 */

import { z } from "zod";

/**
 * Valid review statuses enum
 */
export const ReviewStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;

/**
 * Schema for creating a new review (POST /api/reviews)
 */
export const createReviewSchema = z.object({
  userId: z
    .string({ message: "User ID is required" })
    .uuid("Invalid user ID format"),
  placeId: z
    .string({ message: "Place ID is required" })
    .uuid("Invalid place ID format"),
  rating: z
    .number({ message: "Rating is required" })
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(255, "Title must be at most 255 characters")
    .optional()
    .nullable(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters long")
    .max(5000, "Comment must be at most 5000 characters")
    .optional()
    .nullable(),
  visitDate: z
    .string()
    .datetime({ message: "Invalid visit date format. Use ISO 8601 format." })
    .or(z.date())
    .optional()
    .nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Schema for updating an existing review (PUT /api/reviews/[id])
 */
export const updateReviewSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5")
      .optional(),
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(255, "Title must be at most 255 characters")
      .optional()
      .nullable(),
    comment: z
      .string()
      .min(10, "Comment must be at least 10 characters long")
      .max(5000, "Comment must be at most 5000 characters")
      .optional()
      .nullable(),
    status: ReviewStatusEnum.optional(),
    visitDate: z
      .string()
      .datetime({ message: "Invalid visit date format. Use ISO 8601 format." })
      .or(z.date())
      .optional()
      .nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
