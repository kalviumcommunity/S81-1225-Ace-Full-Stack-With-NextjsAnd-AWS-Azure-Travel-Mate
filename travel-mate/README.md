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

## 📁 Folder Structure

app/ → Routes & API (Next.js App Router)  
components/ → Reusable UI components  
lib/ → Helpers & configs  
hooks/ → Custom React hooks  
services/ → API/business logic  
types/ → TypeScript types  

This structure separates concerns and helps the app scale as features grow.
