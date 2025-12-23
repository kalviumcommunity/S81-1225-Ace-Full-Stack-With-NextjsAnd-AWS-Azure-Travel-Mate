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

## 🔒 Strict TypeScript Mode

- `strict`, `noImplicitAny`, `noUnusedLocals`, and `noUnusedParameters` ensure every value has an explicit, type-safe contract, so undefined edge cases are caught at build time instead of in production.
- `forceConsistentCasingInFileNames` keeps imports from breaking across operating systems, and `skipLibCheck` keeps builds fast without relaxing project-level safety.

## 🧹 Linting + Formatting Rules

- ESLint extends `next/core-web-vitals` and `plugin:prettier/recommended`, adding `no-console`, `semi`, `quotes`, and `@typescript-eslint/no-unused-vars` to flag risky patterns during development.
- Prettier (`.prettierrc`) locks formatting to double quotes, required semicolons, width 2, and consistent trailing commas (ES5) so diffs stay tiny and code reviews focus on logic.

## ✅ Pre-Commit Workflow

- Husky installs a `pre-commit` hook that runs `lint-staged`, which in turn executes `eslint --fix` and `prettier --write` over any staged TS/JS files; commits only pass once every file is clean.
- Example outputs:

```bash
npm run lint
> travel-mate@0.1.0 lint
> eslint .
```

```bash
npx lint-staged
⚠ Running tasks for staged files...
✖ eslint --fix
✔ Reverting to original state because of errors...
```

- The second log shows how a deliberate `lint-test.ts` violation blocked the commit until the issue was removed, ensuring a consistent main branch.

## 🔐 Environment Variables

- Copy `.env.example` to `.env.local`, then replace each placeholder with project-specific values. `.env.local` stays untracked because `.gitignore` ignores every `.env*` file except for `.env.example`.
- Server-only secrets (never used in client components):
  - `DATABASE_URL` – backing data store connection string used in API routes.
  - `MAP_PROVIDER` – provider identifier read on the server for feature toggles.
  - `MAPBOX_API_KEY` – third-party token consumed only inside server routes/services.
- Client-safe values (prefixed with `NEXT_PUBLIC_` so Next.js can expose them to the browser):
  - `NEXT_PUBLIC_API_URL` – base path the client uses when calling backend endpoints.
  - `NEXT_PUBLIC_ENV` – display-friendly label rendered in `app/env-check.tsx`.
- Safe usage pattern (server secrets never leave the backend):

```ts
// app/api/health/route.ts
const dbConfigured = Boolean(process.env.DATABASE_URL); // server-only
const publicEnv = process.env.NEXT_PUBLIC_ENV; // safe because it is prefixed
return NextResponse.json({
  checks: { databaseUrlPresent: dbConfigured },
  env: publicEnv ?? "unknown",
});
```

- Common pitfalls avoided:
  - Accidental commits of local secrets (`.env.local`) thanks to the `.gitignore` rules.
  - Using server-only variables in client components—the client only ever reads `NEXT_PUBLIC_*` values.
  - Remembering that environment variables are evaluated at build time; restarting `next dev` after edits prevents stale values.
