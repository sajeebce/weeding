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

// LLC Formation comparison table features
const llcFormationFeatures = [
  {
    text: "LLC Formation in your chosen state",
    tooltip: "We file your LLC formation documents with the state",
    basic: true,
    standard: true,
    premium: true,
  },
  {
    text: "Registered Agent (1st year free)",
    tooltip: "Required legal representative in your LLC state",
    basic: true,
    standard: true,
    premium: true,
  },
  {
    text: "Operating Agreement",
    tooltip: "Legal document outlining LLC ownership and procedures",
    basic: false,
    standard: true,
    premium: true,
  },
  {
    text: "EIN (Tax ID Number)",
    tooltip: "Federal tax identification number from IRS",
    basic: false,
    standard: true,
    premium: true,
  },
  {
    text: "Banking Resolution",
    tooltip: "Document required to open business bank account",
    basic: false,
    standard: true,
    premium: true,
  },
  {
    text: "US Business Address",
    tooltip: "Physical US address for official mail",
    basic: false,
    standard: false,
    premium: true,
  },
  {
    text: "US Phone Number",
    tooltip: "Dedicated US phone number with call forwarding",
    basic: false,
    standard: false,
    premium: true,
  },
  {
    text: "Business Bank Account Assistance",
    tooltip: "Guidance and support for opening US business bank account",
    basic: false,
    standard: false,
    premium: true,
  },
  {
    text: "Priority Support",
    tooltip: "24/7 priority customer support via chat and email",
    basic: false,
    standard: false,
    premium: true,
  },
  {
    text: "Compliance Calendar",
    tooltip: "Automated reminders for annual reports and deadlines",
    basic: false,
    standard: true,
    premium: true,
  },
];

async function main() {
  console.log("🎯 Seeding comparison table data for LLC Formation...\n");

  // Find LLC Formation service
  const service = await prisma.service.findFirst({
    where: { slug: "llc-formation" },
    include: {
      packages: true,
      features: true,
    },
  });

  if (!service) {
    console.error("❌ LLC Formation service not found!");
    return;
  }

  console.log(`Found service: ${service.name}`);
  console.log(`Packages: ${service.packages.map(p => p.name).join(", ")}`);

  // Get package IDs
  const basicPkg = service.packages.find(p => p.name.toLowerCase() === "basic");
  const standardPkg = service.packages.find(p => p.name.toLowerCase() === "standard");
  const premiumPkg = service.packages.find(p => p.name.toLowerCase() === "premium");

  if (!basicPkg || !standardPkg || !premiumPkg) {
    console.error("❌ Missing packages! Need Basic, Standard, Premium");
    console.log("Available packages:", service.packages.map(p => p.name));
    return;
  }

  console.log("\nPackage IDs:");
  console.log(`  Basic: ${basicPkg.id}`);
  console.log(`  Standard: ${standardPkg.id}`);
  console.log(`  Premium: ${premiumPkg.id}`);

  // Delete existing features for this service (clean start)
  console.log("\n🗑️  Clearing existing features...");
  await prisma.serviceFeature.deleteMany({
    where: { serviceId: service.id },
  });

  // Create features and mappings
  console.log("\n📝 Creating features and mappings...\n");

  for (let i = 0; i < llcFormationFeatures.length; i++) {
    const feat = llcFormationFeatures[i];

    // Create feature
    const feature = await prisma.serviceFeature.create({
      data: {
        text: feat.text,
        tooltip: feat.tooltip,
        sortOrder: i,
        serviceId: service.id,
      },
    });

    // Create package mappings
    await prisma.packageFeatureMap.createMany({
      data: [
        { packageId: basicPkg.id, featureId: feature.id, included: feat.basic },
        { packageId: standardPkg.id, featureId: feature.id, included: feat.standard },
        { packageId: premiumPkg.id, featureId: feature.id, included: feat.premium },
      ],
    });

    const status = `[${feat.basic ? "✓" : "✗"}] [${feat.standard ? "✓" : "✗"}] [${feat.premium ? "✓" : "✗"}]`;
    console.log(`  ${i + 1}. ${feat.text}`);
    console.log(`     ${status}`);
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Created ${llcFormationFeatures.length} features with package mappings`);
  console.log("\n📌 Now visit:");
  console.log("   Admin: http://localhost:3000/admin/services/[service-id]");
  console.log("   Frontend: http://localhost:3000/services/llc-formation");
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
