import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkContentAccess, authError } from "@/lib/admin-auth";

// PATCH /api/admin/services/[id]/toggle - Toggle service active status
export async function PATCH(
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
      select: { isActive: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error toggling service:", error);
    return NextResponse.json(
      { error: "Failed to toggle service status" },
      { status: 500 }
    );
  }
}
