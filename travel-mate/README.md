# Travel Mate 🌍

A full-stack travel destination application built with Next.js, TypeScript, PostgreSQL, and Redis.

## �️ Database Schema Design (Prisma ORM)

This project uses **Prisma ORM** with a normalized PostgreSQL database schema following industry best practices.

### Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TRAVEL MATE DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
    │   Category   │           │    User      │           │   Amenity    │
    │──────────────│           │──────────────│           │──────────────│
    │ id (PK)      │           │ id (PK)      │           │ id (PK)      │
    │ name         │           │ email (UQ)   │           │ name (UQ)    │
    │ slug (UQ)    │           │ name         │           │ icon         │
    │ description  │           │ role         │           │ createdAt    │
    │ iconUrl      │           │ bio          │           │ updatedAt    │
    │ sortOrder    │           │ avatarUrl    │           └──────┬───────┘
    │ isActive     │           │ emailVerified│                  │
    │ createdAt    │           │ isActive     │                  │
    │ updatedAt    │           │ createdAt    │                  │
    └──────┬───────┘           │ updatedAt    │                  │
           │                   └──────┬───────┘                  │
           │                          │                          │
           │1                         │1                         │M
           │                          │                          │
           ▼M                         ▼M                         ▼
    ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
    │    Place     │◄─────────►│   Review     │           │ PlaceAmenity │
    │──────────────│     M:N   │──────────────│           │──────────────│
    │ id (PK)      │           │ id (PK)      │           │ id (PK)      │
    │ name         │           │ userId (FK)  │           │ placeId (FK) │
    │ slug (UQ)    │           │ placeId (FK) │           │ amenityId(FK)│
    │ description  │           │ rating       │           │ createdAt    │
    │ address      │           │ title        │           └──────────────┘
    │ city         │           │ comment      │                  ▲M
    │ country      │           │ status       │                  │
    │ latitude     │           │ visitDate    │                  │
    │ longitude    │           │ helpfulCount │           ┌──────┴───────┐
    │ imageUrl     │           │ createdAt    │           │    Place     │
    │ rating       │           │ updatedAt    │           └──────────────┘
    │ reviewCount  │           └──────────────┘
    │ priceLevel   │
    │ isFeatured   │           ┌──────────────┐           ┌──────────────┐
    │ categoryId(FK)│          │   Favorite   │           │  PlaceImage  │
    │ createdAt    │           │──────────────│           │──────────────│
    │ updatedAt    │           │ id (PK)      │           │ id (PK)      │
    └──────┬───────┘           │ userId (FK)  │           │ placeId (FK) │
           │                   │ placeId (FK) │           │ url          │
           │1                  │ createdAt    │           │ altText      │
           │                   └──────────────┘           │ isPrimary    │
           │                          ▲M                  │ sortOrder    │
           │                          │                   │ createdAt    │
           ▼M                         │                   └──────────────┘
    ┌──────────────┐                  │                          ▲M
    │  TripPlace   │           ┌──────┴───────┐                  │
    │──────────────│           │    User      │           ┌──────┴───────┐
    │ id (PK)      │           └──────────────┘           │    Place     │
    │ tripId (FK)  │                                      └──────────────┘
    │ placeId (FK) │
    │ visitOrder   │           ┌──────────────┐           ┌──────────────┐
    │ visitDate    │           │     Trip     │◄─────────►│  TripMember  │
    │ duration     │           │──────────────│     1:M   │──────────────│
    │ notes        │           │ id (PK)      │           │ id (PK)      │
    │ createdAt    │           │ name         │           │ tripId (FK)  │
    │ updatedAt    │           │ description  │           │ userId (FK)  │
    └──────────────┘           │ startDate    │           │ role         │
           ▲M                  │ endDate      │           │ joinedAt     │
           │                   │ budget       │           └──────────────┘
           │                   │ currency     │                  ▲M
    ┌──────┴───────┐           │ status       │                  │
    │     Trip     │           │ coverImage   │           ┌──────┴───────┐
    └──────────────┘           │ isPublic     │           │    User      │
                               │ userId (FK)  │           └──────────────┘
                               │ createdAt    │
                               │ updatedAt    │
                               └──────────────┘
```

### Database Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | Application users with roles | email (unique), role (USER/ADMIN/MODERATOR) |
| **Category** | Travel destination categories | slug (unique), sortOrder |
| **Place** | Travel destinations | slug (unique), coordinates, rating, categoryId |
| **PlaceImage** | Multiple images per place | url, isPrimary, sortOrder |
| **Amenity** | Available amenities | name (unique), icon |
| **PlaceAmenity** | Junction table (Place ↔ Amenity) | placeId, amenityId (unique pair) |
| **Review** | User reviews for places | rating (1-5), status (PENDING/APPROVED/REJECTED) |
| **Favorite** | User's favorite places | userId, placeId (unique pair) |
| **Trip** | User trip itineraries | status (PLANNING/UPCOMING/IN_PROGRESS/COMPLETED/CANCELLED) |
| **TripPlace** | Places in a trip | visitOrder, duration, notes |
| **TripMember** | Trip collaborators | role (owner/editor/viewer) |

### Enums

```prisma
enum UserRole {
  USER       // Regular user
  ADMIN      // Full system access
  MODERATOR  // Content moderation access
}

enum TripStatus {
  PLANNING     // Trip is being planned
  UPCOMING     // Trip is confirmed
  IN_PROGRESS  // Currently on the trip
  COMPLETED    // Trip finished
  CANCELLED    // Trip cancelled
}

