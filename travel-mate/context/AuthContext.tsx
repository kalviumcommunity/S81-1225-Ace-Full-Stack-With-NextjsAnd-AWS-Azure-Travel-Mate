"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

/**
 * Authentication Context
 *
 * Provides global authentication state and methods throughout the application.
 * Manages user login/logout state and persists session information.
 *
 * @features
 * - User authentication state
 * - Login and logout methods
 * - Memoized context value for performance
 * - Console logging for state transitions
 *
 * @usage
 * Wrap your app with <AuthProvider> and use useAuthContext() or useAuth() hook
 */

interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, email?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Login function - sets user state and logs the action
   */
  const login = useCallback((username: string, email?: string) => {
    setIsLoading(true);

    // Simulate async login
    setTimeout(() => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email: email || `${username.toLowerCase()}@example.com`,
        role: "USER",
      };

      setUser(newUser);
      setIsLoading(false);

      // Log state transition
      console.log("✅ User logged in:", username);
      console.log("   User ID:", newUser.id);
      console.log("   Email:", newUser.email);
    }, 500);
  }, []);

  /**
   * Logout function - clears user state and logs the action
   */
  const logout = useCallback(() => {
    const previousUser = user?.username;
    setUser(null);

    // Log state transition
    console.log("🚪 User logged out:", previousUser || "Unknown");
  }, [user?.username]);

  /**
   * Update user information
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      console.log("📝 User updated:", updates);
      return updated;
    });
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access AuthContext
 * Must be used within an AuthProvider
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}

export type { User, AuthContextType };
