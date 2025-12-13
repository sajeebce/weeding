import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET active FAQs for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ sortOrder: "asc" }],
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
      },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
