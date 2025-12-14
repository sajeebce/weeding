import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { DEFAULT_ROLE_PERMISSIONS } from "../src/lib/permissions";

// Load environment variables
import "dotenv/config";

function createPrismaClient() {
  const pool = new Pool({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || "llcpad",
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("Seeding role permissions...");

  // Clear existing permissions
  await prisma.rolePermission.deleteMany();

  // Insert default permissions for each role
  for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          role: role as UserRole,
          permission,
        },
      });
    }
    console.log(`  ✓ ${role}: ${permissions.length} permissions`);
  }

  console.log("Done seeding permissions!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
