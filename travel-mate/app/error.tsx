"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      <span style={{ fontSize: "5rem", marginBottom: "1rem" }}>😕</span>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--foreground)",
        }}
      >
        Oops! Something went wrong
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "1.125rem",
          marginBottom: "2rem",
          maxWidth: "500px",
        }}
      >
        We encountered an unexpected error. Don&apos;t worry, our team has been
        notified.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre
          style={{
            background: "var(--card)",
            padding: "1rem",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            marginBottom: "2rem",
            maxWidth: "600px",
            overflow: "auto",
            fontSize: "0.875rem",
            textAlign: "left",
            color: "var(--error)",
          }}
        >
          {error.message}
        </pre>
      )}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button onClick={() => reset()} className="btn btn-primary btn-lg">
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary btn-lg">
          Go Home
        </Link>
      </div>
    </div>
  );
}
