/**
 * Email Templates
 *
 * Reusable HTML email templates for transactional emails.
 * All templates return formatted HTML strings ready for sending.
 */

/**
 * Base email wrapper with consistent styling
 */
const baseTemplate = (content: string, appName: string = "Travel Mate") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px 25px;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #eeeeee;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 25px;
      font-weight: 600;
      margin: 15px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .highlight {
      background-color: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    hr {
      border: none;
      border-top: 1px solid #eeeeee;
      margin: 25px 0;
    }
    a {
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌍 ${appName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      <p>This is an automated email — please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Welcome email template for new user signups
 */
export const welcomeTemplate = (userName: string, loginUrl?: string) => {
  const content = `
    <h2>Welcome aboard, ${userName}! 🎉</h2>
    <p>We're thrilled to have you join the Travel Mate community!</p>
    <p>With Travel Mate, you can:</p>
    <ul>
      <li>🗺️ Discover amazing travel destinations</li>
      <li>📅 Plan and organize your trips</li>
      <li>⭐ Share reviews and experiences</li>
      <li>🤝 Connect with fellow travelers</li>
    </ul>
    ${
      loginUrl
        ? `
    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Start Exploring</a>
    </p>
    `
        : ""
    }
    <div class="highlight">
      <strong>Pro Tip:</strong> Complete your profile to get personalized destination recommendations!
    </div>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Happy travels! ✈️</p>
  `;

  return baseTemplate(content);
};

/**
 * Password reset email template
 */
export const passwordResetTemplate = (
  userName: string,
  resetUrl: string,
  expiresIn: string = "1 hour"
) => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <div class="highlight">
      <strong>⏰ Important:</strong> This link will expire in ${expiresIn}.
    </div>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <hr />
    <p style="font-size: 12px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
  `;

  return baseTemplate(content);
};

/**
 * Email verification template
 */
export const emailVerificationTemplate = (
  userName: string,
  verificationUrl: string,
  verificationCode?: string
) => {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hi ${userName},</p>
    <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email</a>
    </p>
    ${
      verificationCode
        ? `
    <div class="highlight">
      <strong>Verification Code:</strong> <code style="font-size: 18px; font-weight: bold;">${verificationCode}</code>
    </div>
    `
        : ""
    }
    <p>If you didn't create an account with us, please ignore this email.</p>
    <hr />
    <p style="font-size: 12px; color: #666;">
      This verification link will expire in 24 hours.
    </p>
  `;

  return baseTemplate(content);
};

/**
 * Booking confirmation email template
 */
export const bookingConfirmationTemplate = (
  userName: string,
  bookingDetails: {
    placeName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: string;
    bookingId: string;
  }
) => {
  const { placeName, checkIn, checkOut, guests, totalAmount, bookingId } =
    bookingDetails;

  const content = `
    <h2>Booking Confirmed! 🎊</h2>
    <p>Hi ${userName},</p>
    <p>Great news! Your booking has been confirmed. Here are the details:</p>
    
    <div class="highlight">
      <h3 style="margin-top: 0;">📍 ${placeName}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>Check-in:</strong></td>
          <td style="padding: 8px 0;">${checkIn}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Check-out:</strong></td>
          <td style="padding: 8px 0;">${checkOut}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Guests:</strong></td>
          <td style="padding: 8px 0;">${guests}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Total:</strong></td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #667eea;">${totalAmount}</td>
        </tr>
      </table>
    </div>
    
    <p style="text-align: center; font-size: 14px; color: #666;">
      <strong>Booking Reference:</strong> ${bookingId}
    </p>
    
    <hr />
    
    <p><strong>What's next?</strong></p>
    <ul>
      <li>Check your email for any additional instructions</li>
      <li>Review the cancellation policy</li>
      <li>Save this confirmation for your records</li>
    </ul>
    
    <p>Have a wonderful trip! 🌴</p>
  `;

  return baseTemplate(content);
};

/**
 * Trip reminder email template
 */
export const tripReminderTemplate = (
  userName: string,
  tripDetails: {
    tripName: string;
    startDate: string;
    destination: string;
    daysUntil: number;
  }
) => {
  const { tripName, startDate, destination, daysUntil } = tripDetails;

  const content = `
    <h2>Trip Reminder 🗓️</h2>
    <p>Hi ${userName},</p>
    <p>Your adventure is just around the corner!</p>
    
    <div class="highlight">
      <h3 style="margin-top: 0;">${tripName}</h3>
      <p><strong>📍 Destination:</strong> ${destination}</p>
      <p><strong>📅 Start Date:</strong> ${startDate}</p>
      <p style="font-size: 20px; text-align: center; color: #667eea;">
        <strong>${daysUntil} day${daysUntil !== 1 ? "s" : ""} to go!</strong>
      </p>
    </div>
    
    <p><strong>Packing Checklist:</strong></p>
    <ul>
      <li>✅ Valid ID/Passport</li>
      <li>✅ Travel insurance documents</li>
      <li>✅ Booking confirmations</li>
      <li>✅ Local currency or travel card</li>
      <li>✅ Phone charger and adapter</li>
    </ul>
    
    <p>Safe travels! 🛫</p>
  `;

  return baseTemplate(content);
};

/**
 * Generic notification email template
 */
export const notificationTemplate = (
  userName: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
) => {
  const content = `
    <h2>${title}</h2>
    <p>Hi ${userName},</p>
    <p>${message}</p>
    ${
      actionUrl && actionText
        ? `
    <p style="text-align: center;">
      <a href="${actionUrl}" class="button">${actionText}</a>
    </p>
    `
        : ""
    }
  `;

  return baseTemplate(content);
};

/**
 * Export all templates
 */
export const EmailTemplates = {
  welcome: welcomeTemplate,
  passwordReset: passwordResetTemplate,
  emailVerification: emailVerificationTemplate,
  bookingConfirmation: bookingConfirmationTemplate,
  tripReminder: tripReminderTemplate,
  notification: notificationTemplate,
};

export default EmailTemplates;
