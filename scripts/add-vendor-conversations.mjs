// scripts/add-vendor-conversations.mjs
// Phase 5D: Add VendorConversation, VendorMessage, VendorQuickReply tables
import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const client = new pg.Client({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});

async function main() {
  await client.connect();
  try {
    console.log("Creating VendorConvStatus enum...");
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "VendorConvStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'SPAM');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Creating MessageSenderRole enum...");
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "MessageSenderRole" AS ENUM ('VENDOR', 'GUEST');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Creating VendorConversation table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "VendorConversation" (
        "id"            TEXT NOT NULL PRIMARY KEY,
        "vendorId"      TEXT NOT NULL,
        "inquiryId"     TEXT UNIQUE,
        "guestName"     TEXT NOT NULL,
        "guestEmail"    TEXT NOT NULL,
        "status"        "VendorConvStatus" NOT NULL DEFAULT 'ACTIVE',
        "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "VendorConversation_vendorId_fkey"
          FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE,
        CONSTRAINT "VendorConversation_inquiryId_fkey"
          FOREIGN KEY ("inquiryId") REFERENCES "VendorInquiry"("id") ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "VendorConversation_vendorId_lastMessageAt_idx"
        ON "VendorConversation"("vendorId", "lastMessageAt" DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "VendorConversation_vendorId_status_idx"
        ON "VendorConversation"("vendorId", "status");
    `);

    console.log("Creating VendorMessage table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "VendorMessage" (
        "id"             TEXT NOT NULL PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "senderRole"     "MessageSenderRole" NOT NULL,
        "content"        TEXT NOT NULL,
        "isRead"         BOOLEAN NOT NULL DEFAULT false,
        "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "VendorMessage_conversationId_fkey"
          FOREIGN KEY ("conversationId") REFERENCES "VendorConversation"("id") ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "VendorMessage_conversationId_createdAt_idx"
        ON "VendorMessage"("conversationId", "createdAt" DESC);
    `);

    console.log("Creating VendorQuickReply table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "VendorQuickReply" (
        "id"        TEXT NOT NULL PRIMARY KEY,
        "vendorId"  TEXT NOT NULL,
        "title"     TEXT NOT NULL,
        "content"   TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "VendorQuickReply_vendorId_fkey"
          FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "VendorQuickReply_vendorId_idx"
        ON "VendorQuickReply"("vendorId");
    `);

    // Phase 5D: Add projectId + coupleUserId to VendorConversation
    console.log("Adding projectId + coupleUserId columns to VendorConversation...");
    await client.query(`
      ALTER TABLE "VendorConversation"
      ADD COLUMN IF NOT EXISTS "projectId" TEXT REFERENCES "WeddingProject"("id") ON DELETE SET NULL;
    `);
    await client.query(`
      ALTER TABLE "VendorConversation"
      ADD COLUMN IF NOT EXISTS "coupleUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL;
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "VendorConversation_projectId_idx"
        ON "VendorConversation"("projectId");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "VendorConversation_coupleUserId_idx"
        ON "VendorConversation"("coupleUserId");
    `);

    console.log("Done. All tables created and columns added.");
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
