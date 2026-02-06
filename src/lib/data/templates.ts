// ============================================
// TEMPLATE DATA UTILITIES
// Functions for fetching Page Builder templates
// ============================================

import prisma from "@/lib/db";
import type { PageTemplateType } from "@prisma/client";
import type { Section } from "@/lib/page-builder/types";

// Block type used by the new Widget Page Builder to store sections
const WIDGET_BLOCK_TYPE = "widget-page-sections";

// ============================================
// GET ACTIVE TEMPLATE FOR TYPE
// ============================================

interface TemplateData {
  id: string;
  slug: string;
  name: string;
  templateType: PageTemplateType;
  sections: Section[];
  metaTitle: string | null;
  metaDescription: string | null;
}

/**
 * Gets the active template for a specific page type
 * Returns null if no active template is assigned
 */
export async function getActiveTemplateForType(
  type: PageTemplateType
): Promise<TemplateData | null> {
  try {
    const page = await prisma.landingPage.findFirst({
      where: {
        templateType: type,
        isTemplateActive: true,
        isActive: true,
      },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!page) {
      console.log("[Templates] No page found for type:", type);
      return null;
    }

    console.log("[Templates] Page found:", {
      id: page.id,
      name: page.name,
      templateType: page.templateType,
      isTemplateActive: page.isTemplateActive,
      blocksCount: page.blocks.length,
      blockTypes: page.blocks.map(b => b.type),
    });

    // Find the widget-page-sections block which contains the Section[] data
    const widgetSectionsBlock = page.blocks.find(
      (block) => block.type === WIDGET_BLOCK_TYPE
    );

    console.log("[Templates] Widget sections block:", widgetSectionsBlock ? {
      id: widgetSectionsBlock.id,
      type: widgetSectionsBlock.type,
      settingsType: typeof widgetSectionsBlock.settings,
      isArray: Array.isArray(widgetSectionsBlock.settings),
    } : null);

    // Get sections from the block settings (stored as JSON array)
    const sections: Section[] = Array.isArray(widgetSectionsBlock?.settings)
      ? (widgetSectionsBlock.settings as unknown as Section[])
      : [];

    console.log("[Templates] Sections extracted:", sections.length);

    return {
      id: page.id,
      slug: page.slug,
      name: page.name,
      templateType: type,
      sections,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
    };
  } catch (error) {
    console.error("Error fetching template:", error);
    return null;
  }
}

/**
 * Checks if a template exists for a specific page type
 */
export async function hasActiveTemplateForType(
  type: PageTemplateType
): Promise<boolean> {
  try {
    const count = await prisma.landingPage.count({
      where: {
        templateType: type,
        isTemplateActive: true,
        isActive: true,
      },
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking template:", error);
    return false;
  }
}
