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
    // Create VenueType enum if not exists
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "VenueType" AS ENUM ('CEREMONY', 'RECEPTION');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // Create EventVenue table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "EventVenue" (
        "id"          TEXT        NOT NULL PRIMARY KEY,
        "projectId"   TEXT        NOT NULL,
        "type"        "VenueType" NOT NULL,
        "venueName"   TEXT,
        "address"     TEXT,
        "city"        TEXT,
        "country"     TEXT,
        "date"        TIMESTAMPTZ,
        "time"        TEXT,
        "capacity"    INTEGER,
        "description" TEXT,
        "notes"       TEXT,
        "layoutNotes" TEXT,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE,
        UNIQUE ("projectId", "type")
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "EventVenue_projectId_idx" ON "EventVenue"("projectId")
    `);

    console.log("EventVenue table created successfully.");
  } finally {
    await client.end();
  }
}

main().catch(console.error);
