import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 *
 * This configuration extends the default Tailwind theme with:
 * - Custom breakpoints for responsive design
 * - Brand color palette with light/dark variants
 * - Dark mode support via class strategy
 *
 * @see https://tailwindcss.com/docs/configuration
 */

const config: Config = {
  // Enable dark mode via class strategy (toggleable via JavaScript)
  darkMode: "class",

  // Content paths for purging unused styles
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ========================================
      // CUSTOM BREAKPOINTS
      // ========================================
      // Responsive design breakpoints
      // Usage: sm:, md:, lg:, xl:, 2xl:
      screens: {
        sm: "640px", // Mobile landscape / small tablets
        md: "768px", // Tablets
        lg: "1024px", // Laptops / small desktops
        xl: "1280px", // Desktops
        "2xl": "1536px", // Large desktops
      },

      // ========================================
      // BRAND COLORS
      // ========================================
      // Custom color palette for consistent theming
      colors: {
        // Primary brand color (sky blue)
        brand: {
          light: "#38bdf8", // Sky 400 - Hover states, accents
          DEFAULT: "#0ea5e9", // Sky 500 - Primary actions
          dark: "#0284c7", // Sky 600 - Active states
        },

        // Secondary color (violet)
        secondary: {
          light: "#a78bfa", // Violet 400
          DEFAULT: "#8b5cf6", // Violet 500
          dark: "#7c3aed", // Violet 600
        },

        // Accent color (amber)
        accent: {
          light: "#fbbf24", // Amber 400
          DEFAULT: "#f59e0b", // Amber 500
          dark: "#d97706", // Amber 600
        },

        // Semantic colors
        success: {
          light: "#34d399", // Emerald 400
          DEFAULT: "#10b981", // Emerald 500
          dark: "#059669", // Emerald 600
        },
        warning: {
          light: "#fbbf24", // Amber 400
          DEFAULT: "#f59e0b", // Amber 500
          dark: "#d97706", // Amber 600
        },
        error: {
          light: "#f87171", // Red 400
          DEFAULT: "#ef4444", // Red 500
          dark: "#dc2626", // Red 600
        },
        info: {
          light: "#60a5fa", // Blue 400
          DEFAULT: "#3b82f6", // Blue 500
          dark: "#2563eb", // Blue 600
        },

        // Surface colors for light/dark themes
        surface: {
          light: "#ffffff",
          DEFAULT: "#f8fafc",
          dark: "#0f172a",
        },
      },

      // ========================================
      // TYPOGRAPHY
      // ========================================
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Consolas", "monospace"],
      },

      // ========================================
      // SPACING & SIZING
      // ========================================
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // ========================================
      // BORDER RADIUS
      // ========================================
      borderRadius: {
        "4xl": "2rem",
      },

      // ========================================
      // BOX SHADOW
      // ========================================
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px rgba(14, 165, 233, 0.3)",
        "glow-lg": "0 0 40px rgba(14, 165, 233, 0.4)",
      },

      // ========================================
      // ANIMATIONS
      // ========================================
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },

  plugins: [],
};

export default config;
