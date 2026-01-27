"use client";

import { useCallback } from "react";
import { useUIContext } from "@/context/UIContext";

/**
 * useUI Hook
 *
 * A custom hook that wraps UIContext and provides convenient
 * UI state utilities with additional derived state.
 *
 * @features
 * - Theme management (light/dark)
 * - Sidebar visibility control
 * - Toast notifications
 * - Global loading state
 *
 * @example
 * const { theme, toggleTheme, isDarkMode } = useUI();
 *
 * <button onClick={toggleTheme}>
 *   {isDarkMode ? '☀️ Light' : '🌙 Dark'}
 * </button>
 */

export function useUI() {
  const {
    theme,
    toggleTheme,
    setTheme,
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    toggleSidebarCollapsed,
    setSidebarOpen,
    toasts,
    addToast,
    removeToast,
    isGlobalLoading,
    setGlobalLoading,
  } = useUIContext();

  /**
   * Check if dark mode is active
   */
  const isDarkMode = theme === "dark";

  /**
   * Check if light mode is active
   */
  const isLightMode = theme === "light";

  /**
   * Get theme icon
   */
  const themeIcon = isDarkMode ? "🌙" : "☀️";

  /**
   * Get sidebar icon
   */
  const sidebarIcon = sidebarOpen ? "📂" : "📁";

  /**
   * Show success toast
   */
  const showSuccess = useCallback(
    (message: string) => {
      addToast(message, "success");
    },
    [addToast]
  );

  /**
   * Show error toast
   */
  const showError = useCallback(
    (message: string) => {
      addToast(message, "error");
    },
    [addToast]
  );

  /**
   * Show warning toast
   */
  const showWarning = useCallback(
    (message: string) => {
      addToast(message, "warning");
    },
    [addToast]
  );

  /**
   * Show info toast
   */
  const showInfo = useCallback(
    (message: string) => {
      addToast(message, "info");
    },
    [addToast]
  );

  /**
   * Get CSS classes for current theme
   */
  const themeClasses = isDarkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900";

  /**
   * Get CSS variable-based theme styles
   */
  const getThemeStyle = useCallback(
    (lightValue: string, darkValue: string): string => {
      return isDarkMode ? darkValue : lightValue;
    },
    [isDarkMode]
  );

  return {
    // Theme state
    theme,
    isDarkMode,
    isLightMode,
    themeIcon,
    themeClasses,

    // Theme methods
    toggleTheme,
    setTheme,
    getThemeStyle,

    // Sidebar state
    sidebarOpen,
    sidebarCollapsed,
    sidebarIcon,

    // Sidebar methods
    toggleSidebar,
    toggleSidebarCollapsed,
    setSidebarOpen,

    // Toast state
    toasts,

    // Toast methods
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Loading state
    isGlobalLoading,
    setGlobalLoading,
  };
}

export type UseUIReturn = ReturnType<typeof useUI>;
