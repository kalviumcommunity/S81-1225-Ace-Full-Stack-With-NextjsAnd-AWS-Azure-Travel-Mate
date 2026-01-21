/**
 * Cache Service
 *
 * Provides a comprehensive caching layer with cache-aside pattern implementation.
 * Supports TTL policies, cache invalidation, and performance metrics.
 *
 * Cache Key Naming Convention:
 * - {resource}:list - List of resources (e.g., "places:list")
 * - {resource}:list:{hash} - Filtered list with query params hash
 * - {resource}:{id} - Single resource by ID
 * - {resource}:slug:{slug} - Single resource by slug
 *
 * TTL Policies (in seconds):
 * - VERY_SHORT: 30s - Rapidly changing data
 * - SHORT: 60s - Frequently updated data
 * - MEDIUM: 300s (5 min) - Moderately updated data
 * - LONG: 900s (15 min) - Rarely changing data
 * - VERY_LONG: 3600s (1 hour) - Static/reference data
 */

import redis, { isRedisConnected } from "./redis";
import { logger } from "./logger";
import crypto from "crypto";

// ============================================
// TTL Policies (in seconds)
// ============================================
export const CacheTTL = {
  VERY_SHORT: 30, // 30 seconds - for rapidly changing data
  SHORT: 60, // 1 minute - default for list endpoints
  MEDIUM: 300, // 5 minutes - for moderately updated data
  LONG: 900, // 15 minutes - for rarely changing data
  VERY_LONG: 3600, // 1 hour - for static/reference data
} as const;

// ============================================
// Cache Key Prefixes
// ============================================
export const CachePrefix = {
  PLACES: "places",
  CATEGORIES: "categories",
  USERS: "users",
  REVIEWS: "reviews",
  TRIPS: "trips",
  BOOKINGS: "bookings",
} as const;

// ============================================
// Cache Metrics
// ============================================
interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  avgHitTime: number;
  avgMissTime: number;
}

const metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,
  avgHitTime: 0,
  avgMissTime: 0,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a hash from query parameters for unique cache keys
 */
function hashQueryParams(params: Record<string, string | null>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  if (!filtered) return "default";

  return crypto.createHash("md5").update(filtered).digest("hex").slice(0, 8);
}

/**
 * Build a cache key for list endpoints with query params
 */
export function buildListCacheKey(
  prefix: string,
  params?: Record<string, string | null>
): string {
  if (!params || Object.keys(params).length === 0) {
    return `${prefix}:list`;
  }
  const hash = hashQueryParams(params);
  return `${prefix}:list:${hash}`;
}

/**
 * Build a cache key for a single resource
 */
export function buildItemCacheKey(prefix: string, id: string): string {
  return `${prefix}:${id}`;
}

/**
 * Build a cache key for a resource by slug
 */
export function buildSlugCacheKey(prefix: string, slug: string): string {
  return `${prefix}:slug:${slug}`;
}

// ============================================
// Core Cache Operations
// ============================================

/**
 * Get data from cache
 * Returns null if cache miss or error
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const startTime = performance.now();

  try {
    // Check if Redis is available
    if (!(await isRedisConnected())) {
      logger.warn("Redis not connected, skipping cache", {
        component: "cache",
        key,
      });
      return null;
    }

    const cached = await redis.get(key);

    if (cached) {
      const duration = performance.now() - startTime;
      metrics.hits++;
      metrics.avgHitTime =
        (metrics.avgHitTime * (metrics.hits - 1) + duration) / metrics.hits;

      logger.info(`Cache HIT`, {
        component: "cache",
        key,
        duration: `${duration.toFixed(2)}ms`,
      });

      return JSON.parse(cached) as T;
    }

    const duration = performance.now() - startTime;
    metrics.misses++;
    metrics.avgMissTime =
      (metrics.avgMissTime * (metrics.misses - 1) + duration) / metrics.misses;

    logger.info(`Cache MISS`, {
      component: "cache",
      key,
      duration: `${duration.toFixed(2)}ms`,
    });

    return null;
  } catch (error) {
    metrics.errors++;
    logger.error("Cache get error", {
      component: "cache",
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

/**
 * Set data in cache with TTL
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  ttlSeconds: number = CacheTTL.SHORT
): Promise<boolean> {
  const startTime = performance.now();

  try {
    // Check if Redis is available
    if (!(await isRedisConnected())) {
      logger.warn("Redis not connected, skipping cache set", {
        component: "cache",
        key,
      });
      return false;
    }

    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);

    const duration = performance.now() - startTime;
    logger.info(`Cache SET`, {
      component: "cache",
      key,
      ttl: `${ttlSeconds}s`,
      duration: `${duration.toFixed(2)}ms`,
    });

    return true;
  } catch (error) {
    metrics.errors++;
    logger.error("Cache set error", {
      component: "cache",
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Delete a specific cache key
 */
