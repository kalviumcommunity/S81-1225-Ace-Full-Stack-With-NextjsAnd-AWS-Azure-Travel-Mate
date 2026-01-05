/**
 * Logger Utility
 *
 * Provides structured logging for the application with timestamps
 * and different log levels (info, warn, error, debug).
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

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
const logToConsole = (logMessage: LogMessage) => {
  const prefix = `[${logMessage.timestamp}] [${logMessage.level.toUpperCase()}]`;
  const output = `${prefix} ${logMessage.message}`;

  switch (logMessage.level) {
    case "error":
      console.error(output, logMessage.data || "");
      break;
    case "warn":
      console.warn(output, logMessage.data || "");
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(output, logMessage.data || "");
      }
      break;
    default:
      console.log(output, logMessage.data || "");
  }
};
/* eslint-enable no-console */

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    logToConsole(formatLog("info", message, data));
  },

  warn: (message: string, data?: Record<string, unknown>) => {
    logToConsole(formatLog("warn", message, data));
  },

  error: (message: string, data?: Record<string, unknown>) => {
    logToConsole(formatLog("error", message, data));
  },

  debug: (message: string, data?: Record<string, unknown>) => {
    logToConsole(formatLog("debug", message, data));
  },
};

export default logger;
