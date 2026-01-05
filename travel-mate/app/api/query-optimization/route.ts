/**
 * Query Optimization API Routes
 *
 * Demonstrates optimized vs inefficient queries with performance metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { queryOptimizationService } from "@/services/query-optimization.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  try {
    switch (action) {
      // ----------------------------------------
      // USER QUERIES
      // ----------------------------------------
      case "users-optimized": {
        const result = await queryOptimizationService.getUsersOptimized({
          page,
          pageSize,
        });
        return NextResponse.json({
          success: true,
          action: "users-optimized",
          description:
            "Fetches only required user fields (id, name, email, role)",
          ...result,
        });
      }

      case "users-inefficient": {
        const result = await queryOptimizationService.getUsersInefficient({
          page,
          pageSize,
        });
        return NextResponse.json({
          success: true,
          action: "users-inefficient",
          description: "Fetches ALL user fields and ALL relations (slow)",
          warning: "This is an anti-pattern demonstration",
          ...result,
        });
      }

      // ----------------------------------------
      // PLACE QUERIES
      // ----------------------------------------
      case "places-optimized": {
        const country = searchParams.get("country") || undefined;
        const city = searchParams.get("city") || undefined;
        const categoryId = searchParams.get("categoryId") || undefined;
        const minRating = searchParams.get("minRating")
          ? parseFloat(searchParams.get("minRating")!)
          : undefined;
        const isFeatured =
          searchParams.get("isFeatured") === "true" ? true : undefined;
        const search = searchParams.get("search") || undefined;

        const result = await queryOptimizationService.getPlacesOptimized({
          page,
          pageSize,
          country,
          city,
          categoryId,
          minRating,
          isFeatured,
          search,
        });

        return NextResponse.json({
          success: true,
          action: "places-optimized",
          description:
            "Uses indexed fields for filtering, selects minimal fields",
          indexesUsed: [
            "country",
            "city",
            "categoryId",
            "rating",
            "isFeatured",
            "isActive",
          ],
          ...result,
        });
      }

      case "places-featured": {
        const limit = parseInt(searchParams.get("limit") || "6");
        const result = await queryOptimizationService.getFeaturedPlaces(limit);
        return NextResponse.json({
          success: true,
          action: "places-featured",
          description: "Fetches featured places using isFeatured index",
          ...result,
        });
      }

      case "places-by-location": {
        const lat = parseFloat(searchParams.get("lat") || "0");
        const lng = parseFloat(searchParams.get("lng") || "0");
        const radius = parseFloat(searchParams.get("radius") || "1");

        const result = await queryOptimizationService.getPlacesByLocation(
          lat,
          lng,
          radius
        );
        return NextResponse.json({
          success: true,
          action: "places-by-location",
          description: "Uses composite index on (latitude, longitude)",
          params: { lat, lng, radius },
          ...result,
        });
      }

      // ----------------------------------------
      // TRIP QUERIES
      // ----------------------------------------
      case "trips-with-places": {
        const userId = searchParams.get("userId");
        if (!userId) {
          return NextResponse.json(
            { success: false, error: "userId is required" },
            { status: 400 }
          );
        }

        const result = await queryOptimizationService.getTripsWithPlaces(
          userId,
          {
            page,
            pageSize,
          }
        );
        return NextResponse.json({
          success: true,
          action: "trips-with-places",
          description: "Avoids N+1 by using include with select",
          ...result,
        });
      }

      // ----------------------------------------
      // BOOKING QUERIES
      // ----------------------------------------
      case "bookings-optimized": {
        const userId = searchParams.get("userId") || undefined;
        const status =
          (searchParams.get("status") as
            | "PENDING"
            | "CONFIRMED"
            | "CANCELLED"
            | "COMPLETED"
            | "REFUNDED"
            | null) || undefined;

        const result = await queryOptimizationService.getBookingsOptimized({
          page,
          pageSize,
          userId,
          status,
        });
        return NextResponse.json({
          success: true,
          action: "bookings-optimized",
          description: "Uses indexed fields for filtering bookings",
          indexesUsed: ["userId", "status", "createdAt"],
          ...result,
        });
      }

      // ----------------------------------------
      // AGGREGATION QUERIES
      // ----------------------------------------
      case "statistics": {
        const result = await queryOptimizationService.getStatistics();
        return NextResponse.json({
          success: true,
          action: "statistics",
          description: "Parallel aggregation queries for dashboard stats",
          ...result,
        });
      }

      case "top-places-by-category": {
        const limit = parseInt(searchParams.get("limit") || "5");
        const result =
          await queryOptimizationService.getTopPlacesByCategory(limit);
        return NextResponse.json({
          success: true,
          action: "top-places-by-category",
          description: "Top rated places grouped by category",
          ...result,
        });
      }

      // ----------------------------------------
      // PERFORMANCE COMPARISON
      // ----------------------------------------
      case "compare-performance": {
        const results =
          await queryOptimizationService.compareQueryPerformance();
        return NextResponse.json({
          success: true,
          action: "compare-performance",
          description: "Compares optimized vs inefficient query performance",
          comparison: results,
          recommendations: [
            "Always select only required fields",
            "Use indexed fields in WHERE clauses",
            "Paginate large result sets",
            "Use includes wisely to avoid N+1",
            "Batch operations when possible",
          ],
        });
      }

      // ----------------------------------------
      // EXPLAIN QUERY
      // ----------------------------------------
      case "explain": {
        const table = searchParams.get("table") || "places";
        const condition = searchParams.get("condition") || "";

        try {
          const result = await queryOptimizationService.explainQuery(
            table,
            condition
          );
          return NextResponse.json({
            success: true,
            action: "explain",
            description: "PostgreSQL EXPLAIN ANALYZE output",
            table,
            condition,
            ...result,
          });
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error:
                error instanceof Error ? error.message : "Explain query failed",
            },
            { status: 400 }
          );
        }
      }

      // ----------------------------------------
      // DEFAULT - API DOCUMENTATION
      // ----------------------------------------
      default:
        return NextResponse.json({
          success: true,
          message: "Query Optimization API",
          description: "Demonstrates query optimization techniques with Prisma",
          availableActions: {
            users: {
              "users-optimized":
                "GET /?action=users-optimized - Optimized user query",
              "users-inefficient":
                "GET /?action=users-inefficient - Inefficient user query (anti-pattern)",
            },
            places: {
              "places-optimized":
                "GET /?action=places-optimized&country=&city=&minRating=",
              "places-featured": "GET /?action=places-featured&limit=6",
              "places-by-location":
                "GET /?action=places-by-location&lat=&lng=&radius=",
            },
            trips: {
              "trips-with-places": "GET /?action=trips-with-places&userId=",
            },
            bookings: {
              "bookings-optimized":
                "GET /?action=bookings-optimized&userId=&status=",
            },
            analytics: {
              statistics: "GET /?action=statistics",
              "top-places-by-category":
                "GET /?action=top-places-by-category&limit=5",
            },
            performance: {
              "compare-performance": "GET /?action=compare-performance",
              explain: "GET /?action=explain&table=places&condition=",
            },
          },
          optimizationTechniques: [
            "1. Select only required fields (avoid over-fetching)",
            "2. Use pagination with skip/take",
            "3. Leverage indexed fields in WHERE clauses",
            "4. Batch operations with createMany/updateMany",
            "5. Avoid N+1 with proper includes",
            "6. Use parallel queries for independent operations",
            "7. Monitor query performance with logging",
          ],
          indexesInSchema: [
            "@@index([email]) on User",
            "@@index([slug]), @@index([categoryId]), @@index([country]), @@index([city]), @@index([rating]), @@index([isFeatured]), @@index([isActive]), @@index([latitude, longitude]) on Place",
            "@@index([userId]), @@index([placeId]), @@index([status]), @@index([rating]) on Review",
            "@@index([userId]), @@index([status]), @@index([paymentStatus]), @@index([createdAt]) on Booking",
          ],
        });
    }
  } catch (error) {
    logger.error("Query Optimization API Error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Query operation failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "bulk-create-users": {
        if (!Array.isArray(data.users)) {
          return NextResponse.json(
            { success: false, error: "users array is required" },
            { status: 400 }
          );
        }

        const result = await queryOptimizationService.bulkCreateUsers(
          data.users
        );
        return NextResponse.json({
          success: true,
          action: "bulk-create-users",
          description: "Uses createMany for efficient bulk insert",
          ...result,
        });
      }

      case "bulk-update-place-status": {
        if (!Array.isArray(data.placeIds)) {
          return NextResponse.json(
            { success: false, error: "placeIds array is required" },
            { status: 400 }
          );
        }

        const result =
          await queryOptimizationService.bulkUpdatePlaceActiveStatus(
            data.placeIds,
            data.isActive ?? true
          );
        return NextResponse.json({
          success: true,
          action: "bulk-update-place-status",
          description: "Uses updateMany for efficient bulk update",
          ...result,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            validActions: ["bulk-create-users", "bulk-update-place-status"],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Query Optimization API POST Error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Query operation failed",
      },
      { status: 500 }
    );
  }
}
