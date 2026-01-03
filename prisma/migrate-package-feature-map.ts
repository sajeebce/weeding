import { config } from "dotenv";
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "llcpad",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Normalize feature text for comparison
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

async function main() {
  console.log("🔄 Migrating package features to PackageFeatureMap...\n");

  // Get all packages with their features
  const packages = await prisma.package.findMany({
    include: {
      features: true,       // PackageFeature (included)
      notIncluded: true,    // PackageNotIncluded
      service: {
        include: {
          features: true,   // ServiceFeature (master list)
        },
      },
    },
  });

  console.log(`Found ${packages.length} packages to process\n`);

  let totalMappings = 0;
  let skippedExisting = 0;

  for (const pkg of packages) {
    console.log(`\n📦 Processing: ${pkg.name} (${pkg.service.name})`);

    const serviceFeatures = pkg.service.features;
    const includedFeatureTexts = new Set(pkg.features.map(f => normalizeText(f.text)));
    const notIncludedFeatureTexts = new Set(pkg.notIncluded.map(f => normalizeText(f.text)));

    for (const serviceFeature of serviceFeatures) {
      const normalizedServiceFeature = normalizeText(serviceFeature.text);

      // Check if already mapped
      const existingMap = await prisma.packageFeatureMap.findUnique({
        where: {
          packageId_featureId: {
            packageId: pkg.id,
            featureId: serviceFeature.id,
          },
        },
      });

      if (existingMap) {
        skippedExisting++;
        continue;
      }

      // Determine if included
      const isIncluded = includedFeatureTexts.has(normalizedServiceFeature);
      const isExplicitlyNotIncluded = notIncludedFeatureTexts.has(normalizedServiceFeature);

      // Create the mapping
      await prisma.packageFeatureMap.create({
        data: {
          packageId: pkg.id,
          featureId: serviceFeature.id,
          included: isIncluded,
        },
      });

      const status = isIncluded ? "✓" : "✗";
      console.log(`  ${status} ${serviceFeature.text.substring(0, 50)}...`);
      totalMappings++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Migration complete!`);
  console.log(`   Created ${totalMappings} new mappings`);
  console.log(`   Skipped ${skippedExisting} existing mappings`);

  // Summary
  const allMappings = await prisma.packageFeatureMap.count();
  console.log(`   Total mappings in database: ${allMappings}`);
}

main()
  .then(async () => {
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
