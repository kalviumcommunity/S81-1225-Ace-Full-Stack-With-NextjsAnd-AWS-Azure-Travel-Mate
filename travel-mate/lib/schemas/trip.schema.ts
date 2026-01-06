/**
 * Trip Validation Schemas
 *
 * Zod schemas for validating trip-related API requests.
 * These schemas ensure data integrity for trip creation and updates.
 */

import { z } from "zod";

/**
 * Valid trip statuses enum
 */
export const TripStatusEnum = z.enum([
  "PLANNING",
  "UPCOMING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export type TripStatus = z.infer<typeof TripStatusEnum>;

/**
 * Schema for creating a new trip (POST /api/trips)
 */
export const createTripSchema = z
  .object({
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters long")
      .max(255, "Name must be at most 255 characters"),
    description: z
      .string()
      .max(5000, "Description must be at most 5000 characters")
      .optional()
      .nullable(),
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
    startDate: z
      .string()
      .datetime({ message: "Invalid start date format. Use ISO 8601 format." })
      .or(z.date())
      .optional()
      .nullable(),
    endDate: z
      .string()
      .datetime({ message: "Invalid end date format. Use ISO 8601 format." })
      .or(z.date())
      .optional()
      .nullable(),
    budget: z
      .number()
      .positive("Budget must be positive")
      .max(10000000, "Budget exceeds maximum allowed")
      .optional()
      .nullable(),
    currency: z
      .string()
      .length(3, "Currency must be a 3-letter ISO code")
      .toUpperCase()
      .optional()
      .default("USD"),
    status: TripStatusEnum.optional().default("PLANNING"),
    isPublic: z.boolean().optional().default(false),
    coverImage: z.string().url("Invalid cover image URL").optional().nullable(),
  })
  .refine(
    (data) => {
      // Only validate if both dates are provided
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate >= startDate;
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;

/**
 * Schema for updating an existing trip (PUT /api/trips/[id])
 */
export const updateTripSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(255, "Name must be at most 255 characters")
      .optional(),
    description: z
      .string()
      .max(5000, "Description must be at most 5000 characters")
      .optional()
      .nullable(),
    startDate: z
      .string()
      .datetime({ message: "Invalid start date format. Use ISO 8601 format." })
      .or(z.date())
      .optional()
      .nullable(),
    endDate: z
      .string()
      .datetime({ message: "Invalid end date format. Use ISO 8601 format." })
      .or(z.date())
      .optional()
      .nullable(),
    budget: z
      .number()
      .positive("Budget must be positive")
      .max(10000000, "Budget exceeds maximum allowed")
      .optional()
      .nullable(),
    currency: z
      .string()
      .length(3, "Currency must be a 3-letter ISO code")
      .toUpperCase()
      .optional(),
    status: TripStatusEnum.optional(),
    isPublic: z.boolean().optional(),
    coverImage: z.string().url("Invalid cover image URL").optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      // Only validate if both dates are provided
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate >= startDate;
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type UpdateTripInput = z.infer<typeof updateTripSchema>;
