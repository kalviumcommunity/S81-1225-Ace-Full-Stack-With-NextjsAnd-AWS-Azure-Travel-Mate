"use client";

import { useEffect, useState, useCallback } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseFetchOptions {
  immediate?: boolean;
  headers?: HeadersInit;
}

/**
 * Custom hook for data fetching with loading and error states
 *
 * @param url - The URL to fetch data from
 * @param options - Optional configuration
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useFetch<T>(url: string, options: UseFetchOptions = {}) {
  const { immediate = true, headers } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Handle API response format { success: true, data: ... }
      const data = result.data !== undefined ? result.data : result;

      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err : new Error("An error occurred"),
      });
    }
  }, [url, headers]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Hook for making API mutations (POST, PUT, DELETE)
 *
 * @param url - The URL to send the request to
 * @returns Object with mutate function, loading state, error, and data
 */
export function useMutation<T, B = unknown>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    body?: B
  ) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = result.data !== undefined ? result.data : result;
      setState({ data, loading: false, error: null });

      return { success: true, data };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setState({ data: null, loading: false, error });

      return { success: false, error };
    }
  };

  return {
    ...state,
    post: (body: B) => mutate("POST", body),
    put: (body: B) => mutate("PUT", body),
    patch: (body: B) => mutate("PATCH", body),
    delete: () => mutate("DELETE"),
  };
}
