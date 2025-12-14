import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkContentAccess, authError } from "@/lib/admin-auth";

// Validation schema for creating/updating services
const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDesc: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().optional(),
  image: z.string().optional(),
  startingPrice: z.number().min(0),
  processingTime: z.string().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  categoryId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  features: z.array(z.string()).default([]),
});

// GET /api/admin/services - List all services (including inactive)
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const includeInactive = searchParams.get("includeInactive") !== "false";

    const where = {
      ...(categoryId && { categoryId }),
      ...(!includeInactive && { isActive: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { shortDesc: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        packages: {
          select: { id: true, name: true, priceUSD: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { features: true, faqs: true, packages: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    const transformedServices = services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDesc: service.shortDesc,
      icon: service.icon,
      image: service.image,
      startingPrice: Number(service.startingPrice),
      isPopular: service.isPopular,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      category: service.category,
      packagesCount: service._count.packages,
      featuresCount: service._count.features,
      faqsCount: service._count.faqs,
      packages: service.packages.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.priceUSD),
      })),
    }));

    return NextResponse.json({
      services: transformedServices,
      total: transformedServices.length,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST /api/admin/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = serviceSchema.parse(body);
    const { features, ...serviceData } = validatedData;

    // Check if slug already exists
    const existingService = await prisma.service.findUnique({
      where: { slug: serviceData.slug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "A service with this slug already exists" },
        { status: 400 }
      );
    }

    // Create service with features
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        features: {
          create: features.map((text, index) => ({
            text,
            sortOrder: index,
          })),
        },
      },
      include: {
        category: true,
        features: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
