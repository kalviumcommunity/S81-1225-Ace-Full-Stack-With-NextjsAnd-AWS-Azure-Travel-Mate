import {
  PrismaClient,
  UserRole,
  TripStatus,
  ReviewStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // ============================================
  // SEED CATEGORIES
  // ============================================
  console.log("📁 Creating categories...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "landmarks" },
      update: {},
      create: {
        name: "Landmarks",
        slug: "landmarks",
        description: "Famous monuments, towers, and historical landmarks",
        iconUrl: "🏛️",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "nature" },
      update: {},
      create: {
        name: "Nature",
        slug: "nature",
        description: "Natural wonders, parks, and scenic landscapes",
        iconUrl: "🌿",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "beaches" },
      update: {},
      create: {
        name: "Beaches",
        slug: "beaches",
        description: "Beautiful beaches and coastal destinations",
        iconUrl: "🏖️",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "museums" },
      update: {},
      create: {
        name: "Museums",
        slug: "museums",
        description: "Art galleries, museums, and cultural institutions",
        iconUrl: "🏛️",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "adventure" },
      update: {},
      create: {
        name: "Adventure",
        slug: "adventure",
        description: "Adventure sports and thrilling experiences",
        iconUrl: "🎢",
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "historical" },
      update: {},
      create: {
        name: "Historical",
        slug: "historical",
        description: "Ancient ruins and historical sites",
        iconUrl: "🏺",
        sortOrder: 6,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // SEED AMENITIES
  // ============================================
  console.log("🎯 Creating amenities...");
  const amenities = await Promise.all([
    prisma.amenity.upsert({
      where: { name: "WiFi" },
      update: {},
      create: { name: "WiFi", icon: "📶" },
    }),
    prisma.amenity.upsert({
      where: { name: "Parking" },
      update: {},
      create: { name: "Parking", icon: "🅿️" },
    }),
    prisma.amenity.upsert({
      where: { name: "Restaurant" },
      update: {},
      create: { name: "Restaurant", icon: "🍽️" },
    }),
    prisma.amenity.upsert({
      where: { name: "Accessible" },
      update: {},
      create: { name: "Accessible", icon: "♿" },
    }),
    prisma.amenity.upsert({
      where: { name: "Pet Friendly" },
      update: {},
      create: { name: "Pet Friendly", icon: "🐕" },
    }),
    prisma.amenity.upsert({
      where: { name: "Gift Shop" },
      update: {},
      create: { name: "Gift Shop", icon: "🎁" },
    }),
    prisma.amenity.upsert({
      where: { name: "Guided Tours" },
      update: {},
      create: { name: "Guided Tours", icon: "🎤" },
    }),
    prisma.amenity.upsert({
      where: { name: "Photography Allowed" },
      update: {},
      create: { name: "Photography Allowed", icon: "📸" },
    }),
  ]);

  console.log(`✅ Created ${amenities.length} amenities`);

  // ============================================
  // SEED USERS
  // ============================================
  console.log("👥 Creating users...");
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@travelmate.com" },
      update: {},
      create: {
        email: "admin@travelmate.com",
        name: "Admin User",
        role: UserRole.ADMIN,
        bio: "Travel Mate platform administrator",
        emailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "john.traveler@example.com" },
      update: {},
      create: {
        email: "john.traveler@example.com",
        name: "John Traveler",
        role: UserRole.USER,
        bio: "Adventure seeker and travel enthusiast. Visited 30+ countries!",
        emailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "sarah.explorer@example.com" },
      update: {},
      create: {
        email: "sarah.explorer@example.com",
        name: "Sarah Explorer",
        role: UserRole.USER,
        bio: "Nature lover and photography enthusiast",
        emailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "mike.wanderer@example.com" },
      update: {},
      create: {
        email: "mike.wanderer@example.com",
        name: "Mike Wanderer",
        role: UserRole.MODERATOR,
        bio: "Full-time traveler and content creator",
        emailVerified: true,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Get category IDs for places
  const landmarkCategory = categories.find((c) => c.slug === "landmarks")!;
  const natureCategory = categories.find((c) => c.slug === "nature")!;
  const beachCategory = categories.find((c) => c.slug === "beaches")!;
  const historicalCategory = categories.find((c) => c.slug === "historical")!;

  // ============================================
  // SEED PLACES
  // ============================================
  console.log("📍 Creating places...");
  const places = await Promise.all([
    prisma.place.upsert({
      where: { slug: "eiffel-tower-paris" },
      update: {},
      create: {
        name: "Eiffel Tower",
        slug: "eiffel-tower-paris",
        description:
          "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower.",
        address: "Champ de Mars, 5 Avenue Anatole France",
        city: "Paris",
        country: "France",
        latitude: 48.8584,
        longitude: 2.2945,
        imageUrl:
          "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4",
        rating: 4.7,
        reviewCount: 156,
        priceLevel: 3,
        isFeatured: true,
        categoryId: landmarkCategory.id,
      },
    }),
    prisma.place.upsert({
      where: { slug: "grand-canyon-arizona" },
      update: {},
      create: {
        name: "Grand Canyon",
        slug: "grand-canyon-arizona",
        description:
          "The Grand Canyon is a steep-sided canyon carved by the Colorado River in Arizona, United States. It is one of the most spectacular examples of erosion anywhere on Earth.",
        address: "Grand Canyon National Park",
        city: "Arizona",
        country: "United States",
        latitude: 36.1069,
        longitude: -112.1129,
        imageUrl:
          "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722",
        rating: 4.9,
        reviewCount: 243,
        priceLevel: 2,
        isFeatured: true,
        categoryId: natureCategory.id,
      },
    }),
    prisma.place.upsert({
      where: { slug: "machu-picchu-peru" },
      update: {},
      create: {
        name: "Machu Picchu",
        slug: "machu-picchu-peru",
        description:
          "Machu Picchu is a 15th-century Inca citadel situated on a mountain ridge above the Sacred Valley. It is the most familiar icon of Inca civilization.",
        address: "Machu Picchu, Aguas Calientes",
        city: "Cusco Region",
        country: "Peru",
        latitude: -13.1631,
        longitude: -72.545,
        imageUrl:
          "https://images.unsplash.com/photo-1587595431973-160d0d94add1",
        rating: 4.8,
        reviewCount: 189,
        priceLevel: 4,
        isFeatured: true,
        categoryId: historicalCategory.id,
      },
    }),
    prisma.place.upsert({
      where: { slug: "great-barrier-reef-australia" },
      update: {},
      create: {
        name: "Great Barrier Reef",
        slug: "great-barrier-reef-australia",
        description:
          "The Great Barrier Reef is the world's largest coral reef system, composed of over 2,900 individual reefs and 900 islands stretching for over 2,300 kilometers.",
        address: "Great Barrier Reef Marine Park",
        city: "Queensland",
        country: "Australia",
        latitude: -18.2871,
        longitude: 147.6992,
        imageUrl:
          "https://images.unsplash.com/photo-1582967788606-a171c1080cb0",
        rating: 4.9,
        reviewCount: 312,
        priceLevel: 5,
        isFeatured: true,
        categoryId: natureCategory.id,
      },
    }),
    prisma.place.upsert({
      where: { slug: "santorini-greece" },
      update: {},
      create: {
        name: "Santorini",
        slug: "santorini-greece",
        description:
          "Santorini is a volcanic island in the Cyclades group of the Greek islands. It is famous for its dramatic views, stunning sunsets, and beautiful white-washed houses.",
        address: "Santorini Island",
        city: "Santorini",
        country: "Greece",
        latitude: 36.3932,
        longitude: 25.4615,
        imageUrl:
          "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
        rating: 4.8,
        reviewCount: 278,
        priceLevel: 4,
        isFeatured: true,
        categoryId: beachCategory.id,
      },
    }),
    prisma.place.upsert({
      where: { slug: "tokyo-tower-japan" },
      update: {},
      create: {
        name: "Tokyo Tower",
        slug: "tokyo-tower-japan",
        description:
          "Tokyo Tower is a communications and observation tower in the Shiba-koen district of Minato, Tokyo, Japan. At 332.9 meters, it is the second-tallest structure in Japan.",
        address: "4 Chome-2-8 Shibakoen, Minato City",
        city: "Tokyo",
        country: "Japan",
        latitude: 35.6586,
        longitude: 139.7454,
        imageUrl:
          "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc",
        rating: 4.5,
        reviewCount: 167,
        priceLevel: 2,
        isFeatured: false,
        categoryId: landmarkCategory.id,
      },
    }),
  ]);

  console.log(`✅ Created ${places.length} places`);

  // ============================================
  // SEED PLACE IMAGES
  // ============================================
  console.log("🖼️ Creating place images...");
  const eiffelTower = places.find((p) => p.slug === "eiffel-tower-paris")!;
  const grandCanyon = places.find((p) => p.slug === "grand-canyon-arizona")!;

  await prisma.placeImage.createMany({
    data: [
      {
        placeId: eiffelTower.id,
        url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4",
        altText: "Eiffel Tower at sunset",
        isPrimary: true,
        sortOrder: 1,
      },
      {
        placeId: eiffelTower.id,
        url: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e",
        altText: "Eiffel Tower from below",
        isPrimary: false,
        sortOrder: 2,
      },
      {
        placeId: grandCanyon.id,
        url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722",
        altText: "Grand Canyon panoramic view",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created place images");

  // ============================================
  // SEED PLACE AMENITIES
  // ============================================
  console.log("🎯 Linking amenities to places...");
  const wifiAmenity = amenities.find((a) => a.name === "WiFi")!;
  const parkingAmenity = amenities.find((a) => a.name === "Parking")!;
  const restaurantAmenity = amenities.find((a) => a.name === "Restaurant")!;
  const giftShopAmenity = amenities.find((a) => a.name === "Gift Shop")!;

  await prisma.placeAmenity.createMany({
    data: [
      { placeId: eiffelTower.id, amenityId: wifiAmenity.id },
      { placeId: eiffelTower.id, amenityId: restaurantAmenity.id },
      { placeId: eiffelTower.id, amenityId: giftShopAmenity.id },
      { placeId: grandCanyon.id, amenityId: parkingAmenity.id },
      { placeId: grandCanyon.id, amenityId: restaurantAmenity.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Linked amenities to places");

  // ============================================
  // SEED REVIEWS
  // ============================================
  console.log("⭐ Creating reviews...");
  const johnUser = users.find((u) => u.email === "john.traveler@example.com")!;
  const sarahUser = users.find(
    (u) => u.email === "sarah.explorer@example.com"
  )!;

  await prisma.review.createMany({
    data: [
      {
        userId: johnUser.id,
        placeId: eiffelTower.id,
        rating: 5,
        title: "Breathtaking views!",
        comment:
          "The Eiffel Tower exceeded all my expectations. The view from the top is absolutely stunning, especially at sunset. A must-visit when in Paris!",
        status: ReviewStatus.APPROVED,
        visitDate: new Date("2024-06-15"),
      },
      {
        userId: sarahUser.id,
        placeId: eiffelTower.id,
        rating: 4,
        title: "Beautiful but crowded",
        comment:
          "Amazing landmark but be prepared for long queues. Book tickets in advance! The light show at night is magical.",
        status: ReviewStatus.APPROVED,
        visitDate: new Date("2024-08-22"),
      },
      {
        userId: johnUser.id,
        placeId: grandCanyon.id,
        rating: 5,
        title: "Nature at its finest",
        comment:
          "No photo can capture the true grandeur of the Grand Canyon. It's humbling to stand at the edge and witness millions of years of geological history.",
        status: ReviewStatus.APPROVED,
        visitDate: new Date("2024-04-10"),
      },
      {
        userId: sarahUser.id,
        placeId: places.find((p) => p.slug === "santorini-greece")!.id,
        rating: 5,
        title: "Paradise on Earth",
        comment:
          "Santorini is everything you see in pictures and more. The sunsets are unreal, the food is amazing, and the views are unforgettable.",
        status: ReviewStatus.APPROVED,
        visitDate: new Date("2024-09-05"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created reviews");

  // ============================================
  // SEED FAVORITES
  // ============================================
  console.log("❤️ Creating favorites...");
  await prisma.favorite.createMany({
    data: [
      { userId: johnUser.id, placeId: eiffelTower.id },
      { userId: johnUser.id, placeId: grandCanyon.id },
      {
        userId: johnUser.id,
        placeId: places.find((p) => p.slug === "machu-picchu-peru")!.id,
      },
      {
        userId: sarahUser.id,
        placeId: places.find((p) => p.slug === "santorini-greece")!.id,
      },
      {
        userId: sarahUser.id,
        placeId: places.find((p) => p.slug === "great-barrier-reef-australia")!
          .id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created favorites");

  // ============================================
  // SEED TRIPS
  // ============================================
  console.log("✈️ Creating trips...");
  const europeTrip = await prisma.trip.create({
    data: {
      name: "European Adventure 2025",
      description:
        "A two-week journey through the best of Europe - from Paris to Santorini!",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-14"),
      budget: 5000.0,
      currency: "USD",
      status: TripStatus.PLANNING,
      isPublic: true,
      userId: johnUser.id,
    },
  });

  const usaTrip = await prisma.trip.create({
    data: {
      name: "US National Parks Tour",
      description: "Exploring the natural wonders of America",
      startDate: new Date("2025-09-15"),
      endDate: new Date("2025-09-25"),
      budget: 3000.0,
      currency: "USD",
      status: TripStatus.PLANNING,
      isPublic: false,
      userId: sarahUser.id,
    },
  });

  console.log("✅ Created trips");

  // ============================================
  // SEED TRIP PLACES
  // ============================================
  console.log("📍 Adding places to trips...");
  await prisma.tripPlace.createMany({
    data: [
      {
        tripId: europeTrip.id,
        placeId: eiffelTower.id,
        visitOrder: 1,
        visitDate: new Date("2025-06-02"),
        duration: 180,
        notes: "Book skip-the-line tickets",
      },
      {
        tripId: europeTrip.id,
        placeId: places.find((p) => p.slug === "santorini-greece")!.id,
        visitOrder: 2,
        visitDate: new Date("2025-06-10"),
        duration: 2880,
        notes: "Stay for 2 days - sunset views",
      },
      {
        tripId: usaTrip.id,
        placeId: grandCanyon.id,
        visitOrder: 1,
        visitDate: new Date("2025-09-16"),
        duration: 480,
        notes: "Arrive early for sunrise",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Added places to trips");

  // ============================================
  // SEED TRIP MEMBERS
  // ============================================
  console.log("👥 Adding trip members...");
  await prisma.tripMember.createMany({
    data: [
      {
        tripId: europeTrip.id,
        userId: johnUser.id,
        role: "owner",
      },
      {
        tripId: europeTrip.id,
        userId: sarahUser.id,
        role: "editor",
      },
      {
        tripId: usaTrip.id,
        userId: sarahUser.id,
        role: "owner",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Added trip members");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n========================================");
  console.log("🎉 Database seeding completed successfully!");
  console.log("========================================");
  console.log(`📁 Categories: ${categories.length}`);
  console.log(`🎯 Amenities: ${amenities.length}`);
  console.log(`👥 Users: ${users.length}`);
  console.log(`📍 Places: ${places.length}`);
  console.log(`✈️ Trips: 2`);
  console.log("========================================\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
