import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * This module creates a single instance of PrismaClient that is reused
 * across the application. This prevents creating multiple database connections
 * during development when hot-reloading occurs.
 *
 * In production, this ensures efficient connection pooling.
 * In development, the client is cached on the global object to survive hot-reloads.
 */

// Extend the global type to include prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a new PrismaClient or reuse the existing one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

// In development, store the client on the global object
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed when the application exits
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
