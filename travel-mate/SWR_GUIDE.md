# SWR (Stale-While-Revalidate) Implementation Guide

## 📖 Overview

This guide demonstrates how to implement SWR (Stale-While-Revalidate) for client-side data fetching in Next.js, with caching, revalidation, optimistic UI updates, and error handling.

### Key Concepts

**SWR** is a strategy for serving data that is currently available in cache while simultaneously updating it in the background. It combines:
- **Stale**: Return cached data immediately (if available)
- **While-Revalidate**: Fetch fresh data in the background
- **Cache**: Store the result for future requests

## 🚀 Quick Start

### 1. Installation

```bash
npm install swr --legacy-peer-deps
```

### 2. Centralized Fetcher (`lib/fetcher.ts`)

```typescript
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};
```

**Benefits:**
- Consistent error handling across the app
- Single place to configure headers, auth, etc.
- Easy to add logging, retry logic, or interceptors

### 3. Basic Usage in Components

```typescript
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function UsersPage() {
  const { data, error, isLoading } = useSWR("/api/users", fetcher);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load</p>;

  return (
    <div>
      {data.map(user => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}
```

## 🎯 Core Features

### Cache Hits vs Misses

**First Load (Cache Miss):**
1. No data in cache
2. SWR fetches from API
3. Data displayed once received
4. Data stored in cache

**Subsequent Loads (Cache Hit):**
1. Cached data available
2. SWR immediately returns cached data
3. Component renders instantly with stale data
4. SWR silently revalidates in background
5. Updated data replaces cache automatically

### Demonstrating Cache Behavior

```typescript
import { useSWRConfig } from "swr";

export default function CacheDemo() {
  const { cache } = useSWRConfig();
  
  console.log("Cache keys:", Array.from(cache.keys()));
  // First run: []
  // Second run: ["/api/users"]
}
```

## 💡 Advanced Features

### 1. Conditional Requests

```typescript
const { data } = useSWR(
  userId ? `/api/users/${userId}` : null,
  fetcher
);
// Stops fetching if userId is not set
```

### 2. Revalidation Strategies

```typescript
const { data } = useSWR("/api/users", fetcher, {
  // Refetch when window regains focus
  revalidateOnFocus: true,
  
  // Refetch when network reconnects
  revalidateOnReconnect: true,
  
  // Poll periodically (every 5 seconds)
  refreshInterval: 5000,
  
  // Wait 60 seconds before allowing duplicate requests
  dedupingInterval: 60000,
  
  // Custom retry logic
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (retryCount >= 3) return;
    setTimeout(() => revalidate({ retryCount }), 2000);
  },
});
```

### 3. Optimistic UI Updates

```typescript
import { mutate } from "swr";

async function addUser(name, email) {
  const oldData = await fetcher("/api/users");
  
  // Optimistic update (false = don't revalidate yet)
  const tempUser = { id: Date.now(), name, email };
  mutate("/api/users", [...oldData, tempUser], false);
  
  // Actual API call
  await fetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ name, email })
  });
  
  // Revalidate to sync with server
  mutate("/api/users");
}
```

**Benefits:**
- Instant UI feedback
- Feels responsive and fast
- Automatic rollback on error

### 4. Error Handling

```typescript
const { data, error } = useSWR("/api/users", fetcher, {
  onError: (err) => {
    console.error("Failed to fetch:", err);
    // Send to error tracking service
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry on 404
    if (error.status === 404) return;
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    setTimeout(() => revalidate({ retryCount }), delay);
  },
});
```

## 📊 Comparing SWR with Fetch API

| Feature | SWR | Fetch API |
|---------|-----|----------|
| Caching | ✅ Automatic | ❌ Manual |
| Revalidation | ✅ Built-in | ❌ Manual |
| Background updates | ✅ Automatic | ❌ Manual |
| Optimistic UI | ✅ Easy | ⚠️ Manual |
| Error retries | ✅ Configurable | ❌ Manual |
| Deduplication | ✅ Automatic | ❌ Manual |
| Focus revalidation | ✅ Automatic | ❌ Manual |

## 🎓 Files in This Implementation

### `/lib/fetcher.ts`
Centralized fetch utility with error handling and multiple HTTP methods.

### `/app/users/page.tsx`
Main users page featuring:
- SWR data fetching with pagination
- Cache status display (hit/miss)
- Search and filtering
- Error and loading states
- Integration with AddUser component

