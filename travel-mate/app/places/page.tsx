import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlaceCard from "@/components/PlaceCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR - regenerate every 60 seconds

interface PlaceWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  country: string;
  imageUrl: string | null;
  rating: number | string;
  reviewCount: number;
  priceLevel: number | null;
  isFeatured: boolean;
  category: {
    name: string;
    slug: string;
  };
}

async function getPlaces(): Promise<PlaceWithCategory[]> {
  try {
    const places = await prisma.place.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
      take: 20,
    });

    return places.map((place) => ({
      ...place,
      rating: place.rating.toString(),
    }));
  } catch {
    // Return mock data if database isn't available
    return getMockPlaces();
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

function getMockPlaces(): PlaceWithCategory[] {
  return [
    {
      id: "1",
      name: "Taj Mahal",
      slug: "taj-mahal",
      description:
        "One of the Seven Wonders of the World, this ivory-white marble mausoleum is a symbol of eternal love.",
      city: "Agra",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop",
      rating: "4.9",
      reviewCount: 15234,
      priceLevel: 2,
      isFeatured: true,
      category: { name: "Heritage", slug: "heritage" },
    },
    {
      id: "2",
      name: "Goa Beaches",
      slug: "goa-beaches",
      description:
        "Famous for its stunning beaches, vibrant nightlife, and Portuguese heritage architecture.",
      city: "Goa",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop",
      rating: "4.7",
      reviewCount: 8921,
      priceLevel: 3,
      isFeatured: true,
      category: { name: "Beach", slug: "beach" },
    },
    {
      id: "3",
      name: "Manali Hills",
      slug: "manali-hills",
      description:
        "A stunning hill station nestled in the Himalayas, perfect for adventure seekers and nature lovers.",
      city: "Manali",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop",
      rating: "4.8",
      reviewCount: 6543,
      priceLevel: 2,
      isFeatured: false,
      category: { name: "Mountains", slug: "mountains" },
    },
    {
      id: "4",
      name: "Kerala Backwaters",
      slug: "kerala-backwaters",
      description:
        "Experience the tranquil beauty of Kerala's interconnected lagoons, lakes, and canals.",
      city: "Alleppey",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
      rating: "4.8",
      reviewCount: 7892,
      priceLevel: 3,
      isFeatured: true,
      category: { name: "Nature", slug: "nature" },
    },
    {
      id: "5",
      name: "Jaipur Pink City",
      slug: "jaipur-pink-city",
      description:
        "The royal capital of Rajasthan, known for its magnificent palaces and rich cultural heritage.",
      city: "Jaipur",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop",
      rating: "4.6",
      reviewCount: 9234,
      priceLevel: 2,
      isFeatured: false,
      category: { name: "Heritage", slug: "heritage" },
    },
    {
      id: "6",
      name: "Ladakh Adventure",
      slug: "ladakh-adventure",
      description:
        "A high-altitude desert offering breathtaking landscapes, monasteries, and thrilling adventures.",
      city: "Leh",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1545652985-5edd365b12eb?w=400&h=300&fit=crop",
      rating: "4.9",
      reviewCount: 5678,
      priceLevel: 4,
      isFeatured: true,
      category: { name: "Adventure", slug: "adventure" },
    },
    {
      id: "7",
      name: "Varanasi Ghats",
      slug: "varanasi-ghats",
      description:
        "One of the world's oldest living cities, a spiritual hub on the banks of the sacred Ganges.",
      city: "Varanasi",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop",
      rating: "4.7",
      reviewCount: 8123,
      priceLevel: 1,
      isFeatured: false,
      category: { name: "Heritage", slug: "heritage" },
    },
    {
      id: "8",
      name: "Andaman Islands",
      slug: "andaman-islands",
      description:
        "Pristine beaches, crystal-clear waters, and incredible marine life await in this tropical paradise.",
      city: "Port Blair",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&h=300&fit=crop",
      rating: "4.8",
      reviewCount: 4567,
      priceLevel: 4,
      isFeatured: true,
      category: { name: "Beach", slug: "beach" },
    },
  ];
}

export default async function PlacesPage() {
  const [places, categories] = await Promise.all([
    getPlaces(),
    getCategories(),
  ]);

  const featuredPlaces = places.filter((p) => p.isFeatured);
  const regularPlaces = places.filter((p) => !p.isFeatured);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section
          style={{
            background: "var(--gradient-hero)",
            color: "white",
            padding: "4rem 0",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Discover Amazing Destinations
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                opacity: 0.9,
                marginBottom: "2rem",
                maxWidth: "600px",
                margin: "0 auto 2rem",
              }}
            >
              Explore handpicked travel destinations with offline maps, reviews,
              and local insights.
            </p>

            {/* Search Bar */}
            <div
              className="search-bar"
              style={{ maxWidth: "500px", margin: "0 auto" }}
            >
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search destinations, cities, or experiences..."
                style={{ background: "white", color: "var(--foreground)" }}
              />
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <section
            style={{
              padding: "1.5rem 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="container">
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                }}
              >
                <button className="btn btn-primary btn-sm">All</button>
                {categories.map((cat) => (
                  <button key={cat.id} className="btn btn-ghost btn-sm">
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Places */}
        {featuredPlaces.length > 0 && (
          <section className="section" style={{ paddingBottom: "2rem" }}>
            <div className="container">
              <div style={{ marginBottom: "1.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  ✨ Featured Destinations
                </h2>
                <p style={{ color: "var(--muted)" }}>
                  Hand-picked places recommended by our travel experts
                </p>
              </div>
              <div className="grid-places">
                {featuredPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Places */}
        <section
          className="section"
          style={{
            paddingTop: featuredPlaces.length > 0 ? "2rem" : undefined,
            background: "var(--card)",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  All Destinations
                </h2>
                <p style={{ color: "var(--muted)" }}>
                  {places.length} destinations available
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <select
                  className="form-input"
                  style={{ width: "auto", padding: "0.5rem 1rem" }}
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div className="grid-places">
              {(regularPlaces.length > 0 ? regularPlaces : places).map(
                (place) => (
                  <PlaceCard key={place.id} place={place} />
                )
              )}
            </div>

            {/* Load More */}
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <button className="btn btn-secondary btn-lg">
                Load More Destinations
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="section" style={{ textAlign: "center" }}>
          <div className="container">
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Get Travel Inspiration
            </h2>
            <p
              style={{
                color: "var(--muted)",
                marginBottom: "2rem",
                maxWidth: "500px",
                margin: "0 auto 2rem",
              }}
            >
              Subscribe to our newsletter for exclusive deals, travel tips, and
              destination guides.
            </p>
            <form
              style={{
                display: "flex",
                gap: "0.75rem",
                maxWidth: "400px",
                margin: "0 auto",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                style={{ flex: "1", minWidth: "200px" }}
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
