import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// GET /api/admin/header/[id] - Get specific header config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    const header = await prisma.headerConfig.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!header) {
      return NextResponse.json(
        { error: "Header not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...header,
      ctaButtons: header.ctaButtons ? JSON.parse(header.ctaButtons as string) : [],
      topBarContent: header.topBarContent ? JSON.parse(header.topBarContent as string) : null,
    });
  } catch (error) {
    console.error("Error fetching header:", error);
    return NextResponse.json(
      { error: "Failed to fetch header" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/header/[id] - Delete header config
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    // Check if this is the only header
    const headerCount = await prisma.headerConfig.count();
    if (headerCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only header configuration" },
        { status: 400 }
      );
    }

    // Check if trying to delete active header
    const header = await prisma.headerConfig.findUnique({
      where: { id },
    });

    if (header?.isActive) {
      return NextResponse.json(
        { error: "Cannot delete active header. Set another header as active first." },
        { status: 400 }
      );
    }

    await prisma.headerConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting header:", error);
    return NextResponse.json(
      { error: "Failed to delete header" },
      { status: 500 }
    );
  }
}
