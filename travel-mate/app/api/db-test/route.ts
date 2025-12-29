import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Database Test API Route
 * GET /api/db-test
 *
 * Tests the Prisma client connection and returns database statistics.
 * Use this endpoint to verify your database setup is working correctly.
 */
export async function GET() {
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;

    // Get database statistics
    const [userCount, categoryCount, placeCount, reviewCount, tripCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.category.count(),
        prisma.place.count(),
        prisma.review.count(),
        prisma.trip.count(),
      ]);

    // Fetch sample data
    const sampleCategories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
      },
      take: 5,
      orderBy: {
        sortOrder: "asc",
      },
    });

    const samplePlaces = await prisma.place.findMany({
      select: {
        name: true,
        city: true,
        country: true,
        rating: true,
      },
      take: 5,
      orderBy: {
        rating: "desc",
      },
    });

    return NextResponse.json(
      {
        status: "connected",
        message: "Prisma Client successfully connected to PostgreSQL database",
        timestamp: new Date().toISOString(),
        database: {
          provider: "postgresql",
          stats: {
            users: userCount,
            categories: categoryCount,
            places: placeCount,
            reviews: reviewCount,
            trips: tripCount,
          },
        },
        samples: {
          categories: sampleCategories,
          places: samplePlaces,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Ensure DATABASE_URL is set correctly and the database is running",
      },
      { status: 500 }
    );
  }
}
