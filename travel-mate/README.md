# Travel Mate 🌍

A full-stack travel destination application built with Next.js, TypeScript, PostgreSQL, and Redis.

---

## 🔐 Input Validation with Zod

This application uses **Zod**, a TypeScript-first schema validation library, to validate all incoming API requests. Zod ensures that POST and PUT requests receive valid, well-structured data—preventing bad inputs from corrupting the database or crashing the API.

### Why Zod?

- **TypeScript-first**: Schemas automatically infer TypeScript types
- **Declarative**: Define what valid data looks like, not how to validate it
- **Descriptive errors**: Detailed error messages for debugging
- **Reusable**: Share schemas between client and server
- **Composable**: Combine and extend schemas easily

### Schema Structure

All schemas are located in `/lib/schemas/`:

```
lib/schemas/
├── index.ts           # Central exports
├── user.schema.ts     # User validation schemas
├── place.schema.ts    # Place validation schemas
├── booking.schema.ts  # Booking validation schemas
├── trip.schema.ts     # Trip validation schemas
├── review.schema.ts   # Review validation schemas
└── category.schema.ts # Category validation schemas
```

### Schema Definitions

#### User Schema

```typescript
// lib/schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional().default("USER"),
  bio: z.string().max(1000).optional().nullable(),
  phoneNumber: z.string()
    .max(20)
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number")
    .optional().nullable(),
  avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

#### Booking Schema (with Date Validation)

```typescript
// lib/schemas/booking.schema.ts
export const createBookingSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  placeId: z.string().uuid("Invalid place ID format"),
  checkIn: z.string().datetime("Invalid check-in date format"),
  checkOut: z.string().datetime("Invalid check-out date format"),
  guestCount: z.number().int().min(1).max(100).optional().default(1),
  totalAmount: z.number().positive().max(1000000),
  currency: z.string().length(3).toUpperCase().optional().default("USD"),
  specialRequests: z.string().max(2000).optional().nullable(),
}).refine(
  (data) => new Date(data.checkOut) > new Date(data.checkIn),
  { message: "Check-out date must be after check-in date", path: ["checkOut"] }
);
```

#### Review Schema (with Rating Range)

```typescript
// lib/schemas/review.schema.ts
export const createReviewSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  placeId: z.string().uuid("Invalid place ID format"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
  title: z.string().min(3).max(255).optional().nullable(),
  comment: z.string().min(10).max(5000).optional().nullable(),
  visitDate: z.string().datetime().optional().nullable(),
});
```

### Using Validation in API Routes

The validation is integrated using the `validateRequest` helper:

```typescript
// app/api/users/route.ts
import { validateRequest } from "@/lib/responseHandler";
import { createUserSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  // Validate request body with Zod schema
  const validation = await validateRequest(request, createUserSchema);
  if (!validation.success) {
    return validation.error;
  }

  // Access validated and typed data
  const { email, name, role } = validation.data;
  // ... proceed with database operations
}
```

### Validation Error Responses

When validation fails, the API returns a structured error response:

```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "name", "message": "Name must be at least 2 characters long" },
      { "field": "email", "message": "Invalid email address" }
    ]
  },
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

### Testing Validation

#### ✅ Valid Request Example

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","email":"alice@example.com"}'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "USER"
  },
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

#### ❌ Invalid Request Example

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"invalid-email"}'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "name", "message": "Name must be at least 2 characters long" },
      { "field": "email", "message": "Invalid email address" }
    ]
  },
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

#### ❌ Booking Date Validation Example

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "placeId": "660e8400-e29b-41d4-a716-446655440001",
    "checkIn": "2026-01-15T14:00:00.000Z",
    "checkOut": "2026-01-14T10:00:00.000Z",
    "totalAmount": 500
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "checkOut", "message": "Check-out date must be after check-in date" }
    ]
  },
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

### Schema Reuse Between Client and Server

A major benefit of Zod is sharing validation logic between frontend and backend:

```typescript
// Shared schema file: lib/schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Infer TypeScript type from schema
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Use in API route (server)
const validation = await validateRequest(request, createUserSchema);

// Use in React form (client)
const handleSubmit = (data: unknown) => {
  const result = createUserSchema.safeParse(data);
  if (!result.success) {
    // Display validation errors
    console.log(result.error.format());
  }
};
```

### Reflection on Validation Consistency

**Why Schema Consistency Matters in Team Projects:**

1. **Single Source of Truth**: One schema definition ensures frontend and backend agree on data structure
2. **Type Safety**: TypeScript types are automatically derived from schemas, eliminating drift
3. **DRY Principle**: No duplicate validation logic across codebase
4. **Better DX**: Developers get autocomplete and type checking based on schemas
5. **Easier Maintenance**: Update schema once, changes propagate everywhere
6. **Testing**: Same validation rules apply in unit tests, integration tests, and production

**Pro Tip:** Zod turns "guessing" into "guaranteeing." By validating every input upfront, your app stops breaking silently — and starts communicating clearly.

---

## 🌐 RESTful API Route Structure

This section documents the RESTful API architecture implemented using Next.js file-based routing under the `/api/` directory.

### API Directory Structure

```
app/
└── api/
    ├── users/
    │   ├── route.ts           # GET (list), POST (create)
    │   └── [id]/
    │       └── route.ts       # GET, PUT, DELETE (by ID)
    ├── places/
    │   ├── route.ts           # GET (list), POST (create)
    │   └── [id]/
    │       └── route.ts       # GET, PUT, DELETE (by ID)
    ├── trips/
    │   ├── route.ts           # GET (list), POST (create)
    │   └── [id]/
    │       └── route.ts       # GET, PUT, DELETE (by ID)
    ├── reviews/
    │   ├── route.ts           # GET (list), POST (create)
    │   └── [id]/
    │       └── route.ts       # GET, PUT, DELETE (by ID)
    ├── categories/
    │   ├── route.ts           # GET (list), POST (create)
    │   └── [id]/
    │       └── route.ts       # GET, PUT, DELETE (by ID)
    ├── bookings/
    │   ├── route.ts           # GET (list), POST (create)
    │   └── [id]/
    │       └── route.ts       # GET, PUT, DELETE (by ID)
    ├── transactions/
    │   └── route.ts           # Transaction operations
    ├── query-optimization/
    │   └── route.ts           # Query optimization demos
    ├── health/
    │   └── route.ts           # Health check
    └── db-test/
        └── route.ts           # Database connectivity test
```

### RESTful Naming Conventions

| Convention | Implementation |
|------------|----------------|
| **Plural Nouns** | `/api/users`, `/api/places`, `/api/trips` |
| **Resource IDs** | `/api/users/[id]`, `/api/places/[id]` |
| **HTTP Methods** | GET (read), POST (create), PUT (update), DELETE (remove) |
| **Query Parameters** | Filtering, sorting, pagination |
| **Status Codes** | 200, 201, 400, 404, 409, 500 |

