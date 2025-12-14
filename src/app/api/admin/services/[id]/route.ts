import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkContentAccess, checkAdminOnly, authError } from "@/lib/admin-auth";

// Validation schema for updating services
const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  shortDesc: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  startingPrice: z.number().min(0).optional(),
  processingTime: z.string().optional().nullable(),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
});

// GET /api/admin/services/[id] - Get single service for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        features: { orderBy: { sortOrder: "asc" } },
        packages: {
          orderBy: { sortOrder: "asc" },
          include: {
            features: { orderBy: { sortOrder: "asc" } },
            notIncluded: { orderBy: { sortOrder: "asc" } },
          },
        },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Transform for frontend
    const transformedService = {
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDesc: service.shortDesc,
      description: service.description,
      icon: service.icon,
      image: service.image,
      startingPrice: Number(service.startingPrice),
      processingTime: service.processingTime,
      isPopular: service.isPopular,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      categoryId: service.categoryId,
      metaTitle: service.metaTitle,
      metaDescription: service.metaDescription,
      category: service.category,
      features: service.features.map((f) => ({ id: f.id, text: f.text })),
      packages: service.packages.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.priceUSD),
        priceBDT: p.priceBDT ? Number(p.priceBDT) : null,
        isPopular: p.isPopular,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        features: p.features.map((f) => ({ id: f.id, text: f.text })),
        notIncluded: p.notIncluded.map((n) => ({ id: n.id, text: n.text })),
      })),
      faqs: service.faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        sortOrder: f.sortOrder,
      })),
    };

    return NextResponse.json(transformedService);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);
    const { features, ...serviceData } = validatedData;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if new slug conflicts with another service
    if (serviceData.slug && serviceData.slug !== existingService.slug) {
      const slugConflict = await prisma.service.findUnique({
        where: { slug: serviceData.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A service with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update service
    const updateData: Record<string, unknown> = { ...serviceData };

    // If features are provided, replace them
    if (features !== undefined) {
      // Delete existing features
      await prisma.serviceFeature.deleteMany({
        where: { serviceId: id },
      });

      // Create new features
      await prisma.serviceFeature.createMany({
        data: features.map((text, index) => ({
          serviceId: id,
          text,
          sortOrder: index,
        })),
      });
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        features: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/services/[id] - Delete service (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Check if service has orders
    if (existingService.orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with existing orders. Deactivate it instead." },
        { status: 400 }
      );
    }

    // Delete service (cascades to features, packages, FAQs)
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
