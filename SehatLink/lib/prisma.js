import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Test connection on startup in development
if (process.env.NODE_ENV === "development" && !globalForPrisma.prismaConnectionTested) {
  db.$connect()
    .then(() => {
      console.log("✅ Database connected successfully");
      globalForPrisma.prismaConnectionTested = true;
    })
    .catch((error) => {
      console.error("❌ Database connection failed:", error.message);
      console.error("💡 Tip: Check if your Neon database is paused. Resume it in the Neon dashboard.");
    });
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
