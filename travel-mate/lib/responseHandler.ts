/**
 * Global API Response Handler
 *
 * A centralized utility that ensures every API endpoint returns responses
 * in a consistent, structured, and predictable format.
 *
 * Benefits:
 * - Unified response structure across all endpoints
 * - Improved developer experience (DX)
 * - Simplified error debugging
 * - Enhanced observability in production
 */

import { NextResponse } from "next/server";
import { ERROR_CODES, ErrorCode } from "./errorCodes";

/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
  filters?: Record<string, unknown>;
}

/**
 * Send a successful response
 *
 * @param data - The response data payload
 * @param message - Success message (default: "Success")
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized format
 *
 * @example
 * ```ts
 * return sendSuccess(user, "User created successfully", 201);
 * ```
 */
export const sendSuccess = <T>(
  data: T,
  message = "Success",
  status = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a paginated success response
 *
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param message - Success message
 * @param filters - Applied filters (optional)
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized paginated format
 *
 * @example
 * ```ts
 * return sendPaginatedSuccess(
 *   users,
 *   { page: 1, limit: 10, total: 100, totalPages: 10, hasNextPage: true, hasPrevPage: false },
 *   "Users fetched successfully"
 * );
 * ```
 */
export const sendPaginatedSuccess = <T>(
  data: T[],
  pagination: PaginationMeta,
  message = "Success",
  filters?: Record<string, unknown>,
  status = 200
): NextResponse<PaginatedResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination,
      filters,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send an error response
 *
 * @param message - Error message for the user
 * @param code - Error code from ERROR_CODES or custom string
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details (optional)
 * @returns NextResponse with standardized error format
 *
 * @example
 * ```ts
 * return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
 * return sendError("Validation failed", ERROR_CODES.VALIDATION_ERROR, 400, { field: "email" });
 * ```
 */
export const sendError = (
  message = "Something went wrong",
  code: ErrorCode | string = ERROR_CODES.INTERNAL_ERROR,
  status = 500,
  details?: unknown
): NextResponse<ApiResponse<never>> => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        details: details ?? undefined,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a validation error response
 *
 * @param fieldErrors - Object containing field-specific error messages
 * @param message - Overall error message
 * @returns NextResponse with 400 status and validation error details
 *
 * @example
 * ```ts
 * return sendValidationError({
 *   email: "Email is required",
 *   name: "Name must be at least 2 characters"
 * });
 * ```
 */
export const sendValidationError = (
  fieldErrors: Record<string, string | null>,
  message = "Validation failed"
): NextResponse<ApiResponse<never>> => {
  // Filter out null values
  const cleanedErrors = Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v !== null)
  );

  return sendError(message, ERROR_CODES.VALIDATION_ERROR, 400, cleanedErrors);
};

/**
 * Send a not found error response
 *
 * @param resource - Name of the resource that wasn't found or a custom message
 * @param code - Optional specific error code (default: NOT_FOUND)
 * @returns NextResponse with 404 status
 *
 * @example
 * ```ts
 * return sendNotFound("User");
 * return sendNotFound("User not found", ERROR_CODES.USER_NOT_FOUND);
 * ```
 */
export const sendNotFound = (
  resource: string,
  code: ErrorCode | string = ERROR_CODES.NOT_FOUND
): NextResponse<ApiResponse<never>> => {
  // Check if message already includes "not found"
  const message = resource.toLowerCase().includes("not found")
    ? resource
    : `${resource} not found`;
  return sendError(message, code, 404);
};

/**
 * Send a conflict error response (e.g., duplicate resource)
 *
 * @param message - Conflict description
 * @param code - Optional specific error code (default: CONFLICT)
 * @param details - Additional details (optional)
 * @returns NextResponse with 409 status
 *
 * @example
 * ```ts
 * return sendConflict("User with this email already exists");
 * return sendConflict("Duplicate entry", ERROR_CODES.USER_DUPLICATE_EMAIL);
 * ```
 */
export const sendConflict = (
  message: string,
  code: ErrorCode | string = ERROR_CODES.CONFLICT,
  details?: unknown
): NextResponse<ApiResponse<never>> => {
  return sendError(message, code, 409, details);
};

/**
 * Send an unauthorized error response
 *
 * @param message - Error message (default: "Unauthorized")
 * @returns NextResponse with 401 status
 */
export const sendUnauthorized = (
  message = "Unauthorized"
): NextResponse<ApiResponse<never>> => {
  return sendError(message, ERROR_CODES.UNAUTHORIZED, 401);
};

/**
 * Send a forbidden error response
 *
 * @param message - Error message (default: "Forbidden")
 * @returns NextResponse with 403 status
 */
export const sendForbidden = (
  message = "Forbidden"
): NextResponse<ApiResponse<never>> => {
  return sendError(message, ERROR_CODES.FORBIDDEN, 403);
};

/**
 * Send a bad request error response
 *
 * @param message - Error message
 * @param code - Optional specific error code (default: BAD_REQUEST)
 * @param details - Additional details (optional)
 * @returns NextResponse with 400 status
 *
 * @example
 * ```ts
 * return sendBadRequest("Invalid input");
 * return sendBadRequest("Rating must be between 1 and 5", ERROR_CODES.REVIEW_INVALID_RATING);
 * ```
 */
export const sendBadRequest = (
  message: string,
  code: ErrorCode | string = ERROR_CODES.BAD_REQUEST,
  details?: unknown
): NextResponse<ApiResponse<never>> => {
  return sendError(message, code, 400, details);
};

/**
 * Send an internal server error response
 *
 * @param message - Error message (default: "Internal server error")
 * @param details - Additional details for logging (optional)
 * @returns NextResponse with 500 status
 */
export const sendInternalError = (
  message = "Internal server error",
  details?: unknown
): NextResponse<ApiResponse<never>> => {
  return sendError(message, ERROR_CODES.INTERNAL_ERROR, 500, details);
};

/**
 * Send a database error response
 *
 * @param message - Error message (default: "Database operation failed")
 * @param details - Additional details (optional)
 * @returns NextResponse with 500 status
 */
export const sendDatabaseError = (
  message = "Database operation failed",
  details?: unknown
): NextResponse<ApiResponse<never>> => {
  return sendError(message, ERROR_CODES.DATABASE_ERROR, 500, details);
};
