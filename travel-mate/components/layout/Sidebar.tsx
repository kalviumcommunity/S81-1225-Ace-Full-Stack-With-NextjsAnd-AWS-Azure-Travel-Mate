"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar Component
 *
 * A collapsible sidebar navigation component for secondary navigation.
 * Displays navigation links with icons and active state highlighting.
 *
 * @props
 * - collapsed?: boolean - Whether the sidebar is collapsed (icons only)
 * - onToggle?: () => void - Callback when collapse toggle is clicked
 *
 * @accessibility
 * - Uses semantic <aside> and <nav> elements
 * - aria-label for navigation region
 * - Keyboard navigable links
 * - Focus visible states
 */

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/users", label: "Users", icon: "👥", badge: 5 },
  { href: "/trips", label: "Trips", icon: "✈️" },
  { href: "/places", label: "Places", icon: "📍" },
  { href: "/bookings", label: "Bookings", icon: "📅", badge: 3 },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside
      role="complementary"
      aria-label="Sidebar navigation"
      className={`
        hidden md:flex flex-col
        bg-slate-50 border-r border-slate-200
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Navigation
          </h2>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${
                    isActive(link.href)
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }
                `}
                aria-current={isActive(link.href) ? "page" : undefined}
                title={collapsed ? link.label : undefined}
              >
                <span className="text-lg" aria-hidden="true">
                  {link.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {link.badge && (
                      <span
                        className={`
                          px-2 py-0.5 text-xs font-semibold rounded-full
                          ${
                            isActive(link.href)
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                        aria-label={`${link.badge} items`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200">
        {!collapsed && (
          <div className="text-xs text-slate-500 text-center">
            Travel Mate © 2026
          </div>
        )}
      </div>
    </aside>
  );
}
