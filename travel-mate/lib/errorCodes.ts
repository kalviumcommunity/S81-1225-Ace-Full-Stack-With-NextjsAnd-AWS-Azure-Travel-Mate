/**
 * Error Codes Dictionary
 *
 * Centralized error codes for consistent error handling across the API.
 * Using standardized codes makes it easier to trace issues from logs
 * or monitoring dashboards.
 *
 * Code Format:
 * - E1XX: Client errors (validation, bad request)
 * - E2XX: Authentication/Authorization errors
 * - E3XX: Resource errors (not found, conflict)
 * - E4XX: Business logic errors
 * - E5XX: Server/Infrastructure errors
 */

export const ERROR_CODES = {
  // E1XX - Client Errors
  VALIDATION_ERROR: "E100",
  BAD_REQUEST: "E101",
  INVALID_INPUT: "E102",
  MISSING_FIELD: "E103",
  INVALID_FORMAT: "E104",

  // E2XX - Authentication/Authorization Errors
  UNAUTHORIZED: "E200",
  FORBIDDEN: "E201",
  TOKEN_EXPIRED: "E202",
  INVALID_TOKEN: "E203",
  SESSION_EXPIRED: "E204",

  // E3XX - Resource Errors
  NOT_FOUND: "E300",
  CONFLICT: "E301",
  ALREADY_EXISTS: "E302",
  RESOURCE_DELETED: "E303",
  RESOURCE_LOCKED: "E304",

  // E4XX - Business Logic Errors
  BUSINESS_RULE_VIOLATION: "E400",
  OPERATION_NOT_ALLOWED: "E401",
  LIMIT_EXCEEDED: "E402",
  INSUFFICIENT_PERMISSIONS: "E403",
  INVALID_STATE: "E404",

  // E5XX - Server/Infrastructure Errors
  INTERNAL_ERROR: "E500",
  DATABASE_ERROR: "E501",
  EXTERNAL_SERVICE_ERROR: "E502",
  TIMEOUT: "E503",
  SERVICE_UNAVAILABLE: "E504",

  // Domain-Specific Error Codes
  // User Errors (E60X)
  USER_NOT_FOUND: "E600",
  USER_FETCH_ERROR: "E601",
  USER_CREATE_ERROR: "E602",
  USER_UPDATE_ERROR: "E603",
  USER_DELETE_ERROR: "E604",
  USER_DUPLICATE_EMAIL: "E605",

  // Place Errors (E61X)
  PLACE_NOT_FOUND: "E610",
  PLACE_FETCH_ERROR: "E611",
  PLACE_CREATE_ERROR: "E612",
  PLACE_UPDATE_ERROR: "E613",
  PLACE_DELETE_ERROR: "E614",
  PLACE_DUPLICATE_SLUG: "E615",

  // Trip Errors (E62X)
  TRIP_NOT_FOUND: "E620",
  TRIP_FETCH_ERROR: "E621",
  TRIP_CREATE_ERROR: "E622",
  TRIP_UPDATE_ERROR: "E623",
  TRIP_DELETE_ERROR: "E624",

  // Review Errors (E63X)
  REVIEW_NOT_FOUND: "E630",
  REVIEW_FETCH_ERROR: "E631",
  REVIEW_CREATE_ERROR: "E632",
  REVIEW_UPDATE_ERROR: "E633",
  REVIEW_DELETE_ERROR: "E634",
  REVIEW_DUPLICATE: "E635",
  REVIEW_INVALID_RATING: "E636",

  // Category Errors (E64X)
  CATEGORY_NOT_FOUND: "E640",
  CATEGORY_FETCH_ERROR: "E641",
  CATEGORY_CREATE_ERROR: "E642",
  CATEGORY_UPDATE_ERROR: "E643",
  CATEGORY_DELETE_ERROR: "E644",
  CATEGORY_DUPLICATE: "E645",
  CATEGORY_HAS_PLACES: "E646",

  // Booking Errors (E65X)
  BOOKING_NOT_FOUND: "E650",
  BOOKING_FETCH_ERROR: "E651",
  BOOKING_CREATE_ERROR: "E652",
  BOOKING_UPDATE_ERROR: "E653",
  BOOKING_DELETE_ERROR: "E654",
  BOOKING_CANCEL_ERROR: "E655",
  BOOKING_INVALID_DATES: "E656",
  BOOKING_ALREADY_COMPLETED: "E657",
  BOOKING_ALREADY_CANCELLED: "E658",

  // File Upload Errors (E66X)
  FILE_NOT_FOUND: "E660",
  FILE_FETCH_ERROR: "E661",
  FILE_CREATE_ERROR: "E662",
  FILE_UPDATE_ERROR: "E663",
  FILE_DELETE_ERROR: "E664",
  FILE_UPLOAD_ERROR: "E665",
  FILE_TYPE_NOT_ALLOWED: "E666",
  FILE_SIZE_EXCEEDED: "E667",
  FILE_ALREADY_EXISTS: "E668",
  PRESIGNED_URL_ERROR: "E669",

  // Email Errors (E67X)
  EMAIL_SEND_ERROR: "E670",
  EMAIL_TEMPLATE_ERROR: "E671",
  EMAIL_VALIDATION_ERROR: "E672",
  EMAIL_SERVICE_UNAVAILABLE: "E673",
  EMAIL_RATE_LIMIT_EXCEEDED: "E674",
  EMAIL_RECIPIENT_INVALID: "E675",
  EMAIL_SENDER_NOT_VERIFIED: "E676",
} as const;

