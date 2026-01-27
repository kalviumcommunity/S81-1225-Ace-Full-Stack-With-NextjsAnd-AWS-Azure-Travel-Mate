"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Navigation links for authenticated users
const authNavLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/places", label: "Destinations", icon: "📍" },
  { href: "/trips", label: "My Trips", icon: "✈️" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

// Navigation links for guests (not logged in)
const guestNavLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Verify token with API
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser({
          name: data.data.user.name,
          email: data.data.user.email,
          avatar: data.data.user.name?.charAt(0).toUpperCase(),
        });
      } else {
        // Token invalid or expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const navLinks = isAuthenticated ? authNavLinks : guestNavLinks;

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

        {/* Auth Section - Desktop */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="desktop-nav"
        >
          {isLoading ? (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--border)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ) : isAuthenticated && user ? (
            /* Profile Menu for Authenticated Users */
            <div ref={profileMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="profile-btn"
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {user.avatar}
                </div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: profileMenuOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: 0,
                    width: "220px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-lg)",
                    padding: "0.5rem",
                    zIndex: 1000,
                  }}
                >
                  {/* User Info */}
                  <div
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "var(--foreground)",
                      }}
                    >
                      {user.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      fontSize: "0.875rem",
                      transition: "background 0.2s ease",
                    }}
                    className="dropdown-item"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  <Link
                    href="/trips"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      fontSize: "0.875rem",
                      transition: "background 0.2s ease",
                    }}
                    className="dropdown-item"
                  >
                    <span>✈️</span> My Trips
                  </Link>
                  <Link
                    href="/places"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      fontSize: "0.875rem",
                      transition: "background 0.2s ease",
                    }}
                    className="dropdown-item"
                  >
                    <span>📍</span> Destinations
                  </Link>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid var(--border)",
                      margin: "0.5rem 0",
                    }}
                  />

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      borderRadius: "var(--radius)",
                      border: "none",
                      background: "none",
                      color: "var(--error)",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      transition: "background 0.2s ease",
                    }}
                    className="dropdown-item logout-btn"
                  >
                    <span>🚪</span> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login/Signup for Guests */
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
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
            zIndex: 999,
          }}
        >
          {/* User Info for Mobile (if authenticated) */}
          {isAuthenticated && user && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: "var(--background)",
                  borderRadius: "var(--radius)",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {user.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {user.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border)",
                  margin: "0.25rem 0",
                }}
              />
            </>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem",
              }}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}

          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border)",
              margin: "0.5rem 0",
            }}
          />

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
              style={{
                color: "var(--error)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              <span>🚪</span> Log Out
            </button>
          ) : (
            <>
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
            </>
          )}
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
        .profile-btn:hover {
          background: var(--background);
        }
        .dropdown-item:hover {
          background: var(--background);
        }
        .logout-btn:hover {
          background: rgb(239 68 68 / 0.1);
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </nav>
  );
}
