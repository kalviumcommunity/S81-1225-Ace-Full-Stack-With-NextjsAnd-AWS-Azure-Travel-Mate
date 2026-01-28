"use client";

import { useUIContext } from "@/context/UIContext";

/**
 * ThemeToggle Component
 *
 * A toggle button that switches between light and dark themes.
 * Uses smooth animations and provides clear visual feedback.
 *
 * @accessibility
 * - Uses semantic button element
 * - Includes aria-label describing current state
 * - Keyboard accessible (Enter/Space to toggle)
 * - Focus ring for visibility
 * - High contrast icons
 *
 * @example
 * <ThemeToggle />
 * <ThemeToggle size="sm" />
 * <ThemeToggle showLabel />
 */

interface ThemeToggleProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show text label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function ThemeToggle({
  size = "md",
  showLabel = false,
  className = "",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useUIContext();
  const isDark = theme === "dark";

  // Size configurations
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2
        ${sizeClasses[size]}
        rounded-full
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isDark
            ? "bg-slate-700 hover:bg-slate-600 text-yellow-400 focus:ring-yellow-400"
            : "bg-sky-100 hover:bg-sky-200 text-sky-600 focus:ring-sky-500"
        }
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun icon (light mode) */}
      <span
        className={`
          absolute transition-all duration-300 transform
          ${isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}
        `}
        aria-hidden="true"
      >
        ☀️
      </span>

      {/* Moon icon (dark mode) */}
      <span
        className={`
          transition-all duration-300 transform
          ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}
        `}
        aria-hidden="true"
      >
        🌙
      </span>

      {/* Optional label */}
      {showLabel && (
        <span className={`font-medium ${labelSizeClasses[size]}`}>
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}

/**
 * ThemeToggleSwitch Component
 *
 * An alternative switch-style theme toggle with smooth animation.
 */
export function ThemeToggleSwitch({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useUIContext();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      onClick={toggleTheme}
      aria-checked={isDark}
      aria-label={`Dark mode ${isDark ? "enabled" : "disabled"}`}
      className={`
        relative inline-flex items-center
        w-16 h-8 rounded-full
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isDark
            ? "bg-slate-700 focus:ring-slate-500"
            : "bg-sky-200 focus:ring-sky-400"
        }
        ${className}
      `}
    >
      {/* Switch track background icons */}
      <span className="absolute left-2 text-sm" aria-hidden="true">
        ☀️
      </span>
      <span className="absolute right-2 text-sm" aria-hidden="true">
        🌙
      </span>

      {/* Switch thumb */}
      <span
        className={`
          absolute w-6 h-6 rounded-full
          bg-white shadow-md
          transition-transform duration-300 ease-in-out
          ${isDark ? "translate-x-9" : "translate-x-1"}
        `}
        aria-hidden="true"
      />
    </button>
  );
}
