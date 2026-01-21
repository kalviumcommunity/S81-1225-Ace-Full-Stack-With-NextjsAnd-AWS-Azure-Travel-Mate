import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic"; // SSR always

interface DashboardData {
  user: {
    name: string;
    email: string;
    avatar: string;
    memberSince: string;
  };
  stats: {
    tripsPlanned: number;
    placesVisited: number;
    reviewsWritten: number;
    savedPlaces: number;
  };
  upcomingTrips: Array<{
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    image: string;
    status: "upcoming" | "in-progress" | "completed";
  }>;
  savedPlaces: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    image: string;
    rating: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "review" | "booking" | "save" | "trip";
    message: string;
    time: string;
  }>;
}

async function getDashboardData(): Promise<DashboardData> {
  // Simulated data - in production, this would fetch from database
  return {
    user: {
      name: "Raghava",
      email: "raghava@example.com",
      avatar: "R",
      memberSince: "January 2024",
    },
    stats: {
      tripsPlanned: 12,
      placesVisited: 28,
      reviewsWritten: 15,
      savedPlaces: 47,
    },
    upcomingTrips: [
      {
        id: "1",
        name: "Kerala Backwaters Adventure",
        destination: "Alleppey, Kerala",
        startDate: "Feb 15, 2026",
        endDate: "Feb 22, 2026",
        image:
          "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300&h=200&fit=crop",
        status: "upcoming",
      },
      {
        id: "2",
        name: "Himalayan Trek",
        destination: "Manali, Himachal Pradesh",
        startDate: "Mar 10, 2026",
        endDate: "Mar 18, 2026",
        image:
          "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&h=200&fit=crop",
        status: "upcoming",
      },
    ],
    savedPlaces: [
      {
        id: "1",
        name: "Taj Mahal",
        city: "Agra",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=150&h=100&fit=crop",
        rating: 4.9,
      },
      {
        id: "2",
        name: "Goa Beach",
        city: "Goa",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=150&h=100&fit=crop",
        rating: 4.7,
      },
      {
        id: "3",
        name: "Jaipur Palace",
        city: "Jaipur",
        country: "India",
        image:
          "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=150&h=100&fit=crop",
        rating: 4.6,
      },
    ],
    recentActivity: [
      {
        id: "1",
        type: "review",
        message: "You wrote a review for Taj Mahal",
        time: "2 hours ago",
      },
      {
        id: "2",
        type: "save",
        message: "You saved Ladakh Adventure to favorites",
        time: "Yesterday",
      },
      {
        id: "3",
        type: "trip",
        message: "Kerala trip planning completed",
        time: "3 days ago",
      },
      {
        id: "4",
        type: "booking",
        message: "Hotel booking confirmed for Manali",
        time: "1 week ago",
      },
    ],
  };
}

const activityIcons: Record<string, string> = {
  review: "⭐",
  booking: "🎫",
  save: "❤️",
  trip: "✈️",
};

const statCards = [
  { key: "tripsPlanned", label: "Trips Planned", icon: "🗺️", color: "#0ea5e9" },
  {
    key: "placesVisited",
    label: "Places Visited",
    icon: "📍",
    color: "#10b981",
  },
  {
    key: "reviewsWritten",
    label: "Reviews Written",
    icon: "⭐",
    color: "#f59e0b",
  },
  { key: "savedPlaces", label: "Saved Places", icon: "❤️", color: "#ef4444" },
];

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "calc(100vh - 70px)",
          background: "var(--background)",
        }}
      >
        {/* Dashboard Header */}
        <div className="dashboard-header" style={{ background: "var(--card)" }}>
          <div className="container">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {data.user.avatar}
              </div>
              <div>
                <h1 className="dashboard-title">
                  Welcome back, {data.user.name}! 👋
                </h1>
                <p className="dashboard-subtitle">
                  Member since {data.user.memberSince} • {data.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="container"
          style={{ padding: "2rem var(--container-padding)" }}
        >
          {/* Stats Grid */}
          <div className="dashboard-stats">
            {statCards.map((stat) => (
              <div key={stat.key} className="dashboard-stat-card">
                <div
                  className="dashboard-stat-icon"
                  style={{ background: `${stat.color}15`, fontSize: "1.5rem" }}
                >
                  {stat.icon}
                </div>
                <div className="dashboard-stat-content">
                  <h3>{data.stats[stat.key as keyof typeof data.stats]}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div
            style={{
              display: "grid",
              gap: "2rem",
              gridTemplateColumns: "1fr",
              marginTop: "2rem",
            }}
          >
            {/* Upcoming Trips */}
            <section className="card" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                  ✈️ Upcoming Trips
                </h2>
                <Link href="/trips/new" className="btn btn-primary btn-sm">
                  + Plan New Trip
                </Link>
              </div>

              {data.upcomingTrips.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                  }}
                >
                  {data.upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "1rem",
                        background: "var(--card-hover)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <img
                        src={trip.image}
                        alt={trip.name}
                        style={{
                          width: "100px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{ fontWeight: 600, marginBottom: "0.25rem" }}
                        >
                          {trip.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--muted)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          📍 {trip.destination}
                        </p>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--muted)",
                          }}
                        >
                          📅 {trip.startDate} - {trip.endDate}
                        </p>
                      </div>
                      <span className="badge badge-primary">{trip.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--muted)",
                  }}
                >
                  <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</p>
                  <p>No upcoming trips. Start planning your next adventure!</p>
                  <Link
                    href="/places"
                    className="btn btn-primary"
                    style={{ marginTop: "1rem" }}
                  >
                    Explore Destinations
                  </Link>
                </div>
              )}
            </section>

            {/* Two Column Layout */}
            <div
              style={{
                display: "grid",
                gap: "2rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {/* Saved Places */}
              <section className="card" style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    ❤️ Saved Places
                  </h2>
                  <Link
                    href="/saved"
                    style={{
                      color: "var(--primary)",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    View All →
                  </Link>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {data.savedPlaces.map((place) => (
                    <Link
                      key={place.id}
                      href={`/places/${place.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem",
                        background: "var(--card-hover)",
                        borderRadius: "var(--radius)",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background var(--transition)",
                      }}
                    >
                      <img
                        src={place.image}
                        alt={place.name}
                        style={{
                          width: "60px",
                          height: "45px",
                          objectFit: "cover",
                          borderRadius: "var(--radius-sm)",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                          {place.name}
                        </h4>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--muted)",
                          }}
                        >
                          {place.city}, {place.country}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <span style={{ color: "#fbbf24" }}>★</span>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                          {place.rating}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="card" style={{ padding: "1.5rem" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  🕐 Recent Activity
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {data.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ fontSize: "1.25rem" }}>
                        {activityIcons[activity.type]}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {activity.message}
                        </p>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--muted)",
                          }}
                        >
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Quick Actions */}
            <section className="card" style={{ padding: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                ⚡ Quick Actions
              </h2>
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                {[
                  { icon: "🗺️", label: "Download Offline Map", href: "/maps" },
                  { icon: "📝", label: "Write a Review", href: "/reviews/new" },
                  { icon: "💰", label: "Track Expenses", href: "/expenses" },
                  { icon: "👥", label: "Invite Friends", href: "/invite" },
                  { icon: "⚙️", label: "Account Settings", href: "/settings" },
                  { icon: "❓", label: "Help & Support", href: "/help" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="btn btn-ghost"
                    style={{
                      justifyContent: "flex-start",
                      padding: "1rem",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