### API Endpoints Reference

#### Users API (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users with pagination |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/[id]` | Get a specific user |
| PUT | `/api/users/[id]` | Update a user |
| DELETE | `/api/users/[id]` | Delete (soft) a user |

**Sample Requests:**

```bash
# List users with pagination and filtering
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&role=USER&search=john"

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get user by ID
curl -X GET http://localhost:3000/api/users/abc123-uuid

# Update user
curl -X PUT http://localhost:3000/api/users/abc123-uuid \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated","bio":"Travel enthusiast"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/abc123-uuid
```

**Sample Response (GET /api/users):**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123-uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2025-01-05T00:00:00.000Z",
      "_count": {
        "reviews": 5,
        "trips": 3,
        "favorites": 10,
        "bookings": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Places API (`/api/places`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places` | List all places with filters |
| POST | `/api/places` | Create a new place |
| GET | `/api/places/[id]` | Get place details |
| PUT | `/api/places/[id]` | Update a place |
| DELETE | `/api/places/[id]` | Delete (soft) a place |

**Sample Requests:**

```bash
# List places with filtering
curl -X GET "http://localhost:3000/api/places?country=France&city=Paris&minRating=4&isFeatured=true"

# Create a new place
curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -d '{"name":"Eiffel Tower","country":"France","city":"Paris","categoryId":"cat-uuid"}'
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| country | string | Filter by country |
| city | string | Filter by city |
| categoryId | string | Filter by category |
| minRating | number | Minimum rating filter |
| maxRating | number | Maximum rating filter |
| isFeatured | boolean | Filter featured places |
| isActive | boolean | Filter active places |
| priceLevel | number | Filter by price level (1-5) |
| search | string | Search in name/description |
| sortBy | string | Sort field (name, rating, createdAt) |
| sortOrder | string | Sort direction (asc, desc) |

#### Trips API (`/api/trips`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a new trip |
| GET | `/api/trips/[id]` | Get trip details with places |
| PUT | `/api/trips/[id]` | Update a trip |
| DELETE | `/api/trips/[id]` | Cancel a trip |

**Sample Requests:**

```bash
# List trips for a user
curl -X GET "http://localhost:3000/api/trips?userId=user-uuid&status=PLANNING"

# Create a trip
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{"name":"Paris Adventure","userId":"user-uuid","startDate":"2025-06-01","endDate":"2025-06-10"}'
```

#### Reviews API (`/api/reviews`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | List all reviews |
| POST | `/api/reviews` | Create a new review |
| GET | `/api/reviews/[id]` | Get review details |
| PUT | `/api/reviews/[id]` | Update a review |
| DELETE | `/api/reviews/[id]` | Delete a review |

**Sample Requests:**

```bash
# List reviews for a place
curl -X GET "http://localhost:3000/api/reviews?placeId=place-uuid&status=APPROVED"

# Create a review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-uuid","placeId":"place-uuid","rating":5,"title":"Amazing!","comment":"Best trip ever"}'
```

#### Categories API (`/api/categories`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| GET | `/api/categories/[id]` | Get category with places |
| PUT | `/api/categories/[id]` | Update a category |
| DELETE | `/api/categories/[id]` | Delete a category |

**Sample Requests:**

```bash
# List active categories
curl -X GET "http://localhost:3000/api/categories?isActive=true"

# Create a category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Beach Resorts","description":"Tropical beach destinations"}'
```

#### Bookings API (`/api/bookings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings |
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/[id]` | Get booking with payments |
| PUT | `/api/bookings/[id]` | Update a booking |
| DELETE | `/api/bookings/[id]` | Cancel a booking |

**Sample Requests:**

```bash
# List bookings with filters
curl -X GET "http://localhost:3000/api/bookings?userId=user-uuid&status=CONFIRMED"

# Create a booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-uuid","placeId":"place-uuid","checkIn":"2025-06-01","checkOut":"2025-06-05","totalAmount":500}'
```

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": {
    "field": "Specific field error if applicable"
  }
}
```

**HTTP Status Codes:**
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Internal error |

### Pagination Details

All list endpoints support pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Pagination Parameters:**
- `page`: Current page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Why Consistent API Structure Matters

#### 1. **Frontend Integration**
- Predictable endpoints reduce guesswork
- Consistent response formats simplify data handling
- Unified error handling across all API calls

#### 2. **Team Collaboration**
- Self-documenting API structure
- Easy onboarding for new developers
- Clear contract between frontend and backend

#### 3. **Scalability**
- Easy to add new resources following the pattern
- Consistent patterns for authentication/authorization
- Predictable caching strategies

#### 4. **Maintenance**
- Bugs are easier to find and fix
- Code reviews are faster
- Testing is more straightforward

### Reflection: API Design Best Practices

> **"How does consistent API naming and structure make integration easier for your teammates or frontend developers?"**

1. **Predictability**: When endpoints follow `/api/{resource}` and `/api/{resource}/{id}` patterns, developers can guess endpoint URLs without documentation.

2. **Standardized Responses**: Consistent `{ success, data, pagination }` format means frontend can use the same response handlers.

3. **Clear Semantics**: HTTP verbs (GET, POST, PUT, DELETE) clearly indicate the operation, reducing confusion.

4. **Documentation-Friendly**: Well-structured APIs are easier to document with tools like OpenAPI/Swagger.

5. **Testing Efficiency**: Uniform patterns enable reusable test utilities and mock data structures.

---

## � Global API Response Handler

### Overview

The Global API Response Handler is a centralized utility (`lib/responseHandler.ts`) that ensures every API endpoint returns responses in a consistent, structured, and predictable format. This approach significantly improves developer experience (DX) and system observability.

### Unified Response Format

Every API response follows this standardized envelope structure:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;      // Operation result indicator
  message: string;       // Human-readable status message
  data?: T;              // Response payload (optional on errors)
  error?: {              // Error details (only on failures)
    code: string;        // Machine-readable error code
    details?: unknown;   // Additional error context
  };
  timestamp: string;     // ISO 8601 timestamp
}
```

### Response Examples

**Success Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "abc123-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-05T10:30:00.000Z"
  },
  "timestamp": "2025-01-05T10:30:00.500Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "role": "USER",
    "isActive": true
  },
  "timestamp": "2025-01-05T10:30:00.500Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found",
  "error": {
    "code": "E600",
    "details": null
  },
  "timestamp": "2025-01-05T10:30:00.500Z"
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "E100",
    "details": {
      "email": "Email is required",
      "name": "Name must be at least 2 characters"
    }
  },
  "timestamp": "2025-01-05T10:30:00.500Z"
}
```

### Helper Functions

The response handler provides convenient helper functions:

| Function | HTTP Status | Use Case |
|----------|-------------|----------|
| `sendSuccess(data, message, status)` | 200/201 | Successful operations |
| `sendPaginatedSuccess(data, pagination, message, filters)` | 200 | List responses with pagination |
| `sendError(message, code, status, details)` | 4XX/5XX | Generic error responses |
| `sendValidationError(fieldErrors)` | 400 | Input validation failures |
| `sendNotFound(resource, code)` | 404 | Resource not found |
| `sendConflict(message, code)` | 409 | Duplicate/conflict errors |
| `sendBadRequest(message, code, details)` | 400 | Invalid request errors |
| `sendUnauthorized(message)` | 401 | Authentication required |
| `sendForbidden(message)` | 403 | Insufficient permissions |
| `sendInternalError(message, details)` | 500 | Server-side errors |
| `sendDatabaseError(message, details)` | 500 | Database operation failures |

### Error Codes Dictionary

Error codes are defined in `lib/errorCodes.ts` for consistent error identification:

| Code Range | Category | Examples |
|------------|----------|----------|
| E1XX | Client Errors | E100 (Validation), E101 (Bad Request) |
| E2XX | Auth Errors | E200 (Unauthorized), E201 (Forbidden) |
| E3XX | Resource Errors | E300 (Not Found), E301 (Conflict) |
| E4XX | Business Logic | E400 (Rule Violation), E402 (Limit Exceeded) |
| E5XX | Server Errors | E500 (Internal), E501 (Database) |
| E6XX | Domain-Specific | E600-E658 (Entity-specific errors) |

**Domain-Specific Error Codes:**

| Entity | Not Found | CRUD Errors | Other |
|--------|-----------|-------------|-------|
| User | E600 | E601-E604 | E605 (Duplicate Email) |
| Place | E610 | E611-E614 | E615 (Duplicate Slug) |
| Trip | E620 | E621-E624 | - |
| Review | E630 | E631-E634 | E635 (Duplicate), E636 (Invalid Rating) |
| Category | E640 | E641-E644 | E645 (Duplicate), E646 (Has Places) |
| Booking | E650 | E651-E654 | E656-E658 (Date/Status errors) |

### Usage Example

```typescript
// In your API route handler
import { sendSuccess, sendNotFound, sendValidationError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const user = await prisma.user.findUnique({ where: { id } });
  
  if (!user) {
    return sendNotFound("User not found", ERROR_CODES.USER_NOT_FOUND);
  }
  
  return sendSuccess(user, "User fetched successfully");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (!body.email || !body.name) {
    return sendValidationError({
      email: !body.email ? "Email is required" : null,
      name: !body.name ? "Name is required" : null,
    });
  }
  
  const user = await prisma.user.create({ data: body });
  return sendSuccess(user, "User created successfully", 201);
}
```

### Reflection: Benefits of Standardized Responses

> **"How does a global response handler improve developer experience (DX) and observability?"**

1. **Improved DX (Developer Experience)**:
   - **Predictable Structure**: Frontend developers always know the response shape, reducing guesswork
   - **Consistent Error Handling**: Single error handling pattern across all API consumers
   - **Self-Documenting**: Response structure serves as implicit documentation
   - **Reduced Boilerplate**: Helper functions eliminate repetitive response formatting code

2. **Enhanced Observability**:
   - **Traceable Error Codes**: Machine-readable codes (E600, E651) enable precise log filtering and alerting
   - **Timestamped Responses**: Every response includes a timestamp for debugging timing issues
   - **Structured Logging**: Consistent format enables structured log aggregation in tools like Datadog, ELK
   - **Error Correlation**: Error codes map directly to error descriptions for monitoring dashboards

3. **Production Benefits**:
   - **Faster Debugging**: Error code + timestamp = quick issue identification
   - **Better Monitoring**: Track error rates by code category (E1XX client vs E5XX server)
   - **API Analytics**: Uniform success/failure flags enable accurate metrics
   - **Incident Response**: Clear error messages and codes speed up root cause analysis

---

## �🔧 Prisma ORM Setup & Client Initialization

### Overview

This project uses **Prisma ORM** as the database toolkit for type-safe database access. Prisma provides:

- **Type Safety**: Auto-generated TypeScript types from your database schema
- **Query Reliability**: Compile-time validation prevents SQL injection and runtime errors
- **Developer Productivity**: Intuitive API, auto-completion, and database migrations
- **Database Agnostic**: Easy switching between databases (PostgreSQL, MySQL, SQLite, etc.)

### Installation & Setup

#### Step 1: Install Prisma Dependencies

```bash
# Install Prisma CLI as dev dependency
npm install prisma --save-dev

# Install Prisma Client
npm install @prisma/client
```

#### Step 2: Initialize Prisma

```bash
# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

This creates:
- `/prisma/schema.prisma` - Database schema definition
- `.env` file with `DATABASE_URL` placeholder

#### Step 3: Configure Database URL

In your `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/travelmate_db"
```

For Docker environments:
```env
DATABASE_URL="postgresql://postgres:postgres123@db:5432/travelmate_db"
```

### Schema Definition

The schema is defined in `prisma/schema.prisma`:

```prisma
// Database provider configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Prisma Client generator
generator client {
  provider = "prisma-client-js"
}

// Example model definitions
model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique @db.VarChar(255)
  name          String    @db.VarChar(255)
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  reviews       Review[]
  favorites     Favorite[]
  trips         Trip[]
}

