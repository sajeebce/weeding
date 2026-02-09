import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - Get a single page by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const page = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Get sections from widget-page-sections block
    const widgetBlock = page.blocks.find((b) => b.type === "widget-page-sections");
    const sections = Array.isArray(widgetBlock?.settings)
      ? widgetBlock.settings
      : [];

    return NextResponse.json({
      id: page.id,
      slug: page.slug,
      name: page.name,
      isActive: page.isActive,
      templateType: page.templateType,
      isTemplateActive: page.isTemplateActive,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
      sections,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      publishedAt: page.publishedAt,
      version: page.version,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a page
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, isActive, metaTitle, metaDescription, ogImage, sections } = body;

    // Check if page exists
    const existing = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.landingPage.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update the page
    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        slug: slug !== undefined ? slug : existing.slug,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        ogImage: ogImage !== undefined ? ogImage : existing.ogImage,
        updatedAt: new Date(),
      },
    });

    // Update sections if provided
    if (sections !== undefined && Array.isArray(sections)) {
      const widgetBlock = await prisma.landingPageBlock.findFirst({
        where: {
          landingPageId: id,
          type: "widget-page-sections",
        },
      });

      if (widgetBlock) {
        await prisma.landingPageBlock.update({
          where: { id: widgetBlock.id },
          data: { settings: sections },
        });
      } else {
        await prisma.landingPageBlock.create({
          data: {
            landingPageId: id,
            type: "widget-page-sections",
            name: "Widget Page Sections",
            sortOrder: 0,
            isActive: true,
            settings: sections,
          },
        });
      }
    }

    // Revalidate public pages so changes show immediately
    revalidatePath("/");
    if (page.slug) {
      revalidatePath(`/${page.slug}`);
    }
    if (existing.slug && existing.slug !== page.slug) {
      revalidatePath(`/${existing.slug}`);
    }

    return NextResponse.json({
      id: page.id,
      slug: page.slug,
      name: page.name,
      isActive: page.isActive,
      templateType: page.templateType,
      isTemplateActive: page.isTemplateActive,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a page
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Prevent deleting pages that are active templates
    if (page.isTemplateActive) {
      return NextResponse.json(
        { error: "Cannot delete a page that is assigned as an active template. Please unassign it first." },
        { status: 400 }
      );
    }

    // Delete the page (blocks will cascade delete)
    await prisma.landingPage.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
