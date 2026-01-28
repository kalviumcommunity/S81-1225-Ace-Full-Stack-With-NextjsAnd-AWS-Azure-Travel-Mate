"use client";

import Link from "next/link";
import { useUIContext } from "@/context/UIContext";
import { ThemeToggleSwitch } from "@/components/ui/ThemeToggle";

/**
 * Responsive Demo Page
 *
 * Demonstrates TailwindCSS responsive utilities and theme switching.
 * Includes breakpoint indicators and various responsive layouts.
 */

const breakpoints = [
  {
    name: "sm",
    width: "640px",
    description: "Mobile landscape / small tablets",
  },
  { name: "md", width: "768px", description: "Tablets" },
  { name: "lg", width: "1024px", description: "Laptops / small desktops" },
  { name: "xl", width: "1280px", description: "Desktops" },
  { name: "2xl", width: "1536px", description: "Large desktops" },
];

const features = [
  {
    icon: "🗺️",
    title: "Offline Maps",
    description: "Navigate without internet connection",
  },
  {
    icon: "✨",
    title: "Smart Recommendations",
    description: "Personalized travel suggestions",
  },
  {
    icon: "📅",
    title: "Trip Planning",
    description: "Organize your entire journey",
  },
  {
    icon: "⭐",
    title: "Reviews",
    description: "Authentic traveler reviews",
  },
];