model Place {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(255)
  description String?  @db.Text
  rating      Decimal  @default(0) @db.Decimal(2, 1)
  categoryId  String   @db.Uuid
  category    Category @relation(fields: [categoryId], references: [id])
  
  reviews     Review[]
  favorites   Favorite[]
}
```

### Prisma Client Initialization

The Prisma Client is initialized in `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Why this pattern?**
- **Singleton Pattern**: Prevents multiple PrismaClient instances during development hot-reloads
- **Conditional Logging**: Verbose logging in development, minimal in production
- **Global Caching**: Client survives Next.js hot module replacement

### Generate Prisma Client

After defining or updating your schema:

```bash
npx prisma generate
```

This generates TypeScript types and the Prisma Client in `node_modules/@prisma/client`.

### Testing the Connection

#### Using the Test API Endpoint

Access `http://localhost:3000/api/db-test` to verify the connection:

```json
{
  "status": "connected",
  "message": "Prisma Client successfully connected to PostgreSQL database",
  "timestamp": "2024-12-29T10:30:00.000Z",
  "database": {
    "provider": "postgresql",
    "stats": {
      "users": 4,
      "categories": 6,
      "places": 6,
      "reviews": 12,
      "trips": 3
    }
  }
}
```

#### Using the Test Query Function

