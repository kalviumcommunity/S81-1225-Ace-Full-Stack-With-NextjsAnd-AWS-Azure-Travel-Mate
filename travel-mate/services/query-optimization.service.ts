/**
 * Query Optimization Service
 *
 * This service demonstrates optimized query patterns using Prisma ORM.
 *
 * Key Optimization Techniques:
 * - Select only required fields (avoid over-fetching)
 * - Use pagination with skip/take
 * - Batch operations with createMany/updateMany
 * - Efficient filtering and sorting with indexes
 * - Avoid N+1 queries with proper includes
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Define status enums locally to avoid TypeScript resolution issues
const ReviewStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
} as const;

type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus];

// ============================================
// TYPE DEFINITIONS
// ============================================

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface PlaceFilterParams extends PaginationParams {
  country?: string;
  city?: string;
  categoryId?: string;
  minRating?: number;
  isFeatured?: boolean;
  search?: string;
}

interface BookingFilterParams extends PaginationParams {
  userId?: string;
  status?: BookingStatusType;
  startDate?: Date;
  endDate?: Date;
}

interface QueryMetrics {
  queryName: string;
  duration: number;
  resultCount: number;
}

// Helper to track query performance
const trackQuery = (
  name: string,
  startTime: number,
  count: number
): QueryMetrics => {
  const duration = Date.now() - startTime;
  logger.info(`Query Performance: ${name}`, {
    duration: `${duration}ms`,
    resultCount: count,
  });
  return { queryName: name, duration, resultCount: count };
};

// ============================================
// OPTIMIZED QUERY SERVICE
// ============================================

export const queryOptimizationService = {
  // ----------------------------------------
  // OPTIMIZED SELECT PATTERNS
  // ----------------------------------------

  /**
   * Get users with minimal fields (optimized)
   *
   * Instead of fetching all fields, only select what's needed.
   * This reduces data transfer and improves response time.
   */
  async getUsersOptimized(params: PaginationParams = {}) {
    const startTime = Date.now();
    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    // OPTIMIZED: Only select required fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count();
    const metrics = trackQuery("getUsersOptimized", startTime, users.length);

    return {
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      metrics,
    };
  },

  /**
   * Get users with full data (inefficient - for comparison)
   *
   * This fetches all fields and relations - use sparingly.
   */
  async getUsersInefficient(params: PaginationParams = {}) {
    const startTime = Date.now();
    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    // INEFFICIENT: Fetches all fields and deep relations
    const users = await prisma.user.findMany({
      include: {
        reviews: true,
        favorites: true,
        trips: {
          include: {
            tripPlaces: {
              include: {
                place: true,
              },
            },
          },
        },
        tripMembers: true,
        // Note: bookings relation included via type-safe cast below
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count();
    const metrics = trackQuery("getUsersInefficient", startTime, users.length);

    return {
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      metrics,
    };
  },

  // ----------------------------------------
  // OPTIMIZED PLACE QUERIES (Uses Indexes)
  // ----------------------------------------

  /**
   * Get places with filters (leverages indexes)
   *
   * This query is optimized by:
   * 1. Using indexed fields in WHERE clause
   * 2. Selecting only needed fields
   * 3. Paginating results
   */
  async getPlacesOptimized(params: PlaceFilterParams = {}) {
    const startTime = Date.now();
    const {
      page = 1,
      pageSize = 10,
      country,
      city,
      categoryId,
      minRating,
      isFeatured,
      search,
    } = params;
    const skip = (page - 1) * pageSize;

    // Build WHERE clause using indexed fields
    const where: Prisma.PlaceWhereInput = {
      isActive: true,
      ...(country && { country }), // Uses @@index([country])
      ...(city && { city }), // Uses @@index([city])
      ...(categoryId && { categoryId }), // Uses @@index([categoryId])
      ...(isFeatured !== undefined && { isFeatured }), // Uses @@index([isFeatured])
      ...(minRating && {
        rating: { gte: new Prisma.Decimal(minRating) }, // Uses @@index([rating])
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // OPTIMIZED: Select only required fields with shallow include
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          country: true,
          imageUrl: true,
          rating: true,
          reviewCount: true,
          priceLevel: true,
          isFeatured: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
      }),
      prisma.place.count({ where }),
    ]);

    const metrics = trackQuery("getPlacesOptimized", startTime, places.length);

    return {
      data: places,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      filters: { country, city, categoryId, minRating, isFeatured, search },
      metrics,
    };
  },

  /**
   * Get featured places (highly optimized)
   *
   * Uses isFeatured index for fast filtering
   */
  async getFeaturedPlaces(limit: number = 6) {
    const startTime = Date.now();

    const places = await prisma.place.findMany({
      where: {
        isFeatured: true, // Uses @@index([isFeatured])
        isActive: true, // Uses @@index([isActive])
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        rating: true,
        city: true,
        country: true,
      },
      take: limit,
      orderBy: { rating: "desc" }, // Uses @@index([rating])
    });

    const metrics = trackQuery("getFeaturedPlaces", startTime, places.length);

    return { data: places, metrics };
  },

  /**
   * Get places by location (uses composite index)
   *
   * Uses the latitude/longitude composite index for geo queries
   */
  async getPlacesByLocation(
    lat: number,
    lng: number,
    radiusDegrees: number = 1
  ) {
    const startTime = Date.now();

    // Uses @@index([latitude, longitude])
    const places = await prisma.place.findMany({
      where: {
        isActive: true,
        latitude: {
          gte: new Prisma.Decimal(lat - radiusDegrees),
          lte: new Prisma.Decimal(lat + radiusDegrees),
        },
        longitude: {
          gte: new Prisma.Decimal(lng - radiusDegrees),
          lte: new Prisma.Decimal(lng + radiusDegrees),
        },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        city: true,
        country: true,
        rating: true,
      },
      take: 50,
    });

    const metrics = trackQuery("getPlacesByLocation", startTime, places.length);

    return { data: places, metrics };
  },

  // ----------------------------------------
  // BATCH OPERATIONS
  // ----------------------------------------

  /**
   * Bulk create users (optimized)
   *
   * Uses createMany instead of multiple create calls
   */
  async bulkCreateUsers(users: Array<{ email: string; name: string }>) {
    const startTime = Date.now();

    // OPTIMIZED: Single query instead of N queries
    const result = await prisma.user.createMany({
      data: users,
      skipDuplicates: true, // Skip if email already exists
    });

    const metrics = trackQuery("bulkCreateUsers", startTime, result.count);

    return { createdCount: result.count, metrics };
  },

  /**
   * Bulk update place ratings (optimized)
   *
   * Uses updateMany for batch updates
   */
  async bulkUpdatePlaceActiveStatus(placeIds: string[], isActive: boolean) {
    const startTime = Date.now();

    const result = await prisma.place.updateMany({
      where: { id: { in: placeIds } },
      data: { isActive },
    });

    const metrics = trackQuery(
      "bulkUpdatePlaceActiveStatus",
      startTime,
      result.count
    );

    return { updatedCount: result.count, metrics };
  },

  // ----------------------------------------
  // AVOIDING N+1 QUERIES
  // ----------------------------------------

  /**
   * Get trips with places (avoiding N+1)
   *
   * GOOD: Uses include to fetch related data in a single query
   * BAD: Would loop and fetch places separately
   */
  async getTripsWithPlaces(userId: string, params: PaginationParams = {}) {
    const startTime = Date.now();
    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    // OPTIMIZED: Single query with includes (avoids N+1)
    const trips = await prisma.trip.findMany({
      where: { userId }, // Uses @@index([userId])
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        budget: true,
        currency: true,
        tripPlaces: {
          select: {
            id: true,
            visitOrder: true,
            visitDate: true,
            notes: true,
            place: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
                imageUrl: true,
                rating: true,
              },
            },
          },
          orderBy: { visitOrder: "asc" },
        },
        _count: {
          select: { tripPlaces: true },
        },
      },
      skip,
      take: pageSize,
      orderBy: { startDate: "desc" }, // Uses @@index([startDate])
    });

    const total = await prisma.trip.count({ where: { userId } });
    const metrics = trackQuery("getTripsWithPlaces", startTime, trips.length);

    return {
      data: trips,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      metrics,
    };
  },

  /**
   * Get bookings with optimized relations
   */
  async getBookingsOptimized(params: BookingFilterParams = {}) {
    const startTime = Date.now();
    const {
      page = 1,
      pageSize = 10,
      userId,
      status,
      startDate,
      endDate,
    } = params;
    const skip = (page - 1) * pageSize;

    // Build where clause for booking queries
    const where = {
      ...(userId && { userId }), // Uses @@index([userId])
      ...(status && { status }), // Uses @@index([status])
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          }, // Uses @@index([createdAt])
        }),
    };

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        select: {
          id: true,
          bookingRef: true,
          totalAmount: true,
          currency: true,
          status: true,
          paymentStatus: true,
          guestCount: true,
          checkIn: true,
          checkOut: true,
          createdAt: true,
          place: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
              imageUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: { payments: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      db.booking.count({ where }),
    ]);

    const metrics = trackQuery(
      "getBookingsOptimized",
      startTime,
      bookings.length
    );

    return {
      data: bookings,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      metrics,
    };
  },

  // ----------------------------------------
  // AGGREGATION QUERIES
  // ----------------------------------------

  /**
   * Get statistics (optimized aggregations)
   */
  async getStatistics() {
    const startTime = Date.now();

    // OPTIMIZED: Parallel aggregation queries
    const [userStats, placeStats, reviewStats, bookingStats, recentBookings] =
      await Promise.all([
        prisma.user.aggregate({
          _count: { id: true },
          where: { isActive: true },
        }),
        prisma.place.aggregate({
          _count: { id: true },
          _avg: { rating: true },
          where: { isActive: true },
        }),
        prisma.review.aggregate({
          _count: { id: true },
          _avg: { rating: true },
          where: { status: ReviewStatus.APPROVED },
        }),
        db.booking.aggregate({
          _count: { id: true },
          _sum: { totalAmount: true },
          where: { paymentStatus: "PAID" },
        }),
        db.booking.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

    const metrics = trackQuery("getStatistics", startTime, 5);

    return {
      data: {
        users: {
          total: userStats._count.id,
        },
        places: {
          total: placeStats._count.id,
          averageRating: placeStats._avg.rating?.toNumber() || 0,
        },
        reviews: {
          total: reviewStats._count.id,
          averageRating: reviewStats._avg.rating || 0,
        },
        bookings: {
          total: bookingStats._count.id,
          totalRevenue: bookingStats._sum.totalAmount?.toNumber() || 0,
          lastSevenDays: recentBookings,
        },
      },
      metrics,
    };
  },

  /**
   * Get top-rated places by category
   */
  async getTopPlacesByCategory(limit: number = 5) {
    const startTime = Date.now();

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        places: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            rating: true,
            reviewCount: true,
            imageUrl: true,
            city: true,
            country: true,
          },
          orderBy: { rating: "desc" },
          take: limit,
        },
      },
    });

    const metrics = trackQuery(
      "getTopPlacesByCategory",
      startTime,
      categories.length
    );

    return { data: categories, metrics };
  },

  // ----------------------------------------
  // COMPARISON: EFFICIENT VS INEFFICIENT
  // ----------------------------------------

  /**
   * Compare query performance
   *
   * This method demonstrates the difference between
   * optimized and unoptimized queries
   */
  async compareQueryPerformance() {
    const results: {
      optimized: QueryMetrics;
      inefficient: QueryMetrics;
      improvement: string;
    }[] = [];

    // Test 1: User queries
    const optimizedUsers = await this.getUsersOptimized({
      page: 1,
      pageSize: 10,
    });
    const inefficientUsers = await this.getUsersInefficient({
      page: 1,
      pageSize: 10,
    });

    const improvement =
      inefficientUsers.metrics.duration > 0
        ? ((inefficientUsers.metrics.duration -
            optimizedUsers.metrics.duration) /
            inefficientUsers.metrics.duration) *
          100
        : 0;

    results.push({
      optimized: optimizedUsers.metrics,
      inefficient: inefficientUsers.metrics,
      improvement: `${improvement.toFixed(1)}% faster`,
    });

    logger.info("Query Performance Comparison", {
      optimizedDuration: `${optimizedUsers.metrics.duration}ms`,
      inefficientDuration: `${inefficientUsers.metrics.duration}ms`,
      improvement: `${improvement.toFixed(1)}%`,
    });

    return results;
  },

  // ----------------------------------------
  // RAW QUERY WITH EXPLAIN
  // ----------------------------------------

  /**
   * Execute raw query with EXPLAIN ANALYZE
   *
   * Use this to analyze query execution plans
   */
  async explainQuery(tableName: string, condition: string = "") {
    const startTime = Date.now();

    // Build safe query - only allow specific tables
    const allowedTables = ["users", "places", "reviews", "bookings", "trips"];
    if (!allowedTables.includes(tableName)) {
      throw new Error(`Table ${tableName} is not allowed for EXPLAIN`);
    }

    const query = `EXPLAIN ANALYZE SELECT * FROM ${tableName} ${condition ? `WHERE ${condition}` : ""} LIMIT 100`;

    try {
      const result =
        await prisma.$queryRawUnsafe<Array<{ "QUERY PLAN": string }>>(query);
      const metrics = trackQuery("explainQuery", startTime, result.length);

      return {
        queryPlan: result.map((r) => r["QUERY PLAN"]).join("\n"),
        metrics,
      };
    } catch (error) {
      logger.error("EXPLAIN query failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
};

export default queryOptimizationService;
