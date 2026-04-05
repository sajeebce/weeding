import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "EventBriefToken" (
      "id"        TEXT NOT NULL,
      "projectId" TEXT NOT NULL,
      "token"     TEXT NOT NULL,
      "revokedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EventBriefToken_pkey" PRIMARY KEY ("id")
    );
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "EventBriefToken_token_key"
      ON "EventBriefToken"("token");
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS "EventBriefToken_projectId_idx"
      ON "EventBriefToken"("projectId");
  `);

  // Add FK only if not already present
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'EventBriefToken_projectId_fkey'
      ) THEN
        ALTER TABLE "EventBriefToken"
          ADD CONSTRAINT "EventBriefToken_projectId_fkey"
          FOREIGN KEY ("projectId")
          REFERENCES "WeddingProject"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END
    $$;
  `);

  console.log("✅ EventBriefToken table created successfully");
  await client.end();
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
