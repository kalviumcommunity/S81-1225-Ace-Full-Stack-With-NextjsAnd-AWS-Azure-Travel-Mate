/**
 * Category Validation Schemas
 *
 * Zod schemas for validating category-related API requests.
 * These schemas ensure data integrity for category creation and updates.
 */

import { z } from "zod";

/**
 * Schema for creating a new category (POST /api/categories)
 */
export const createCategorySchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .nullable(),
  iconUrl: z.string().url("Invalid icon URL").optional().nullable(),
  sortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .optional()
    .default(0),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

/**
 * Schema for updating an existing category (PUT /api/categories/[id])
 */
export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description must be at most 1000 characters")
      .optional()
      .nullable(),
    iconUrl: z.string().url("Invalid icon URL").optional().nullable(),
    isActive: z.boolean().optional(),
    sortOrder: z
      .number()
      .int("Sort order must be an integer")
      .min(0, "Sort order must be non-negative")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
