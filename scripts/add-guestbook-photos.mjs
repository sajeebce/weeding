import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "GuestbookEntry" (
        "id"         TEXT        NOT NULL PRIMARY KEY,
        "websiteId"  TEXT        NOT NULL,
        "authorName" TEXT        NOT NULL,
        "message"    TEXT        NOT NULL,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("websiteId") REFERENCES "WeddingWebsite"("id") ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "GuestbookEntry_websiteId_idx"
        ON "GuestbookEntry"("websiteId")
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "GuestbookEntry_websiteId_createdAt_idx"
        ON "GuestbookEntry"("websiteId", "createdAt" DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "GuestPhoto" (
        "id"           TEXT        NOT NULL PRIMARY KEY,
        "websiteId"    TEXT        NOT NULL,
        "uploaderName" TEXT,
        "caption"      TEXT,
        "photoData"    TEXT        NOT NULL,
        "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("websiteId") REFERENCES "WeddingWebsite"("id") ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "GuestPhoto_websiteId_idx"
        ON "GuestPhoto"("websiteId")
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "GuestPhoto_websiteId_createdAt_idx"
        ON "GuestPhoto"("websiteId", "createdAt" DESC)
    `);

    console.log("GuestbookEntry and GuestPhoto tables created successfully.");
  } finally {
    await client.end();
  }
}

main().catch(console.error);
