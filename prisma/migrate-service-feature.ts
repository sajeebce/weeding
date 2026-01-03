import { config } from "dotenv";
config();

import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});

async function main() {
  console.log("Adding missing columns to ServiceFeature table...\n");

  // Add description column
  try {
    await pool.query(`ALTER TABLE "ServiceFeature" ADD COLUMN "description" TEXT`);
    console.log("✓ Added description column");
  } catch (e: any) {
    if (e.code === "42701") console.log("- description column already exists");
    else throw e;
  }

  // Add tooltip column
  try {
    await pool.query(`ALTER TABLE "ServiceFeature" ADD COLUMN "tooltip" TEXT`);
    console.log("✓ Added tooltip column");
  } catch (e: any) {
    if (e.code === "42701") console.log("- tooltip column already exists");
    else throw e;
  }

  // Add createdAt column with default
  try {
    await pool.query(`ALTER TABLE "ServiceFeature" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    console.log("✓ Added createdAt column");
  } catch (e: any) {
    if (e.code === "42701") console.log("- createdAt column already exists");
    else throw e;
  }

  // Add updatedAt column with default
  try {
    await pool.query(`ALTER TABLE "ServiceFeature" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    console.log("✓ Added updatedAt column");
  } catch (e: any) {
    if (e.code === "42701") console.log("- updatedAt column already exists");
    else throw e;
  }

  console.log("\n✅ ServiceFeature columns updated successfully");

  // Show updated structure
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'ServiceFeature'
    ORDER BY ordinal_position
  `);
  console.log("\nUpdated columns:");
  console.table(result.rows);

  await pool.end();
}

main().catch(e => {
  console.error(e);
  pool.end();
  process.exit(1);
});