/**
 * Type for error code values
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Error code descriptions for documentation and logging
 */
export const ERROR_DESCRIPTIONS: Record<ErrorCode, string> = {
  // E1XX - Client Errors
  E100: "Validation error - input data failed validation rules",
  E101: "Bad request - malformed request syntax or invalid request",
  E102: "Invalid input - data doesn't meet requirements",
  E103: "Missing required field in the request",
  E104: "Invalid format - data format is incorrect",

  // E2XX - Authentication/Authorization Errors
  E200: "Unauthorized - authentication required",
  E201: "Forbidden - insufficient permissions for this action",
  E202: "Token expired - please re-authenticate",
  E203: "Invalid token - authentication token is invalid",
  E204: "Session expired - please log in again",

  // E3XX - Resource Errors
  E300: "Resource not found",
  E301: "Conflict - resource already exists or state conflict",
  E302: "Resource already exists with given identifier",
  E303: "Resource has been deleted",
  E304: "Resource is locked and cannot be modified",

  // E4XX - Business Logic Errors
  E400: "Business rule violation",
  E401: "Operation not allowed in current state",
  E402: "Limit exceeded",
  E403: "Insufficient permissions for this resource",
  E404: "Invalid state for this operation",

  // E5XX - Server/Infrastructure Errors
  E500: "Internal server error",
  E501: "Database operation failed",
  E502: "External service error",
  E503: "Request timeout",
  E504: "Service temporarily unavailable",

  // Domain-Specific Errors
  // User Errors
  E600: "User not found",
  E601: "Failed to fetch user(s)",
  E602: "Failed to create user",
  E603: "Failed to update user",
  E604: "Failed to delete user",
  E605: "User with this email already exists",

  // Place Errors
  E610: "Place not found",
  E611: "Failed to fetch place(s)",
  E612: "Failed to create place",
  E613: "Failed to update place",
  E614: "Failed to delete place",
  E615: "Place with this slug already exists",

  // Trip Errors
  E620: "Trip not found",
  E621: "Failed to fetch trip(s)",
  E622: "Failed to create trip",
  E623: "Failed to update trip",
  E624: "Failed to delete trip",

  // Review Errors
  E630: "Review not found",
  E631: "Failed to fetch review(s)",
  E632: "Failed to create review",
  E633: "Failed to update review",
  E634: "Failed to delete review",
  E635: "User has already reviewed this place",
  E636: "Rating must be between 1 and 5",

  // Category Errors
  E640: "Category not found",
  E641: "Failed to fetch category(ies)",
  E642: "Failed to create category",
  E643: "Failed to update category",
  E644: "Failed to delete category",
  E645: "Category with this name already exists",
  E646: "Cannot delete category with associated places",

  // Booking Errors
  E650: "Booking not found",
  E651: "Failed to fetch booking(s)",
  E652: "Failed to create booking",
  E653: "Failed to update booking",
  E654: "Failed to delete booking",
  E655: "Failed to cancel booking",
  E656: "Check-out date must be after check-in date",
  E657: "Cannot cancel a completed booking",
  E658: "Booking is already cancelled",

  // File Upload Errors
  E660: "File not found",
  E661: "Failed to fetch file(s)",
  E662: "Failed to create file record",
  E663: "Failed to update file",
  E664: "Failed to delete file",
  E665: "File upload failed",
  E666: "File type not allowed",
  E667: "File size exceeds maximum limit",
  E668: "File with this key already exists",
  E669: "Failed to generate pre-signed URL",

  // Email Errors
  E670: "Failed to send email",
  E671: "Email template generation failed",
  E672: "Invalid email request data",
  E673: "Email service is unavailable",
  E674: "Email rate limit exceeded",
  E675: "Invalid recipient email address",
  E676: "Sender email is not verified in SES",
};

/**
 * Get error description by code
 *
 * @param code - Error code
 * @returns Human-readable description of the error
 */
export const getErrorDescription = (code: ErrorCode): string => {
  return ERROR_DESCRIPTIONS[code] || "Unknown error";
};

/**
 * HTTP status code mapping for error codes
 */
export const ERROR_STATUS_CODES: Partial<Record<ErrorCode, number>> = {
  E100: 400,
  E101: 400,
  E102: 400,
  E103: 400,
  E104: 400,
  E200: 401,
  E201: 403,
  E202: 401,
  E203: 401,
  E204: 401,
  E300: 404,
  E301: 409,
  E302: 409,
  E303: 410,
  E304: 423,
  E400: 422,
  E401: 422,
  E402: 429,
  E403: 403,
  E404: 422,
  E500: 500,
  E501: 500,
  E502: 502,
  E503: 504,
  E504: 503,
};

/**
 * Get HTTP status code for an error code
 *
 * @param code - Error code
 * @returns HTTP status code (defaults to 500 if not mapped)
 */
export const getStatusForErrorCode = (code: ErrorCode): number => {
  return ERROR_STATUS_CODES[code] || 500;
};
