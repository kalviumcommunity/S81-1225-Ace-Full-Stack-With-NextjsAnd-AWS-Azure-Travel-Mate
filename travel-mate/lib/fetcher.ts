/**
 * Centralized fetcher for SWR
 * Handles consistent error handling and response parsing
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);

  // Handle non-OK responses
  if (!res.ok) {
    const error = new Error("Failed to fetch data") as Error & {
      status?: number;
    };
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Post fetcher for creating data
 */
export const postFetcher = async (url: string, data: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error("Failed to post data") as Error & {
      status?: number;
    };
    error.status = res.status;
    throw error;
  }

  return res.json();
};

/**
 * Put fetcher for updating data
 */
export const putFetcher = async (url: string, data: unknown) => {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error("Failed to put data") as Error & {
      status?: number;
    };
    error.status = res.status;
    throw error;
  }

  return res.json();
};