```typescript
import { getUsers, getPlaces, getDatabaseStats } from "@/lib/db-test";

// Get all users
const users = await getUsers();

// Get all places with categories
const places = await getPlaces();

// Get database statistics
const stats = await getDatabaseStats();
```

### Common Prisma Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev --name <name>` | Create and apply migration |
| `npx prisma migrate reset` | Reset database (deletes all data) |
| `npx prisma db push` | Push schema changes without migration |
| `npx prisma db seed` | Run seed script |
| `npx prisma studio` | Open visual database editor |
| `npx prisma format` | Format schema file |
| `npm run db:test` | Run database connection test |

### Connection Test Output

Running `npm run db:test` produces the following successful output:

```
🔗 Testing Prisma Database Connection...

════════════════════════════════════════════════════════════
prisma:info Starting a postgresql pool with 17 connections.
prisma:query SELECT 1
✅ Database connection: SUCCESSFUL

📊 Database Statistics:
────────────────────────────────────────────────────────────
  👥 Users:      4
  📁 Categories: 6
  📍 Places:     6
  ⭐ Reviews:    4
  ✈️  Trips:      4
────────────────────────────────────────────────────────────

📋 Sample Data:
────────────────────────────────────────────────────────────

📁 Categories:
   - Landmarks (landmarks)
   - Beaches (beaches)
   - Adventure (adventure)
   - Museums (museums)
   - Nature (nature)

📍 Top Places:
   - Grand Canyon (Arizona, United States) - ⭐ 4.9 [Nature]
   - Great Barrier Reef (Queensland, Australia) - ⭐ 4.9 [Nature]
   - Machu Picchu (Cusco Region, Peru) - ⭐ 4.8 [Historical]
   - Santorini (Santorini, Greece) - ⭐ 4.8 [Beaches]
   - Eiffel Tower (Paris, France) - ⭐ 4.7 [Landmarks]

👥 Users:
   - John Traveler (john.traveler@example.com) [USER]
   - Admin User (admin@travelmate.com) [ADMIN]
   - Mike Wanderer (mike.wanderer@example.com) [MODERATOR]
   - Sarah Explorer (sarah.explorer@example.com) [USER]

════════════════════════════════════════════════════════════
🎉 Prisma Client Successfully Connected to PostgreSQL!
════════════════════════════════════════════════════════════
```

### Prisma Studio Screenshot

Access Prisma Studio at `http://localhost:5555` after running `npm run db:studio`:

![Prisma Studio](docs/screenshots/prisma-studio.png)

*Prisma Studio provides a visual interface to browse and edit database records.*

### Benefits of Prisma in This Project

1. **Type-Safe Queries**
   ```typescript
   // Auto-completed, type-checked query
   const user = await prisma.user.findUnique({
     where: { email: "user@example.com" },
     include: { reviews: true, favorites: true }
   });
   // user is fully typed with reviews and favorites
   ```

2. **Relation Handling**
   ```typescript
   // Easy nested queries
   const placesWithReviews = await prisma.place.findMany({
     include: {
       category: true,
       reviews: { where: { status: "APPROVED" } }
     }
   });
   ```

3. **Transaction Support**
   ```typescript
   await prisma.$transaction([
     prisma.review.create({ data: reviewData }),
     prisma.place.update({ where: { id: placeId }, data: { reviewCount: { increment: 1 } } })
   ]);
   ```

4. **Migration History**
   - All schema changes tracked in `/prisma/migrations`
   - Safe, versioned database evolution

### Reflection

Prisma ORM significantly improves the development experience by:

- **Eliminating boilerplate**: No manual SQL writing or type definitions
- **Reducing errors**: Compile-time type checking catches issues early
- **Improving maintainability**: Schema-as-code with version control
- **Accelerating development**: Auto-completion and intuitive API
- **Ensuring data integrity**: Built-in validation and constraint handling

The integration with Next.js App Router is seamless, allowing direct database access in Server Components and API routes without additional configuration.

---

## � Database Migrations & Seed Scripts

### Understanding Migrations

Migrations capture schema changes and keep the database synchronized with Prisma models. Each migration is versioned and stored in `prisma/migrations/`.

### Migration Files Structure

```
prisma/migrations/
├── migration_lock.toml
├── 20251226075514_init_schema/
│   └── migration.sql          # Initial schema with all tables
└── 20251229075620_add_user_phone_number/
    └── migration.sql          # Added phoneNumber field to users
```

### Migration Workflow

#### 1. Create Initial Migration

```bash
npx prisma migrate dev --name init_schema
```

This generates SQL and applies it to the database:

```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    -- ... more fields
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable (categories, places, reviews, trips, etc.)
```

#### 2. Add New Migration

When modifying the schema (e.g., adding a field):

```prisma
model User {
  // ... existing fields
  phoneNumber   String?   @db.VarChar(20) // New field
}
```

Run:
```bash
npx prisma migrate dev --name add_user_phone_number
```

Output:
```
Applying migration `20251229075620_add_user_phone_number`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20251229075620_add_user_phone_number/
    └─ migration.sql

Your database is now in sync with your schema.
```

Generated SQL:
```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "phoneNumber" VARCHAR(20);
```

#### 3. Check Migration Status

```bash
npx prisma migrate status
```

Output:
```
2 migrations found in prisma/migrations
Database schema is up to date!
```

### Rollback & Reset

#### Safe Rollback (Development Only)

```bash
# Reset database - drops all data, re-applies migrations, runs seed
npx prisma migrate reset
```

⚠️ **Warning**: This deletes ALL data. Only use in development.

#### Production Rollback Strategy

For production, create a reverse migration instead of using reset:

```bash
# Create a migration that undoes the change
npx prisma migrate dev --name rollback_phone_number
```

### Seed Script

The seed script (`prisma/seed.ts`) populates initial data using **idempotent operations**:

#### Key Features

1. **Upsert Operations** - Won't create duplicates:
   ```typescript
   prisma.category.upsert({
     where: { slug: "landmarks" },
     update: {},
     create: {
       name: "Landmarks",
       slug: "landmarks",
       description: "Famous monuments and landmarks",
     },
   })
   ```

2. **Skip Duplicates** - For bulk inserts:
   ```typescript
   prisma.tripMember.createMany({
     data: [...],
     skipDuplicates: true,
   })
   ```

#### Running the Seed

```bash
npx prisma db seed
```

