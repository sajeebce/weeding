import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Section index -> new padding values (targeted fixes only)
const UPDATES = {
  1:  { paddingTop: 40, paddingBottom: 24 },  // trust-badges: gap->service-list 24+80=104px
  2:  { paddingTop: 80, paddingBottom: 80 },  // service-list: 96->80
  4:  { paddingTop: 80, paddingBottom: 80 },  // process-steps: 96->80
  5:  { paddingTop: 80, paddingBottom: 80 },  // pricing-table: 96->80
  10: { paddingTop: 80, paddingBottom: 0  },  // CTA hero: pB 80->0 (text-block follows)
  11: { paddingTop: 16, paddingBottom: 48 },  // text-block: pT 32->16 (security text near CTA)
};

async function main() {
  const homePage = await prisma.landingPage.findFirst({ where: { slug: "home" } });
  if (!homePage) throw new Error("Home page not found");

  const block = await prisma.landingPageBlock.findFirst({
    where: { landingPageId: homePage.id, type: "widget-page-sections" },
  });
  if (!block) throw new Error("widget-page-sections block not found");

  const sections = block.settings;
  if (!Array.isArray(sections)) throw new Error("Block settings is not an array");

  const updated = sections.map((section, si) => {
    const pad = UPDATES[si];
    if (!pad) return section;
    const s = { ...(section.settings || {}) };
    s.paddingTop = pad.paddingTop;
    s.paddingBottom = pad.paddingBottom;
    console.log(`Section ${si} -> pT:${pad.paddingTop} pB:${pad.paddingBottom}`);
    return { ...section, settings: s };
  });

  await prisma.landingPageBlock.update({
    where: { id: block.id },
    data: { settings: updated },
  });

  console.log("\nDB updated.");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