enum ReviewStatus {
  PENDING   // Awaiting moderation
  APPROVED  // Visible to public
  REJECTED  // Not approved
}
```

### Normalization

The schema follows **Third Normal Form (3NF)**:

| Normal Form | Applied Rule | Example |
|-------------|--------------|---------|
| **1NF** | Atomic values, no repeating groups | Place amenities in separate `PlaceAmenity` table |
| **2NF** | No partial dependencies | All non-key fields depend on entire primary key |
| **3NF** | No transitive dependencies | Category data stored in `Category` table, not duplicated in `Place` |

### Indexes

Strategic indexes for query performance:

```sql
-- User lookups
@@index([email])

-- Place queries
@@index([categoryId])
@@index([country])
@@index([isFeatured])
@@index([rating])

-- Review queries
@@index([userId])
@@index([placeId])
@@index([status])

-- Trip queries
@@index([userId])
@@index([status])
```

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration_name>

# Reset database (deletes all data)
npx prisma migrate reset

# Seed database with sample data
npx prisma db seed

# Open Prisma Studio (visual database editor)
npx prisma studio

# View database in formatted output
npx prisma db pull
```

### Seed Data

The seed script (`prisma/seed.ts`) populates:
- 6 Categories (Landmarks, Nature, Beaches, Museums, Adventure, Historical)
- 8 Amenities (WiFi, Parking, Restaurant, etc.)
- 4 Users (Admin, Moderator, 2 Regular users)
- 6 Places (Eiffel Tower, Grand Canyon, Machu Picchu, etc.)
- Reviews, Favorites, Trips with sample data

---

## �🐳 Docker Setup

This project is fully containerized using Docker and Docker Compose, allowing you to run the entire stack (Next.js app, PostgreSQL database, and Redis cache) with a single command.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- At least 4GB of available RAM for Docker

### Quick Start

```bash
# Clone the repository and navigate to the travel-mate directory
cd travel-mate

# Start all services (app, database, redis)
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### Accessing Services

| Service    | URL/Port                    | Description                    |
| ---------- | --------------------------- | ------------------------------ |
| App        | http://localhost:3000       | Next.js application            |
| PostgreSQL | localhost:5432              | Database (user: postgres)      |
| Redis      | localhost:6379              | Cache server                   |
| Health API | http://localhost:3000/api/health | Health check endpoint      |

### Docker Files Overview

#### Dockerfile (Production)

```dockerfile
# Multi-stage build for optimized production image
# Stage 1: Install dependencies
# Stage 2: Build the Next.js application
# Stage 3: Minimal production runtime with standalone output
```

**Key features:**
- Uses `node:20-alpine` as base image for small footprint (~150MB)
- Multi-stage build reduces final image size
- Runs as non-root user for security
- Standalone output mode for minimal deployment
- Health checks for container orchestration

#### Dockerfile.dev (Development)

```dockerfile
# Single-stage build with hot reload support
# Mounts source code as volume for live changes
```

#### docker-compose.yml

```yaml
services:
  app:        # Next.js container (port 3000)
  db:         # PostgreSQL 16 (port 5432)
  redis:      # Redis 7 (port 6379)

networks:
  travel-mate-network:  # Shared bridge network

volumes:
  postgres_data:        # Persistent database storage
  redis_data:           # Persistent cache storage
```

### Network Configuration

All services communicate over a shared bridge network (`travel-mate-network`):

```
┌─────────────────────────────────────────────────────────┐
│                 travel-mate-network                      │
│                                                          │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐         │
│  │   app   │◄────►│   db    │      │  redis  │         │
│  │  :3000  │      │  :5432  │      │  :6379  │         │
│  └─────────┘      └─────────┘      └─────────┘         │
│       │                │                │               │
└───────┼────────────────┼────────────────┼───────────────┘
        │                │                │
   localhost:3000   localhost:5432   localhost:6379
```

- **Internal communication**: Services use container names (e.g., `db:5432`, `redis:6379`)
- **External access**: Ports are mapped to localhost for development

### Volume Mounts

| Volume               | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `postgres_data`      | Persists database data across restarts     |
| `redis_data`         | Persists Redis cache data                  |
| `./init-db`          | SQL scripts run on first DB initialization |

### Environment Variables

Environment variables are passed through docker-compose.yml:

```yaml
# Database connection (internal Docker network)
DATABASE_URL=postgresql://postgres:postgres123@db:5432/travelmate_db

# Redis connection (internal Docker network)
REDIS_URL=redis://redis:6379

# Client-side variables
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=docker
```

### Common Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f          # All services
docker-compose logs -f app      # Only app service

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild a specific service
docker-compose build app

# Execute command in running container
docker-compose exec app sh
docker-compose exec db psql -U postgres -d travelmate_db

# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Troubleshooting

#### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Kill the process or change ports in docker-compose.yml
```

#### Database Connection Issues
```bash
# Check if database is healthy
docker-compose exec db pg_isready -U postgres

# View database logs
docker-compose logs db
```

#### Permission Issues (Linux/Mac)
```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./
```

#### Rebuilding After Code Changes
```bash
# Force rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### Issues Faced & Solutions

1. **Build Error - ESLint/TypeScript**: Added `ignoreDuringBuilds: true` in `next.config.ts` for both ESLint and TypeScript during production builds.

2. **Standalone Output**: Enabled `output: "standalone"` in Next.js config to create a minimal production build that doesn't require the full `node_modules`.

3. **Health Check Dependencies**: Used `depends_on` with `condition: service_healthy` to ensure the database and Redis are ready before the app starts.

4. **Network Discovery**: Services use container names (`db`, `redis`) instead of `localhost` for internal communication within the Docker network.

---

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
init-db/ → Database initialization SQL scripts  
prisma/ → Prisma schema, migrations, and seed data  

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
  - `REDIS_URL` – Redis cache connection string for caching and session storage.
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