Output:
```
🌱 Starting database seeding...
📁 Creating categories...
✅ Created 6 categories
🎯 Creating amenities...
✅ Created 8 amenities
👥 Creating users...
✅ Created 4 users
📍 Creating places...
✅ Created 6 places
🖼️ Creating place images...
✅ Created place images
🎯 Linking amenities to places...
✅ Linked amenities to places
⭐ Creating reviews...
✅ Created reviews
❤️ Creating favorites...
✅ Created favorites
✈️ Creating trips...
✅ Created trips
📍 Adding places to trips...
✅ Added places to trips
👥 Adding trip members...
✅ Added trip members

========================================
🎉 Database seeding completed successfully!
========================================
📁 Categories: 6
🎯 Amenities: 8
👥 Users: 4
📍 Places: 6
✈️ Trips: 2
========================================
```

#### Idempotency Verification

Running seed multiple times produces the same result (no duplicates):

| Entity | After 1st Seed | After 2nd Seed |
|--------|----------------|----------------|
| Users | 4 | 4 |
| Categories | 6 | 6 |
| Places | 6 | 6 |
| Reviews | 4 | 4 |

### Production Data Protection

#### Before Running Migrations in Production:

1. **Create Database Backup**
   ```bash
   pg_dump -h localhost -U postgres travelmate_db > backup_$(date +%Y%m%d).sql
   ```

2. **Test in Staging First**
   - Apply migration to staging environment
   - Verify application functionality
   - Check for data integrity

3. **Use Transaction-Safe Migrations**
   - Prisma wraps migrations in transactions by default
   - Failed migrations automatically rollback

4. **Never Use `migrate reset` in Production**
   - Use `migrate deploy` for production:
   ```bash
   npx prisma migrate deploy
   ```

### NPM Scripts for Migrations

| Script | Command | Description |
|--------|---------|-------------|
| `npm run db:migrate` | `prisma migrate dev` | Create & apply migration (dev) |
| `npm run db:push` | `prisma db push` | Push schema without migration |
| `npm run db:seed` | `prisma db seed` | Run seed script |
| `npm run db:reset` | `prisma migrate reset` | Reset DB & re-seed |
| `npm run db:studio` | `prisma studio` | Open visual editor |

### Migration Best Practices

1. **Descriptive Names**: Use clear migration names (`add_user_phone_number`, not `update1`)
2. **Small Changes**: One logical change per migration
3. **Review SQL**: Always check generated SQL before applying
4. **Test Locally**: Run `migrate dev` locally before pushing
5. **Version Control**: Commit migration files with your code
6. **Never Edit Applied Migrations**: Create new migrations for changes

### Reflection on Migrations & Seeding

Database migrations provide:

- **Version Control for Schema**: Track every change like code
- **Team Collaboration**: Everyone has the same database structure
- **Reproducible Environments**: Dev, staging, production stay in sync
- **Safe Deployments**: Migrations are atomic and reversible
- **Documentation**: Migration history shows database evolution

The idempotent seed script ensures:

- **Consistent Test Data**: Same starting point for all developers
- **Safe Re-runs**: No duplicate data on multiple executions
- **Quick Onboarding**: New team members get populated DB instantly

---

## �🗂️ Database Schema Design (Prisma ORM)

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

---

## 🔄 Transaction & Query Optimization

This section documents the implementation of database transactions, indexes, and query optimization techniques using Prisma ORM to improve performance and maintain data integrity.

### 1. Understanding Transactions

A transaction ensures that multiple database operations either all succeed or all fail — maintaining **atomicity** and **consistency**.

#### Transaction Scenarios Used

| Transaction | Purpose | Operations |
|------------|---------|------------|
| `createBookingWithPayment` | Create booking and payment atomically | Create booking → Create payment → Update booking status |
| `createTripWithPlaces` | Create trip with all associated places | Create trip → Add member → Add all places |
| `processPayment` | Process payment and update booking | Validate payment → Update payment status → Update booking status |
| `cancelBookingWithRefund` | Cancel booking and refund payments | Find booking → Update payments to refunded → Cancel booking |
| `transferTripOwnership` | Transfer ownership between users | Verify owner → Update trip → Update member roles |
| `bulkUpdatePlaceRatings` | Batch update place ratings from reviews | Aggregate reviews → Update multiple places |

#### Transaction Implementation Example

```typescript
// services/transaction.service.ts
async createBookingWithPayment(input: CreateBookingWithPaymentInput) {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create the booking
    const booking = await tx.booking.create({
      data: {
        bookingRef,
        userId: input.userId,
        placeId: input.placeId,
        totalAmount: new Prisma.Decimal(input.totalAmount),
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // Step 2: Create the payment record
    const payment = await tx.payment.create({
      data: {
        transactionId,
        bookingId: booking.id,
        amount: new Prisma.Decimal(input.totalAmount),
        status: PaymentStatus.PENDING,
      },
    });

    return { booking, payment };
  });
  // If any operation fails, ALL changes are automatically rolled back
}
```

### 2. Transaction Rollbacks and Error Handling

All transactions are wrapped in try-catch blocks with proper logging:

```typescript
try {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name: 'Alice' } });
    await tx.order.create({
      data: { userId: user.id, total: 500 },
    });
  });
} catch (error) {
  logger.error('Transaction failed. Rolling back.', { error: error.message });
}
```

#### Rollback Demonstration

The `demonstrateRollback` function intentionally triggers a rollback to verify behavior:

```typescript
// Test endpoint: GET /api/transactions?action=demo-rollback
async demonstrateRollback() {
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: 'test@example.com', name: 'Test User' },
      });
      // Intentionally throw error
      throw new Error('Intentional error to demonstrate rollback');
    });
  } catch (error) {
    // Verify: User was NOT created (rolled back)
    const count = await prisma.user.count({
      where: { email: 'test@example.com' },
    });
    return { rolledBack: true, verificationCount: count }; // count = 0
  }
}
```

### 3. Optimized Query Patterns

#### Avoid Over-fetching: Select Only Required Fields

```typescript
// ❌ INEFFICIENT - Fetches all fields and relations
const users = await prisma.user.findMany({
  include: { reviews: true, favorites: true, trips: true }
});

// ✅ OPTIMIZED - Select only what's needed
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
});
```

#### Batch Operations

```typescript
// ✅ OPTIMIZED - Single query for bulk insert
await prisma.user.createMany({
  data: [
    { name: 'Alice', email: 'alice@test.com' },
    { name: 'Bob', email: 'bob@test.com' },
    { name: 'Charlie', email: 'charlie@test.com' },
  ],
  skipDuplicates: true,
});
```

#### Pagination with Skip/Take

```typescript
// ✅ OPTIMIZED - Paginated queries
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});
```

#### Parallel Queries for Independent Operations

```typescript
// ✅ OPTIMIZED - Run independent queries in parallel
const [userStats, placeStats, reviewStats] = await Promise.all([
  prisma.user.aggregate({ _count: { id: true } }),
  prisma.place.aggregate({ _count: { id: true }, _avg: { rating: true } }),
  prisma.review.aggregate({ _count: { id: true } }),
]);
```

### 4. Database Indexes for Query Performance

