/**
 * Centralized Error Handler
 *
 * A comprehensive error handling system for the Travel Mate API that:
 * - Provides consistent error responses across all endpoints
 * - Differentiates between development and production environments
 * - Logs structured error information for monitoring
 * - Hides sensitive details in production for security
 * - Supports custom error types with proper status codes
 *
 * Security Principles:
 * - Never expose stack traces in production
 * - Never expose internal error details to clients
 * - Always log full details server-side for debugging
 * - Use generic messages for unknown errors
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger, RequestContext } from "./logger";
import { ERROR_CODES, ErrorCode, ERROR_DESCRIPTIONS } from "./errorCodes";

// ============================================
// CONFIGURATION
// ============================================

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Generic error message for production (never expose internal details)
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again later.";
const GENERIC_VALIDATION_MESSAGE = "Invalid request data.";
const GENERIC_AUTH_MESSAGE = "Authentication failed.";
const GENERIC_FORBIDDEN_MESSAGE = "Access denied.";
const GENERIC_NOT_FOUND_MESSAGE = "Resource not found.";

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

/**
 * Base application error class
 * Extend this for all custom errors in the application
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly context?: RequestContext;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode | string = ERROR_CODES.INTERNAL_ERROR,
    options?: {
      isOperational?: boolean;
      details?: unknown;
      context?: RequestContext;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;
    this.context = options?.context;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - for input validation failures
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: unknown,
    code: ErrorCode | string = ERROR_CODES.VALIDATION_ERROR
  ) {
    super(message, 400, code, { isOperational: true, details });
    this.name = "ValidationError";
  }
}

/**
 * Authentication error - for auth failures
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    code: ErrorCode | string = ERROR_CODES.UNAUTHORIZED
  ) {
    super(message, 401, code, { isOperational: true });
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error - for permission failures
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access denied",
    code: ErrorCode | string = ERROR_CODES.FORBIDDEN
  ) {
    super(message, 403, code, { isOperational: true });
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = "Resource",
    code: ErrorCode | string = ERROR_CODES.NOT_FOUND
  ) {
    super(`${resource} not found`, 404, code, { isOperational: true });
    this.name = "NotFoundError";
  }
}

/**
 * Conflict error - for duplicate resources
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    code: ErrorCode | string = ERROR_CODES.CONFLICT
  ) {
    super(message, 409, code, { isOperational: true });
    this.name = "ConflictError";
  }
}

/**
 * Database error - for database operation failures
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = "Database operation failed",
    code: ErrorCode | string = ERROR_CODES.DATABASE_ERROR
  ) {
    super(message, 500, code, { isOperational: true });
    this.name = "DatabaseError";
  }
}

/**
 * External service error - for third-party API failures
 */
export class ExternalServiceError extends AppError {
  constructor(
    serviceName: string,
    message?: string,
    code: ErrorCode | string = ERROR_CODES.EXTERNAL_SERVICE_ERROR
  ) {
    super(message || `External service error: ${serviceName}`, 503, code, {
      isOperational: true,
    });
    this.name = "ExternalServiceError";
  }
}

// ============================================
// ERROR RESPONSE INTERFACES
// ============================================

/**
 * Development error response (includes full details)
 */
interface DevErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    name: string;
    details?: unknown;
    stack?: string;
  };
  timestamp: string;
  path?: string;
  method?: string;
}

/**
 * Production error response (safe, minimal details)
 */
interface ProdErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
  };
  timestamp: string;
}

// ============================================
// ERROR HANDLERS
// ============================================

/**
 * Handle Prisma database errors
 */
const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError
): AppError => {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const target = (error.meta?.target as string[])?.join(", ") || "field";
      return new ConflictError(
        `A record with this ${target} already exists`,
        ERROR_CODES.ALREADY_EXISTS
      );
    case "P2025":
      // Record not found
      return new NotFoundError("Record", ERROR_CODES.NOT_FOUND);
    case "P2003":
      // Foreign key constraint failed
      return new ValidationError(
        "Invalid reference to related record",
        { code: error.code },
        ERROR_CODES.VALIDATION_ERROR
      );
    case "P2014":
      // Required relation violation
      return new ValidationError(
        "Required related record not found",
        { code: error.code },
        ERROR_CODES.VALIDATION_ERROR
      );
    default:
      return new DatabaseError(
        IS_PRODUCTION
          ? "Database operation failed"
          : `Database error: ${error.message}`,
        ERROR_CODES.DATABASE_ERROR
      );
  }
};

/**
 * Handle Zod validation errors
 */
const handleZodError = (error: ZodError): ValidationError => {
  const formattedErrors = error.issues.map((issue) => ({
    field: issue.path.join(".") || "unknown",
    message: issue.message,
    code: issue.code,
  }));

  return new ValidationError(
    "Validation failed",
    formattedErrors,
    ERROR_CODES.VALIDATION_ERROR
  );
};

/**
 * Get safe error message for production
 */
const getSafeMessage = (error: AppError): string => {
  if (!IS_PRODUCTION) {
    return error.message;
  }

  // Map error types to safe messages
  if (error instanceof ValidationError) {
    return GENERIC_VALIDATION_MESSAGE;
  }
  if (error instanceof AuthenticationError) {
    return GENERIC_AUTH_MESSAGE;
  }
  if (error instanceof AuthorizationError) {
    return GENERIC_FORBIDDEN_MESSAGE;
  }
  if (error instanceof NotFoundError) {
    return GENERIC_NOT_FOUND_MESSAGE;
  }
  if (error.isOperational) {
    // Operational errors can show their message in production
    return error.message;
  }

  // Unknown errors get generic message
  return GENERIC_ERROR_MESSAGE;
};