export async function cacheDelete(key: string): Promise<boolean> {
  try {
    if (!(await isRedisConnected())) {
      return false;
    }

    await redis.del(key);

    logger.info(`Cache DELETE`, {
      component: "cache",
      key,
    });

    return true;
  } catch (error) {
    metrics.errors++;
    logger.error("Cache delete error", {
      component: "cache",
      key,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

/**
 * Invalidate all cache keys matching a pattern
 * Use with caution in production - KEYS command can be slow
 */
export async function cacheInvalidatePattern(pattern: string): Promise<number> {
  try {
    if (!(await isRedisConnected())) {
      return 0;
    }

    // Use SCAN for production-safe pattern matching
    let cursor = "0";
    let deletedCount = 0;
    const keysToDelete: string[] = [];

    do {
      const [newCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = newCursor;
      keysToDelete.push(...keys);
    } while (cursor !== "0");

    if (keysToDelete.length > 0) {
      deletedCount = await redis.del(...keysToDelete);
    }

    logger.info(`Cache INVALIDATE pattern`, {
      component: "cache",
      pattern,
      deletedKeys: deletedCount,
    });

    return deletedCount;
  } catch (error) {
    metrics.errors++;
    logger.error("Cache invalidate pattern error", {
      component: "cache",
      pattern,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return 0;
  }
}

/**
 * Invalidate all caches for a resource type
 * Use after CREATE, UPDATE, DELETE operations
 */
export async function invalidateResourceCache(prefix: string): Promise<void> {
  await cacheInvalidatePattern(`${prefix}:*`);
}

// ============================================
// Cache-Aside Pattern Helper
// ============================================

interface CacheAsideOptions<T> {
  key: string;
  ttl?: number;
  fetchFn: () => Promise<T>;
  skipCache?: boolean;
}

/**
 * Cache-aside pattern implementation
 *
 * 1. Check cache for data
 * 2. If found, return cached data
 * 3. If not found, fetch from source (DB)
 * 4. Store result in cache
 * 5. Return data
 *
 * @example
 * const users = await cacheAside({
 *   key: buildListCacheKey(CachePrefix.USERS, queryParams),
 *   ttl: CacheTTL.SHORT,
 *   fetchFn: () => prisma.user.findMany({ where, take: limit }),
 * });
 */
export async function cacheAside<T>({
  key,
  ttl = CacheTTL.SHORT,
  fetchFn,
  skipCache = false,
}: CacheAsideOptions<T>): Promise<{
  data: T;
  cached: boolean;
  duration: number;
}> {
  const startTime = performance.now();

  // Skip cache if requested
  if (skipCache) {
    const data = await fetchFn();
    const duration = performance.now() - startTime;
    return { data, cached: false, duration };
  }

  // Try to get from cache
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    const duration = performance.now() - startTime;
    return { data: cached, cached: true, duration };
  }

  // Fetch from source
  const data = await fetchFn();
  const fetchDuration = performance.now() - startTime;

  // Store in cache (don't await to avoid blocking response)
  cacheSet(key, data, ttl).catch(() => {
    // Error already logged in cacheSet
  });

  return { data, cached: false, duration: fetchDuration };
}

// ============================================
// Cache Statistics
// ============================================

/**
 * Get cache performance metrics
 */
export function getCacheMetrics(): CacheMetrics & {
  hitRate: string;
  totalRequests: number;
} {
  const totalRequests = metrics.hits + metrics.misses;
  const hitRate =
    totalRequests > 0
      ? ((metrics.hits / totalRequests) * 100).toFixed(2) + "%"
      : "N/A";

  return {
    ...metrics,
    hitRate,
    totalRequests,
  };
}

/**
 * Reset cache metrics
 */
export function resetCacheMetrics(): void {
  metrics.hits = 0;
  metrics.misses = 0;
  metrics.errors = 0;
  metrics.avgHitTime = 0;
  metrics.avgMissTime = 0;
}

// ============================================
// Specific Resource Cache Helpers
// ============================================

/**
 * Invalidate places cache (call after place mutations)
 */
export async function invalidatePlacesCache(placeId?: string): Promise<void> {
  if (placeId) {
    await cacheDelete(buildItemCacheKey(CachePrefix.PLACES, placeId));
  }
  await invalidateResourceCache(CachePrefix.PLACES);
}

/**
 * Invalidate categories cache (call after category mutations)
 */
export async function invalidateCategoriesCache(
  categoryId?: string
): Promise<void> {
  if (categoryId) {
    await cacheDelete(buildItemCacheKey(CachePrefix.CATEGORIES, categoryId));
  }
  await invalidateResourceCache(CachePrefix.CATEGORIES);
}

/**
 * Invalidate users cache (call after user mutations)
 */
export async function invalidateUsersCache(userId?: string): Promise<void> {
  if (userId) {
    await cacheDelete(buildItemCacheKey(CachePrefix.USERS, userId));
  }
  await invalidateResourceCache(CachePrefix.USERS);
}

/**
 * Invalidate reviews cache (call after review mutations)
 */
export async function invalidateReviewsCache(reviewId?: string): Promise<void> {
  if (reviewId) {
    await cacheDelete(buildItemCacheKey(CachePrefix.REVIEWS, reviewId));
  }
  await invalidateResourceCache(CachePrefix.REVIEWS);
  // Also invalidate places cache since reviews affect place ratings
  await invalidateResourceCache(CachePrefix.PLACES);
}
