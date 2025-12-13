import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists
    const existing = await prisma.blogCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating blog category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