/**
 * Create development error response
 */
const createDevResponse = (
  error: AppError,
  context?: RequestContext
): DevErrorResponse => ({
  success: false,
  message: error.message,
  error: {
    code: error.code,
    name: error.name,
    details: error.details,
    stack: error.stack,
  },
  timestamp: new Date().toISOString(),
  path: context?.path,
  method: context?.method,
});

/**
 * Create production error response
 */
const createProdResponse = (error: AppError): ProdErrorResponse => ({
  success: false,
  message: getSafeMessage(error),
  error: {
    code: error.code,
  },
  timestamp: new Date().toISOString(),
});

// ============================================
// MAIN ERROR HANDLER
// ============================================

/**
 * Context for error handling
 */
export interface ErrorContext extends RequestContext {
  operation?: string;
}

/**
 * Central error handler function
 *
 * This is the main entry point for all error handling in the application.
 * It normalizes various error types, logs appropriately, and returns
 * safe responses based on the environment.
 *
 * @param error - The error that occurred (any type)
 * @param context - Optional context about the request/operation
 * @returns NextResponse with appropriate error response
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   try {
 *     // ... your code
 *   } catch (error) {
 *     return handleError(error, { method: 'GET', path: '/api/users' });
 *   }
 * }
 * ```
 */
export function handleError(
  error: unknown,
  context?: ErrorContext
): NextResponse {
  // Normalize error to AppError
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = handleZodError(error);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError(
      IS_PRODUCTION ? "Invalid data format" : error.message,
      undefined,
      ERROR_CODES.VALIDATION_ERROR
    );
  } else if (error instanceof Error) {
    // Unknown error - treat as non-operational
    appError = new AppError(error.message, 500, ERROR_CODES.INTERNAL_ERROR, {
      isOperational: false,
    });
    // Copy the original stack trace
    appError.stack = error.stack;
  } else {
    // Non-Error thrown (string, object, etc.)
    appError = new AppError(String(error), 500, ERROR_CODES.INTERNAL_ERROR, {
      isOperational: false,
    });
  }

  // Add context to error if available
  const errorContext = context || appError.context;

  // Log the error
  logError(appError, errorContext);

  // Create response based on environment
  const response = IS_PRODUCTION
    ? createProdResponse(appError)
    : createDevResponse(appError, errorContext);

  return NextResponse.json(response, { status: appError.statusCode });
}

/**
 * Log error with appropriate level and structure
 */
function logError(error: AppError, context?: ErrorContext): void {
  const errorDescription = ERROR_DESCRIPTIONS[error.code as ErrorCode];

  const logMeta: Record<string, unknown> = {
    errorCode: error.code,
    errorName: error.name,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    operation: context?.operation,
  };

  if (error.details) {
    logMeta.details = error.details;
  }

  if (errorDescription) {
    logMeta.description = errorDescription;
  }

  // Use appropriate log level based on error severity
  if (!error.isOperational || error.statusCode >= 500) {
    // Non-operational or server errors are critical
    logger.error(
      `Error in ${context?.method || "UNKNOWN"} ${context?.path || "unknown path"}: ${error.message}`,
      error,
      context
    );
  } else if (error.statusCode >= 400) {
    // Client errors are warnings
    logger.warn(
      `Client error in ${context?.method || "UNKNOWN"} ${context?.path || "unknown path"}: ${error.message}`,
      logMeta
    );
  } else {
    logger.info(
      `Handled error in ${context?.method || "UNKNOWN"} ${context?.path || "unknown path"}`,
      logMeta
    );
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Wrap an async route handler with error handling
 *
 * @param handler - The async route handler function
 * @param context - Static context for the route
 * @returns Wrapped handler with error handling
 *
 * @example
 * ```ts
 * export const GET = withErrorHandling(
 *   async (request) => {
 *     const users = await prisma.user.findMany();
 *     return sendSuccess(users);
 *   },
 *   { path: '/api/users' }
 * );
 * ```
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: Omit<ErrorContext, "method">
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extract method from request if available
      const request = args[0] as { method?: string } | undefined;
      return handleError(error, {
        ...context,
        method: request?.method,
      });
    }
  };
}

/**
 * Assert a condition and throw an AppError if it fails
 *
 * @param condition - Condition to check
 * @param message - Error message if condition is false
 * @param ErrorClass - Error class to throw (default: AppError)
 *
 * @example
 * ```ts
 * assertOrThrow(user !== null, 'User not found', NotFoundError);
 * ```
 */
export function assertOrThrow(
  condition: unknown,
  message: string,
  ErrorClass: new (message: string) => AppError = AppError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

/**
 * Type guard to check if error is operational (expected/handled)
 */
export function isOperationalError(error: unknown): error is AppError {
  return error instanceof AppError && error.isOperational;
}

/**
 * Extract error message safely from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Create a safe error response for streaming/non-JSON contexts
 */
export function createSafeErrorMessage(error: unknown): string {
  if (IS_PRODUCTION) {
    return GENERIC_ERROR_MESSAGE;
  }
  return getErrorMessage(error);
}
