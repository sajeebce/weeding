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
      ALTER TABLE "WeddingGuest"
        ADD COLUMN IF NOT EXISTS "rsvpToken"       TEXT UNIQUE,
        ADD COLUMN IF NOT EXISTS "rsvpMessage"     TEXT,
        ADD COLUMN IF NOT EXISTS "rsvpSubmittedAt" TIMESTAMPTZ
    `);
    console.log("RSVP columns added successfully.");
  } finally {
    await client.end();
  }
}

main().catch(console.error);
