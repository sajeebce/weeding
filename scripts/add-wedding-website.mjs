// Run: node scripts/add-wedding-website.mjs
import pg from "pg";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "WeddingWebsite" (
    "id"           TEXT         NOT NULL PRIMARY KEY,
    "projectId"    TEXT         NOT NULL UNIQUE,
    "slug"         TEXT         NOT NULL UNIQUE,
    "published"    BOOLEAN      NOT NULL DEFAULT false,
    "theme"        TEXT         NOT NULL DEFAULT 'modern',
    "primaryColor" TEXT         NOT NULL DEFAULT '#be185d',
    "accentColor"  TEXT         NOT NULL DEFAULT '#f9a8d4',
    "fontFamily"   TEXT         NOT NULL DEFAULT 'Inter',
    "blocks"       JSONB        NOT NULL DEFAULT '[]',
    "customDomain" TEXT,
    "password"     TEXT,
    "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "WeddingWebsite_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "WeddingWebsite_projectId_idx" ON "WeddingWebsite"("projectId");
  CREATE INDEX IF NOT EXISTS "WeddingWebsite_slug_idx"      ON "WeddingWebsite"("slug");
`);

await client.end();
console.log("WeddingWebsite table created successfully.");
