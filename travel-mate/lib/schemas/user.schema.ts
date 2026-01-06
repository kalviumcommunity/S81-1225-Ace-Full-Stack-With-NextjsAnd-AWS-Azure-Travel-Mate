/**
 * User Validation Schemas
 *
 * Zod schemas for validating user-related API requests.
 * These schemas ensure data integrity for user creation and updates.
 */

import { z } from "zod";

/**
 * Valid user roles enum
 */
export const UserRoleEnum = z.enum(["USER", "ADMIN", "MODERATOR"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

/**
 * Schema for creating a new user (POST /api/users)
 */
export const createUserSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  name: z
    .string({ message: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .max(255, "Name must be at most 255 characters"),
  role: UserRoleEnum.optional().default("USER"),
  bio: z
    .string()
    .max(1000, "Bio must be at most 1000 characters")
    .optional()
    .nullable(),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be at most 20 characters")
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number format")
    .optional()
    .nullable(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Schema for updating an existing user (PUT /api/users/[id])
 */
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(255, "Name must be at most 255 characters")
      .optional(),
    bio: z
      .string()
      .max(1000, "Bio must be at most 1000 characters")
      .optional()
      .nullable(),
    phoneNumber: z
      .string()
      .max(20, "Phone number must be at most 20 characters")
      .regex(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
        "Invalid phone number format"
      )
      .optional()
      .nullable(),
    avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
    role: UserRoleEnum.optional(),
    isActive: z.boolean().optional(),
    emailVerified: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
