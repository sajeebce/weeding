import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for footer widgets
const widgetSchema = z.object({
  footerId: z.string(),
  type: z.enum([
    "BRAND",
    "LINKS",
    "CONTACT",
    "NEWSLETTER",
    "SOCIAL",
    "TEXT",
    "RECENT_POSTS",
    "SERVICES",
    "STATES",
    "CUSTOM_HTML",
  ]),
  title: z.string().optional().nullable(),
  showTitle: z.boolean().default(true),
  content: z.any().optional(),
  column: z.number().min(1).max(6).default(1),
  sortOrder: z.number().default(0),
  customClass: z.string().optional(),
});

// GET /api/admin/footer/widgets - Get all widgets for a footer
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const searchParams = request.nextUrl.searchParams;
    const footerId = searchParams.get("footerId");

    if (!footerId) {
      return NextResponse.json(
        { error: "Footer ID is required" },
        { status: 400 }
      );
    }

    const widgets = await prisma.footerWidget.findMany({
      where: { footerId },
      orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
      include: {
        menuItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      widgets: widgets.map((w) => ({
        ...w,
        content: w.content ? JSON.parse(w.content as string) : null,
      })),
      total: widgets.length,
    });
  } catch (error) {
    console.error("Error fetching widgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch widgets" },
      { status: 500 }
    );
  }
}

// POST /api/admin/footer/widgets - Create new widget
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { menuItems, ...restBody } = body;
    const validatedData = widgetSchema.parse(restBody);
    const { content, ...widgetData } = validatedData;

    // Get the max sortOrder for this column
    const maxSortOrder = await prisma.footerWidget.aggregate({
      where: {
        footerId: validatedData.footerId,
        column: validatedData.column,
      },
      _max: { sortOrder: true },
    });

    const widget = await prisma.footerWidget.create({
      data: {
        ...widgetData,
        content: content ? JSON.stringify(content) : Prisma.DbNull,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
        // Create menu items if provided (for LINKS widget)
        ...(menuItems && menuItems.length > 0 && {
          menuItems: {
            create: menuItems.map((item: { label: string; url: string; target: string; sortOrder: number; isVisible: boolean }) => ({
              label: item.label,
              url: item.url,
              target: item.target || "_self",
              sortOrder: item.sortOrder,
              isVisible: item.isVisible ?? true,
            })),
          },
        }),
      },
      include: {
        menuItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        ...widget,
        content: widget.content ? JSON.parse(widget.content as string) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating widget:", error);
    return NextResponse.json(
      { error: "Failed to create widget" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/footer/widgets - Update widget
export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { id, menuItems, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Widget ID is required" },
        { status: 400 }
      );
    }

    const validatedData = widgetSchema.partial().parse(data);
    const { content, ...widgetData } = validatedData;

    // If menuItems are provided, handle them in a transaction
    if (menuItems !== undefined) {
      const widget = await prisma.$transaction(async (tx) => {
        // Delete existing menu items
        await tx.footerWidgetLink.deleteMany({
          where: { widgetId: id },
        });

        // Update widget and create new menu items
        return tx.footerWidget.update({
          where: { id },
          data: {
            ...widgetData,
            ...(content !== undefined && { content: JSON.stringify(content) }),
            ...(menuItems && menuItems.length > 0 && {
              menuItems: {
                create: menuItems.map((item: { label: string; url: string; target: string; sortOrder: number; isVisible: boolean }) => ({
                  label: item.label,
                  url: item.url,
                  target: item.target || "_self",
                  sortOrder: item.sortOrder,
                  isVisible: item.isVisible ?? true,
                })),
              },
            }),
          },
          include: {
            menuItems: {
              orderBy: { sortOrder: "asc" },
            },
          },
        });
      });

      return NextResponse.json({
        ...widget,
        content: widget.content ? JSON.parse(widget.content as string) : null,
      });
    }

    // Simple update without menuItems
    const widget = await prisma.footerWidget.update({
      where: { id },
      data: {
        ...widgetData,
        ...(content !== undefined && { content: JSON.stringify(content) }),
      },
      include: {
        menuItems: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      ...widget,
      content: widget.content ? JSON.parse(widget.content as string) : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating widget:", error);
    return NextResponse.json(
      { error: "Failed to update widget" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/footer/widgets - Delete widget
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
        { error: "Widget ID is required" },
        { status: 400 }
      );
    }

    await prisma.footerWidget.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json(
      { error: "Failed to delete widget" },
      { status: 500 }
    );
  }
}
