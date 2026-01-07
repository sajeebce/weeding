import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string; blockId: string }>;
}

// GET single block
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, blockId } = await params;

    const block = await prisma.landingPageBlock.findFirst({
      where: {
        id: blockId,
        landingPageId: id,
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(block);
  } catch (error) {
    console.error("Error fetching block:", error);
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 }
    );
  }
}

// PUT update block
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, blockId } = await params;
    const body = await request.json();

    // Verify block exists and belongs to the page
    const existing = await prisma.landingPageBlock.findFirst({
      where: {
        id: blockId,
        landingPageId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    const block = await prisma.landingPageBlock.update({
      where: { id: blockId },
      data: {
        type: body.type ?? existing.type,
        name: body.name !== undefined ? body.name : existing.name,
        sortOrder: body.sortOrder ?? existing.sortOrder,
        isActive: body.isActive ?? existing.isActive,
        settings: body.settings ?? existing.settings,
        hideOnMobile: body.hideOnMobile ?? existing.hideOnMobile,
        hideOnDesktop: body.hideOnDesktop ?? existing.hideOnDesktop,
        variant: body.variant !== undefined ? body.variant : existing.variant,
      },
    });

    return NextResponse.json(block);
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}

// DELETE block
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, blockId } = await params;

    // Verify block exists and belongs to the page
    const existing = await prisma.landingPageBlock.findFirst({
      where: {
        id: blockId,
        landingPageId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    // Delete the block
    await prisma.landingPageBlock.delete({
      where: { id: blockId },
    });

    // Re-order remaining blocks
    const remainingBlocks = await prisma.landingPageBlock.findMany({
      where: { landingPageId: id },
      orderBy: { sortOrder: "asc" },
    });

    // Update sort orders to be sequential
    for (let i = 0; i < remainingBlocks.length; i++) {
      if (remainingBlocks[i].sortOrder !== i) {
        await prisma.landingPageBlock.update({
          where: { id: remainingBlocks[i].id },
          data: { sortOrder: i },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json(
      { error: "Failed to delete block" },
      { status: 500 }
    );
  }
}
