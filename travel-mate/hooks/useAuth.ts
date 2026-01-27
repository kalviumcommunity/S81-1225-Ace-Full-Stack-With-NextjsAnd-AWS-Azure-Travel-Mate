"use client";

import { useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth Hook
 *
 * A custom hook that wraps AuthContext and provides convenient
 * authentication utilities with additional derived state.
 *
 * @features
 * - Access to user data and authentication state
 * - Login and logout methods
 * - Derived isAuthenticated boolean
 * - Role checking utilities
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (isAuthenticated) {
 *   console.log(`Welcome, ${user.username}!`);
 * }
 */

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, updateUser } =
    useAuthContext();

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role: "USER" | "ADMIN" | "MODERATOR"): boolean => {
      return user?.role === role;
    },
    [user?.role]
  );

  /**
   * Check if user is admin
   */
  const isAdmin = user?.role === "ADMIN";

  /**
   * Check if user is moderator or admin
   */
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  /**
   * Get user display name
   */
  const displayName = user?.username || "Guest";

  /**
   * Get user initials for avatar
   */
  const userInitials = user?.username
    ? user.username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return {
    // Core auth state
    user,
    isAuthenticated,
    isLoading,

    // Auth methods
    login,
    logout,
    updateUser,

    // Role utilities
    hasRole,
    isAdmin,
    isModerator,

    // Display utilities
    displayName,
    userInitials,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
