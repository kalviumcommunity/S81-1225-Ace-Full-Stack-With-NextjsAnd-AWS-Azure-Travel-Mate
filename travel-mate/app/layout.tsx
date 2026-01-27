import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Mate | Your Smart Travel Companion",
  description:
    "Discover amazing destinations, plan your trips, and explore the world with Travel Mate. Offline-friendly maps, curated recommendations, and seamless travel planning.",
  keywords: [
    "travel",
    "trip planning",
    "destinations",
    "offline maps",
    "travel companion",
    "public routes",
    "protected routes",
    "dynamic routing",
  ],
  authors: [{ name: "Travel Mate Team" }],
  openGraph: {
    title: "Travel Mate | Your Smart Travel Companion",
    description: "Discover amazing destinations and plan your perfect trip",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Global Navigation Bar */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            padding: "1rem 2rem",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderBottom: "1px solid #e2e8f0",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#1e293b",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🌍 Travel Mate
          </Link>

          <div style={{ flex: 1 }} />

          {/* Public Routes */}
          <Link
            href="/"
            style={{
              padding: "0.5rem 1rem",
              color: "#475569",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            🏠 Home
          </Link>

          <Link
            href="/login"
            style={{
              padding: "0.5rem 1rem",
              color: "#475569",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            🔑 Login
          </Link>

          {/* Protected Routes */}
          <Link
            href="/dashboard"
            style={{
              padding: "0.5rem 1rem",
              background: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            📊 Dashboard
          </Link>

          <Link
            href="/users"
            style={{
              padding: "0.5rem 1rem",
              background: "#8b5cf6",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            👥 Users
          </Link>

          <Link
            href="/users/1"
            style={{
              padding: "0.5rem 1rem",
              background: "#ec4899",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            👤 User 1
          </Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
