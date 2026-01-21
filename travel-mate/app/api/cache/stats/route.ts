/**
 * Cache Stats API Route
 *
 * Provides cache performance metrics and health status.
 * Useful for monitoring and debugging cache behavior.
 *
 * Endpoints:
 * - GET  /api/cache/stats - Get cache metrics
 * - POST /api/cache/stats - Reset cache metrics
 * - DELETE /api/cache/stats - Clear all cache (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import redis, { isRedisConnected } from "@/lib/redis";
import {
  getCacheMetrics,
  resetCacheMetrics,
  cacheInvalidatePattern,
} from "@/lib/cache";

// ============================================
// GET /api/cache/stats - Get cache metrics
// ============================================
export async function GET() {
  try {
    const isConnected = await isRedisConnected();
    const metrics = getCacheMetrics();

    // Get Redis info
    let redisInfo = null;
    if (isConnected) {
      try {
        const info = await redis.info("memory");
        const keyCount = await redis.dbsize();

        redisInfo = {
          connected: true,
          keyCount,
          memoryUsed:
            info.match(/used_memory_human:(.+)/)?.[1]?.trim() || "N/A",
          memoryPeak:
            info.match(/used_memory_peak_human:(.+)/)?.[1]?.trim() || "N/A",
        };
      } catch {
        redisInfo = { connected: true, error: "Failed to get Redis info" };
      }
    } else {
      redisInfo = { connected: false };
    }

    return NextResponse.json({
      success: true,
      data: {
        cache: {
          ...metrics,
          performance: {
            avgHitTime: `${metrics.avgHitTime.toFixed(2)}ms`,
            avgMissTime: `${metrics.avgMissTime.toFixed(2)}ms`,
            speedImprovement:
              metrics.avgMissTime > 0
                ? `${(((metrics.avgMissTime - metrics.avgHitTime) / metrics.avgMissTime) * 100).toFixed(1)}%`
                : "N/A",
          },
        },
        redis: redisInfo,
        ttlPolicies: {
          VERY_SHORT: "30 seconds - Rapidly changing data",
          SHORT: "60 seconds - Default for list endpoints",
          MEDIUM: "5 minutes - Moderately updated data",
          LONG: "15 minutes - Rarely changing data (categories)",
          VERY_LONG: "1 hour - Static/reference data",
        },
      },
      message: "Cache stats retrieved successfully",
    });
  } catch (error) {
    logger.error("Failed to get cache stats", { error });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get cache stats",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/cache/stats - Reset cache metrics
// ============================================
export async function POST() {
  try {
    resetCacheMetrics();

    logger.info("Cache metrics reset");

    return NextResponse.json({
      success: true,
      message: "Cache metrics reset successfully",
      data: getCacheMetrics(),
    });
  } catch (error) {
    logger.error("Failed to reset cache metrics", { error });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset cache metrics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/cache/stats - Clear all cache (admin only)
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get("pattern") || "*";
    const confirm = searchParams.get("confirm");

    if (confirm !== "true") {
      return NextResponse.json(
        {
          success: false,
          message: "Please add ?confirm=true to confirm cache clear operation",
          warning: `This will delete all cache keys matching pattern: ${pattern}`,
        },
        { status: 400 }
      );
    }

    const deletedCount = await cacheInvalidatePattern(pattern);

    logger.warn("Cache cleared", { pattern, deletedCount });

    return NextResponse.json({
      success: true,
      message: `Cache cleared successfully`,
      data: {
        pattern,
        deletedKeys: deletedCount,
      },
    });
  } catch (error) {
    logger.error("Failed to clear cache", { error });
    return NextResponse.json(
      {
        success: false,
        message: "Failed to clear cache",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
