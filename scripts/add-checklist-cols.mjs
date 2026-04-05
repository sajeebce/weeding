import pg from "pg";
import { readFileSync } from "fs";

const env = readFileSync("d:/projects/llcpad/.env", "utf8");
const dbUrl = env.match(/DATABASE_URL="([^"]+)"/)?.[1];

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();
try {
  await client.query(`ALTER TABLE "ChecklistTask" ADD COLUMN IF NOT EXISTS "description" TEXT`);
  await client.query(`ALTER TABLE "ChecklistTask" ADD COLUMN IF NOT EXISTS "subtasks" JSONB NOT NULL DEFAULT '[]'`);
  console.log("Columns added successfully");
} finally {
  await client.end();
}
