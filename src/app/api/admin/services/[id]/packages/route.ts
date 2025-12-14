import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkContentAccess, authError } from "@/lib/admin-auth";

const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceUSD: z.number().min(0),
  priceBDT: z.number().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  features: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
});

// POST /api/admin/services/[id]/packages - Add package to service
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: serviceId } = await params;
    const body = await request.json();
    const { features, notIncluded, ...packageData } = packageSchema.parse(body);

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Create package with features and notIncluded
    const pkg = await prisma.package.create({
      data: {
        ...packageData,
        serviceId,
        features: {
          create: features.map((text, index) => ({
            text,
            sortOrder: index,
          })),
        },
        notIncluded: {
          create: notIncluded.map((text, index) => ({
            text,
            sortOrder: index,
          })),
        },
      },
      include: {
        features: { orderBy: { sortOrder: "asc" } },
        notIncluded: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
