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

## ✅ Code Quality Tooling

- **Strict TypeScript:** `strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`, and `skipLibCheck` are all enabled in `tsconfig.json`. These checks surface undefined types, dead code, and casing mistakes during compilation instead of at runtime, tightening feedback loops for the team.
- **ESLint + Prettier:** `.eslintrc.json` extends `next/core-web-vitals` and `plugin:prettier/recommended` while enforcing `no-console`, double quotes, and required semicolons. Prettier is configured with 2-space tabs, trailing commas, and double quotes to keep diffs small and code easy to scan.
- **Pre-commit enforcement:** Husky runs `lint-staged`, which executes `eslint --fix` and `prettier --write` on staged TypeScript/JavaScript files. Commits that still violate rules are rejected, so the main branch always receives formatted, lint-clean code.

### Lint/Format Evidence

```
npm run lint

> travel-mate@0.1.0 lint
> eslint . --ext .ts,.tsx,.js,.jsx

# No output past this point → ESLint finished without any warnings or errors
```
