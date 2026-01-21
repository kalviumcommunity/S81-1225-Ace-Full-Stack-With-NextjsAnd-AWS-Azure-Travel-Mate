import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        background: "var(--background)",
      }}
    >
      <span style={{ fontSize: "6rem", marginBottom: "1rem" }}>🗺️</span>
      <h1
        style={{
          fontSize: "8rem",
          fontWeight: 800,
          lineHeight: 1,
          background: "var(--gradient-primary)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "1rem",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--foreground)",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1.125rem",
          marginBottom: "2rem",
          maxWidth: "500px",
        }}
      >
        Looks like you&apos;ve ventured off the beaten path. The page
        you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link href="/" className="btn btn-primary btn-lg">
          Back to Home
        </Link>
        <Link href="/places" className="btn btn-secondary btn-lg">
          Explore Destinations
        </Link>
      </div>
    </div>
  );
}
