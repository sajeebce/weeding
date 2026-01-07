import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST reorder blocks
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    if (!body.blockIds || !Array.isArray(body.blockIds)) {
      return NextResponse.json(
        { error: "blockIds array is required" },
        { status: 400 }
      );
    }

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

    // Update sort orders based on the new order
    const updates = body.blockIds.map((blockId: string, index: number) =>
      prisma.landingPageBlock.update({
        where: { id: blockId },
        data: { sortOrder: index },
      })
    );

    await prisma.$transaction(updates);

    // Fetch and return updated blocks
    const blocks = await prisma.landingPageBlock.findMany({
      where: { landingPageId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error reordering blocks:", error);
    return NextResponse.json(
      { error: "Failed to reorder blocks" },
      { status: 500 }
    );
  }
}
