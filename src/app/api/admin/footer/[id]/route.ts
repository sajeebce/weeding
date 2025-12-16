import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// GET /api/admin/footer/[id] - Get specific footer config
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

    const footer = await prisma.footerConfig.findUnique({
      where: { id },
      include: {
        widgets: {
          orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
          include: {
            menuItems: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!footer) {
      return NextResponse.json(
        { error: "Footer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...footer,
      bottomLinks: footer.bottomLinks ? JSON.parse(footer.bottomLinks as string) : [],
      trustBadges: footer.trustBadges ? JSON.parse(footer.trustBadges as string) : [],
      widgets: footer.widgets.map((w) => ({
        ...w,
        content: w.content ? JSON.parse(w.content as string) : null,
      })),
    });
  } catch (error) {
    console.error("Error fetching footer:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/footer/[id] - Delete footer config
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

    // Check if this is the only footer
    const footerCount = await prisma.footerConfig.count();
    if (footerCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete the only footer configuration" },
        { status: 400 }
      );
    }

    // Check if trying to delete active footer
    const footer = await prisma.footerConfig.findUnique({
      where: { id },
    });

    if (footer?.isActive) {
      return NextResponse.json(
        { error: "Cannot delete active footer. Set another footer as active first." },
        { status: 400 }
      );
    }

    await prisma.footerConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footer:", error);
    return NextResponse.json(
      { error: "Failed to delete footer" },
      { status: 500 }
    );
  }
}
