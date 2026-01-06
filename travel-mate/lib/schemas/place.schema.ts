/**
 * Place Validation Schemas
 *
 * Zod schemas for validating place-related API requests.
 * These schemas ensure data integrity for place creation and updates.
 */

import { z } from "zod";

/**
 * Schema for creating a new place (POST /api/places)
 */
export const createPlaceSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .max(255, "Name must be at most 255 characters"),
  description: z
    .string()
    .max(5000, "Description must be at most 5000 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, "Address must be at most 500 characters")
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, "City must be at most 100 characters")
    .optional()
    .nullable(),
  country: z
    .string({ message: "Country is required" })
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be at most 100 characters"),
  categoryId: z
    .string({ message: "Category ID is required" })
    .uuid("Invalid category ID format"),
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
  priceLevel: z
    .number()
    .int("Price level must be an integer")
    .min(1, "Price level must be between 1 and 5")
    .max(5, "Price level must be between 1 and 5")
    .optional()
    .nullable(),
  isFeatured: z.boolean().optional().default(false),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;

/**
 * Schema for updating an existing place (PUT /api/places/[id])
 */
export const updatePlaceSchema = z
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
    address: z
      .string()
      .max(500, "Address must be at most 500 characters")
      .optional()
      .nullable(),
    city: z
      .string()
      .max(100, "City must be at most 100 characters")
      .optional()
      .nullable(),
    country: z
      .string()
      .min(2, "Country must be at least 2 characters")
      .max(100, "Country must be at most 100 characters")
      .optional(),
    categoryId: z.string().uuid("Invalid category ID format").optional(),
    latitude: z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
      .nullable(),
    longitude: z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
      .nullable(),
    imageUrl: z.string().url("Invalid image URL").optional().nullable(),
    priceLevel: z
      .number()
      .int("Price level must be an integer")
      .min(1, "Price level must be between 1 and 5")
      .max(5, "Price level must be between 1 and 5")
      .optional()
      .nullable(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
