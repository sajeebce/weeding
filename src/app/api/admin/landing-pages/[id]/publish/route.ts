import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST publish landing page
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify landing page exists
    const existing = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        blocks: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    // Check if page has at least one block
    if (existing.blocks.length === 0) {
      return NextResponse.json(
        { error: "Cannot publish a page with no blocks" },
        { status: 400 }
      );
    }

    // Publish the page
    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        isActive: true,
        publishedAt: new Date(),
        version: existing.version + 1,
      },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error publishing landing page:", error);
    return NextResponse.json(
      { error: "Failed to publish landing page" },
      { status: 500 }
    );
  }
}

// DELETE unpublish landing page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verify landing page exists
    const existing = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    // Don't allow unpublishing the default page
    if (existing.isDefault) {
      return NextResponse.json(
        { error: "Cannot unpublish the default landing page" },
        { status: 400 }
      );
    }

    // Unpublish the page
    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        isActive: false,
        publishedAt: null,
      },
      include: {
        blocks: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error unpublishing landing page:", error);
    return NextResponse.json(
      { error: "Failed to unpublish landing page" },
      { status: 500 }
    );
  }
}
