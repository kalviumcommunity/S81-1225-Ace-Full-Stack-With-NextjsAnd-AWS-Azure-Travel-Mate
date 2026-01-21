/**
 * Admin Statistics API Routes
 *
 * Protected admin-only endpoint for system statistics.
 *
 * Endpoints:
 * - GET /api/admin/stats - Get comprehensive system statistics
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Helper function to get user info from headers (set by middleware)
 */
function getUserFromHeaders(request: NextRequest) {
  return {
    id: request.headers.get("x-user-id"),
    email: request.headers.get("x-user-email"),
    name: request.headers.get("x-user-name"),
    role: request.headers.get("x-user-role"),
  };
}

/**
 * GET /api/admin/stats
 *
 * Get comprehensive system statistics
 */
export async function GET(request: NextRequest) {
  try {
    const admin = getUserFromHeaders(request);

    // Get date ranges for statistics
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setMonth(monthStart.getMonth() - 1);

    // Execute all statistics queries in parallel
    const [
      // Total counts
      totalUsers,
      totalPlaces,
      totalBookings,
      totalTrips,
      totalReviews,

      // Users by role
      usersByRole,

      // Active vs inactive users
      activeUsers,
      inactiveUsers,

      // Recent activity
      usersToday,
      usersThisWeek,
      usersThisMonth,

      // Bookings by status
      bookingsByStatus,

      // Reviews by status
      reviewsByStatus,

      // Top rated places
      topRatedPlaces,

      // Recent bookings revenue
      recentBookings,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.place.count(),
      prisma.booking.count(),
      prisma.trip.count(),
      prisma.review.count(),

      // Users by role
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),

      // Active vs inactive
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),

      // Recent activity
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),

      // Bookings by status
      prisma.booking.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Reviews by status
      prisma.review.groupBy({
        by: ["status"],
        _count: true,
      }),

      // Top rated places
      prisma.place.findMany({
        take: 5,
        orderBy: { rating: "desc" },
        where: { reviewCount: { gt: 0 } },
        select: {
          id: true,
          name: true,
          rating: true,
          reviewCount: true,
          city: true,
          country: true,
        },
      }),

      // Recent bookings for revenue calculation
      prisma.booking.findMany({
        where: {
          createdAt: { gte: monthStart },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        select: {
          totalAmount: true,
        },
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = recentBookings.reduce(
      (sum, booking) => sum + Number(booking.totalAmount || 0),
      0
    );

    // Format users by role
    const userRoleStats = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Format bookings by status
    const bookingStatusStats = bookingsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Format reviews by status
    const reviewStatusStats = reviewsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    logger.info(`Admin ${admin.email} fetched system statistics`);

    return NextResponse.json(
      {
        success: true,
        message: "System statistics retrieved successfully",
        data: {
          overview: {
            totalUsers,
            totalPlaces,
            totalBookings,
            totalTrips,
            totalReviews,
          },
          users: {
            byRole: userRoleStats,
            active: activeUsers,
            inactive: inactiveUsers,
            newToday: usersToday,
            newThisWeek: usersThisWeek,
            newThisMonth: usersThisMonth,
          },
          bookings: {
            byStatus: bookingStatusStats,
            revenueThisMonth: totalRevenue,
          },
          reviews: {
            byStatus: reviewStatusStats,
          },
          topRatedPlaces,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Admin stats error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve system statistics",
        error: {
          code: "ADMIN_STATS_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
