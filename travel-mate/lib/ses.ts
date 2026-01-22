/**
 * AWS SES Client Configuration
 *
 * Centralized SES client setup for email sending operations.
 * Uses AWS SDK v3 for modern, modular client architecture.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/**
 * AWS SES Configuration from environment variables
 */
export const SES_CONFIG = {
  region: process.env.AWS_REGION || "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  senderEmail: process.env.SES_EMAIL_SENDER || "",
};

/**
 * Validate SES configuration
 */
export const validateSESConfig = (): boolean => {
  const { accessKeyId, secretAccessKey, senderEmail } = SES_CONFIG;
  return Boolean(accessKeyId && secretAccessKey && senderEmail);
};

/**
 * Create SES client instance
 * Only creates if credentials are available
 */
export const createSESClient = (): SESClient | null => {
  if (!validateSESConfig()) {
    console.warn(
      "AWS SES credentials not configured. Email sending will not work."
    );
    return null;
  }

  return new SESClient({
    region: SES_CONFIG.region,
    credentials: {
      accessKeyId: SES_CONFIG.accessKeyId,
      secretAccessKey: SES_CONFIG.secretAccessKey,
    },
  });
};

/**
 * Singleton SES client instance
 */
let sesClientInstance: SESClient | null = null;

/**
 * Get SES client (lazy initialization)
 */
export const getSESClient = (): SESClient | null => {
  if (!sesClientInstance) {
    sesClientInstance = createSESClient();
  }
  return sesClientInstance;
};

/**
 * Email sending options
 */
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Email sending result
 */
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using AWS SES
 *
 * @param options - Email options including recipient, subject, and body
 * @returns Result with success status and message ID
 */
export const sendEmail = async (
  options: SendEmailOptions
): Promise<SendEmailResult> => {
  const sesClient = getSESClient();

  if (!sesClient) {
    return {
      success: false,
      error: "SES client not configured. Check AWS credentials.",
    };
  }

  const { to, subject, htmlBody, textBody, replyTo, cc, bcc } = options;

  // Normalize recipients to arrays
  const toAddresses = Array.isArray(to) ? to : [to];
  const replyToAddresses = replyTo
    ? Array.isArray(replyTo)
      ? replyTo
      : [replyTo]
    : undefined;
  const ccAddresses = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
  const bccAddresses = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined;

  try {
    const command = new SendEmailCommand({
      Source: SES_CONFIG.senderEmail,
      Destination: {
        ToAddresses: toAddresses,
        CcAddresses: ccAddresses,
        BccAddresses: bccAddresses,
      },
      ReplyToAddresses: replyToAddresses,
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: "UTF-8",
          },
          ...(textBody && {
            Text: {
              Data: textBody,
              Charset: "UTF-8",
            },
          }),
        },
      },
    });

    const response = await sesClient.send(command);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error("SES SendEmail failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Email rate limiting configuration
 * Default SES sandbox limits: 1 email/second, 200 emails/day
 * Production limits: varies (typically 14 emails/second)
 */
export const EMAIL_RATE_LIMITS = {
  SANDBOX: {
    maxPerSecond: 1,
    maxPerDay: 200,
  },
  PRODUCTION: {
    maxPerSecond: 14, // Default, can be increased
    maxPerDay: 50000, // Default, can be increased
  },
} as const;

export default getSESClient;
