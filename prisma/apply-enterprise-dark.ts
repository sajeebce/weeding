import { config } from "dotenv";
config(); // Load environment variables

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

// All widget types from Prisma schema
type FooterWidgetType =
  | "BRAND"
  | "LINKS"
  | "CONTACT"
  | "NEWSLETTER"
  | "SOCIAL"
  | "TEXT"
  | "RECENT_POSTS"
  | "SERVICES"
  | "STATES"
  | "CUSTOM_HTML"
  | "APP_DOWNLOAD"
  | "PAYMENT_METHODS"
  | "AWARDS"
  | "MAP"
  | "WORKING_HOURS"
  | "LANGUAGE_SELECT"
  | "THEME_TOGGLE"
  | "FEATURED_PRODUCT"
  | "TESTIMONIAL"
  | "COUNTDOWN"
  | "CTA_BANNER";

interface PresetWidget {
  type: FooterWidgetType;
  title: string;
  showTitle: boolean;
  column: number;
  sortOrder: number;
  content?: Record<string, unknown>;
  menuItems?: Array<{
    label: string;
    url: string;
    target?: string;
    icon?: string;
  }>;
}

async function applyEnterpriseDarkPreset() {
  console.log("🎨 Applying Enterprise Dark preset to active footer...");

  // Get the Enterprise Dark preset
  const preset = await prisma.footerPreset.findFirst({
    where: { name: "Enterprise Dark", isBuiltIn: true },
  });

  if (!preset) {
    console.error("❌ Enterprise Dark preset not found! Run seed-footer-presets.ts first.");
    return;
  }

  // Get the active footer
  const footer = await prisma.footerConfig.findFirst({
    where: { isActive: true },
    include: { widgets: true },
  });

  if (!footer) {
    console.error("❌ No active footer found!");
    return;
  }

  console.log(`  Found preset: ${preset.name}`);
  console.log(`  Found footer: ${footer.name} (${footer.id})`);

  // Extract config from preset
  const presetConfig = preset.config as Record<string, unknown>;
  const {
    widgets: presetWidgets,
    bottomLinks: presetBottomLinks,
    bgGradient: presetBgGradient,
    ...configToApply
  } = presetConfig;

  // Prepare data for update
  const updateData: Record<string, unknown> = {
    ...configToApply,
    presetId: preset.id,
  };

  // Handle JSON fields
  if (presetBottomLinks) {
    updateData.bottomLinks = JSON.stringify(presetBottomLinks);
  }
  if (presetBgGradient) {
    updateData.bgGradient = JSON.stringify(presetBgGradient);
  }

  // Update footer with preset config
  await prisma.footerConfig.update({
    where: { id: footer.id },
    data: updateData,
  });
  console.log("  ✓ Footer config updated");

  // Replace widgets from preset
  if (presetWidgets && Array.isArray(presetWidgets)) {
    // Delete existing widgets and their menu items
    const existingWidgets = await prisma.footerWidget.findMany({
      where: { footerId: footer.id },
      select: { id: true },
    });

    for (const widget of existingWidgets) {
      await prisma.menuItem.deleteMany({
        where: { footerWidgetId: widget.id },
      });
    }

    await prisma.footerWidget.deleteMany({
      where: { footerId: footer.id },
    });
    console.log("  ✓ Old widgets deleted");

    // Create new widgets from preset
    for (const widgetData of presetWidgets as PresetWidget[]) {
      const { menuItems, content, ...widgetFields } = widgetData;

      // Create the widget
      const newWidget = await prisma.footerWidget.create({
        data: {
          footerId: footer.id,
          type: widgetFields.type,
          title: widgetFields.title || null,
          showTitle: widgetFields.showTitle ?? true,
          column: widgetFields.column || 1,
          sortOrder: widgetFields.sortOrder || 0,
          content: content || undefined,
        },
      });

      // Create menu items if provided
      if (menuItems && Array.isArray(menuItems)) {
        for (let i = 0; i < menuItems.length; i++) {
          const item = menuItems[i];
          await prisma.menuItem.create({
            data: {
              footerWidgetId: newWidget.id,
              label: item.label,
              url: item.url,
              target: (item.target as "_self" | "_blank") || "_self",
              icon: item.icon || null,
              sortOrder: i,
              isVisible: true,
            },
          });
        }
      }
    }
    console.log(`  ✓ Created ${(presetWidgets as PresetWidget[]).length} widgets from preset`);
  }

  // Increment preset usage count
  await prisma.footerPreset.update({
    where: { id: preset.id },
    data: {
      usageCount: { increment: 1 },
    },
  });

  console.log("✅ Enterprise Dark preset applied successfully!");
}

// Run
applyEnterpriseDarkPreset()
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
