import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for menu items
const menuItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().optional().nullable(),
  target: z.enum(["_self", "_blank"]).default("_self"),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  headerId: z.string(),
  isMegaMenu: z.boolean().default(false),
  megaMenuColumns: z.number().default(4),
  isVisible: z.boolean().default(true),
  visibleOnMobile: z.boolean().default(true),
  badge: z.string().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  categoryIcon: z.string().optional().nullable(),
  categoryDesc: z.string().optional().nullable(),
  sortOrder: z.number().default(0),
});

// GET /api/admin/header/menu - Get all menu items for a header
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const searchParams = request.nextUrl.searchParams;
    const headerId = searchParams.get("headerId");

    if (!headerId) {
      return NextResponse.json(
        { error: "Header ID is required" },
        { status: 400 }
      );
    }

    // Get flat list of all menu items for easier manipulation
    const menuItems = await prisma.menuItem.findMany({
      where: { headerId },
      orderBy: { sortOrder: "asc" },
    });

    // Build hierarchical structure
    const buildTree = (items: typeof menuItems, parentId: string | null = null): typeof menuItems => {
      return items
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    const tree = buildTree(menuItems);

    return NextResponse.json({
      menuItems: tree,
      flatList: menuItems,
      total: menuItems.length,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/header/menu - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = menuItemSchema.parse(body);

    // Get the max sortOrder for the parent level
    const maxSortOrder = await prisma.menuItem.aggregate({
      where: {
        headerId: validatedData.headerId,
        parentId: validatedData.parentId || null,
      },
      _max: { sortOrder: true },
    });

    const menuItem = await prisma.menuItem.create({
      data: {
        ...validatedData,
        sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/header/menu - Update menu item
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
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    const validatedData = menuItemSchema.partial().parse(data);

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/header/menu - Delete menu item
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
        { error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    // Delete menu item (children will be deleted via cascade)
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
