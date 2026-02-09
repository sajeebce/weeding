import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const WIDGET_BLOCK_TYPE = "widget-page-sections";

/**
 * GET - Get page sections (widget-page-sections block settings)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Get the widget sections block
    const widgetBlock = await prisma.landingPageBlock.findFirst({
      where: {
        landingPageId: id,
        type: WIDGET_BLOCK_TYPE,
      },
    });

    const sections = Array.isArray(widgetBlock?.settings)
      ? widgetBlock.settings
      : [];

    return NextResponse.json({
      pageId: page.id,
      pageName: page.name,
      sections,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching page sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch page sections" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Save page sections (widget-page-sections block settings)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Invalid sections data - must be an array" },
        { status: 400 }
      );
    }

    // Debug: Log what the server received
    const totalWidgets = sections.reduce(
      (sum: number, s: { columns?: { widgets?: unknown[] }[] }) =>
        sum + (s.columns || []).reduce((cs: number, c) => cs + (c.widgets || []).length, 0),
      0
    );
    console.log("[Sections API] Saving:", {
      pageId: id,
      sectionCount: sections.length,
      totalWidgets,
    });

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

    // Find or create the widget sections block
    const existingBlock = await prisma.landingPageBlock.findFirst({
      where: {
        landingPageId: id,
        type: WIDGET_BLOCK_TYPE,
      },
    });

    if (existingBlock) {
      // Update existing block
      await prisma.landingPageBlock.update({
        where: { id: existingBlock.id },
        data: {
          settings: sections,
          isActive: true,
        },
      });
    } else {
      // Create new block
      await prisma.landingPageBlock.create({
        data: {
          landingPageId: id,
          type: WIDGET_BLOCK_TYPE,
          name: "Widget Page Sections",
          sortOrder: 0,
          isActive: true,
          settings: sections,
        },
      });
    }

    // Update the landing page timestamp
    await prisma.landingPage.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Revalidate the page's public URL so changes show immediately
    revalidatePath("/");
    if (page.slug) {
      revalidatePath(`/${page.slug}`);
    }

    return NextResponse.json({
      success: true,
      pageId: page.id,
      message: "Sections saved successfully",
    });
  } catch (error) {
    console.error("Error saving page sections:", error);
    return NextResponse.json(
      { error: "Failed to save page sections" },
      { status: 500 }
    );
  }
}