### `/app/users/AddUser.tsx`
Component demonstrating optimistic UI:
- Form to add new users
- Optimistic cache updates
- Automatic revalidation after POST
- Error rollback

### `/app/users/UsersDashboard.tsx`
Advanced cache inspection tool:
- Cache key monitoring
- Manual revalidation triggers
- Polling configuration
- Error retry strategies
- Cache statistics

## 🔍 Cache Key Strategy

Cache keys should be:
- **Unique** for different requests
- **Deterministic** (same inputs = same key)
- **URL-based** for easy identification

```typescript
// Good
useSWR("/api/users?page=1&limit=10", fetcher);

// Good - conditional
useSWR(userId ? `/api/user/${userId}` : null, fetcher);

// Avoid - non-deterministic
const [sort, setSort] = useState("name");
useSWR(["/api/users", { sort }], fetcher); // Use array for complex keys
```

## ⚙️ Configuration Best Practices

### Development
```typescript
{
  revalidateOnFocus: true,
  dedupingInterval: 5000,
  focusThrottleInterval: 30000,
  // More aggressive revalidation for testing
  refreshInterval: 10000,
}
```

### Production
```typescript
{
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  focusThrottleInterval: 300000,
  // Less aggressive to reduce API load
  refreshInterval: 0,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (retryCount >= 3) return;
    setTimeout(() => revalidate({ retryCount }), 2000);
  }
}
```

## 🚨 Common Pitfalls

### 1. Stale Data Without Revalidation
```typescript
// ❌ Bad - data never updates
const { data } = useSWR("/api/users", fetcher, {
  revalidateOnFocus: false,
  refreshInterval: 0,
});

// ✅ Good - enables background updates
const { data } = useSWR("/api/users", fetcher, {
  revalidateOnFocus: true,
  refreshInterval: 30000, // Optional polling
});
```

### 2. Not Handling Loading State
```typescript
// ❌ Bad - assumes data exists
{data.map(user => <p>{user.name}</p>)}

// ✅ Good - checks all states
if (isLoading) return <p>Loading...</p>;
if (error) return <p>Error</p>;
return <div>{data?.map(...)}</div>;
```

### 3. Improper Optimistic Updates
```typescript
// ❌ Bad - no rollback on error
mutate("/api/users", newData, false);
await fetch("/api/users", { method: "POST", body });

// ✅ Good - reverts on error
const oldData = data;
mutate("/api/users", newData, false);
try {
  await fetch("/api/users", { method: "POST", body });
  mutate("/api/users");
} catch {
  mutate("/api/users", oldData, false); // Rollback
}
```

## 📈 Performance Tips

1. **Use Dynamic Keys**: Only fetch when data is needed
   ```typescript
   useSWR(search ? `/api/search?q=${search}` : null, fetcher);
   ```

2. **Limit Cache Size**: Implement cache eviction policy
   ```typescript
   const { cache } = useSWRConfig();
   if (cache.size > 50) cache.clear(); // Simple eviction
   ```

3. **Batch Requests**: Fetch related data together
   ```typescript
   const { data: users } = useSWR("/api/users", fetcher);
   const { data: posts } = useSWR("/api/posts", fetcher);
   ```

4. **Use Pagination**: Don't fetch all data at once
   ```typescript
   useSWR(`/api/users?page=${page}&limit=20`, fetcher);
   ```

## 🔗 Related Resources

- [SWR Documentation](https://swr.vercel.app/)
- [Next.js Data Fetching](https://nextjs.org/docs/guides/data-fetching)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

## ✅ Checklist for Implementation

- [ ] Install SWR: `npm install swr`
- [ ] Create fetcher utility in `lib/fetcher.ts`
- [ ] Create main page with SWR hooks
- [ ] Implement loading and error states
- [ ] Add cache status display
- [ ] Create mutation component with optimistic UI
- [ ] Configure revalidation strategies
- [ ] Add error retry logic
- [ ] Test cache hits and misses
- [ ] Monitor cache in browser DevTools
- [ ] Document cache keys and strategies

## 🎯 Learning Outcomes

After completing this implementation, you'll understand:
- ✅ How SWR caching works
- ✅ Cache hits vs misses
- ✅ Revalidation strategies
- ✅ Optimistic UI patterns
- ✅ Error handling and retries
- ✅ Performance optimization
- ✅ Production best practices
