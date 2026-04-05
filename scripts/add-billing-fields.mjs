// scripts/add-billing-fields.mjs
// Migration: add planner subscription fields to User, Stripe fields to VendorProfile
import pg from "pg";
import { config } from "dotenv";

config();

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  // --- User: planner subscription fields ---
  await client.query(`
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "plannerTier"      TEXT NOT NULL DEFAULT 'basic',
      ADD COLUMN IF NOT EXISTS "plannerStatus"    TEXT NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "plannerPeriodEnd" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "stripeCustomerId"  TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
  `);
  console.log("✅ User billing fields added");

  // --- VendorProfile: Stripe fields ---
  await client.query(`
    ALTER TABLE "VendorProfile"
      ADD COLUMN IF NOT EXISTS "stripeCustomerId"      TEXT,
      ADD COLUMN IF NOT EXISTS "stripeSubscriptionId"  TEXT;
  `);
  console.log("✅ VendorProfile Stripe fields added");

} catch (err) {
  console.error("Migration error:", err);
  process.exit(1);
} finally {
  await client.end();
}

console.log("✅ Billing migration complete");
