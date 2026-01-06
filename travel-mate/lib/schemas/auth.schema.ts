/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating authentication-related API requests.
 * These schemas ensure data integrity for signup and login operations.
 */

import { z } from "zod";

/**
 * Password validation requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * Schema for user signup (POST /api/auth/signup)
 */
export const signupSchema = z
  .object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email address")
      .max(255, "Email must be at most 255 characters")
      .toLowerCase()
      .trim(),
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters long")
      .max(255, "Name must be at most 255 characters")
      .trim(),
    password: passwordSchema,
    confirmPassword: z.string({ message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Schema for user login (POST /api/auth/login)
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for token refresh (POST /api/auth/refresh)
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string({ message: "Refresh token is required" }),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Schema for password change (POST /api/auth/change-password)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ message: "Current password is required" }),
    newPassword: passwordSchema,
    confirmNewPassword: z.string({
      message: "Confirm new password is required",
    }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
