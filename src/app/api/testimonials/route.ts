import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET active testimonials for public display
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        company: true,
        country: true,
        avatar: true,
        content: true,
        rating: true,
      },
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
