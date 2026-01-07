import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { blockRegistry } from "@/lib/landing-blocks/registry";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET all blocks for a landing page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const blocks = await prisma.landingPageBlock.findMany({
      where: { landingPageId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}

// POST add new block to landing page
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify landing page exists
    const page = await prisma.landingPage.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    // Get default settings if not provided
    let settings = body.settings;
    if (!settings && body.type) {
      settings = blockRegistry.getDefaultSettings(body.type) || {};
    }

    // Get the next sort order
    const lastBlock = await prisma.landingPageBlock.findFirst({
      where: { landingPageId: id },
      orderBy: { sortOrder: "desc" },
    });

    const sortOrder = body.sortOrder ?? (lastBlock ? lastBlock.sortOrder + 1 : 0);

    // If inserting at a specific position, shift other blocks
    if (body.sortOrder !== undefined) {
      await prisma.landingPageBlock.updateMany({
        where: {
          landingPageId: id,
          sortOrder: { gte: body.sortOrder },
        },
        data: {
          sortOrder: { increment: 1 },
        },
      });
    }

    const block = await prisma.landingPageBlock.create({
      data: {
        landingPageId: id,
        type: body.type,
        name: body.name || null,
        sortOrder,
        isActive: body.isActive ?? true,
        settings: settings,
        hideOnMobile: body.hideOnMobile ?? false,
        hideOnDesktop: body.hideOnDesktop ?? false,
        variant: body.variant || null,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 }
    );
  }
}