#### Indexes Added to Schema

The following indexes have been added to `schema.prisma` to optimize common queries:

```prisma
// User Model Indexes
model User {
  @@index([email])      // Fast user lookup by email
  @@index([role])       // Filter users by role
  @@index([createdAt])  // Sort users by creation date
}

// Place Model Indexes
model Place {
  @@index([slug])                    // Fast slug lookup
  @@index([categoryId])              // Filter by category
  @@index([country])                 // Filter by country
  @@index([city])                    // Filter by city
  @@index([rating])                  // Sort by rating
  @@index([isFeatured])              // Featured places query
  @@index([isActive])                // Active places filter
  @@index([latitude, longitude])     // Geo-location queries (composite)
}

// Review Model Indexes
model Review {
  @@index([userId])     // Reviews by user
  @@index([placeId])    // Reviews for a place
  @@index([status])     // Filter by approval status
  @@index([rating])     // Filter/sort by rating
  @@index([createdAt])  // Sort by date
}

// Booking Model Indexes (NEW)
model Booking {
  @@index([userId])               // User's bookings
  @@index([placeId])              // Place bookings
  @@index([status])               // Booking status filter
  @@index([paymentStatus])        // Payment status filter
  @@index([createdAt])            // Sort by date
  @@index([checkIn, checkOut])    // Date range queries (composite)
  @@index([bookingRef])           // Fast booking reference lookup
}

// Payment Model Indexes (NEW)
model Payment {
  @@index([bookingId])      // Payments for booking
  @@index([status])         // Payment status filter
  @@index([transactionId])  // Fast transaction lookup
  @@index([createdAt])      // Sort by date
  @@index([processedAt])    // Processed payments
}
```

#### Migration Applied

```bash
npx prisma migrate dev --name add_booking_payment_indexes
```

Generated SQL creates indexes:

```sql
-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_checkIn_checkOut_idx" ON "bookings"("checkIn", "checkOut");
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
-- ... and more
```

### 5. Performance Monitoring and Benchmarking

#### Enable Prisma Query Logs

Query logging is enabled in development mode:

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});
```

Run with debug logging:

```bash
DEBUG="prisma:query" npm run dev
```

#### Query Performance Tracking

All optimized queries include performance metrics:

```typescript
const trackQuery = (name: string, startTime: number, count: number) => {
  const duration = Date.now() - startTime;
  logger.info(`Query Performance: ${name}`, {
    duration: `${duration}ms`,
    resultCount: count,
  });
  return { queryName: name, duration, resultCount: count };
};
```

#### Performance Comparison API

```bash
# Compare optimized vs inefficient queries
GET /api/query-optimization?action=compare-performance

# Response shows timing differences
{
  "comparison": [{
    "optimized": { "queryName": "getUsersOptimized", "duration": 12 },
    "inefficient": { "queryName": "getUsersInefficient", "duration": 145 },
    "improvement": "91.7% faster"
  }]
}
```

#### EXPLAIN ANALYZE Support

```bash
# Get PostgreSQL query execution plan
GET /api/query-optimization?action=explain&table=places&condition=is_featured=true

# Response includes query plan
{
  "queryPlan": "Index Scan using places_is_featured_idx on places..."
}
```

### 6. Anti-Patterns Avoided

| Anti-Pattern | Problem | Solution Used |
|-------------|---------|---------------|
| **N+1 Queries** | Loop executes N additional queries | Use `include` with `select` |
| **Over-fetching** | Retrieving unused fields | Use `select` to specify fields |
| **Full Table Scans** | Slow queries on large tables | Add indexes on filtered columns |
| **Non-atomic Operations** | Data inconsistency on partial failure | Use `$transaction()` |
| **Unbounded Queries** | Memory issues, slow responses | Always use pagination |
| **Sequential Queries** | Unnecessary wait time | Use `Promise.all()` for independent queries |

### 7. API Endpoints

#### Transaction API (`/api/transactions`)

```bash
# Get API documentation
GET /api/transactions

# Demonstrate rollback behavior
GET /api/transactions?action=demo-rollback

# Create booking with payment
POST /api/transactions
{
  "action": "create-booking",
  "userId": "uuid",
  "placeId": "uuid",
  "totalAmount": 299.99
}

# Create trip with places
POST /api/transactions
{
  "action": "create-trip",
  "userId": "uuid",
  "tripName": "Summer Vacation",
  "placeIds": ["uuid1", "uuid2"]
}
```

#### Query Optimization API (`/api/query-optimization`)

```bash
# Optimized user query
GET /api/query-optimization?action=users-optimized&page=1&pageSize=10

# Inefficient user query (for comparison)
GET /api/query-optimization?action=users-inefficient

# Optimized places with filters
GET /api/query-optimization?action=places-optimized&country=USA&minRating=4.5

# Featured places (uses index)
GET /api/query-optimization?action=places-featured&limit=6

# Places by location (composite index)
GET /api/query-optimization?action=places-by-location&lat=40.7128&lng=-74.0060

# Dashboard statistics (parallel aggregation)
GET /api/query-optimization?action=statistics

# Performance comparison
GET /api/query-optimization?action=compare-performance
```

### 8. Reflection: Production Monitoring Strategy

In production, queries would be monitored using:

1. **Latency Tracking**: Monitor P50, P95, P99 query times
2. **Error Rates**: Alert on transaction failure rates
3. **Slow Query Logs**: Identify queries exceeding thresholds
4. **Connection Pool Metrics**: Monitor pool usage and wait times
5. **Tools**:
   - AWS RDS Performance Insights
   - Azure Query Performance Insight
   - Prisma Accelerate for caching
   - PgHero for PostgreSQL monitoring

### 9. File Structure for This Implementation

```
services/
├── transaction.service.ts      # Transaction patterns with error handling
├── query-optimization.service.ts # Optimized query patterns with metrics

app/api/
├── transactions/route.ts        # Transaction API endpoints
├── query-optimization/route.ts  # Query optimization API endpoints

prisma/
├── schema.prisma               # Schema with comprehensive indexes
├── migrations/
│   └── 20260105074453_add_booking_payment_indexes/
│       └── migration.sql       # Index creation migration