export default function ResponsiveDemoPage() {
  const { theme } = useUIContext();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Hero Section - Responsive */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--primary-dark)] text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          {/* Responsive Grid - Text + Theme Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Responsive Design
                <span className="block text-yellow-300">& Theme Switching</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                This page demonstrates TailwindCSS responsive utilities and the
                light/dark theme toggle functionality.
              </p>

              {/* Theme Toggle Section */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <span className="text-sm font-medium">Toggle Theme:</span>
                  <ThemeToggleSwitch />
                </div>
                <span className="text-sm opacity-75">
                  Current: <strong className="uppercase">{theme}</strong> mode
                </span>
              </div>
            </div>

            {/* Right Content - Breakpoint Indicator */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Current Breakpoint
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {/* Breakpoint indicators - Only one visible at a time */}
                  <span className="sm:hidden px-4 py-2 bg-red-500 text-white rounded-lg font-mono text-sm">
                    xs (&lt;640px)
                  </span>
                  <span className="hidden sm:inline-block md:hidden px-4 py-2 bg-orange-500 text-white rounded-lg font-mono text-sm">
                    sm (≥640px)
                  </span>
                  <span className="hidden md:inline-block lg:hidden px-4 py-2 bg-yellow-500 text-black rounded-lg font-mono text-sm">
                    md (≥768px)
                  </span>
                  <span className="hidden lg:inline-block xl:hidden px-4 py-2 bg-green-500 text-white rounded-lg font-mono text-sm">
                    lg (≥1024px)
                  </span>
                  <span className="hidden xl:inline-block 2xl:hidden px-4 py-2 bg-blue-500 text-white rounded-lg font-mono text-sm">
                    xl (≥1280px)
                  </span>
                  <span className="hidden 2xl:inline-block px-4 py-2 bg-purple-500 text-white rounded-lg font-mono text-sm">
                    2xl (≥1536px)
                  </span>
                </div>
                <p className="mt-4 text-sm text-center opacity-75">
                  Resize browser to see changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breakpoints Reference Table */}
      <section className="py-12 sm:py-16 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Breakpoints Reference
          </h2>

          {/* Mobile: Card layout, Desktop: Table */}
          <div className="lg:hidden space-y-4">
            {breakpoints.map((bp) => (
              <div
                key={bp.name}
                className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-lg font-bold text-[var(--primary)]">
                    {bp.name}:
                  </span>
                  <span className="font-mono text-sm bg-[var(--card-hover)] px-2 py-1 rounded">
                    {bp.width}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">{bp.description}</p>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--border)]">
                  <th className="px-6 py-4 text-left font-semibold">
                    Breakpoint
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Min Width
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    CSS Class Prefix
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakpoints.map((bp, index) => (
                  <tr
                    key={bp.name}
                    className={`border-b border-[var(--border)] ${
                      index % 2 === 0 ? "bg-[var(--background)]" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[var(--primary)]">
                        {bp.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{bp.width}</td>
                    <td className="px-6 py-4">
                      <code className="bg-[var(--card-hover)] px-2 py-1 rounded text-sm">
                        {bp.name}:
                      </code>
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {bp.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Responsive Card Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Responsive Card Grid
          </h2>
          <p className="text-center text-[var(--muted)] mb-8 max-w-2xl mx-auto">
            This grid adapts from 1 column on mobile, to 2 on tablets, and 4 on
            desktop. Cards also adjust their padding and text sizes.
          </p>

          {/* Responsive grid: 1 col → 2 cols → 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="
                  bg-[var(--card)] rounded-xl p-4 sm:p-6
                  border border-[var(--border)]
                  hover:shadow-lg hover:border-[var(--primary)]
                  transition-all duration-300
                  group
                "
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Color Palette Display */}
      <section className="py-12 sm:py-16 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Theme Color Palette
          </h2>
          <p className="text-center text-[var(--muted)] mb-8">
            Colors adapt based on the current theme ({theme} mode)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: "Primary",
                var: "--primary",
                class: "bg-[var(--primary)]",
              },
              {
                name: "Secondary",
                var: "--secondary",
                class: "bg-[var(--secondary)]",
              },
              { name: "Accent", var: "--accent", class: "bg-[var(--accent)]" },
              {
                name: "Success",
                var: "--success",
                class: "bg-[var(--success)]",
              },
              {
                name: "Warning",
                var: "--warning",
                class: "bg-[var(--warning)]",
              },
              { name: "Error", var: "--error", class: "bg-[var(--error)]" },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div
                  className={`${color.class} h-16 sm:h-20 rounded-lg mb-2 shadow-md`}
                />
                <p className="font-medium text-sm">{color.name}</p>
                <p className="text-xs text-[var(--muted)] font-mono">
                  {color.var}
                </p>
              </div>
            ))}
          </div>

          {/* Surface Colors */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                name: "Background",
                var: "--background",
                class: "bg-[var(--background)]",
              },
              { name: "Card", var: "--card", class: "bg-[var(--card)]" },
              {
                name: "Card Hover",
                var: "--card-hover",
                class: "bg-[var(--card-hover)]",
              },
              { name: "Border", var: "--border", class: "bg-[var(--border)]" },
            ].map((color) => (
              <div key={color.name} className="text-center">
                <div
                  className={`${color.class} h-12 rounded-lg mb-2 border border-[var(--border)]`}
                />
                <p className="font-medium text-sm">{color.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Notes */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Accessibility Considerations
          </h2>

          <div className="space-y-6">
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <span className="text-2xl">🎨</span> Color Contrast
              </h3>
              <p className="text-[var(--muted)]">
                All text colors maintain WCAG AA contrast ratios (4.5:1 for
                normal text, 3:1 for large text) in both light and dark modes.
                The primary blue (#0ea5e9) on white backgrounds achieves 3.2:1,
                suitable for large text and UI components.
              </p>
            </div>

            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <span className="text-2xl">⌨️</span> Keyboard Navigation
              </h3>
              <p className="text-[var(--muted)]">
                The theme toggle is fully keyboard accessible. Press Tab to
                focus and Enter/Space to activate. Clear focus rings are visible
                in both themes.
              </p>
            </div>

            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <span className="text-2xl">📱</span> Touch Targets
              </h3>
              <p className="text-[var(--muted)]">
                Interactive elements meet the recommended 44×44px minimum touch
                target size for mobile devices, ensuring easy tapping on
                touchscreens.
              </p>
            </div>

            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <span className="text-2xl">🔊</span> Screen Reader Support
              </h3>
              <p className="text-[var(--muted)]">
                The theme toggle includes descriptive aria-labels that announce
                the current state and action. Icons are marked with aria-hidden
                to prevent redundant announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
        >
          ← Back to Home
        </Link>
      </section>
    </div>
  );
}
