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
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'ServiceFeature'
    ORDER BY ordinal_position
  `);
  console.log("ServiceFeature columns:");
  console.table(result.rows);

  await pool.end();
}

main().catch(console.error);
