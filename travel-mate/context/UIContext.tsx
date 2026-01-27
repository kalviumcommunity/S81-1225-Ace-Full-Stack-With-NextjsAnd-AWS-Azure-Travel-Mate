"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";

/**
 * UI Context
 *
 * Provides global UI state management throughout the application.
 * Manages theme, sidebar visibility, and other UI preferences.
 *
 * @features
 * - Light/Dark theme toggle with persistence
 * - Sidebar open/close state
 * - Toast notifications queue
 * - Memoized context value for performance
 * - Console logging for state transitions
 *
 * @usage
 * Wrap your app with <UIProvider> and use useUIContext() or useUI() hook
 */

type Theme = "light" | "dark";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface UIContextType {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;

  // Loading overlay
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

// Helper to get initial theme from localStorage (safe for SSR)
function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  }
  return "light";
}

export function UIProvider({ children }: UIProviderProps) {
  // Theme state - initialize from localStorage if available
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isGlobalLoading, setGlobalLoading] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", newTheme);
      }

      // Log state transition
      console.log("🎨 Theme toggled to:", newTheme);

      return newTheme;
    });
  }, []);

  /**
   * Set specific theme
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }

    console.log("🎨 Theme set to:", newTheme);
  }, []);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      console.log(newState ? "📂 Sidebar opened" : "📁 Sidebar closed");
      return newState;
    });
  }, []);

  /**
   * Toggle sidebar collapsed state
   */
  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newState = !prev;
      console.log(newState ? "📌 Sidebar collapsed" : "📌 Sidebar expanded");
      return newState;
    });
  }, []);

  /**
   * Add a toast notification
   */
  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = `toast-${Date.now()}`;
      const toast: Toast = { id, message, type };

      setToasts((prev) => [...prev, toast]);
      console.log(`🔔 Toast added [${type}]:`, message);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  /**
   * Remove a specific toast
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<UIContextType>(
    () => ({
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
    }),
    [
      theme,
      toggleTheme,
      setTheme,
      sidebarOpen,
      sidebarCollapsed,
      toggleSidebar,
      toggleSidebarCollapsed,
      toasts,
      addToast,
      removeToast,
      isGlobalLoading,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

/**
 * Hook to access UIContext
 * Must be used within a UIProvider
 *
 * @throws Error if used outside of UIProvider
 */
export function useUIContext(): UIContextType {
  const context = useContext(UIContext);

  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider");
  }

  return context;
}

export type { Theme, Toast, UIContextType };
