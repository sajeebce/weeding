/**
 * Standalone Chat Server
 *
 * Runs Socket.io on port 3001 alongside Next.js (port 3000).
 *
 * Usage:
 *   npm run dev:chat    (development with hot reload)
 *
 * Terminal 1: npm run dev       → Next.js on :3000
 * Terminal 2: npm run dev:chat  → Socket.io on :3001
 */

import "dotenv/config";
import { createServer } from "http";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { initializeSocketServer } from "./src/lib/support/socket/server";

const CHAT_PORT = parseInt(process.env.CHAT_SERVER_PORT || "3001", 10);

// Create Prisma client with pg adapter (same as src/lib/db.ts)
const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error"] });

async function start() {
  // Verify database connection
  try {
    await prisma.$connect();
    console.log("[Chat Server] Database connected");
  } catch (error) {
    console.error("[Chat Server] Database connection failed:", error);
    process.exit(1);
  }

  // Create HTTP server for Socket.io
  const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  // Initialize Socket.io with Prisma
  initializeSocketServer(httpServer, prisma as unknown as import("@prisma/client").PrismaClient);

  httpServer.listen(CHAT_PORT, () => {
    console.log(`
┌──────────────────────────────────────────┐
│                                          │
│   Live Chat Server                       │
│                                          │
│   > Socket:  ws://localhost:${CHAT_PORT}        │
│   > Health:  http://localhost:${CHAT_PORT}/health│
│   > DB:      ${process.env.DATABASE_NAME || "llcpad"}                       │
│                                          │
└──────────────────────────────────────────┘
    `);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[Chat Server] Shutting down...");
    httpServer.close();
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("[Chat Server] Failed to start:", error);
  process.exit(1);
});
