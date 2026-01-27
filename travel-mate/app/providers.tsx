"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

/**
 * Providers Component
 *
 * Wraps the application with all necessary context providers.
 * This is a client component that enables context usage in the app.
 *
 * Provider Order (innermost to outermost):
 * 1. UIProvider - UI state (theme, sidebar, toasts)
 * 2. AuthProvider - Authentication state
 *
 * @example
 * <Providers>
 *   <App />
 * </Providers>
 */

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <UIProvider>{children}</UIProvider>
    </AuthProvider>
  );
}
