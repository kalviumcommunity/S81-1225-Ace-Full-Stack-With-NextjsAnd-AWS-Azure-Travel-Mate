"use client";

import Link from "next/link";

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    slug?: string;
    description?: string | null;
    city?: string | null;
    country?: string;
    imageUrl?: string | null;
    rating?: number | string;
    reviewCount?: number;
    priceLevel?: number | null;
    isFeatured?: boolean;
    category?: {
      name: string;
      slug: string;
    };
  };
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const rating =
    typeof place.rating === "string"
      ? parseFloat(place.rating)
      : place.rating || 0;
  const priceLevel = place.priceLevel || 2;

  const imageUrl =
    place.imageUrl ||
    `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop`;

  const renderPriceLevel = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          style={{ color: i < priceLevel ? "var(--success)" : "var(--border)" }}
        >
          $
        </span>
      ));
  };

  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} style={{ color: "#fbbf24" }}>
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} style={{ color: "#fbbf24" }}>
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} style={{ color: "var(--border)" }}>
            ★
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <Link
      href={`/places/${place.slug || place.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        className="card"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Image Container */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={imageUrl}
            alt={place.name}
            className="card-image"
            style={{
              height: "200px",
              transition: "transform 0.3s ease",
            }}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop";
            }}
          />

          {/* Featured Badge */}
          {place.isFeatured && (
            <span
              className="badge badge-primary"
              style={{
                position: "absolute",
                top: "0.75rem",
                left: "0.75rem",
              }}
            >
              ✨ Featured
            </span>
          )}

          {/* Category Badge */}
          {place.category && (
            <span
              className="badge"
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                background: "rgba(0,0,0,0.6)",
                color: "white",
              }}
            >
              {place.category.name}
            </span>
          )}

          {/* Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
            }}
          />
        </div>

        {/* Card Content */}
        <div
          className="card-body"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Location */}
          {(place.city || place.country) && (
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.8125rem",
                marginBottom: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              📍 {[place.city, place.country].filter(Boolean).join(", ")}
            </p>
          )}

          {/* Title */}
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "0.5rem",
              lineHeight: 1.3,
            }}
          >
            {place.name}
          </h3>

          {/* Description */}
          {place.description && (
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                marginBottom: "1rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flex: 1,
              }}
            >
              {place.description}
            </p>
          )}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            {/* Rating */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div className="rating">{renderRating()}</div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {rating.toFixed(1)}
              </span>
              {place.reviewCount !== undefined && (
                <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
                  ({place.reviewCount})
                </span>
              )}
            </div>

            {/* Price Level */}
            <div style={{ fontSize: "0.875rem", letterSpacing: "-0.05em" }}>
              {renderPriceLevel()}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
