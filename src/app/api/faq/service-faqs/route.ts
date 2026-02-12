import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/faq/service-faqs
 * Returns all service FAQs grouped by category → service
 * Public endpoint (no auth required) - used by FAQ widget
 */
export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            faqs: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                question: true,
                answer: true,
              },
            },
          },
        },
      },
    });

    // Filter to only categories/services that have FAQs
    const result = categories
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        categorySlug: cat.slug,
        services: cat.services
          .filter((s) => s.faqs.length > 0)
          .map((s) => ({
            serviceId: s.id,
            serviceName: s.name,
            serviceSlug: s.slug,
            faqs: s.faqs.map((f) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
            })),
          })),
      }))
      .filter((cat) => cat.services.length > 0);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching service FAQs:", error);
    return NextResponse.json([], { status: 200 });
  }
}
