import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for widget links (menu items)
const linkSchema = z.object({
  footerWidgetId: z.string(),
  label: z.string().min(1, "Label is required"),
  url: z.string().optional(),
  target: z.enum(["_self", "_blank"]).default("_self"),
  icon: z.string().optional(),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

// GET /api/admin/footer/widgets/links - Get all links for a widget
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const searchParams = request.nextUrl.searchParams;
    const widgetId = searchParams.get("widgetId");

    if (!widgetId) {
      return NextResponse.json(
        { error: "Widget ID is required" },
        { status: 400 }
      );
    }

    const links = await prisma.menuItem.findMany({
      where: { footerWidgetId: widgetId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      links,
      total: links.length,
    });
  } catch (error) {
    console.error("Error fetching widget links:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget links" },
      { status: 500 }
    );
  }
}

// POST /api/admin/footer/widgets/links - Create new link
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = linkSchema.parse(body);

    // Get the max sortOrder for this widget
    const maxSortOrder = await prisma.menuItem.aggregate({
      where: { footerWidgetId: validatedData.footerWidgetId },
      _max: { sortOrder: true },
    });

    const link = await prisma.menuItem.create({
      data: {
        ...validatedData,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating widget link:", error);
    return NextResponse.json(
      { error: "Failed to create widget link" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/footer/widgets/links - Update link
export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    const validatedData = linkSchema.partial().parse(data);

    const link = await prisma.menuItem.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(link);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating widget link:", error);
    return NextResponse.json(
      { error: "Failed to update widget link" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/footer/widgets/links - Delete link
export async function DELETE(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting widget link:", error);
    return NextResponse.json(
      { error: "Failed to delete widget link" },
      { status: 500 }
    );
  }
}
