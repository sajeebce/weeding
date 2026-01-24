import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { PageTemplateType } from "@prisma/client";

/**
 * GET - List all pages with template information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateType = searchParams.get("templateType") as PageTemplateType | null;
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};

    if (templateType) {
      where.templateType = templateType;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const pages = await prisma.landingPage.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });

    // Transform to include section count from widget-page-sections block
    const pagesWithInfo = await Promise.all(
      pages.map(async (page) => {
        const widgetBlock = await prisma.landingPageBlock.findFirst({
          where: {
            landingPageId: page.id,
            type: "widget-page-sections",
          },
          select: { settings: true },
        });

        const sections = Array.isArray(widgetBlock?.settings)
          ? widgetBlock.settings
          : [];

        return {
          id: page.id,
          slug: page.slug,
          name: page.name,
          isActive: page.isActive,
          templateType: page.templateType,
          isTemplateActive: page.isTemplateActive,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          sectionsCount: sections.length,
          blocksCount: page._count.blocks,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          publishedAt: page.publishedAt,
        };
      })
    );

    return NextResponse.json({
      pages: pagesWithInfo,
      total: pagesWithInfo.length,
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, templateType, metaTitle, metaDescription, ogImage } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Page name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const pageSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug already exists
    const existing = await prisma.landingPage.findUnique({
      where: { slug: pageSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    // Create the page
    const page = await prisma.landingPage.create({
      data: {
        slug: pageSlug,
        name,
        isActive: true,
        templateType: templateType || null,
        isTemplateActive: false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
      },
    });

    // Create default empty widget-page-sections block
    await prisma.landingPageBlock.create({
      data: {
        landingPageId: page.id,
        type: "widget-page-sections",
        name: "Widget Page Sections",
        sortOrder: 0,
        isActive: true,
        settings: [],
      },
    });

    return NextResponse.json(
      {
        id: page.id,
        slug: page.slug,
        name: page.name,
        isActive: page.isActive,
        templateType: page.templateType,
        isTemplateActive: page.isTemplateActive,
        sectionsCount: 0,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
