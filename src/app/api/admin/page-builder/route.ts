import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const HOMEPAGE_SLUG = "homepage";
const WIDGET_BLOCK_TYPE = "widget-page-sections";

/**
 * GET - Load widget page builder data
 * Returns the sections array for the homepage
 */
export async function GET() {
  try {
    // Find or create the homepage landing page
    let page = await prisma.landingPage.findUnique({
      where: { slug: HOMEPAGE_SLUG },
      include: {
        blocks: {
          where: { type: WIDGET_BLOCK_TYPE },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!page) {
      // Create default homepage if it doesn't exist
      page = await prisma.landingPage.create({
        data: {
          slug: HOMEPAGE_SLUG,
          name: "Homepage",
          isActive: true,
          isDefault: true,
        },
        include: {
          blocks: true,
        },
      });
    }

    // Get the widget sections from the block
    const widgetBlock = page.blocks.find((b) => b.type === WIDGET_BLOCK_TYPE);
    const sections = widgetBlock?.settings || [];

    return NextResponse.json({
      pageId: page.id,
      sections,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error("Error loading page builder data:", error);
    return NextResponse.json(
      { error: "Failed to load page builder data" },
      { status: 500 }
    );
  }
}

/**
 * POST - Save widget page builder data
 * Saves the sections array to the homepage
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "Invalid sections data" },
        { status: 400 }
      );
    }

    // Find or create the homepage landing page
    let page = await prisma.landingPage.findUnique({
      where: { slug: HOMEPAGE_SLUG },
    });

    if (!page) {
      page = await prisma.landingPage.create({
        data: {
          slug: HOMEPAGE_SLUG,
          name: "Homepage",
          isActive: true,
          isDefault: true,
        },
      });
    }

    // Upsert the widget block with sections data
    const existingBlock = await prisma.landingPageBlock.findFirst({
      where: {
        landingPageId: page.id,
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
          landingPageId: page.id,
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
      where: { id: page.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      pageId: page.id,
      message: "Page saved successfully",
    });
  } catch (error) {
    console.error("Error saving page builder data:", error);
    return NextResponse.json(
      { error: "Failed to save page builder data" },
      { status: 500 }
    );
  }
}
