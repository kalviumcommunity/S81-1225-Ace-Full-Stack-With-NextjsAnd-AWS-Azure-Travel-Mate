import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

async function getPlace(slug: string) {
  try {
    const place = await prisma.place.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isActive: true,
      },
      include: {
        category: true,
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    return place;
  } catch {
    return null;
  }
}

// Mock data fallback
function getMockPlace(slug: string) {
  const mockPlaces: Record<
    string,
    {
      id: string;
      name: string;
      slug: string;
      description: string;
      city: string;
      country: string;
      imageUrl: string;
      rating: string;
      reviewCount: number;
      priceLevel: number;
      latitude: string;
      longitude: string;
      category: { name: string; slug: string };
      amenities: string[];
      images: string[];
    }
  > = {
    "taj-mahal": {
      id: "1",
      name: "Taj Mahal",
      slug: "taj-mahal",
      description:
        "The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, India. It was commissioned in 1631 by the fifth Mughal emperor, Shah Jahan to house the tomb of his beloved wife, Mumtaz Mahal.\n\nThe Taj Mahal is widely recognized as the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage. It attracts 7-8 million visitors a year and was declared a UNESCO World Heritage Site in 1983.",
      city: "Agra",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=600&fit=crop",
      rating: "4.9",
      reviewCount: 15234,
      priceLevel: 2,
      latitude: "27.1751",
      longitude: "78.0421",
      category: { name: "Heritage", slug: "heritage" },
      amenities: [
        "Guided Tours",
        "Photography Allowed",
        "Wheelchair Accessible",
        "Restrooms",
        "Gift Shop",
      ],
      images: [
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=500&fit=crop",
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=500&fit=crop",
        "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=800&h=500&fit=crop",
      ],
    },
    "goa-beaches": {
      id: "2",
      name: "Goa Beaches",
      slug: "goa-beaches",
      description:
        "Goa is famous for its pristine beaches, vibrant nightlife, and Portuguese heritage architecture. From the bustling shores of Baga to the serene sands of Palolem, there's a beach for every traveler.\n\nExperience water sports, beach parties, fresh seafood, and stunning sunsets. Goa offers the perfect blend of relaxation and adventure.",
      city: "Goa",
      country: "India",
      imageUrl:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=600&fit=crop",
      rating: "4.7",
      reviewCount: 8921,
      priceLevel: 3,
      latitude: "15.2993",
      longitude: "74.1240",
      category: { name: "Beach", slug: "beach" },
      amenities: [
        "Beach Access",
        "Water Sports",
        "Restaurants",
        "Nightlife",
        "Parking",
      ],
      images: [
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=500&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop",
      ],
    },
  };

  return mockPlaces[slug] || mockPlaces["taj-mahal"];
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const dbPlace = await getPlace(slug);
  let isMock = false;

  // Determine which place data to use - DB or mock
  let place:
    | NonNullable<Awaited<ReturnType<typeof getPlace>>>
    | ReturnType<typeof getMockPlace>;

  if (!dbPlace) {
    const mockPlace = getMockPlace(slug);
    if (!mockPlace) {
      notFound();
    }
    isMock = true;
    place = mockPlace;
  } else {
    place = dbPlace;
  }

  const rating =
    typeof place.rating === "string"
      ? parseFloat(place.rating)
      : Number(place.rating);
  const priceLevel = place.priceLevel || 2;

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          style={{
            color: i < Math.floor(rating) ? "#fbbf24" : "var(--border)",
            fontSize: "1.25rem",
          }}
        >
          ★
        </span>
      ));
  };

  return (
    <>
      <Navbar />

      <main>
        {/* Breadcrumb */}
        <div
          style={{
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            padding: "1rem 0",
          }}
        >
          <div className="container">
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--muted)",
              }}
            >
              <Link
                href="/"
                style={{ color: "var(--muted)", textDecoration: "none" }}
              >
                Home
              </Link>
              <span>/</span>
              <Link
                href="/places"
                style={{ color: "var(--muted)", textDecoration: "none" }}
              >
                Destinations
              </Link>
              <span>/</span>
              <span style={{ color: "var(--foreground)" }}>{place.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Image */}
        <div
          className="place-hero container"
          style={{
            backgroundImage: `url(${place.imageUrl || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=600&fit=crop"})`,
            marginTop: "2rem",
          }}
        >
          <div className="place-hero-overlay">
            <div className="place-hero-content">
              {!isMock && place.category && (
                <span
                  className="badge badge-primary"
                  style={{ marginBottom: "0.75rem" }}
                >
                  {place.category.name}
                </span>
              )}
              {isMock && (
                <span
                  className="badge badge-primary"
                  style={{ marginBottom: "0.75rem" }}
                >
                  {
                    (place as unknown as { category: { name: string } })
                      .category.name
                  }
                </span>
              )}
              <h1>{place.name}</h1>
              <div className="place-meta">
                <div className="place-meta-item">
                  📍 {place.city}, {place.country}
                </div>
                <div className="place-meta-item">
                  {renderStars(rating)}{" "}
                  <span style={{ marginLeft: "0.5rem" }}>
                    {rating.toFixed(1)}
                  </span>
                </div>
                <div className="place-meta-item">
                  💬 {(place.reviewCount || 0).toLocaleString()} reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="container"
          style={{ padding: "3rem var(--container-padding)" }}
        >
          <div
            style={{
              display: "grid",
              gap: "2rem",
              gridTemplateColumns: "1fr",
              maxWidth: "1000px",
            }}
          >
            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button className="btn btn-primary btn-lg">
                📥 Download Offline Map
              </button>
              <button className="btn btn-secondary">
                ❤️ Save to Favorites
              </button>
              <button
                className="btn btn-ghost"
                style={{ border: "1px solid var(--border)" }}
              >
                📤 Share
              </button>
            </div>

            {/* Description */}
            <section className="card" style={{ padding: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                About This Place
              </h2>
              <div
                style={{
                  color: "var(--muted)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {place.description}
              </div>
            </section>

            {/* Info Grid */}
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Price Level
                </h3>
                <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color:
                            i < priceLevel ? "var(--success)" : "var(--border)",
                        }}
                      >
                        $
                      </span>
                    ))}
                </p>
              </div>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Best Time to Visit
                </h3>
                <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  October - March
                </p>
              </div>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Average Duration
                </h3>
                <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  2-3 Hours
                </p>
              </div>
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Location
                </h3>
                <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  {place.city}, {place.country}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {isMock && (
              <section className="card" style={{ padding: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  Amenities & Features
                </h2>
                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  {(place as unknown as { amenities: string[] }).amenities.map(
                    (amenity: string) => (
                      <span
                        key={amenity}
                        className="badge"
                        style={{
                          background: "var(--card-hover)",
                          color: "var(--foreground)",
                          padding: "0.5rem 1rem",
                          fontSize: "0.9375rem",
                        }}
                      >
                        ✓ {amenity}
                      </span>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section className="card" style={{ padding: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Reviews</h2>
                <button className="btn btn-primary btn-sm">
                  ✍️ Write a Review
                </button>
              </div>

              {/* Rating Summary */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                  marginBottom: "2rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1 }}
                  >
                    {rating.toFixed(1)}
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    {renderStars(rating)}
                  </div>
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {(place.reviewCount || 0).toLocaleString()} reviews
                  </div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {[
                  {
                    name: "John T.",
                    rating: 5,
                    date: "2 weeks ago",
                    text: "Absolutely breathtaking! The architecture is stunning and the history is fascinating. A must-visit destination.",
                  },
                  {
                    name: "Sarah M.",
                    rating: 4,
                    date: "1 month ago",
                    text: "Beautiful place, but quite crowded. I recommend visiting early morning for the best experience.",
                  },
                  {
                    name: "Rahul K.",
                    rating: 5,
                    date: "2 months ago",
                    text: "One of the most iconic landmarks I've ever visited. The sunset view is magical!",
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1.5rem",
                      background: "var(--card-hover)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--gradient-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                          }}
                        >
                          {review.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{review.name}</div>
                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--muted)",
                            }}
                          >
                            {review.date}
                          </div>
                        </div>
                      </div>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <p style={{ color: "var(--foreground)", lineHeight: 1.7 }}>
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button className="btn btn-secondary">View All Reviews</button>
              </div>
            </section>

            {/* Map Placeholder */}
            <section className="card" style={{ padding: "2rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Location
              </h2>
              <div
                style={{
                  height: "300px",
                  background: "var(--card-hover)",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "3rem" }}>🗺️</span>
                  <p style={{ marginTop: "1rem" }}>
                    Interactive map would be displayed here
                  </p>
                  <p style={{ fontSize: "0.875rem" }}>
                    Coordinates: {place.latitude || "27.1751"},{" "}
                    {place.longitude || "78.0421"}
                  </p>
                </div>
              </div>
            </section>

            {/* Similar Places */}
            <section>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                Similar Destinations
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/places" className="btn btn-primary btn-lg">
                  Explore More Destinations →
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
