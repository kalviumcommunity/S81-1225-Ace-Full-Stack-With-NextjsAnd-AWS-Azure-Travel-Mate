import prisma from "./prisma";

/**
 * Test Database Connection
 *
 * This module provides utility functions to test and verify the Prisma
 * database connection. Use these functions to ensure your database
 * is properly configured and accessible.
 */

/**
 * Test basic database connectivity
 * @returns Connection status and timestamp
 */
export async function testConnection(): Promise<{
  connected: boolean;
  timestamp: Date;
  error?: string;
}> {
  try {
    // Execute a simple query to test the connection
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all users from the database
 * @returns Array of users with basic info
 */
export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  console.log("Users retrieved:", users.length);
  return users;
}

/**
 * Get all categories from the database
 * @returns Array of categories
 */
export async function getCategories() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
  console.log("Categories retrieved:", categories.length);
  return categories;
}

/**
 * Get all places with their category info
 * @returns Array of places with category details
 */
export async function getPlaces() {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      country: true,
      rating: true,
      isFeatured: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      rating: "desc",
    },
  });
  console.log("Places retrieved:", places.length);
  return places;
}

/**
 * Get featured places only
 * @returns Array of featured places
 */
export async function getFeaturedPlaces() {
  const featuredPlaces = await prisma.place.findMany({
    where: {
      isFeatured: true,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      city: true,
      country: true,
      imageUrl: true,
      rating: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      rating: "desc",
    },
  });
  console.log("Featured places retrieved:", featuredPlaces.length);
  return featuredPlaces;
}

/**
 * Get database statistics
 * @returns Object containing counts of all main entities
 */
export async function getDatabaseStats() {
  const [userCount, categoryCount, placeCount, reviewCount, tripCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.place.count(),
      prisma.review.count(),
      prisma.trip.count(),
    ]);

  const stats = {
    users: userCount,
    categories: categoryCount,
    places: placeCount,
    reviews: reviewCount,
    trips: tripCount,
    timestamp: new Date(),
  };

  console.log("Database Statistics:", stats);
  return stats;
}

/**
 * Comprehensive connection test with database info
 * Use this to verify your Prisma setup is working correctly
 */
export async function runConnectionTest() {
  console.log("\n🔗 Testing Prisma Database Connection...\n");

  try {
    // Step 1: Test basic connectivity
    const connectionResult = await testConnection();
    console.log(
      "✅ Connection Status:",
      connectionResult.connected ? "Connected" : "Failed"
    );
    console.log("📅 Timestamp:", connectionResult.timestamp.toISOString());

    if (!connectionResult.connected) {
      console.error("❌ Connection Error:", connectionResult.error);
      return { success: false, error: connectionResult.error };
    }

    // Step 2: Get database stats
    console.log("\n📊 Fetching Database Statistics...");
    const stats = await getDatabaseStats();

    console.log("\n🎉 Prisma Client Successfully Connected!");
    console.log("════════════════════════════════════════");
    console.log(`  Users:      ${stats.users}`);
    console.log(`  Categories: ${stats.categories}`);
    console.log(`  Places:     ${stats.places}`);
    console.log(`  Reviews:    ${stats.reviews}`);
    console.log(`  Trips:      ${stats.trips}`);
    console.log("════════════════════════════════════════\n");

    return { success: true, stats };
  } catch (error) {
    console.error("❌ Database Test Failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
