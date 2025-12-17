## Rendering Strategies – Travel Mate

### Static Rendering (SSG)
- Page: /about
- Reason: App description rarely changes
- Benefit: Fastest load, zero server cost

### Dynamic Rendering (SSR)
- Page: /dashboard
- Reason: User-specific data
- Benefit: Real-time accuracy

### Hybrid Rendering (ISR)
- Page: /places
- Reason: Popular places update occasionally
- Benefit: Fast like static, fresh like dynamic


If Travel Mate had 10x more users, we would reduce SSR usage
and rely more on static and ISR pages to reduce server load,
costs, and improve TTFB.
