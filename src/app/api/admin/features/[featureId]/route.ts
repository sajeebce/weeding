import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET - Get a single feature
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ featureId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { featureId } = await params;

    const feature = await prisma.serviceFeature.findUnique({
      where: { id: featureId },
      include: {
        packageMappings: {
          include: {
            package: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature" },
      { status: 500 }
    );
  }
}

// PUT - Update a feature
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ featureId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { featureId } = await params;
    const body = await request.json();

    const { text, description, tooltip } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Feature text is required" },
        { status: 400 }
      );
    }

    const feature = await prisma.serviceFeature.update({
      where: { id: featureId },
      data: {
        text: text.trim(),
        description: description?.trim() || null,
        tooltip: tooltip?.trim() || null,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a feature
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ featureId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { featureId } = await params;

    // This will also delete related PackageFeatureMap entries due to cascade
    await prisma.serviceFeature.delete({
      where: { id: featureId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { error: "Failed to delete feature" },
      { status: 500 }
    );
  }
}
