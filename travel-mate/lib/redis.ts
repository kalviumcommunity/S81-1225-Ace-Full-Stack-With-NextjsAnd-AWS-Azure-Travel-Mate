/**
 * Redis Connection Utility
 *
 * Provides a singleton Redis client connection for caching and session management.
 * Uses ioredis for robust Redis connectivity with automatic reconnection.
 *
 * Features:
 * - Singleton pattern to prevent multiple connections
 * - Automatic reconnection handling
 * - Connection event logging
 * - Graceful error handling
 */

import Redis from "ioredis";
import { logger } from "./logger";

// Redis connection URL from environment
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis client with connection options
const createRedisClient = (): Redis => {
  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    // Reconnection strategy
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error("Redis connection failed after 10 retries", {
          component: "redis",
        });
        return null; // Stop retrying
      }
      const delay = Math.min(times * 100, 3000);
      logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`, {
        component: "redis",
      });
      return delay;
    },
  });

  // Connection event handlers
  redis.on("connect", () => {
    logger.info("Redis client connected", { component: "redis" });
  });

  redis.on("ready", () => {
    logger.info("Redis client ready", { component: "redis" });
  });

  redis.on("error", (error) => {
    logger.error("Redis client error", {
      component: "redis",
      error: error.message,
    });
  });

  redis.on("close", () => {
    logger.warn("Redis connection closed", { component: "redis" });
  });

  redis.on("reconnecting", () => {
    logger.info("Redis client reconnecting", { component: "redis" });
  });

  return redis;
};

// Singleton Redis client
declare global {
  var redis: Redis | undefined;
}

// Use global variable in development to prevent multiple connections during HMR
const redis = globalThis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.redis = redis;
}

export default redis;

/**
 * Check if Redis is connected and responsive
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

/**
 * Gracefully disconnect Redis client
 */
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    logger.info("Redis client disconnected gracefully", { component: "redis" });
  } catch (error) {
    logger.error("Error disconnecting Redis", {
      component: "redis",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