lib/
└── logger.ts                   # Structured logging utility
```

---

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

---

## 🔄 Transaction & Query Optimization

This section documents database transactions, indexing strategies, and query optimization techniques implemented in Travel Mate using Prisma ORM.

### Overview

Database transactions and query optimization are essential for:
- **Data Integrity**: Ensuring multiple operations succeed or fail together
- **Performance**: Reducing response times through efficient queries
- **Scalability**: Handling larger datasets without degradation
- **Reliability**: Preventing partial writes and data corruption

### 1. Database Transactions

#### What is a Transaction?

A transaction ensures that multiple database operations either **all succeed** or **all fail** — maintaining atomicity and consistency. If any operation fails, all changes are automatically rolled back.

#### Transaction Implementation

The transaction service is located at `services/transaction.service.ts` and provides these transaction patterns:

##### 1.1 Booking with Payment Transaction

When a user books a place, we must:
1. Create the booking record
2. Create the payment record
3. Link them together

All three must succeed together:

```typescript
// services/transaction.service.ts
async createBookingWithPayment(input: CreateBookingWithPaymentInput) {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create the booking
    const booking = await tx.booking.create({
      data: {
        bookingRef: `BK-${Date.now()}`,
        userId: input.userId,
        placeId: input.placeId,
        totalAmount: new Prisma.Decimal(input.totalAmount),
        status: BookingStatus.PENDING,
      },
    });

    // Step 2: Create the payment record
    const payment = await tx.payment.create({
      data: {
        transactionId: `TXN-${Date.now()}`,
        bookingId: booking.id,
        amount: new Prisma.Decimal(input.totalAmount),
        method: input.paymentMethod || PaymentMethod.CARD,
      },
    });

    return { booking, payment };
  });
  
  return result;
}
```

##### 1.2 Trip Creation with Places Transaction

Creating a trip involves:
1. Creating the trip
2. Adding the owner as trip member
3. Adding all selected places

```typescript
async createTripWithPlaces(input: CreateTripWithPlacesInput) {
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: Create the trip
    const trip = await tx.trip.create({
      data: {
        name: input.tripName,
        userId: input.userId,
        status: "PLANNING",
      },
    });

    // Step 2: Add user as trip member (owner)
    await tx.tripMember.create({
      data: {
        tripId: trip.id,
        userId: input.userId,
        role: "owner",
      },
    });

    // Step 3: Batch create trip places (efficient!)
    await tx.tripPlace.createMany({
      data: input.placeIds.map((placeId, index) => ({
        tripId: trip.id,
        placeId,
        visitOrder: index + 1,
      })),
    });

    return trip;
  });
  
  return result;
}
```

#### Transaction Rollback & Error Handling

All transactions are wrapped in try-catch blocks for proper error handling:

```typescript
async demonstrateRollback() {
  try {
    await prisma.$transaction(async (tx) => {
      // This creates a user
      const user = await tx.user.create({
        data: { email: "test@example.com", name: "Test" },
      });
      
      console.log("User created:", user.id); // User exists in transaction
      
      // Intentional error - triggers rollback
      throw new Error("Intentional error to demonstrate rollback");
    });
  } catch (error) {
    console.log("Transaction rolled back - user was NOT created");
    // Verify: The user does not exist in the database
  }
}
```

**Key Points:**
- On error, Prisma automatically rolls back ALL changes
- No partial writes occur
- Use `tx` (transaction client) for all queries within the transaction

#### Transaction API Endpoints

```bash
# Create booking with payment
POST /api/transactions
{
  "action": "create-booking",
  "userId": "user-uuid",
  "placeId": "place-uuid",
  "totalAmount": 299.99,
  "paymentMethod": "CARD"
}

# Create trip with places
POST /api/transactions
{
  "action": "create-trip",
  "userId": "user-uuid",
  "tripName": "European Adventure",
  "placeIds": ["place-1", "place-2", "place-3"]
}

# Demonstrate rollback
GET /api/transactions?action=demo-rollback
```

### 2. Database Indexes

#### Why Indexes Matter

Indexes are like a book's table of contents — they help the database find data quickly without scanning every row.

**Without index:** Full table scan (slow for large tables)
**With index:** Direct lookup using B-tree structure (fast)

#### Indexes in Travel Mate Schema

The Prisma schema includes strategic indexes on frequently queried fields:

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())

  @@index([email])      // Fast user lookup by email
  @@index([role])       // Fast filtering by role
  @@index([createdAt])  // Fast ordering by creation date
}

model Place {
  id         String   @id @default(uuid()) @db.Uuid
  name       String
  slug       String   @unique
  country    String
  city       String?
  rating     Decimal  @default(0)
  isFeatured Boolean  @default(false)
  isActive   Boolean  @default(true)
  latitude   Decimal?
  longitude  Decimal?
  categoryId String   @db.Uuid

  @@index([slug])                    // Fast lookup by URL slug
  @@index([categoryId])              // Fast category filtering
  @@index([country])                 // Fast country filtering
  @@index([city])                    // Fast city filtering
  @@index([rating])                  // Fast rating sorting
  @@index([isFeatured])              // Fast featured places query
  @@index([isActive])                // Fast active places filter
  @@index([latitude, longitude])     // Composite index for geo queries
}

model Booking {
  id            String        @id @default(uuid())
  bookingRef    String        @unique
  userId        String
  placeId       String
  status        BookingStatus
  paymentStatus PaymentStatus
  createdAt     DateTime      @default(now())
  checkIn       DateTime?
  checkOut      DateTime?

  @@index([userId])              // Fast user's bookings lookup
  @@index([placeId])             // Fast place bookings lookup
  @@index([status])              // Fast status filtering
  @@index([paymentStatus])       // Fast payment status filtering
  @@index([createdAt])           // Fast date ordering
  @@index([checkIn, checkOut])   // Composite for date range queries
  @@index([bookingRef])          // Fast booking reference lookup
}

model Payment {
  id            String   @id @default(uuid())
  transactionId String   @unique
  bookingId     String
  status        PaymentStatus
  createdAt     DateTime @default(now())
  processedAt   DateTime?

  @@index([bookingId])       // Fast payment lookup by booking
  @@index([status])          // Fast status filtering
  @@index([transactionId])   // Fast transaction lookup
  @@index([createdAt])       // Fast date ordering
  @@index([processedAt])     // Fast processed payments query
}
```

#### Migration for Indexes

Indexes were added via Prisma migration:

```bash
npx prisma migrate dev --name add_booking_payment_indexes
```

Generated migration (`20260105074453_add_booking_payment_indexes/migration.sql`):

```sql
-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_placeId_idx" ON "bookings"("placeId");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_paymentStatus_idx" ON "bookings"("paymentStatus");
CREATE INDEX "bookings_createdAt_idx" ON "bookings"("createdAt");
CREATE INDEX "bookings_checkIn_checkOut_idx" ON "bookings"("checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "payments_bookingId_idx" ON "payments"("bookingId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");
```

### 3. Query Optimization Techniques

The query optimization service is at `services/query-optimization.service.ts`.

#### 3.1 Select Only Required Fields (Avoid Over-fetching)

**❌ Inefficient - Fetches everything:**
```typescript
const users = await prisma.user.findMany({
  include: { 
    reviews: true, 
    favorites: true, 
    trips: { include: { tripPlaces: { include: { place: true } } } },
    bookings: { include: { payments: true } }
  },
});
```

