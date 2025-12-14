import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET - Get a single canned response
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id } = await params;

    const response = await prisma.cannedResponse.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { error: "Canned response not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching canned response:", error);
    return NextResponse.json(
      { error: "Failed to fetch canned response" },
      { status: 500 }
    );
  }
}

// PUT - Update a canned response
const updateResponseSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;
    const { id } = await params;

    // Check if response exists and user has permission
    const existing = await prisma.cannedResponse.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Canned response not found" },
        { status: 404 }
      );
    }

    // Only creator or admin can update
    if (
      existing.createdById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only edit your own canned responses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateResponseSchema.parse(body);

    const response = await prisma.cannedResponse.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating canned response:", error);
    return NextResponse.json(
      { error: "Failed to update canned response" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a canned response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;
    const { id } = await params;

    // Check if response exists
    const existing = await prisma.cannedResponse.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Canned response not found" },
        { status: 404 }
      );
    }

    // Only creator or admin can delete
    if (
      existing.createdById !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You can only delete your own canned responses" },
        { status: 403 }
      );
    }

    await prisma.cannedResponse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting canned response:", error);
    return NextResponse.json(
      { error: "Failed to delete canned response" },
      { status: 500 }
    );
  }
}

// PATCH - Increment use count (when response is used)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id } = await params;

    const response = await prisma.cannedResponse.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error incrementing use count:", error);
    return NextResponse.json(
      { error: "Failed to increment use count" },
      { status: 500 }
    );
  }
}
