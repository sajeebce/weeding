// scripts/add-vendor-plan-tier.mjs
// Phase 5C: Add VendorPlanTier enum + planTier column to VendorProfile
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
    console.log("Adding VendorPlanTier enum...");
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "VendorPlanTier" AS ENUM ('TRIAL', 'BUSINESS', 'EXPIRED');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("Adding planTier column to VendorProfile...");
    await client.query(`
      ALTER TABLE "VendorProfile"
      ADD COLUMN IF NOT EXISTS "planTier" "VendorPlanTier" NOT NULL DEFAULT 'TRIAL';
    `);

    console.log("Back-filling expired trials...");
    const result = await client.query(`
      UPDATE "VendorProfile"
      SET "planTier" = 'EXPIRED'
      WHERE "trialEndsAt" IS NOT NULL
        AND "trialEndsAt" < NOW()
        AND "planTier" = 'TRIAL';
    `);
    console.log(`  Updated ${result.rowCount} expired trial vendors.`);

    console.log("Done.");
  } finally {
    await client.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
