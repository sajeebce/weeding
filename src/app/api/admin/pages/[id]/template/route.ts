import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { PageTemplateType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT - Assign or unassign a page as a template for a page type
 *
 * Body:
 * - templateType: PageTemplateType | null - The template type to assign, or null to unassign
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { templateType } = body;

    // Check if page exists
    const page = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // If unassigning (templateType is null)
    if (templateType === null) {
      await prisma.landingPage.update({
        where: { id },
        data: {
          templateType: null,
          isTemplateActive: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Template unassigned successfully",
        page: {
          id: page.id,
          name: page.name,
          templateType: null,
          isTemplateActive: false,
        },
      });
    }

    // Validate templateType
    const validTypes = Object.values(PageTemplateType);
    if (!validTypes.includes(templateType)) {
      return NextResponse.json(
        { error: `Invalid template type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Find if there's an existing active template for this type
    const existingTemplate = await prisma.landingPage.findFirst({
      where: {
        templateType: templateType as PageTemplateType,
        isTemplateActive: true,
        id: { not: id }, // Exclude current page
      },
    });

    // Deactivate existing template if found
    let previousTemplate = null;
    if (existingTemplate) {
      await prisma.landingPage.update({
        where: { id: existingTemplate.id },
        data: { isTemplateActive: false },
      });
      previousTemplate = {
        id: existingTemplate.id,
        name: existingTemplate.name,
      };
    }

    // Assign the new template
    const updatedPage = await prisma.landingPage.update({
      where: { id },
      data: {
        templateType: templateType as PageTemplateType,
        isTemplateActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Page assigned as ${templateType} template`,
      previousTemplate,
      page: {
        id: updatedPage.id,
        name: updatedPage.name,
        templateType: updatedPage.templateType,
        isTemplateActive: updatedPage.isTemplateActive,
      },
    });
  } catch (error) {
    console.error("Error assigning template:", error);
    return NextResponse.json(
      { error: "Failed to assign template" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get the current template assignment status
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const page = await prisma.landingPage.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        templateType: true,
        isTemplateActive: true,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching template status:", error);
    return NextResponse.json(
      { error: "Failed to fetch template status" },
      { status: 500 }
    );
  }
}
