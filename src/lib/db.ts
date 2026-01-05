import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use individual connection parameters to avoid URL encoding issues with special characters
  const pool = new Pool({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || "llcpad",
    // Connection pool optimization
    max: 10, // Maximum connections in pool
    min: 2, // Minimum connections to keep
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Timeout for new connections
  });
  const adapter = new PrismaPg(pool);

  // Disable query logging for better performance
  // Set PRISMA_LOG=query in .env to enable query logging when needed
  const enableQueryLog = process.env.PRISMA_LOG === "query";

  return new PrismaClient({
    adapter,
    log: enableQueryLog ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
