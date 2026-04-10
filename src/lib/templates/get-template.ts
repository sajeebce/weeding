import prisma from "@/lib/db";
import type { PageTemplateType } from "@prisma/client";
import type { Section } from "@/lib/page-builder/types";

interface TemplateData {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

/**
 * Get the active template for a specific page type
 */
export async function getActiveTemplate(
  templateType: PageTemplateType
): Promise<TemplateData | null> {
  try {
    const page = await prisma.landingPage.findFirst({
      where: {
        templateType,
        isTemplateActive: true,
        isActive: true,
      },
      include: {
        blocks: {
          where: {
            type: "widget-page-sections",
            isActive: true,
          },
        },
      },
    });

    if (!page) {
      return null;
    }

    // Extract sections from widget-page-sections block
    const widgetBlock = page.blocks.find((b) => b.type === "widget-page-sections");
    const sections = Array.isArray(widgetBlock?.settings)
      ? (widgetBlock.settings as unknown as Section[])
      : [];

    // Only return if there are sections
    if (sections.length === 0) {
      return null;
    }

    return {
      id: page.id,
      name: page.name,
      slug: page.slug,
      sections,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
    };
  } catch (error) {
    console.error(`Error fetching ${templateType} template:`, error);
    return null;
  }
}

/**
 * Get a page by slug
 */
async function getTemplateBySlug(slug: string): Promise<TemplateData | null> {
  try {
    const page = await prisma.landingPage.findFirst({
      where: { slug, isActive: true },
      include: {
        blocks: {
          where: { type: "widget-page-sections", isActive: true },
        },
      },
    });

    if (!page) return null;

    const widgetBlock = page.blocks.find((b) => b.type === "widget-page-sections");
    const sections = Array.isArray(widgetBlock?.settings)
      ? (widgetBlock.settings as unknown as Section[])
      : [];

    if (sections.length === 0) return null;

    return {
      id: page.id,
      name: page.name,
      slug: page.slug,
      sections,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
    };
  } catch {
    return null;
  }
}

/**
 * Get the HOME template — falls back to the "home" slug if no template is assigned
 */
export async function getHomeTemplate(): Promise<TemplateData | null> {
  return (await getActiveTemplate("HOME")) ?? (await getTemplateBySlug("home"));
}

/**
 * Get the SERVICE_DETAILS template
 */
export async function getServiceDetailsTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("SERVICE_DETAILS");
}

/**
 * Get the SERVICES_LIST template
 */
export async function getServicesListTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("SERVICES_LIST");
}

/**
 * Get the BLOG_POST template
 */
export async function getBlogPostTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("BLOG_POST");
}

/**
 * Get the BLOG_LIST template
 */
export async function getBlogListTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("BLOG_LIST");
}

/**
 * Get the ABOUT template
 */
export async function getAboutTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("ABOUT");
}

/**
 * Get the CONTACT template
 */
export async function getContactTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("CONTACT");
}

/**
 * Get the FAQ template
 */
export async function getFaqTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("FAQ");
}

/**
 * Get the PRICING template
 */
export async function getPricingTemplate(): Promise<TemplateData | null> {
  return getActiveTemplate("PRICING");
}

/**
 * Check if a template exists for a page type
 */
export async function hasTemplate(templateType: PageTemplateType): Promise<boolean> {
  const template = await getActiveTemplate(templateType);
  return template !== null;
}
