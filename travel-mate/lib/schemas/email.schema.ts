/**
 * Email Validation Schemas
 *
 * Zod schemas for validating email sending requests.
 */

import { z } from "zod";

/**
 * Email types for different purposes
 */
export const EMAIL_TYPES = [
  "welcome",
  "password_reset",
  "email_verification",
  "booking_confirmation",
  "trip_reminder",
  "notification",
  "custom",
] as const;

export type EmailType = (typeof EMAIL_TYPES)[number];

/**
 * Base email request schema
 */
export const sendEmailSchema = z.object({
  to: z
    .union([
      z.string().email("Invalid email address"),
      z.array(z.string().email("Invalid email address")),
    ])
    .describe("Recipient email address(es)"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(1, "Message content is required")
    .max(100000, "Message must be less than 100,000 characters")
    .describe("HTML content of the email"),
  textBody: z
    .string()
    .max(50000)
    .optional()
    .describe("Plain text version of the email"),
  cc: z
    .union([z.string().email(), z.array(z.string().email())])
    .optional()
    .describe("CC recipients"),
  bcc: z
    .union([z.string().email(), z.array(z.string().email())])
    .optional()
    .describe("BCC recipients"),
  replyTo: z
    .union([z.string().email(), z.array(z.string().email())])
    .optional()
    .describe("Reply-to address(es)"),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

/**
 * Template-based email request schema
 */
export const sendTemplateEmailSchema = z.object({
  to: z.union([
    z.string().email("Invalid email address"),
    z.array(z.string().email("Invalid email address")),
  ]),
  templateType: z.enum(EMAIL_TYPES).describe("Type of email template to use"),
  templateData: z
    .record(z.string(), z.unknown())
    .describe("Data to populate the template"),
  subject: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Override default template subject"),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
});

export type SendTemplateEmailInput = z.infer<typeof sendTemplateEmailSchema>;

/**
 * Welcome email specific data schema
 */
export const welcomeEmailDataSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  loginUrl: z.string().url().optional(),
});

export type WelcomeEmailData = z.infer<typeof welcomeEmailDataSchema>;

/**
 * Password reset email specific data schema
 */
export const passwordResetEmailDataSchema = z.object({
  userName: z.string().min(1),
  resetUrl: z.string().url("Invalid reset URL"),
  expiresIn: z.string().optional().default("1 hour"),
});

export type PasswordResetEmailData = z.infer<
  typeof passwordResetEmailDataSchema
>;

/**
 * Email verification specific data schema
 */
export const emailVerificationDataSchema = z.object({
  userName: z.string().min(1),
  verificationUrl: z.string().url("Invalid verification URL"),
  verificationCode: z.string().optional(),
});

export type EmailVerificationData = z.infer<typeof emailVerificationDataSchema>;

/**
 * Booking confirmation email data schema
 */
export const bookingConfirmationDataSchema = z.object({
  userName: z.string().min(1),
  placeName: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.number().int().positive(),
  totalAmount: z.string().min(1),
  bookingId: z.string().min(1),
});

export type BookingConfirmationData = z.infer<
  typeof bookingConfirmationDataSchema
>;

/**
 * Trip reminder email data schema
 */
export const tripReminderDataSchema = z.object({
  userName: z.string().min(1),
  tripName: z.string().min(1),
  startDate: z.string().min(1),
  destination: z.string().min(1),
  daysUntil: z.number().int().min(0),
});

export type TripReminderData = z.infer<typeof tripReminderDataSchema>;

/**
 * Notification email data schema
 */
export const notificationDataSchema = z.object({
  userName: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  actionUrl: z.string().url().optional(),
  actionText: z.string().optional(),
});

export type NotificationData = z.infer<typeof notificationDataSchema>;
