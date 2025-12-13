import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check for circular reference
    if (parentId) {
      let currentParentId = parentId;
      while (currentParentId) {
        if (currentParentId === id) {
          return NextResponse.json(
            { error: "Cannot set category as its own parent or ancestor" },
            { status: 400 }
          );
        }
        const parent = await prisma.blogCategory.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        });
        currentParentId = parent?.parentId || null;
      }
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists (excluding current category)
    const existing = await prisma.blogCategory.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has posts
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true, children: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category._count.posts > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${category._count.posts} posts. Please reassign or delete the posts first.`,
        },
        { status: 400 }
      );
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${category._count.children} subcategories. Please delete or reassign subcategories first.`,
        },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
