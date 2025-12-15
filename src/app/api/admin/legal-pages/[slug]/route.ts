import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get a single legal page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = await prisma.legalPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching legal page:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal page" },
      { status: 500 }
    );
  }
}

// PUT - Update a legal page
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, metaTitle, metaDescription, isActive } = body;

    const existingPage = await prisma.legalPage.findUnique({
      where: { slug },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const page = await prisma.legalPage.update({
      where: { slug },
      data: {
        title: title ?? existingPage.title,
        content: content ?? existingPage.content,
        metaTitle: metaTitle ?? existingPage.metaTitle,
        metaDescription: metaDescription ?? existingPage.metaDescription,
        isActive: isActive ?? existingPage.isActive,
        version: existingPage.version + 1,
        lastUpdatedBy: session.user.id,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating legal page:", error);
    return NextResponse.json(
      { error: "Failed to update legal page" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a legal page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingPage = await prisma.legalPage.findUnique({
      where: { slug },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.legalPage.delete({ where: { slug } });

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting legal page:", error);
    return NextResponse.json(
      { error: "Failed to delete legal page" },
      { status: 500 }
    );
  }
}
