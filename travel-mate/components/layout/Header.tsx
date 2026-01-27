"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Header Component
 *
 * A reusable navigation header that displays the app logo and main navigation links.
 * Highlights the active route for better user orientation.
 *
 * @accessibility
 * - Uses semantic <header> and <nav> elements
 * - Includes aria-label for navigation
 * - Links have clear focus states
 * - Color contrast meets WCAG AA standards
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
      className="sticky top-0 z-50 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors"
            aria-label="Travel Mate - Go to homepage"
          >
            <span className="text-2xl">🌍</span>
            <span className="hidden sm:inline">Travel Mate</span>
          </Link>

          {/* Navigation */}
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 sm:gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`
                      flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${
                        isActive(link.href)
                          ? "bg-blue-600 text-white shadow-md"
                          : link.protected
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
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
        </div>
      </div>
    </header>
  );
}
