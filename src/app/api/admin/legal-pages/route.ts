import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - List all legal pages
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await prisma.legalPage.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching legal pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal pages" },
      { status: 500 }
    );
  }
}

// POST - Create a new legal page
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, content, metaTitle, metaDescription, isActive } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.legalPage.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    const page = await prisma.legalPage.create({
      data: {
        slug,
        title,
        content,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || "",
        isActive: isActive ?? true,
        lastUpdatedBy: session.user.id,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating legal page:", error);
    return NextResponse.json(
      { error: "Failed to create legal page" },
      { status: 500 }
    );
  }
}
