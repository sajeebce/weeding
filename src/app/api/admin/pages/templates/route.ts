import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { PageTemplateType } from "@prisma/client";

/**
 * GET - Get all active templates and available template types
 */
export async function GET() {
  try {
    // Get all pages that are assigned as templates
    const assignedTemplates = await prisma.landingPage.findMany({
      where: {
        templateType: { not: null },
        isTemplateActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        templateType: true,
        isTemplateActive: true,
        updatedAt: true,
      },
    });

    // Create a map of template type to assigned page
    const templateMap: Record<string, typeof assignedTemplates[0] | null> = {};
    const allTypes = Object.values(PageTemplateType);

    // Initialize all types as unassigned
    allTypes.forEach((type) => {
      templateMap[type] = null;
    });

    // Fill in assigned templates
    assignedTemplates.forEach((template) => {
      if (template.templateType) {
        templateMap[template.templateType] = template;
      }
    });

    // Format response
    const templates = allTypes.map((type) => ({
      type,
      label: formatTemplateLabel(type),
      description: getTemplateDescription(type),
      assignedPage: templateMap[type],
      isAssigned: templateMap[type] !== null,
    }));

    return NextResponse.json({
      templates,
      assignedCount: assignedTemplates.length,
      totalTypes: allTypes.length,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * Format template type to human-readable label
 */
function formatTemplateLabel(type: PageTemplateType): string {
  const labels: Record<PageTemplateType, string> = {
    HOME: "Homepage",
    SERVICE_DETAILS: "Service Details",
    SERVICES_LIST: "Services List",
    BLOG_POST: "Blog Post",
    BLOG_LIST: "Blog List",
    ABOUT: "About Page",
    CONTACT: "Contact Page",
    CHECKOUT: "Checkout",
    CUSTOM: "Custom Page",
  };
  return labels[type] || type;
}

/**
 * Get description for each template type
 */
function getTemplateDescription(type: PageTemplateType): string {
  const descriptions: Record<PageTemplateType, string> = {
    HOME: "Main homepage displayed at the root URL (/)",
    SERVICE_DETAILS: "Template for individual service pages (/services/[slug])",
    SERVICES_LIST: "Services listing page (/services)",
    BLOG_POST: "Template for individual blog posts (/blog/[slug])",
    BLOG_LIST: "Blog listing page (/blog)",
    ABOUT: "About page (/about)",
    CONTACT: "Contact page (/contact)",
    CHECKOUT: "Checkout pages (/checkout/*)",
    CUSTOM: "Custom standalone pages with custom URLs",
  };
  return descriptions[type] || "";
}
