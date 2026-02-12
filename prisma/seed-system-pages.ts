import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// System pages that must always exist and cannot be deleted
const SYSTEM_PAGES = [
  {
    slug: "home",
    name: "Home",
    templateType: "HOME" as const,
    isTemplateActive: true,
  },
  {
    slug: "service",
    name: "Service Details",
    templateType: "SERVICE_DETAILS" as const,
    isTemplateActive: true,
  },
  {
    slug: "services",
    name: "Services List",
    templateType: "SERVICES_LIST" as const,
    isTemplateActive: true,
  },
  {
    slug: "blog-list",
    name: "Blog List",
    templateType: "BLOG_LIST" as const,
    isTemplateActive: true,
  },
  {
    slug: "about",
    name: "About",
    templateType: "ABOUT" as const,
    isTemplateActive: true,
  },
  {
    slug: "contact",
    name: "Contact",
    templateType: "CONTACT" as const,
    isTemplateActive: true,
  },
  {
    slug: "faq",
    name: "FAQ",
    templateType: "FAQ" as const,
    isTemplateActive: true,
  },
];

async function seedSystemPages() {
  console.log("Seeding system pages...");

  for (const page of SYSTEM_PAGES) {
    // Check if page with this slug already exists
    const existing = await prisma.landingPage.findUnique({
      where: { slug: page.slug },
    });

    if (existing) {
      // Mark as system if not already
      if (!existing.isSystem) {
        await prisma.landingPage.update({
          where: { id: existing.id },
          data: {
            isSystem: true,
            templateType: page.templateType,
            isTemplateActive: page.isTemplateActive,
          },
        });
        console.log(`  Updated "${page.name}" (/${page.slug}) → isSystem: true`);
      } else {
        console.log(`  "${page.name}" (/${page.slug}) already system page, skipping`);
      }
    } else {
      // Also check if another page is already assigned to this template type
      const existingTemplate = await prisma.landingPage.findFirst({
        where: {
          templateType: page.templateType,
          isTemplateActive: true,
        },
      });

      if (existingTemplate) {
        // Mark the existing template page as system instead
        await prisma.landingPage.update({
          where: { id: existingTemplate.id },
          data: { isSystem: true },
        });
        console.log(`  Existing template for ${page.templateType} ("${existingTemplate.name}") → isSystem: true`);
      } else {
        // Create new system page
        const created = await prisma.landingPage.create({
          data: {
            slug: page.slug,
            name: page.name,
            isActive: true,
            isSystem: true,
            templateType: page.templateType,
            isTemplateActive: page.isTemplateActive,
          },
        });

        // Create default empty widget-page-sections block
        await prisma.landingPageBlock.create({
          data: {
            landingPageId: created.id,
            type: "widget-page-sections",
            name: "Widget Page Sections",
            sortOrder: 0,
            isActive: true,
            settings: [],
          },
        });

        console.log(`  Created "${page.name}" (/${page.slug}) as system page`);
      }
    }
  }

  console.log("System pages seeding complete!");
}

seedSystemPages()
  .catch((e) => {
    console.error("Error seeding system pages:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
