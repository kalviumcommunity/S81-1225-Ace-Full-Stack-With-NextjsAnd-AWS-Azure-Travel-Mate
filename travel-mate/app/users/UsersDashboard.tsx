"use client";

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

/**
 * UsersDashboard - Advanced SWR cache inspection and revalidation demo
 *
 * Features:
 * - Cache hit/miss monitoring
 * - Manual cache clearing
 * - Revalidation strategies (onFocus, interval, manual)
 * - Error retry configuration
 */

export default function UsersDashboard() {
  const { cache, mutate } = useSWRConfig();
  const [cacheInfo, setCacheInfo] = useState<Map<string, unknown>>(new Map());
  const [refreshInterval, setRefreshInterval] = useState(0);

  const cacheKey = "/api/users?page=1&limit=5";

  // SWR hook with advanced revalidation options
  const {
    data,
    error,
    isLoading,
    mutate: localMutate,
  } = useSWR(cacheKey, fetcher, {
    // Revalidation strategies
    revalidateOnFocus: true, // Refetch when window regains focus
    revalidateOnReconnect: true, // Refetch when reconnected to network
    revalidateIfStale: true, // Refetch if data is considered stale
    dedupingInterval: 60000, // Don't make duplicate requests within 1 minute
    focusThrottleInterval: 300000, // Throttle focus revalidation to every 5 minutes

    // Poll for new data at specified interval (in ms)
    refreshInterval: refreshInterval,

    // Custom error retry logic
    onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
      // Don't retry on 404
      if (error.status === 404) return;

      // Max 3 retries
      if (retryCount >= 3) return;

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, retryCount) * 1000;
      setTimeout(() => revalidate({ retryCount }), delayMs);
    },

    // Called when an error is caught
    onError: (err) => {
      console.error("SWR Error:", err);
    },

    // Called when data is successfully fetched
    onSuccess: (data) => {
      console.log("SWR Success:", data);
    },
  });

  // Monitor cache changes
  useEffect(() => {
    const updateCacheInfo = () => {
      const cacheKeys = Array.from(cache.keys());
      console.log("Cache keys:", cacheKeys);
      // Store keys in state for display
      setCacheInfo(new Map(cacheKeys.map((key) => [String(key), true])));
    };

    updateCacheInfo();
    const interval = setInterval(updateCacheInfo, 1000);
    return () => clearInterval(interval);
  }, [cache]);

  const handleManualRevalidate = () => {
    localMutate();
  };

  const handleClearCache = () => {
    mutate((key) => typeof key === "string" && key.startsWith("/api/users"));
  };

  const handleSetRefreshInterval = (ms: number) => {
    setRefreshInterval(ms);
  };

  const cacheKeys = Array.from(cache.keys()).filter(
    (key) => typeof key === "string" && key.startsWith("/api/users")
  );

  const users = data?.data || [];

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          SWR Cache Inspection & Revalidation
        </h1>
        <p className="text-gray-600 mb-6">
          Advanced cache monitoring and revalidation strategies
        </p>

        {/* Cache Status Monitor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Cache Keys */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📦 Cache Keys
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {cacheKeys.length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Active cache entries</p>
          </div>

          {/* Total Cache Size */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              💾 Cache Size
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {(JSON.stringify(cacheInfo).length / 1024).toFixed(2)} KB
            </p>
            <p className="text-xs text-gray-500 mt-2">Approximate cache size</p>
          </div>

          {/* Data Status */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📊 Data Status
            </p>
            <p
              className={`text-2xl font-bold ${
                isLoading
                  ? "text-yellow-600"
                  : error
                    ? "text-red-600"
                    : "text-green-600"
              }`}
            >
              {isLoading ? "Loading" : error ? "Error" : "Ready"}
            </p>
            <p className="text-xs text-gray-500 mt-2">Current state</p>
          </div>
        </div>

        {/* Revalidation Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            🔄 Revalidation Strategies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manual Revalidation */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Manual Revalidation
              </p>
              <button
                onClick={handleManualRevalidate}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isLoading ? "Revalidating..." : "Revalidate Now"}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Manually trigger a cache refresh
              </p>
            </div>

            {/* Polling Interval */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Polling Configuration
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSetRefreshInterval(0)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                    refreshInterval === 0
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Off
                </button>
                <button
                  onClick={() => handleSetRefreshInterval(5000)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                    refreshInterval === 5000
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  5s
                </button>
                <button
                  onClick={() => handleSetRefreshInterval(10000)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                    refreshInterval === 10000
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  10s
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current:{" "}
                {refreshInterval === 0 ? "Off" : `${refreshInterval}ms`}
              </p>
            </div>
          </div>

          {/* Clear Cache */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Clear All Cache
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Remove all /api/users entries from cache
            </p>
          </div>
        </div>

        {/* Cache Keys Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            🔑 Active Cache Keys
          </h2>
          {cacheKeys.length === 0 ? (
            <p className="text-gray-500 text-sm">No cache entries yet</p>
          ) : (
            <div className="space-y-2">
              {cacheKeys.map((key, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono"
                >
                  <p className="break-all text-gray-700">{String(key)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-900">
            👥 Fetched Users
          </h2>

          {isLoading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-600">Error: {error.message}</p>}

          {users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .slice(0, 5)
                    .map(
                      (user: {
                        id: string;
                        name: string;
                        email: string;
                        role: string;
                      }) => (
                        <tr key={user.id} className="border-b border-gray-200">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-indigo-900">
            📚 Revalidation Strategies Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div>
              <p className="font-semibold mb-2">✅ revalidateOnFocus</p>
              <p>
                Automatically refetch data when the browser tab regains focus
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ revalidateOnReconnect</p>
              <p>
                Automatically refetch data when the network connection is
                restored
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ refreshInterval</p>
              <p>Poll the API at specified intervals (e.g., every 5 seconds)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">✅ onErrorRetry</p>
              <p>
                Automatically retry failed requests with exponential backoff
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
