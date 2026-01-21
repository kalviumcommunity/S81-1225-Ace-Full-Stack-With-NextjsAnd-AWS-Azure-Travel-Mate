"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/places", label: "Destinations" },
  { href: "/trips", label: "My Trips" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "70px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "1.75rem" }}>🌍</span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            Travel Mate
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons - Desktop */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="desktop-nav"
        >
          <Link href="/login" className="btn btn-ghost btn-sm">
            Log In
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "0.5rem",
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: "absolute",
            top: "70px",
            left: 0,
            right: 0,
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: "block" }}
            >
              {link.label}
            </Link>
          ))}
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border)",
              margin: "0.5rem 0",
            }}
          />
          <Link
            href="/login"
            className="btn btn-ghost"
            onClick={() => setMobileMenuOpen(false)}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="btn btn-primary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
