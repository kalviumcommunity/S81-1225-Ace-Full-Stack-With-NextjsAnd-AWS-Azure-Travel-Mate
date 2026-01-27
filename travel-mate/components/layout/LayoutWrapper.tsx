"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * LayoutWrapper Component
 *
 * A comprehensive layout wrapper that provides consistent structure across all pages.
 * Includes Header, optional Sidebar (for dashboard pages), and main content area.
 *
 * @props
 * - children: React.ReactNode - The page content to render
 * - showSidebar?: boolean - Force show/hide sidebar (auto-detected by default)
 *
 * @features
 * - Responsive design with collapsible sidebar
 * - Auto-detects dashboard routes to show sidebar
 * - Sticky header for easy navigation
 * - Accessible skip-to-content link
 *
 * @accessibility
 * - Skip to main content link for keyboard users
 * - Proper landmark regions (header, main, aside)
 * - Focus management for interactive elements
 */

interface LayoutWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

// Routes that should display the sidebar
const SIDEBAR_ROUTES = [
  "/dashboard",
  "/users",
  "/trips",
  "/bookings",
  "/reports",
  "/settings",
];

export default function LayoutWrapper({
  children,
  showSidebar,
}: LayoutWrapperProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Determine if sidebar should be shown based on current route
  const shouldShowSidebar =
    showSidebar !== undefined
      ? showSidebar
      : SIDEBAR_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Skip to main content - accessibility feature */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header />

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - only shown on dashboard routes */}
        {shouldShowSidebar && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Main Content */}
        <main
          id="main-content"
          role="main"
          className={`
            flex-1 overflow-auto
            ${shouldShowSidebar ? "bg-slate-50" : "bg-white"}
          `}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
