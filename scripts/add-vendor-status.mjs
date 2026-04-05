import { Client } from "pg";
import { readFileSync } from "fs";

function getDbUrl() {
  try {
    const env = readFileSync(".env.local", "utf8");
    const m = env.match(/DATABASE_URL="([^"]+)"/);
    if (m) return m[1];
  } catch {}
  try {
    const env = readFileSync(".env", "utf8");
    const m = env.match(/DATABASE_URL="([^"]+)"/);
    if (m) return m[1];
  } catch {}
  return process.env.DATABASE_URL;
}

const client = new Client({ connectionString: getDbUrl() });
await client.connect();
console.log("Connected");

// Create VendorStatus enum
await client.query(`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VendorStatus') THEN
      CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
    END IF;
  END $$;
`);
console.log("✅ VendorStatus enum ready");

// Add userId column to VendorProfile
await client.query(`
  ALTER TABLE "VendorProfile"
    ADD COLUMN IF NOT EXISTS "userId" TEXT UNIQUE REFERENCES "User"(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status "VendorStatus" NOT NULL DEFAULT 'PENDING';
`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorProfile_userId_idx" ON "VendorProfile"("userId");`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorProfile_status_idx" ON "VendorProfile"(status);`);
console.log("✅ VendorProfile updated (userId + status)");

// Update existing approved vendors to APPROVED status
await client.query(`UPDATE "VendorProfile" SET status = 'APPROVED' WHERE "isApproved" = true;`);
console.log("✅ Existing approved vendors synced");

await client.end();
console.log("✅ Migration complete!");
