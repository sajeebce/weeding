import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all global FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const faqs = await prisma.fAQ.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
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

// POST create new global FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const faq = await prisma.fAQ.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category || null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
