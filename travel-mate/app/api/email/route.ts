/**
 * Email API Route
 *
 * RESTful API endpoints for sending transactional emails using AWS SES.
 * Supports both custom HTML emails and pre-defined templates.
 *
 * Endpoints:
 * - POST /api/email           - Send a custom email
 * - POST /api/email/template  - Send a template-based email (handled via query param)
 * - GET  /api/email           - Get email service configuration status
 */

import { NextRequest } from "next/server";
import { sendSuccess, sendError, validateSchema } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { logger } from "@/lib/logger";
import { sendEmail, validateSESConfig, SES_CONFIG } from "@/lib/ses";
import {
  sendEmailSchema,
  sendTemplateEmailSchema,
  welcomeEmailDataSchema,
  passwordResetEmailDataSchema,
  emailVerificationDataSchema,
  bookingConfirmationDataSchema,
  tripReminderDataSchema,
  notificationDataSchema,
  type EmailType,
} from "@/lib/schemas/email.schema";
import {
  welcomeTemplate,
  passwordResetTemplate,
  emailVerificationTemplate,
  bookingConfirmationTemplate,
  tripReminderTemplate,
  notificationTemplate,
} from "@/lib/email-templates";

// ============================================
// GET /api/email - Get email service status
// ============================================

export async function GET() {
  try {
    const isConfigured = validateSESConfig();

    return sendSuccess(
      {
        configured: isConfigured,
        provider: "AWS SES",
        region: SES_CONFIG.region,
        senderConfigured: Boolean(SES_CONFIG.senderEmail),
        availableTemplates: [
          "welcome",
          "password_reset",
          "email_verification",
          "booking_confirmation",
          "trip_reminder",
          "notification",
        ],
        rateLimits: {
          sandbox: {
            maxPerSecond: 1,
            maxPerDay: 200,
            note: "Both sender and recipient must be verified in sandbox mode",
          },
          production: {
            maxPerSecond: 14,
            maxPerDay: 50000,
            note: "Limits can be increased via AWS support request",
          },
        },
      },
      "Email service configuration retrieved",
      200
    );
  } catch (error) {
    logger.error("Failed to get email configuration", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return sendError(
      "Failed to get email configuration",
      ERROR_CODES.INTERNAL_ERROR,
      500
    );
  }
}

// ============================================
// POST /api/email - Send email
// ============================================

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Check if SES is configured
    if (!validateSESConfig()) {
      logger.error("SES configuration missing", {
        hasRegion: Boolean(SES_CONFIG.region),
        hasAccessKey: Boolean(SES_CONFIG.accessKeyId),
        hasSecretKey: Boolean(SES_CONFIG.secretAccessKey),
        hasSender: Boolean(SES_CONFIG.senderEmail),
      });

      return sendError(
        "Email service is not configured. Please set AWS SES credentials.",
        ERROR_CODES.SERVICE_UNAVAILABLE,
        503
      );
    }

    // Parse request body
    const body = await request.json();

    // Check if this is a template-based email
    const { searchParams } = new URL(request.url);
    const useTemplate = searchParams.get("template") === "true";

    if (useTemplate) {
      return await handleTemplateEmail(body, startTime);
    }

    return await handleCustomEmail(body, startTime);
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Email sending failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendError(
      "Failed to send email",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error instanceof Error ? error.message : undefined
    );
  }
}

// ============================================
// Handle Custom Email (Raw HTML)
// ============================================

