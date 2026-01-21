/**
 * Logger Utility
 *
 * Provides structured logging for the application with timestamps
 * and different log levels (info, warn, error, debug).
 *
 * Features:
 * - JSON structured logging for production (easy to parse by CloudWatch, ELK, etc.)
 * - Human-readable format for development
 * - Request context tracking
 * - Error stack trace handling (hidden in production)
 * - Performance timing utilities
 */

type LogLevel = "info" | "warn" | "error" | "debug" | "fatal";

/**
 * Structured log message format for JSON output
 */
interface StructuredLog {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  service: string;
  meta?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  request?: {
    method?: string;
    path?: string;
    userId?: string;
    requestId?: string;
  };
  duration?: number;
}

/**
 * Log message for console output
 */
interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Request context for tracking
 */
export interface RequestContext {
  method?: string;
  path?: string;
  userId?: string;
  requestId?: string;
}

// Configuration
const SERVICE_NAME = "travel-mate-api";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const LOG_LEVEL = process.env.LOG_LEVEL || (IS_PRODUCTION ? "info" : "debug");

// Log level priority (higher = more severe)
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * Check if a log level should be output based on current configuration
 */
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL as LogLevel];
};

/**
 * Format a structured log for JSON output (production)
 */
const formatStructuredLog = (
  level: LogLevel,
  message: string,
  options?: {
    meta?: Record<string, unknown>;
    error?: Error;
    request?: RequestContext;
    duration?: number;
  }
): StructuredLog => {
  const log: StructuredLog = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    service: SERVICE_NAME,
  };

  if (options?.meta) {
    log.meta = options.meta;
  }

  if (options?.error) {
    log.error = {
      name: options.error.name,
      message: options.error.message,
      code: (options.error as Error & { code?: string }).code,
      // Only include stack trace in development
      stack: IS_PRODUCTION ? undefined : options.error.stack,
    };
  }

  if (options?.request) {
    log.request = options.request;
  }

  if (options?.duration !== undefined) {
    log.duration = options.duration;
  }

  return log;
};

/**
 * Format log for human-readable output (development)
 */
const formatLog = (
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): LogMessage => ({
  level,
  message,
  timestamp: new Date().toISOString(),
  ...(data && { data }),
});

/* eslint-disable no-console -- Logger utility intentionally uses console methods */

/**
 * Output log to console with appropriate formatting
 */
const logToConsole = (
  level: LogLevel,
  message: string,
  options?: {
    meta?: Record<string, unknown>;
    error?: Error;
    request?: RequestContext;
    duration?: number;
  }
) => {
  if (!shouldLog(level)) return;

  if (IS_PRODUCTION) {
    // JSON structured output for production (easy to parse by log aggregators)
    const structuredLog = formatStructuredLog(level, message, options);
    const output = JSON.stringify(structuredLog);

    switch (level) {
      case "error":
      case "fatal":
        console.error(output);
        break;
      case "warn":
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  } else {
    // Human-readable output for development
    const logMessage = formatLog(level, message, options?.meta);
    const prefix = `[${logMessage.timestamp}] [${logMessage.level.toUpperCase()}]`;
    const output = `${prefix} ${logMessage.message}`;

    switch (level) {
      case "error":
      case "fatal":
        console.error(output, logMessage.data || "");
        if (options?.error?.stack) {
          console.error("Stack trace:", options.error.stack);
        }
        break;
      case "warn":
        console.warn(output, logMessage.data || "");
        break;
      case "debug":
        console.debug(output, logMessage.data || "");
        break;
      default:
        console.log(output, logMessage.data || "");
    }
  }
};

/* eslint-enable no-console */

/**
 * Main logger object with all logging methods
 */
export const logger = {
  /**
   * Log informational message
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    logToConsole("info", message, { meta });
  },

  /**
   * Log warning message
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    logToConsole("warn", message, { meta });
  },

  /**
   * Log error message with optional error object
   */
  error: (
    message: string,
    errorOrMeta?: Error | Record<string, unknown>,
    request?: RequestContext
  ) => {
    if (errorOrMeta instanceof Error) {
      logToConsole("error", message, { error: errorOrMeta, request });
    } else {
      logToConsole("error", message, { meta: errorOrMeta, request });
    }
  },

  /**
   * Log debug message (only in development)
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    logToConsole("debug", message, { meta });
  },

  /**
   * Log fatal error (critical system failure)
   */
  fatal: (message: string, error?: Error, request?: RequestContext) => {
    logToConsole("fatal", message, { error, request });
  },

  /**
   * Log with request context
   */
  withRequest: (request: RequestContext) => ({
    info: (message: string, meta?: Record<string, unknown>) => {
      logToConsole("info", message, { meta, request });
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      logToConsole("warn", message, { meta, request });
    },
    error: (message: string, error?: Error) => {
      logToConsole("error", message, { error, request });
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
      logToConsole("debug", message, { meta, request });
    },
  }),

  /**
   * Measure and log execution time
   */
  time: (label: string) => {
    const start = performance.now();
    return {
      end: (meta?: Record<string, unknown>) => {
        const duration = Math.round(performance.now() - start);
        logToConsole("info", `${label} completed`, { meta, duration });
        return duration;
      },
    };
  },

  /**
   * Log HTTP request/response
   */
  http: (
    method: string,
    path: string,
    status: number,
    duration: number,
    meta?: Record<string, unknown>
  ) => {
    const level: LogLevel =
      status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    logToConsole(level, `${method} ${path} ${status}`, {
      meta: { ...meta, status },
      duration,
      request: { method, path },
    });
  },
};

export default logger;
