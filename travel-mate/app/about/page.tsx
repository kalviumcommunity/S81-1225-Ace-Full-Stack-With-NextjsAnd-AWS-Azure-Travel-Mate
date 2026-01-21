// app/about/page.tsx

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const revalidate = false; // fully static

const teamMembers = [
  {
    name: "Raghava Kumar",
    role: "Founder & CEO",
    bio: "Passionate traveler with 10+ years in tech. Founded Travel Mate to solve real problems travelers face.",
    avatar: "RK",
    color: "#0ea5e9",
  },
  {
    name: "Priya Sharma",
    role: "Head of Product",
    bio: "Former Google PM. Loves creating intuitive products that make travel planning a breeze.",
    avatar: "PS",
    color: "#8b5cf6",
  },
  {
    name: "Mike Chen",
    role: "Lead Engineer",
    bio: "Full-stack wizard who built the offline maps system. Believes great code enables great adventures.",
    avatar: "MC",
    color: "#10b981",
  },
  {
    name: "Sarah Johnson",
    role: "Community Lead",
    bio: "Connects travelers worldwide. Has visited 50+ countries and counting.",
    avatar: "SJ",
    color: "#f59e0b",
  },
];

const values = [
  {
    icon: "🌍",
    title: "Explore Without Limits",
    description:
      "We believe travel should be accessible to everyone. Our offline features ensure you can navigate anywhere, anytime.",
  },
  {
    icon: "🤝",
    title: "Community First",
    description:
      "Real travelers helping real travelers. Our community shares authentic experiences and hidden gems.",
  },
  {
    icon: "🔒",
    title: "Privacy & Security",
    description:
      "Your data is yours. We use industry-leading encryption and never sell your personal information.",
  },
  {
    icon: "♻️",
    title: "Sustainable Travel",
    description:
      "We promote eco-friendly destinations and partner with sustainable tourism initiatives globally.",
  },
];

const milestones = [
  {
    year: "2023",
    title: "Founded",
    description: "Travel Mate was born from a simple idea: make travel easier.",
  },
  {
    year: "2024",
    title: "1M Downloads",
    description: "Reached our first million users across 50 countries.",
  },
  {
    year: "2025",
    title: "Offline Maps",
    description: "Launched revolutionary offline navigation for remote areas.",
  },
  {
    year: "2026",
    title: "Global Community",
    description: "Building the world's largest travel community platform.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section
          style={{
            background: "var(--gradient-hero)",
            color: "white",
            padding: "5rem 0",
            textAlign: "center",
          }}
        >
          <div className="container">
            <span
              style={{
                display: "inline-block",
                fontSize: "4rem",
                marginBottom: "1rem",
              }}
            >
              🌍
            </span>
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
              }}
            >
              About Travel Mate
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                opacity: 0.9,
                maxWidth: "700px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              We&apos;re on a mission to make travel planning effortless and
              adventures unforgettable. With offline-friendly maps and a global
              community, we help travelers explore with confidence.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="section">
          <div className="container">
            <div
              style={{
                display: "grid",
                gap: "3rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  Our Story
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.8,
                    marginBottom: "1rem",
                  }}
                >
                  Travel Mate started in 2023 when our founder, Raghava, found
                  himself lost in a remote village in Vietnam with no internet
                  connection. That frustrating experience sparked an idea: what
                  if travelers never had to worry about connectivity again?
                </p>
                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.8,
                    marginBottom: "1rem",
                  }}
                >
                  Today, we&apos;ve grown into a platform serving millions of
                  travelers worldwide. Our offline maps cover 95% of the
                  world&apos;s popular destinations, and our community shares
                  thousands of authentic reviews daily.
                </p>
                <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
                  But we&apos;re just getting started. Our vision is to become
                  the world&apos;s most trusted travel companion, helping people
                  discover new places, connect with fellow travelers, and create
                  memories that last a lifetime.
                </p>
              </div>
              <div
                style={{
                  background: "var(--gradient-primary)",
                  borderRadius: "var(--radius-2xl)",
                  padding: "3rem",
                  textAlign: "center",
                  color: "white",
                }}
              >
                <div
                  style={{
                    fontSize: "4rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                  }}
                >
                  50K+
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    opacity: 0.9,
                    marginBottom: "2rem",
                  }}
                >
                  Happy Travelers
                </div>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                  }}
                >
                  1,200+
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    opacity: 0.9,
                    marginBottom: "2rem",
                  }}
                >
                  Destinations
                </div>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                  }}
                >
                  50+
                </div>
                <div style={{ fontSize: "1.25rem", opacity: 0.9 }}>
                  Countries Covered
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="section" style={{ background: "var(--card)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Our Values
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                These core principles guide everything we do at Travel Mate.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gap: "2rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
            >
              {values.map((value) => (
                <div
                  key={value.title}
                  className="card"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {value.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {value.title}
                  </h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Our Journey
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                Key milestones in the Travel Mate story.
              </p>
            </div>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  style={{
                    display: "flex",
                    gap: "2rem",
                    marginBottom: index === milestones.length - 1 ? 0 : "2rem",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      flexShrink: 0,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        background: "var(--gradient-primary)",
                        color: "white",
                        borderRadius: "var(--radius-full)",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                      }}
                    >
                      {milestone.year}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      paddingBottom: "2rem",
                      borderLeft:
                        index === milestones.length - 1
                          ? "none"
                          : "2px solid var(--border)",
                      paddingLeft: "2rem",
                      marginLeft: "-1rem",
                    }}
                  >
                    <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                      {milestone.title}
                    </h3>
                    <p style={{ color: "var(--muted)" }}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="section" style={{ background: "var(--card)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Meet Our Team
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                The passionate people behind Travel Mate.
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gap: "2rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
            >
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="card"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "var(--radius-full)",
                      background: member.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {member.avatar}
                  </div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {member.name}
                  </h3>
                  <p
                    style={{
                      color: "var(--primary)",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      marginBottom: "1rem",
                    }}
                  >
                    {member.role}
                  </p>
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {member.bio}
                  </p>
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
              Join Our Journey
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
              Become part of the Travel Mate community and start exploring the
              world with confidence.
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
                Get Started Free
              </Link>
              <Link
                href="/careers"
                className="btn btn-lg"
                style={{
                  background: "transparent",
                  border: "2px solid white",
                  color: "white",
                }}
              >
                Join Our Team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
