import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all landing pages
export async function GET() {
  try {
    const pages = await prisma.landingPage.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { blocks: true },
        },
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing pages" },
      { status: 500 }
    );
  }
}

// POST create new landing page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if slug already exists
    const existing = await prisma.landingPage.findUnique({
      where: { slug: body.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A landing page with this slug already exists" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (body.isDefault) {
      await prisma.landingPage.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const page = await prisma.landingPage.create({
      data: {
        slug: body.slug,
        name: body.name,
        isActive: body.isActive ?? true,
        isDefault: body.isDefault ?? false,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        ogImage: body.ogImage || null,
      },
      include: {
        blocks: true,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating landing page:", error);
    return NextResponse.json(
      { error: "Failed to create landing page" },
      { status: 500 }
    );
  }
}
