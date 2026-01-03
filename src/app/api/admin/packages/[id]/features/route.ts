import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET - Get all feature mappings for a package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: packageId } = await params;

    const mappings = await prisma.packageFeatureMap.findMany({
      where: { packageId },
      include: {
        feature: true,
      },
      orderBy: {
        feature: {
          sortOrder: "asc",
        },
      },
    });

    return NextResponse.json({ mappings });
  } catch (error) {
    console.error("Error fetching package features:", error);
    return NextResponse.json(
      { error: "Failed to fetch package features" },
      { status: 500 }
    );
  }
}

// POST - Toggle or update a feature mapping
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: packageId } = await params;
    const body = await request.json();

    const { featureId, included, customValue } = body;

    if (!featureId) {
      return NextResponse.json(
        { error: "featureId is required" },
        { status: 400 }
      );
    }

    // Upsert the mapping
    const mapping = await prisma.packageFeatureMap.upsert({
      where: {
        packageId_featureId: {
          packageId,
          featureId,
        },
      },
      create: {
        packageId,
        featureId,
        included: included ?? true,
        customValue: customValue || null,
      },
      update: {
        included: included ?? true,
        customValue: customValue || null,
      },
    });

    return NextResponse.json(mapping);
  } catch (error) {
    console.error("Error updating package feature:", error);
    return NextResponse.json(
      { error: "Failed to update package feature" },
      { status: 500 }
    );
  }
}

// PUT - Bulk update feature mappings for a package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id: packageId } = await params;
    const body = await request.json();

    const { mappings } = body;

    if (!Array.isArray(mappings)) {
      return NextResponse.json(
        { error: "mappings array is required" },
        { status: 400 }
      );
    }

    // Update all mappings in a transaction
    await prisma.$transaction(
      mappings.map(
        ({
          featureId,
          included,
          customValue,
        }: {
          featureId: string;
          included: boolean;
          customValue?: string;
        }) =>
          prisma.packageFeatureMap.upsert({
            where: {
              packageId_featureId: {
                packageId,
                featureId,
              },
            },
            create: {
              packageId,
              featureId,
              included,
              customValue: customValue || null,
            },
            update: {
              included,
              customValue: customValue || null,
            },
          })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error bulk updating package features:", error);
    return NextResponse.json(
      { error: "Failed to update package features" },
      { status: 500 }
    );
  }
}
