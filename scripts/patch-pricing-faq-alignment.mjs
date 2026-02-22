import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    // Fix pricing widget layout (section 5)
    if (si === 5) {
      const cols = (section.columns || []).map(col => ({
        ...col,
        widgets: (col.widgets || []).map(widget => {
          if (widget.type !== "pricing-table") return widget;
          const cardStyle = { ...(widget.settings?.cardStyle || {}), layout: "standard" };
          console.log("Section 5 pricing-table: layout -> standard");
          return { ...widget, settings: { ...widget.settings, cardStyle } };
        }),
      }));
      return { ...section, columns: cols };
    }

    // Fix blog paddingBottom (section 7)
    if (si === 7) {
      const s = { ...(section.settings || {}), paddingBottom: 48 };
      console.log("Section 7 (blog) paddingBottom -> 48");
      return { ...section, settings: s };
    }

    // Fix FAQ paddingTop (section 9)
    if (si === 9) {
      const s = { ...(section.settings || {}), paddingTop: 48 };
      console.log("Section 9 (faq) paddingTop -> 48");
      return { ...section, settings: s };
    }

    return section;
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
