import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get a public legal page by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const page = await prisma.legalPage.findUnique({
      where: { slug, isActive: true },
      select: {
        slug: true,
        title: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        updatedAt: true,
        version: true,
      },
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
