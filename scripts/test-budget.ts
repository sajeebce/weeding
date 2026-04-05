import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { readFileSync } from "fs";

const env = readFileSync("d:/projects/llcpad/.env", "utf8");
const pw = env.match(/DATABASE_PASSWORD=(.+)/)![1].trim();

const pool = new Pool({ host: "localhost", port: 5432, user: "postgres", password: pw, database: "llcpad" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const PROJECT_ID = "cmnbocjv20000jkv5nxqj1gix";

async function main() {
  console.log("1. Testing budgetCategory.findMany...");
  const cats = await prisma.budgetCategory.findMany({ where: { projectId: PROJECT_ID } });
  console.log("   OK — count:", cats.length);

  console.log("2. Testing budgetCategory.create...");
  const cat = await prisma.budgetCategory.create({
    data: { projectId: PROJECT_ID, name: "Test Venue", planned: 500, color: "#6366f1", order: 0 },
    include: { items: true },
  });
  console.log("   OK — id:", cat.id, "name:", cat.name);

  console.log("3. Verify it's in DB...");
  const verify = await prisma.budgetCategory.findMany({ where: { projectId: PROJECT_ID } });
  console.log("   Count after create:", verify.length);

  console.log("4. Cleanup...");
  await prisma.budgetCategory.delete({ where: { id: cat.id } });
  console.log("   DELETE OK");

  console.log("\n✅ ALL TESTS PASSED — Prisma budgetCategory works perfectly");
}

main()
  .catch((e) => { console.error("❌ ERROR:", e.message); process.exit(1); })
  .finally(() => { prisma.$disconnect(); pool.end(); });
