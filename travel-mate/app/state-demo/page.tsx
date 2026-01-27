"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Button, Card } from "@/components";

/**
 * State Management Demo Page
 *
 * Demonstrates the usage of React Context API and custom hooks
 * for global state management in a Next.js application.
 */

export default function StateManagementDemo() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    displayName,
    userInitials,
    isAdmin,
  } = useAuth();

  const {
    theme,
    isDarkMode,
    toggleTheme,
    themeIcon,
    sidebarOpen,
    toggleSidebar,
    showSuccess,
    showError,
    showInfo,
    toasts,
    removeToast,
  } = useUI();

  return (
    <main
      className={`min-h-screen p-8 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            State Management with Context & Hooks
          </h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Demonstrating React Context API and custom hooks for global state
            management.
          </p>
        </div>

        {/* Toast Notifications */}
        {toasts.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`
                  px-4 py-3 rounded-lg shadow-lg flex items-center gap-3
                  ${toast.type === "success" ? "bg-green-500 text-white" : ""}
                  ${toast.type === "error" ? "bg-red-500 text-white" : ""}
                  ${toast.type === "warning" ? "bg-yellow-500 text-black" : ""}
                  ${toast.type === "info" ? "bg-blue-500 text-white" : ""}
                `}
              >
                <span>{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-2 hover:opacity-70"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Authentication Section */}
          <Card
            title="🔐 Authentication"
            subtitle="Managed by AuthContext"
            variant={isDarkMode ? "outlined" : "default"}
            className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}
          >
            <div className="space-y-4">
              {/* Status */}
              <div
                className={`p-3 rounded-lg ${
                  isAuthenticated
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <p className="font-medium">
                  Status: {isAuthenticated ? "Logged In ✓" : "Not Logged In"}
                </p>
              </div>

              {/* User Info */}
              {isAuthenticated && user && (
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {userInitials}
                    </div>
                    <div>
                      <p className="font-semibold">{displayName}</p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="ml-1 font-mono text-xs">
                        {user.id.slice(0, 12)}...
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Role:</span>
                      <span
                        className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          isAdmin
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Auth Actions */}
              <div className="flex gap-2">
                {isAuthenticated ? (
                  <Button
                    label="Logout"
                    variant="danger"
                    onClick={() => {
                      logout();
                      showInfo("You have been logged out");
                    }}
                    fullWidth
                  />
                ) : (
                  <>
                    <Button
                      label={isLoading ? "Logging in..." : "Login as User"}
                      variant="primary"
                      onClick={() => {
                        login("TravelUser");
                        showSuccess("Welcome back, TravelUser!");
                      }}
                      loading={isLoading}
                      disabled={isLoading}
                    />
                    <Button
                      label="Login as Admin"
                      variant="secondary"
                      onClick={() => {
                        login("AdminUser", "admin@travelmate.com");
                        showSuccess("Welcome, Admin!");
                      }}
                      disabled={isLoading}
                    />
                  </>
                )}
              </div>

              {/* Console Log Hint */}
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                💡 Open browser console to see state transition logs
              </p>
            </div>
          </Card>

          {/* UI Controls Section */}
          <Card
            title="🎨 UI Controls"
            subtitle="Managed by UIContext"
            variant={isDarkMode ? "outlined" : "default"}
            className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}
          >
            <div className="space-y-4">
              {/* Theme Control */}
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Theme</p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Current: {theme} {themeIcon}
                    </p>
                  </div>
                  <Button
                    label={`Switch to ${isDarkMode ? "Light" : "Dark"}`}
                    variant="outline"
                    onClick={() => {
                      toggleTheme();
                      showInfo(
                        `Theme changed to ${isDarkMode ? "light" : "dark"} mode`
                      );
                    }}
                    icon={themeIcon}
                  />
                </div>
              </div>

              {/* Sidebar Control */}
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">Sidebar</p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Status: {sidebarOpen ? "Open 📂" : "Closed 📁"}
                    </p>
                  </div>
                  <Button
                    label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                    variant="secondary"
                    onClick={() => {
                      toggleSidebar();
                      showInfo(`Sidebar ${sidebarOpen ? "closed" : "opened"}`);
                    }}
                  />
                </div>
              </div>

              {/* Toast Demos */}
              <div>
                <p className="font-semibold mb-2">Toast Notifications</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => showSuccess("Success! Operation completed.")}
                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ✓ Success
                  </button>
                  <button
                    onClick={() => showError("Error! Something went wrong.")}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ✕ Error
                  </button>
                  <button
                    onClick={() => showInfo("Info: Here's some information.")}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ℹ Info
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* State Summary */}
          <Card
            title="📊 Current State"
            subtitle="Live state values"
            variant={isDarkMode ? "outlined" : "default"}
            className={`md:col-span-2 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : ""
            }`}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Auth State */}
              <div>
                <h4 className="font-semibold mb-2">AuthContext</h4>
                <pre
                  className={`p-3 rounded text-xs overflow-x-auto ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-100"
                  }`}
                >
                  {JSON.stringify(
                    {
                      isAuthenticated,
                      isLoading,
                      user: user
                        ? {
                            id: user.id.slice(0, 12) + "...",
                            username: user.username,
                            email: user.email,
                            role: user.role,
                          }
                        : null,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* UI State */}
              <div>
                <h4 className="font-semibold mb-2">UIContext</h4>
                <pre
                  className={`p-3 rounded text-xs overflow-x-auto ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-100"
                  }`}
                >
                  {JSON.stringify(
                    {
                      theme,
                      isDarkMode,
                      sidebarOpen,
                      toastCount: toasts.length,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </Card>

          {/* Expected Console Logs */}
          <Card
            title="📋 Expected Console Logs"
            subtitle="State transition logging"
            variant={isDarkMode ? "outlined" : "default"}
            className={`md:col-span-2 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : ""
            }`}
          >
            <div
              className={`font-mono text-sm p-4 rounded ${
                isDarkMode ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <p className="text-green-500">✅ User logged in: TravelUser</p>
              <p className="text-green-500"> User ID: user-1706352000000</p>
              <p className="text-green-500">Email: traveluser@example.com</p>
              <p className="text-purple-500">🎨 Theme toggled to: dark</p>
              <p className="text-blue-500">📂 Sidebar opened</p>
              <p className="text-yellow-500">
                🔔 Toast added [success]: Welcome back!
              </p>
              <p className="text-red-500">🚪 User logged out: TravelUser</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
