"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";

type TabType = "demo1" | "demo2" | "demo3" | "cache";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Place {
  id: string;
  name: string;
}

/**
 * SWR Demo Page - Interactive learning experience
 *
 * This page demonstrates:
 * 1. Cache hits vs misses
 * 2. Revalidation on focus
 * 3. Manual cache clearing
 * 4. Multiple simultaneous requests
 * 5. Dynamic request keys
 */

export default function SWRDemoPage() {
  const { cache, mutate } = useSWRConfig();
  const [activeTab, setActiveTab] = useState<TabType>("demo1");

  // Demo 1: Basic fetching with cache monitoring
  const { data: users, isLoading: usersLoading } = useSWR(
    "/api/users?page=1&limit=5",
    fetcher,
    { revalidateOnFocus: true }
  );

  // Demo 2: Conditional fetching
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: selectedUser } = useSWR(
    selectedUserId ? `/api/users?id=${selectedUserId}` : null,
    fetcher
  );

  // Demo 3: Multiple requests
  const { data: places } = useSWR("/api/places?page=1&limit=5", fetcher);

  const { data: _trips } = useSWR("/api/trips?page=1&limit=5", fetcher);

  const cacheSize = Math.round(JSON.stringify(cache).length / 1024);
  const cacheKeys = Array.from(cache.keys())
    .filter((key) => typeof key === "string")
    .slice(0, 10);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 SWR Interactive Demo
          </h1>
          <p className="text-gray-600">
            Learn about cache hits/misses, revalidation, and optimistic updates
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href="/users"
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Users Page
            </Link>
          </div>
        </div>

        {/* Cache Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Cache Keys</p>
            <p className="text-2xl font-bold text-blue-600">
              {cacheKeys.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Cache Size</p>
            <p className="text-2xl font-bold text-purple-600">{cacheSize} KB</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Users Loaded</p>
            <p className="text-2xl font-bold text-green-600">
              {users?.data?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Cache Size (Bytes)</p>
            <p className="text-2xl font-bold text-orange-600">
              {cacheSize * 1024}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: "demo1", label: "📦 Cache Hits/Misses" },
              { id: "demo2", label: "🔀 Conditional Fetching" },
              { id: "demo3", label: "📊 Multiple Requests" },
              { id: "cache", label: "💾 Cache Inspector" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 px-6 py-4 text-center font-medium transition ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Demo 1: Cache Hits/Misses */}
            {activeTab === "demo1" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Cache Hits vs Misses
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>How it works:</strong>
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>First load: No cache → API call (Miss)</li>
                    <li>
                      Subsequent loads: Data in cache → Instant load (Hit)
                    </li>
                    <li>SWR revalidates in background silently</li>
                    <li>New data replaces cache automatically</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Current Cache State</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-mono text-green-900 break-all">
                        {cacheKeys.includes("/api/users?page=1&limit=5")
                          ? "✅ Cache HIT - Data in cache"
                          : "❌ Cache MISS - Not cached"}
                      </p>
                      <p className="text-xs text-green-700 mt-2">
                        Reload the page to see cache in action
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">User Data</h3>
                    {usersLoading ? (
                      <p className="text-gray-600">Loading...</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {users?.data?.map((user: User) => (
                          <div
                            key={user.id}
                            className="p-2 bg-gray-100 rounded text-sm"
                          >
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-600">
                              {user.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>📝 Try this:</strong> Open this page in a new tab,
                    notice the cache miss. Switch back to the first tab, then
                    back to this one — you will see a cache hit because data is
                    reused from the first tab&apos;s cache.
                  </p>
                </div>
              </div>
            )}

            {/* Demo 2: Conditional Fetching */}
            {activeTab === "demo2" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Conditional Fetching
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>Concept:</strong> Only fetch when conditions are met
                    (e.g., user ID is provided)
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Select a User ID:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {users?.data?.map((user: User) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          selectedUserId === user.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {user.name.split(" ")[0]}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                        selectedUserId === null
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {selectedUserId ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-semibold text-green-900 mb-3">
                      ✅ Fetching user data...
                    </p>
                    {selectedUser && (
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Name:</strong> {selectedUser.data?.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedUser.data?.email}
                        </p>
                        <p>
                          <strong>Role:</strong> {selectedUser.data?.role}
                        </p>
                        <p>
                          <strong>Created:</strong>{" "}
                          {new Date(
                            selectedUser.data?.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">
                      No user selected. Select a user above to start fetching
                      their data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Demo 3: Multiple Requests */}
            {activeTab === "demo3" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Multiple Simultaneous Requests
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Users</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {users?.data?.map((user: User) => (
                        <div
                          key={user.id}
                          className="p-2 bg-blue-50 border border-blue-200 rounded text-sm"
                        >
                          <p className="font-medium">{user.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Places</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {places?.data?.map((place: Place) => (
                        <div
                          key={place.id}
                          className="p-2 bg-green-50 border border-green-200 rounded text-sm"
                        >
                          <p className="font-medium">{place.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-900">
                    <strong>💡 Note:</strong> These are 3 independent SWR hooks
                    fetching data simultaneously. Each has its own cache key and
                    revalidation strategy. They don&apos;t block each other.
                  </p>
                </div>
              </div>
            )}

            {/* Cache Inspector */}
            {activeTab === "cache" && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Cache Inspector
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <button
                      onClick={() => mutate((key) => typeof key === "string")}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      Revalidate All
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={() =>
                        mutate(() => true, undefined, { revalidate: false })
                      }
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Clear All Cache
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Active Cache Keys</h3>
                  {cacheKeys.length === 0 ? (
                    <p className="text-gray-600 text-sm">No cached data</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cacheKeys.map((key, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-100 rounded-md text-xs font-mono border border-gray-300"
                        >
                          <p className="break-all text-gray-700">
                            {String(key)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-900 mb-2">
                    <strong>📊 Cache Statistics:</strong>
                  </p>
                  <ul className="text-sm text-indigo-800 space-y-1">
                    <li>• Keys in cache: {cacheKeys.length}</li>
                    <li>• Cache size: ~{cacheSize} KB</li>
                    <li>• All endpoints use /api/ prefix</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-indigo-900">
            🎓 What You&apos;ll Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div>
              <p className="font-semibold mb-2">✅ Cache Behavior</p>
              <p>
                Understand how SWR serves stale data immediately while updating
                in the background
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ Conditional Requests</p>
              <p>
                Learn how to pause fetching until conditions are met using null
                keys
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ Cache Strategy</p>
              <p>
                Discover how different cache keys allow parallel requests and
                targeted updates
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ Performance</p>
              <p>
                See how SWR reduces API calls through smart caching and
                deduplication
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
