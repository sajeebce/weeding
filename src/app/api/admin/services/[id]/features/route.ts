import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET - List all features for a service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: serviceId } = await params;

    const features = await prisma.serviceFeature.findMany({
      where: { serviceId },
      orderBy: { sortOrder: "asc" },
      include: {
        packageMappings: {
          select: {
            packageId: true,
            included: true,
            customValue: true,
          },
        },
      },
    });

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// POST - Create a new feature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: serviceId } = await params;
    const body = await request.json();

    const { text, description, tooltip } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Feature text is required" },
        { status: 400 }
      );
    }

    // Get max sortOrder
    const maxOrder = await prisma.serviceFeature.findFirst({
      where: { serviceId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const feature = await prisma.serviceFeature.create({
      data: {
        text: text.trim(),
        description: description?.trim() || null,
        tooltip: tooltip?.trim() || null,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        serviceId,
      },
    });

    // Create PackageFeatureMap entries for all packages of this service
    const packages = await prisma.package.findMany({
      where: { serviceId },
      select: { id: true },
    });

    if (packages.length > 0) {
      await prisma.packageFeatureMap.createMany({
        data: packages.map((pkg) => ({
          packageId: pkg.id,
          featureId: feature.id,
          included: false, // New features default to not included
        })),
      });
    }

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}

// PUT - Update feature order (bulk)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { featureOrders } = body;

    if (!Array.isArray(featureOrders)) {
      return NextResponse.json(
        { error: "featureOrders array is required" },
        { status: 400 }
      );
    }

    // Update each feature's sortOrder
    await Promise.all(
      featureOrders.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        prisma.serviceFeature.update({
          where: { id },
          data: { sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating feature order:", error);
    return NextResponse.json(
      { error: "Failed to update feature order" },
      { status: 500 }
    );
  }
}
