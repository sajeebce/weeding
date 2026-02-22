import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Final consistent padding values
// Combined gap between adjacent sections = pB(current) + pT(next)
// Target: ~96px between main content sections
const PADDING = {
  0:  { pT: 80, pB: 60 },  // hero (large top for navbar offset)
  1:  { pT: 40, pB: 24 },  // trust-badges (compact)
  2:  { pT: 48, pB: 48 },  // service-list        gap to stats: 48+48=96 ✓
  3:  { pT: 48, pB: 48 },  // stats-section        gap to process: 48+48=96 ✓
  4:  { pT: 48, pB: 48 },  // process-steps        gap to pricing: 48+48=96 ✓
  5:  { pT: 48, pB: 48 },  // pricing-table        gap to testimonials: 48+48=96 ✓
  6:  { pT: 48, pB: 48 },  // testimonials         gap to blog: 48+48=96 ✓
  7:  { pT: 48, pB: 40 },  // blog                 gap to faq: 40+40=80 ✓
  8:  { pT: 0,  pB: 0  },  // empty
  9:  { pT: 40, pB: 48 },  // faq-accordion        gap to CTA: 48+64=112 ✓
  10: { pT: 64, pB: 0  },  // CTA hero
  11: { pT: 16, pB: 40 },  // text-block (security text, close to CTA)
  12: { pT: 0,  pB: 0  },  // empty
};

async function main() {
  const homePage = await prisma.landingPage.findFirst({ where: { slug: "home" } });
  if (!homePage) throw new Error("Home page not found");

  const block = await prisma.landingPageBlock.findFirst({
    where: { landingPageId: homePage.id, type: "widget-page-sections" },
  });
  if (!block) throw new Error("widget-page-sections block not found");

  const sections = block.settings;
  if (!Array.isArray(sections)) throw new Error("Not an array");

  const updated = sections.map((section, si) => {
    const pad = PADDING[si];
    if (!pad) return section;
    const s = { ...(section.settings || {}), paddingTop: pad.pT, paddingBottom: pad.pB };
    const widgets = (section.columns||[]).flatMap(c=>(c.widgets||[]).map(w=>w.type));
    console.log(`[${si}] ${widgets[0]||'empty'} | pT:${pad.pT} pB:${pad.pB}`);
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
