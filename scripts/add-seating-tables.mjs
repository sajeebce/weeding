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
      CREATE TABLE IF NOT EXISTS "SeatingLayout" (
        "id"        TEXT        NOT NULL PRIMARY KEY,
        "projectId" TEXT        NOT NULL,
        "name"      TEXT        NOT NULL DEFAULT 'Layout',
        "type"      TEXT        NOT NULL DEFAULT 'RECEPTION',
        "width"     INTEGER     NOT NULL DEFAULT 1200,
        "height"    INTEGER     NOT NULL DEFAULT 800,
        "bgColor"   TEXT        NOT NULL DEFAULT '#f5f5f0',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "SeatingLayout_projectId_idx" ON "SeatingLayout"("projectId")
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "SeatingTable" (
        "id"        TEXT        NOT NULL PRIMARY KEY,
        "layoutId"  TEXT        NOT NULL,
        "projectId" TEXT        NOT NULL,
        "name"      TEXT        NOT NULL DEFAULT 'Table',
        "type"      TEXT        NOT NULL DEFAULT 'ROUND',
        "x"         FLOAT       NOT NULL DEFAULT 100,
        "y"         FLOAT       NOT NULL DEFAULT 100,
        "seats"     INTEGER     NOT NULL DEFAULT 8,
        "rotation"  FLOAT       NOT NULL DEFAULT 0,
        "color"     TEXT        NOT NULL DEFAULT '#ffffff',
        "guestIds"  JSONB       NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("layoutId")  REFERENCES "SeatingLayout"("id")  ON DELETE CASCADE,
        FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "SeatingTable_layoutId_idx"  ON "SeatingTable"("layoutId")
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "SeatingTable_projectId_idx" ON "SeatingTable"("projectId")
    `);

    console.log("Seating tables created successfully.");
  } finally {
    await client.end();
  }
}

main().catch(console.error);
