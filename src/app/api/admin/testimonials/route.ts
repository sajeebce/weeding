import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET all testimonials
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        company: body.company || null,
        country: body.country || null,
        avatar: body.avatar || null,
        content: body.content,
        rating: body.rating ?? 5,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