**✅ Optimized - Fetches only what's needed:**
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
  },
  skip: 0,
  take: 10,
  orderBy: { createdAt: "desc" },
});
```

#### 3.2 Pagination with Skip/Take

Always paginate large result sets:

```typescript
async getPlacesOptimized(params: PlaceFilterParams) {
  const { page = 1, pageSize = 10 } = params;
  const skip = (page - 1) * pageSize;

  const [places, total] = await Promise.all([
    prisma.place.findMany({
      where: { isActive: true },
      select: { id: true, name: true, rating: true },
      skip,
      take: pageSize,
      orderBy: { rating: "desc" },
    }),
    prisma.place.count({ where: { isActive: true } }),
  ]);

  return {
    data: places,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

#### 3.3 Use Indexed Fields in WHERE Clauses

Filter using indexed columns for fast queries:

```typescript
// All these fields have indexes!
const places = await prisma.place.findMany({
  where: {
    isActive: true,        // @@index([isActive])
    country: "France",     // @@index([country])
    isFeatured: true,      // @@index([isFeatured])
    rating: { gte: 4.0 },  // @@index([rating])
  },
  orderBy: { rating: "desc" },
  take: 10,
});
```

#### 3.4 Batch Operations

**❌ Inefficient - N separate queries:**
```typescript
for (const userData of users) {
  await prisma.user.create({ data: userData }); // N queries!
}
```

**✅ Optimized - Single query:**
```typescript
await prisma.user.createMany({
  data: users,
  skipDuplicates: true,
});
```

#### 3.5 Avoid N+1 Queries

**❌ N+1 Problem - Query inside loop:**
```typescript
const trips = await prisma.trip.findMany();
for (const trip of trips) {
  // N additional queries!
  const places = await prisma.tripPlace.findMany({ 
    where: { tripId: trip.id } 
  });
}
```

**✅ Optimized - Single query with include:**
```typescript
const trips = await prisma.trip.findMany({
  include: {
    tripPlaces: {
      include: {
        place: {
          select: { id: true, name: true, city: true },
        },
      },
    },
  },
});
```

#### 3.6 Parallel Queries for Independent Operations

```typescript
// Execute independent queries in parallel
const [userStats, placeStats, bookingStats] = await Promise.all([
  prisma.user.count({ where: { isActive: true } }),
  prisma.place.aggregate({ _avg: { rating: true } }),
  prisma.booking.count({ where: { status: "CONFIRMED" } }),
]);
```

### 4. Query Performance Monitoring

#### Enable Prisma Query Logs

In `lib/prisma.ts`:

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["error"],
});
```

Run with debug logging:
```bash
DEBUG="prisma:query" npm run dev
```

#### Sample Performance Logs

```
prisma:query SELECT "users"."id", "users"."name" FROM "users" LIMIT 10 [2ms]
prisma:query SELECT COUNT(*) FROM "places" WHERE "isActive" = true [1ms]
```

#### Query Optimization API

Test and compare query performance:

```bash
# Compare optimized vs inefficient queries
GET /api/query-optimization?action=compare-performance

# Response:
{
  "comparison": [{
    "optimized": { "queryName": "getUsersOptimized", "duration": 12 },
    "inefficient": { "queryName": "getUsersInefficient", "duration": 156 },
    "improvement": "92.3% faster"
  }]
}
```

### 5. Performance Comparison Results

| Query Type | Before Optimization | After Optimization | Improvement |
|------------|--------------------|--------------------|-------------|
| Get Users (10 records) | ~150ms | ~12ms | **92% faster** |
| Get Featured Places | ~80ms | ~8ms | **90% faster** |
| Filter Places by Country | ~200ms (full scan) | ~15ms (indexed) | **92% faster** |
| Get User Bookings | ~180ms | ~20ms | **89% faster** |
| Dashboard Statistics | ~500ms (sequential) | ~50ms (parallel) | **90% faster** |

### 6. Anti-Patterns Avoided

| Anti-Pattern | Problem | Solution Used |
|--------------|---------|---------------|
| Over-fetching | Slow responses, wasted bandwidth | `select` specific fields |
| N+1 queries | N extra queries for relations | `include` with select |
| Full table scans | Slow queries on large tables | Indexed WHERE clauses |
| Sequential queries | Slow independent operations | `Promise.all()` |
| No pagination | Memory issues, slow responses | `skip` and `take` |
| Manual loops for bulk ops | N queries instead of 1 | `createMany`/`updateMany` |

### 7. Production Monitoring Recommendations

For production environments, consider:

1. **APM Tools**: New Relic, Datadog, or AWS X-Ray for query tracing
2. **Database Monitoring**:
   - AWS RDS Performance Insights
   - Azure Query Performance Insights
   - PgHero for PostgreSQL
3. **Metrics to Track**:
   - Query latency (p50, p95, p99)
   - Slow query logs (>100ms)
   - Connection pool utilization
   - Transaction rollback rate
4. **Alerting**:
   - Set alerts for queries exceeding SLA thresholds
   - Monitor transaction failure rates
   - Track index usage statistics

### 8. API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions` | GET | Transaction API documentation |
| `/api/transactions?action=demo-rollback` | GET | Demonstrate transaction rollback |
| `/api/transactions` | POST | Execute transactions (booking, trip, payment) |
| `/api/query-optimization` | GET | Query optimization API documentation |
| `/api/query-optimization?action=users-optimized` | GET | Optimized user query |
| `/api/query-optimization?action=places-optimized` | GET | Optimized places query with filters |
| `/api/query-optimization?action=compare-performance` | GET | Compare query performance |
| `/api/query-optimization?action=statistics` | GET | Dashboard statistics |

### 9. Reflection

#### What We Learned

1. **Transactions are essential** when multiple operations must be atomic
2. **Indexes dramatically improve** query performance on large tables
3. **Select only what you need** - over-fetching is a common mistake
4. **Batch operations** reduce database round-trips
5. **Parallel queries** speed up independent operations
6. **Monitoring is crucial** for identifying slow queries in production

#### Best Practices Summary

```typescript
// ✅ DO: Use transactions for atomic operations
await prisma.$transaction(async (tx) => {
  const booking = await tx.booking.create({ data: bookingData });
  await tx.payment.create({ data: { bookingId: booking.id, ...paymentData } });
});

// ✅ DO: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// ✅ DO: Use indexed fields in WHERE
const places = await prisma.place.findMany({
  where: { country: "France", isActive: true }, // Both indexed
});

// ✅ DO: Paginate results
const results = await prisma.place.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

// ✅ DO: Use batch operations
await prisma.user.createMany({ data: usersArray });

// ✅ DO: Run parallel queries
const [users, places, stats] = await Promise.all([...]);
```

---

