import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  image: string;
  status: "planning" | "upcoming" | "in-progress" | "completed" | "cancelled";
  placesCount: number;
  budget: number;
  spent: number;
}

async function getTrips(): Promise<Trip[]> {
  // Mock data - in production, this would fetch from database
  return [
    {
      id: "1",
      name: "Kerala Backwaters Adventure",
      destination: "Alleppey, Kerala",
      startDate: "Feb 15, 2026",
      endDate: "Feb 22, 2026",
      image:
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=250&fit=crop",
      status: "upcoming",
      placesCount: 8,
      budget: 50000,
      spent: 15000,
    },
    {
      id: "2",
      name: "Himalayan Trek",
      destination: "Manali, Himachal Pradesh",
      startDate: "Mar 10, 2026",
      endDate: "Mar 18, 2026",
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop",
      status: "planning",
      placesCount: 5,
      budget: 75000,
      spent: 0,
    },
    {
      id: "3",
      name: "Goa Beach Vacation",
      destination: "Goa",
      startDate: "Dec 20, 2025",
      endDate: "Dec 27, 2025",
      image:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop",
      status: "completed",
      placesCount: 12,
      budget: 40000,
      spent: 38500,
    },
    {
      id: "4",
      name: "Rajasthan Heritage Tour",
      destination: "Jaipur & Udaipur",
      startDate: "Nov 5, 2025",
      endDate: "Nov 12, 2025",
      image:
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=250&fit=crop",
      status: "completed",
      placesCount: 15,
      budget: 60000,
      spent: 55000,
    },
  ];
}

const statusColors: Record<string, { bg: string; text: string }> = {
  planning: { bg: "rgb(139 92 246 / 0.1)", text: "#8b5cf6" },
  upcoming: { bg: "rgb(14 165 233 / 0.1)", text: "#0ea5e9" },
  "in-progress": { bg: "rgb(16 185 129 / 0.1)", text: "#10b981" },
  completed: { bg: "rgb(100 116 139 / 0.1)", text: "#64748b" },
  cancelled: { bg: "rgb(239 68 68 / 0.1)", text: "#ef4444" },
};

const statusLabels: Record<string, string> = {
  planning: "Planning",
  upcoming: "Upcoming",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function TripsPage() {
  const trips = await getTrips();

  const upcomingTrips = trips.filter(
    (t) => t.status === "upcoming" || t.status === "in-progress"
  );
  const planningTrips = trips.filter((t) => t.status === "planning");
  const pastTrips = trips.filter(
    (t) => t.status === "completed" || t.status === "cancelled"
  );

  const TripCard = ({ trip }: { trip: Trip; key?: string }) => (
    <Link
      href={`/trips/${trip.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        className="card"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div style={{ position: "relative" }}>
          <img
            src={trip.image}
            alt={trip.name}
            className="card-image"
            style={{ height: "180px" }}
          />
          <span
            className="badge"
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              background: statusColors[trip.status].bg,
              color: statusColors[trip.status].text,
            }}
          >
            {statusLabels[trip.status]}
          </span>
        </div>
        <div
          className="card-body"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "var(--foreground)",
            }}
          >
            {trip.name}
          </h3>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
            }}
          >
            📍 {trip.destination}
          </p>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            📅 {trip.startDate} - {trip.endDate}
          </p>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ color: "var(--muted)" }}>Budget</span>
              <span style={{ fontWeight: 600 }}>
                ₹{trip.budget.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                height: "6px",
                background: "var(--border)",
                borderRadius: "var(--radius-full)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%`,
                  background:
                    trip.spent > trip.budget
                      ? "var(--error)"
                      : "var(--success)",
                  borderRadius: "var(--radius-full)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--muted)",
                marginTop: "0.25rem",
              }}
            >
              <span>₹{trip.spent.toLocaleString()} spent</span>
              <span>{trip.placesCount} places</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );

  return (
    <>
      <Navbar />

      <main>
        {/* Header */}
        <section
          style={{
            background: "var(--gradient-hero)",
            color: "white",
            padding: "4rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1.5rem",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  My Trips
                </h1>
                <p style={{ fontSize: "1.125rem", opacity: 0.9 }}>
                  Plan, track, and relive your adventures
                </p>
              </div>
              <Link
                href="/trips/new"
                className="btn btn-lg"
                style={{ background: "white", color: "var(--primary)" }}
              >
                + Plan New Trip
              </Link>
            </div>
          </div>
        </section>

        {/* Trip Stats */}
        <section
          style={{
            background: "var(--card)",
            padding: "1.5rem 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "flex",
                gap: "2rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                  }}
                >
                  {trips.length}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                  Total Trips
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--success)",
                  }}
                >
                  {upcomingTrips.length}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                  Upcoming
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--secondary)",
                  }}
                >
                  {planningTrips.length}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                  Planning
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--muted)",
                  }}
                >
                  {pastTrips.length}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                  Completed
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          className="container"
          style={{ padding: "3rem var(--container-padding)" }}
        >
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                ✈️ Upcoming Adventures
              </h2>
              <div
                className="grid-places"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {/* Planning Trips */}
          {planningTrips.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📝 Currently Planning
              </h2>
              <div
                className="grid-places"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {planningTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <section>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📸 Past Adventures
              </h2>
              <div
                className="grid-places"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                }}
              >
                {pastTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {trips.length === 0 && (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
              <span style={{ fontSize: "5rem" }}>🗺️</span>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginTop: "1.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                No trips yet
              </h2>
              <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
                Start planning your next adventure and create unforgettable
                memories!
              </p>
              <Link href="/places" className="btn btn-primary btn-lg">
                Explore Destinations
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
