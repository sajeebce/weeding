// Script to update section padding in the home page LandingPageBlock in the DB
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PADDING_MAP = {
  "hero-content-first":     { paddingTop: 80, paddingBottom: 60 },
  "trust-badges":           { paddingTop: 60, paddingBottom: 60 },
  "service-list":           { paddingTop: 96, paddingBottom: 96 },
  "stats-section":          { paddingTop: 64, paddingBottom: 64 },
  "process-steps":          { paddingTop: 96, paddingBottom: 96 },
  "pricing-table":          { paddingTop: 96, paddingBottom: 96 },
  "testimonials-carousel":  { paddingTop: 80, paddingBottom: 80 },
  "blog-post-grid":         { paddingTop: 80, paddingBottom: 80 },
  "faq-accordion":          { paddingTop: 80, paddingBottom: 80 },
  "hero-content-cta":       { paddingTop: 80, paddingBottom: 80 },
  "text-block":             { paddingTop: 32, paddingBottom: 32 },
  "__empty__":              { paddingTop: 0,  paddingBottom: 0  },
};

async function main() {
  // Get home page
  const homePage = await prisma.landingPage.findFirst({ where: { slug: "home" } });
  if (!homePage) throw new Error("Home page not found");

  // Get the widget page sections block
  const block = await prisma.landingPageBlock.findFirst({
    where: { landingPageId: homePage.id, type: "widget-page-sections" },
  });
  if (!block) throw new Error("widget-page-sections block not found");

  const sections = block.settings;
  if (!Array.isArray(sections)) throw new Error("Block settings is not an array");

  let heroContentCount = 0;

  const updated = sections.map((section, si) => {
    const widgets = (section.columns || []).flatMap(c => (c.widgets || []).map(w => w.type));
    const s = { ...(section.settings || {}) };

    let key;
    if (widgets.length === 0) {
      key = "__empty__";
    } else if (widgets[0] === "hero-content") {
      heroContentCount++;
      key = heroContentCount === 1 ? "hero-content-first" : "hero-content-cta";
    } else {
      key = widgets[0];
    }

    const pad = PADDING_MAP[key];
    if (pad) {
      s.paddingTop = pad.paddingTop;
      s.paddingBottom = pad.paddingBottom;
      console.log(`Section ${si} [${key}] -> pT:${pad.paddingTop} pB:${pad.paddingBottom}`);
    } else {
      console.log(`Section ${si} [${key}] -> no mapping, skipped`);
    }

    return { ...section, settings: s };
  });

  await prisma.landingPageBlock.update({
    where: { id: block.id },
    data: { settings: updated },
  });

  console.log("\nDB updated successfully.");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
