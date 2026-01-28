"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

/**
 * Header Component
 *
 * A reusable navigation header that displays the app logo and main navigation links.
 * Highlights the active route for better user orientation.
 * Includes theme toggle for light/dark mode switching.
 *
 * @accessibility
 * - Uses semantic <header> and <nav> elements
 * - Includes aria-label for navigation
 * - Links have clear focus states
 * - Color contrast meets WCAG AA standards
 * - Theme toggle is keyboard accessible
 *
 * @example
 * <Header />
 */

interface NavLink {
  href: string;
  label: string;
  icon: string;
  protected?: boolean;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/places", label: "Places", icon: "📍" },
  { href: "/login", label: "Login", icon: "🔑" },
  { href: "/dashboard", label: "Dashboard", icon: "📊", protected: true },
  { href: "/users", label: "Users", icon: "👥", protected: true },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] shadow-sm transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            aria-label="Travel Mate - Go to homepage"
          >
            <span className="text-2xl">🌍</span>
            <span className="hidden sm:inline">Travel Mate</span>
          </Link>

          {/* Navigation and Theme Toggle */}
          <div className="flex items-center gap-4">
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-1 sm:gap-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2
                        ${
                          isActive(link.href)
                            ? "bg-[var(--primary)] text-white shadow-md"
                            : link.protected
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                              : "text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                        }
                      `}
                      aria-current={isActive(link.href) ? "page" : undefined}
                    >
                      <span aria-hidden="true">{link.icon}</span>
                      <span className="hidden md:inline">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
