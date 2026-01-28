"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import AddUser from "./AddUser";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, _setLimit] = useState(10);
  const [search, setSearch] = useState("");

  // Build query string with pagination and filters
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
  }).toString();

  const { data, error, isLoading, mutate } = useSWR(
    `/api/users?${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute deduping
      focusThrottleInterval: 300000, // 5 minute focus throttling
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404
        if (error.status === 404) return;
        // Max 3 retries
        if (retryCount >= 3) return;
        // Retry after 2 seconds
        setTimeout(() => revalidate({ retryCount }), 2000);
      },
    }
  );

  // Handle loading state
  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">User Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <svg
              className="w-8 h-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="ml-4 text-gray-600">Loading users...</p>
        </div>
      </main>
    );
  }

  // Handle error state
  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">User Management</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 font-semibold">❌ Failed to load users</p>
          <p className="text-red-500 text-sm mt-2">
            {error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const users: User[] = data?.data || [];
  const pagination = data?.pagination || {};
  const meta = data?.meta || {};

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          User Management
        </h1>
        <p className="text-gray-600 mb-6">
          Manage and view all users in the system
        </p>

        {/* Cache Status */}
        {meta._cache && (
          <div
            className={`mb-6 p-4 rounded-md border ${
              meta._cache.hit
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <p className="text-sm font-semibold">
              {meta._cache.hit ? "✅ Cache Hit" : "⚠️ Cache Miss"}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Key:{" "}
              <code className="bg-white px-1 py-0.5">{meta._cache.key}</code>
            </p>
            <p className="text-xs text-gray-600">
              Response time: {meta._cache.duration} | Total:{" "}
              {meta._cache.totalDuration}
            </p>
          </div>
        )}

        {/* Add User Component */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <AddUser onUserAdded={() => mutate()} />
        </div>

        {/* Search Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-200 mr-3 flex items-center justify-center text-xs font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "MODERATOR"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} (Total:{" "}
              {pagination.total} users)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-700"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Cache Hit/Miss Demo Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            💡 SWR Cache Hit/Miss Demo
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • First load: <strong>Cache Miss</strong> (fetches from server)
            </li>
            <li>
              • Subsequent loads: <strong>Cache Hit</strong> (returns cached
              data instantly)
            </li>
            <li>
              • Background revalidation: SWR silently refetches and updates
              cache
            </li>
            <li>• Changing filters/page: New API call + new cache key</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
