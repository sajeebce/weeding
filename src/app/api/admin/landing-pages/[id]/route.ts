import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single landing page
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
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching landing page:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing page" },
      { status: 500 }
    );
  }
}

// PUT update landing page
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if page exists
    const existing = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    // If slug is changing, check for conflicts
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await prisma.landingPage.findUnique({
        where: { slug: body.slug },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: "A landing page with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If setting as default, unset other defaults
    if (body.isDefault && !existing.isDefault) {
      await prisma.landingPage.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        slug: body.slug ?? existing.slug,
        name: body.name ?? existing.name,
        isActive: body.isActive ?? existing.isActive,
        isDefault: body.isDefault ?? existing.isDefault,
        metaTitle: body.metaTitle !== undefined ? body.metaTitle : existing.metaTitle,
        metaDescription: body.metaDescription !== undefined ? body.metaDescription : existing.metaDescription,
        ogImage: body.ogImage !== undefined ? body.ogImage : existing.ogImage,
        publishedAt: body.publishedAt !== undefined ? body.publishedAt : existing.publishedAt,
        version: body.incrementVersion ? existing.version + 1 : existing.version,
      },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating landing page:", error);
    return NextResponse.json(
      { error: "Failed to update landing page" },
      { status: 500 }
    );
  }
}

// DELETE landing page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if page exists
    const existing = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    // Don't allow deleting the default page
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete the default landing page" },
        { status: 400 }
      );
    }

    // Delete the page (blocks will be cascade deleted)
    await prisma.landingPage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json(
      { error: "Failed to delete landing page" },
      { status: 500 }
    );
  }
}
