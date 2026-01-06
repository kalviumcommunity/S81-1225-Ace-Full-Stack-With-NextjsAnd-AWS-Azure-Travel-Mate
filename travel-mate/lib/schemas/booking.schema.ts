/**
 * Booking Validation Schemas
 *
 * Zod schemas for validating booking-related API requests.
 * These schemas ensure data integrity for booking creation and updates.
 */

import { z } from "zod";

/**
 * Valid booking statuses enum
 */
export const BookingStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "REFUNDED",
]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

/**
 * Valid payment statuses enum
 */
export const PaymentStatusEnum = z.enum([
  "PENDING",
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

/**
 * Valid currency codes (ISO 4217)
 */
export const CurrencyEnum = z
  .string()
  .length(3, "Currency must be a 3-letter ISO code")
  .toUpperCase();

/**
 * Schema for creating a new booking (POST /api/bookings)
 */
export const createBookingSchema = z
  .object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
    placeId: z
      .string({ message: "Place ID is required" })
      .uuid("Invalid place ID format"),
    checkIn: z
      .string({ message: "Check-in date is required" })
      .datetime({
        message: "Invalid check-in date format. Use ISO 8601 format.",
      })
      .or(z.date()),
    checkOut: z
      .string({ message: "Check-out date is required" })
      .datetime({
        message: "Invalid check-out date format. Use ISO 8601 format.",
      })
      .or(z.date()),
    guestCount: z
      .number()
      .int("Guest count must be an integer")
      .min(1, "Guest count must be at least 1")
      .max(100, "Guest count must be at most 100")
      .optional()
      .default(1),
    totalAmount: z
      .number({ message: "Total amount is required" })
      .positive("Total amount must be positive")
      .max(1000000, "Total amount exceeds maximum allowed"),
    currency: CurrencyEnum.optional().default("USD"),
    specialRequests: z
      .string()
      .max(2000, "Special requests must be at most 2000 characters")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      return checkOut > checkIn;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Schema for updating an existing booking (PUT /api/bookings/[id])
 */
export const updateBookingSchema = z
  .object({
    checkIn: z
      .string()
      .datetime({
        message: "Invalid check-in date format. Use ISO 8601 format.",
      })
      .or(z.date())
      .optional()
      .nullable(),
    checkOut: z
      .string()
      .datetime({
        message: "Invalid check-out date format. Use ISO 8601 format.",
      })
      .or(z.date())
      .optional()
      .nullable(),
    guestCount: z
      .number()
      .int("Guest count must be an integer")
      .min(1, "Guest count must be at least 1")
      .max(100, "Guest count must be at most 100")
      .optional(),
    totalAmount: z
      .number()
      .positive("Total amount must be positive")
      .max(1000000, "Total amount exceeds maximum allowed")
      .optional()
      .nullable(),
    currency: CurrencyEnum.optional(),
    status: BookingStatusEnum.optional(),
    paymentStatus: PaymentStatusEnum.optional(),
    specialRequests: z
      .string()
      .max(2000, "Special requests must be at most 2000 characters")
      .optional()
      .nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .refine(
    (data) => {
      // Only validate if both dates are provided
      if (data.checkIn && data.checkOut) {
        const checkIn = new Date(data.checkIn);
        const checkOut = new Date(data.checkOut);
        return checkOut > checkIn;
      }
      return true;
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    }
  );

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
