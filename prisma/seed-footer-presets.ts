import { config } from "dotenv";
config(); // Load environment variables

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Import shared presets data
import { footerPresetsData } from "../src/lib/data/footer-presets-data";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedFooterPresets() {
  console.log("🎨 Seeding footer presets...");

  for (const preset of footerPresetsData) {
    const existing = await prisma.footerPreset.findFirst({
      where: { name: preset.name, isBuiltIn: true },
    });

    if (existing) {
      // Update existing preset
      await prisma.footerPreset.update({
        where: { id: existing.id },
        data: {
          ...preset,
          isBuiltIn: true,
          isPublic: true,
        },
      });
      console.log(`  ✓ Updated preset: ${preset.name}`);
    } else {
      // Create new preset
      await prisma.footerPreset.create({
        data: {
          ...preset,
          isBuiltIn: true,
          isPublic: true,
        },
      });
      console.log(`  ✓ Created preset: ${preset.name}`);
    }
  }

  console.log(`✅ Seeded ${footerPresetsData.length} footer presets`);
}

// Run if executed directly
seedFooterPresets()
  .then(async () => {
    console.log("🎉 Footer presets seeding complete!");
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