async function handleCustomEmail(body: unknown, startTime: number) {
  // Validate request body
  const validation = validateSchema(sendEmailSchema, body);
  if (!validation.success) {
    return validation.error;
  }

  const { to, subject, message, textBody, cc, bcc, replyTo } = validation.data;

  logger.info("Sending custom email", {
    to: Array.isArray(to) ? to.length : 1,
    subject: subject.substring(0, 50),
    hasTextBody: Boolean(textBody),
    hasCc: Boolean(cc),
    hasBcc: Boolean(bcc),
  });

  // Send email
  const result = await sendEmail({
    to,
    subject,
    htmlBody: message,
    textBody,
    cc,
    bcc,
    replyTo,
  });

  const duration = performance.now() - startTime;

  if (!result.success) {
    logger.error("Email delivery failed", {
      error: result.error,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendError(
      `Email delivery failed: ${result.error}`,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      500
    );
  }

  logger.info("Email sent successfully", {
    messageId: result.messageId,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    duration: `${duration.toFixed(2)}ms`,
  });

  return sendSuccess(
    {
      messageId: result.messageId,
      to,
      subject,
      sentAt: new Date().toISOString(),
    },
    "Email sent successfully",
    200
  );
}

// ============================================
// Handle Template Email
// ============================================

async function handleTemplateEmail(body: unknown, startTime: number) {
  // Validate template request
  const validation = validateSchema(sendTemplateEmailSchema, body);
  if (!validation.success) {
    return validation.error;
  }

  const {
    to,
    templateType,
    templateData,
    subject: customSubject,
    cc,
    bcc,
  } = validation.data;

  // Generate email content based on template type
  const { htmlContent, defaultSubject } = generateTemplateContent(
    templateType,
    templateData
  );

  if (!htmlContent) {
    return sendError(
      `Invalid template type or data: ${templateType}`,
      ERROR_CODES.VALIDATION_ERROR,
      400
    );
  }

  const subject = customSubject || defaultSubject;

  logger.info("Sending template email", {
    templateType,
    to: Array.isArray(to) ? to.length : 1,
    subject: subject.substring(0, 50),
  });

  // Send email
  const result = await sendEmail({
    to,
    subject,
    htmlBody: htmlContent,
    cc,
    bcc,
  });

  const duration = performance.now() - startTime;

  if (!result.success) {
    logger.error("Template email delivery failed", {
      templateType,
      error: result.error,
      duration: `${duration.toFixed(2)}ms`,
    });

    return sendError(
      `Email delivery failed: ${result.error}`,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      500
    );
  }

  logger.info("Template email sent successfully", {
    messageId: result.messageId,
    templateType,
    to: Array.isArray(to) ? to.join(", ") : to,
    duration: `${duration.toFixed(2)}ms`,
  });

  return sendSuccess(
    {
      messageId: result.messageId,
      templateType,
      to,
      subject,
      sentAt: new Date().toISOString(),
    },
    "Email sent successfully",
    200
  );
}

// ============================================
// Generate Template Content
// ============================================

function generateTemplateContent(
  templateType: EmailType,
  templateData: Record<string, unknown>
): { htmlContent: string | null; defaultSubject: string } {
  try {
    switch (templateType) {
      case "welcome": {
        const data = welcomeEmailDataSchema.parse(templateData);
        return {
          htmlContent: welcomeTemplate(data.userName, data.loginUrl),
          defaultSubject: "Welcome to Travel Mate! 🌍",
        };
      }

      case "password_reset": {
        const data = passwordResetEmailDataSchema.parse(templateData);
        return {
          htmlContent: passwordResetTemplate(
            data.userName,
            data.resetUrl,
            data.expiresIn
          ),
          defaultSubject: "Reset Your Password - Travel Mate",
        };
      }

      case "email_verification": {
        const data = emailVerificationDataSchema.parse(templateData);
        return {
          htmlContent: emailVerificationTemplate(
            data.userName,
            data.verificationUrl,
            data.verificationCode
          ),
          defaultSubject: "Verify Your Email - Travel Mate",
        };
      }

      case "booking_confirmation": {
        const data = bookingConfirmationDataSchema.parse(templateData);
        return {
          htmlContent: bookingConfirmationTemplate(data.userName, {
            placeName: data.placeName,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            guests: data.guests,
            totalAmount: data.totalAmount,
            bookingId: data.bookingId,
          }),
          defaultSubject: `Booking Confirmed - ${data.placeName}`,
        };
      }

      case "trip_reminder": {
        const data = tripReminderDataSchema.parse(templateData);
        return {
          htmlContent: tripReminderTemplate(data.userName, {
            tripName: data.tripName,
            startDate: data.startDate,
            destination: data.destination,
            daysUntil: data.daysUntil,
          }),
          defaultSubject: `Trip Reminder: ${data.tripName}`,
        };
      }

      case "notification": {
        const data = notificationDataSchema.parse(templateData);
        return {
          htmlContent: notificationTemplate(
            data.userName,
            data.title,
            data.message,
            data.actionUrl,
            data.actionText
          ),
          defaultSubject: data.title,
        };
      }

      case "custom":
      default:
        return {
          htmlContent: null,
          defaultSubject: "Message from Travel Mate",
        };
    }
  } catch (error) {
    logger.error("Template generation failed", {
      templateType,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      htmlContent: null,
      defaultSubject: "Message from Travel Mate",
    };
  }
}
