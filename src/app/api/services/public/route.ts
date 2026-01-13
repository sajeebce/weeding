import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

// GET /api/services/public - Public endpoint for service card widget
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const sortBy = searchParams.get("sortBy") || "popular";
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const popularOnly = searchParams.get("popularOnly") === "true";
    const categoriesParam = searchParams.get("categories");
    const categories = categoriesParam
      ? categoriesParam.split(",").filter(Boolean)
      : [];

    // Build where clause
    const where: Prisma.ServiceWhereInput = {
      ...(activeOnly && { isActive: true }),
      ...(popularOnly && { isPopular: true }),
      ...(categories.length > 0 && {
        category: {
          id: { in: categories },
        },
      }),
    };

    // Build order by clause
    let orderBy: Prisma.ServiceOrderByWithRelationInput[];
    switch (sortBy) {
      case "popular":
        orderBy = [{ isPopular: "desc" }, { sortOrder: "asc" }, { name: "asc" }];
        break;
      case "price-asc":
        orderBy = [{ startingPrice: "asc" }, { name: "asc" }];
        break;
      case "price-desc":
        orderBy = [{ startingPrice: "desc" }, { name: "asc" }];
        break;
      case "name":
        orderBy = [{ name: "asc" }];
        break;
      case "newest":
        orderBy = [{ createdAt: "desc" }];
        break;
      case "sort-order":
      default:
        orderBy = [{ sortOrder: "asc" }, { name: "asc" }];
        break;
    }

    const services = await prisma.service.findMany({
      where,
      take: Math.min(limit, 50), // Cap at 50 for performance
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        features: {
          take: 4, // Limit features for card display
          orderBy: { sortOrder: "asc" },
          select: { id: true, text: true },
        },
      },
      orderBy,
    });

    // Transform for frontend
    const transformedServices = services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDesc: service.shortDesc,
      icon: service.icon,
      image: service.image,
      startingPrice: Number(service.startingPrice),
      processingTime: service.processingTime,
      isPopular: service.isPopular,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      category: service.category,
      features: service.features.map((f) => ({
        id: f.id,
        name: f.text,
      })),
    }));

    return NextResponse.json({
      services: transformedServices,
      total: transformedServices.length,
    });
  } catch (error) {
    console.error("Error fetching public services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
