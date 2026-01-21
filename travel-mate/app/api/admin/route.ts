/**
 * Admin API Routes
 *
 * Protected admin-only endpoints for system management.
 * These routes are only accessible to users with ADMIN role.
 *
 * Endpoints:
 * - GET  /api/admin         - Admin dashboard overview
 * - GET  /api/admin/users   - List all users with admin privileges
 * - GET  /api/admin/stats   - System statistics
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
 * GET /api/admin
 *
 * Admin dashboard endpoint
 * Returns system overview and confirms admin access
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromHeaders(request);

    logger.info(`Admin access granted: ${user.email} (${user.role})`);

    // Get system statistics
    const [
      totalUsers,
      totalPlaces,
      totalBookings,
      totalTrips,
      totalReviews,
      activeUsers,
      pendingReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.place.count(),
      prisma.booking.count(),
      prisma.trip.count(),
      prisma.review.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin dashboard data retrieved successfully",
        data: {
          adminUser: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          statistics: {
            totalUsers,
            activeUsers,
            totalPlaces,
            totalBookings,
            totalTrips,
            totalReviews,
            pendingReviews,
          },
          recentActivity: {
            users: recentUsers,
            bookings: recentBookings,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Admin dashboard error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve admin dashboard data",
        error: {
          code: "ADMIN_ERROR",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
