import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const features = [
  {
    icon: "🗺️",
    title: "Offline Maps",
    description:
      "Download maps for your destinations and navigate seamlessly without internet connection.",
  },
  {
    icon: "✨",
    title: "Smart Recommendations",
    description:
      "Get personalized travel suggestions based on your preferences and travel history.",
  },
  {
    icon: "📅",
    title: "Trip Planning",
    description:
      "Organize your entire journey with our intuitive itinerary builder and booking integration.",
  },
  {
    icon: "⭐",
    title: "Reviews & Ratings",
    description:
      "Read authentic reviews from fellow travelers and share your own experiences.",
  },
  {
    icon: "💰",
    title: "Budget Tracking",
    description:
      "Keep track of your travel expenses and stay within your budget effortlessly.",
  },
  {
    icon: "🤝",
    title: "Travel Community",
    description:
      "Connect with like-minded travelers, share tips, and discover hidden gems together.",
  },
];

const stats = [
  { value: "50K+", label: "Happy Travelers" },
  { value: "1,200+", label: "Destinations" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support Available" },
];

const testimonials = [
  {
    text: "Travel Mate made our honeymoon absolutely perfect. The offline maps saved us countless times in remote areas of Bali!",
    name: "Sarah & Mike",
    role: "Travelers from USA",
    initial: "S",
  },
  {
    text: "As a solo traveler, I rely on Travel Mate for everything. The community feature helped me find amazing local experiences.",
    name: "Priya Sharma",
    role: "Solo Adventurer",
    initial: "P",
  },
  {
    text: "The trip planning feature is incredible. I organized my entire 3-week Europe trip in just a few hours.",
    name: "James Chen",
    role: "Digital Nomad",
    initial: "J",
  },
];

const popularDestinations = [
  {
    name: "Bali, Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 2847,
  },
  {
    name: "Santorini, Greece",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 3421,
  },
  {
    name: "Kyoto, Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 2156,
  },
  {
    name: "Machu Picchu, Peru",
    image:
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 1893,
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Explore the World with Confidence</h1>
          <p className="hero-subtitle">
            Your smart travel companion for planning unforgettable adventures.
            Discover destinations, create itineraries, and travel with offline
            maps.
          </p>
          <div className="hero-buttons">
            <Link href="/places" className="btn btn-primary btn-lg">
              Explore Destinations
            </Link>
            <Link
              href="/signup"
              className="btn btn-secondary btn-lg"
              style={{ borderColor: "white", color: "white" }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ background: "var(--card)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "2rem",
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Everything You Need to Travel Smart
            </h2>
            <p
              style={{
                color: "var(--muted)",
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "1.125rem",
              }}
            >
              From planning to exploring, Travel Mate has all the tools you need
              for the perfect journey.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {features.map((feature) => (
              <div key={feature.title} className="card feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="section" style={{ background: "var(--card)" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                Popular Destinations
              </h2>
              <p style={{ color: "var(--muted)" }}>
                Trending places our travelers love
              </p>
            </div>
            <Link href="/places" className="btn btn-secondary">
              View All Places →
            </Link>
          </div>
          <div className="grid-places">
            {popularDestinations.map((dest) => (
              <div
                key={dest.name}
                className="card"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="card-image"
                  style={{ height: "200px" }}
                />
                <div className="card-body">
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {dest.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: "#fbbf24" }}>★</span>
                    <span style={{ fontWeight: 600 }}>{dest.rating}</span>
                    <span
                      style={{ color: "var(--muted)", fontSize: "0.875rem" }}
                    >
                      ({dest.reviews.toLocaleString()} reviews)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              What Travelers Say
            </h2>
            <p
              style={{
                color: "var(--muted)",
                maxWidth: "600px",
                margin: "0 auto",
                fontSize: "1.125rem",
              }}
            >
              Join thousands of happy travelers who trust Travel Mate for their
              adventures.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="testimonial-card">
                <p className="testimonial-text">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="section"
        style={{
          background: "var(--gradient-primary)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Ready to Start Your Adventure?
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              opacity: 0.9,
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
            }}
          >
            Join Travel Mate today and unlock a world of possibilities. Your
            next great journey awaits.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/signup"
              className="btn btn-lg"
              style={{ background: "white", color: "var(--primary)" }}
            >
              Create Free Account
            </Link>
            <Link
              href="/about"
              className="btn btn-lg"
              style={{
                background: "transparent",
                border: "2px solid white",
                color: "white",
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
