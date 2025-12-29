import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testConnection() {
  console.log("\n🔗 Testing Prisma Database Connection...\n");
  console.log("════════════════════════════════════════════════════════════");

  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection: SUCCESSFUL\n");

    // Get counts
    const [userCount, categoryCount, placeCount, reviewCount, tripCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.category.count(),
        prisma.place.count(),
        prisma.review.count(),
        prisma.trip.count(),
      ]);

    console.log("📊 Database Statistics:");
    console.log("────────────────────────────────────────────────────────────");
    console.log(`  👥 Users:      ${userCount}`);
    console.log(`  📁 Categories: ${categoryCount}`);
    console.log(`  📍 Places:     ${placeCount}`);
    console.log(`  ⭐ Reviews:    ${reviewCount}`);
    console.log(`  ✈️  Trips:      ${tripCount}`);
    console.log(
      "────────────────────────────────────────────────────────────\n"
    );

    // Fetch sample data
    console.log("📋 Sample Data:");
    console.log("────────────────────────────────────────────────────────────");

    const categories = await prisma.category.findMany({
      select: { name: true, slug: true },
      take: 5,
    });
    console.log("\n📁 Categories:");
    categories.forEach((c) => console.log(`   - ${c.name} (${c.slug})`));

    const places = await prisma.place.findMany({
      select: {
        name: true,
        city: true,
        country: true,
        rating: true,
        category: { select: { name: true } },
      },
      take: 5,
      orderBy: { rating: "desc" },
    });
    console.log("\n📍 Top Places:");
    places.forEach((p) =>
      console.log(
        `   - ${p.name} (${p.city}, ${p.country}) - ⭐ ${p.rating} [${p.category.name}]`
      )
    );

    const users = await prisma.user.findMany({
      select: { name: true, email: true, role: true },
      take: 4,
    });
    console.log("\n👥 Users:");
    users.forEach((u) =>
      console.log(`   - ${u.name} (${u.email}) [${u.role}]`)
    );

    console.log(
      "\n════════════════════════════════════════════════════════════"
    );
    console.log("🎉 Prisma Client Successfully Connected to PostgreSQL!");
    console.log(
      "════════════════════════════════════════════════════════════\n"
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Database connection FAILED:");
    console.error(error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
