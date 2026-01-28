"use client";

import { useState } from "react";
import { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

interface AddUserProps {
  onUserAdded?: () => void;
}

export default function AddUser({ onUserAdded }: AddUserProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get the current cache key (first page, default limit)
  const cacheKey = `/api/users?page=1&limit=10`;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate inputs
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Fetch current cache data
      const cachedData = await fetcher(cacheKey);
      const currentUsers = cachedData?.data || [];

      // Step 2: Optimistic update — update cache immediately
      // Create a temporary user object while waiting for server response
      const tempUser = {
        id: `temp-${Date.now()}`,
        name,
        email,
        role: "USER",
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mutate with optimistic data (false = don't revalidate yet)
      mutate(
        cacheKey,
        {
          ...cachedData,
          data: [tempUser, ...currentUsers],
          pagination: {
            ...cachedData.pagination,
            total: (cachedData.pagination?.total || 0) + 1,
          },
        },
        false
      );

      // Step 3: Make actual API call
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: "USER",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const newUser = await response.json();
      console.log("User created:", newUser.data?.id || newUser.id);

      // Step 4: Revalidate and sync cache with actual response
      mutate(cacheKey);

      // Success feedback
      setSuccess(true);
      setName("");
      setEmail("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Call callback if provided
      onUserAdded?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      // Revert optimistic update on error
      mutate(cacheKey);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Add New User</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm">
            ✅ User created successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleAddUser} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="e.g., John Doe"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="e.g., john@example.com"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? "Adding User..." : "Add User"}
        </button>
      </form>

      {/* Optimistic UI Explanation */}
      <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
        <p className="text-sm font-semibold text-indigo-900 mb-2">
          ⚡ Optimistic UI Demo
        </p>
        <ul className="text-xs text-indigo-800 space-y-1">
          <li>
            • <strong>Step 1:</strong> Fill in the name and email fields
          </li>
          <li>
            • <strong>Step 2:</strong> Click &quot;Add User&quot; to submit the
            form
          </li>
          <li>
            • <strong>Step 3:</strong> New user appears immediately in the table
            (optimistic update)
          </li>
          <li>
            • <strong>Step 4:</strong> Server validates and persists the user
          </li>
          <li>
            • <strong>Step 5:</strong> Cache revalidates with actual data from
            server
          </li>
          <li>
            • If the request fails, the UI reverts to the correct cached state
          </li>
        </ul>
      </div>
    </div>
  );
}
