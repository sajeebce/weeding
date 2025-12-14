import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { logActivity, ActivityActions } from "@/lib/activity-log";

// GET /api/admin/users/[id] - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        image: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            customerTickets: true,
            assignedTickets: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Validation schema for updating user
const updateUserSchema = z.object({
  role: z.enum(["CUSTOMER", "ADMIN", "CONTENT_MANAGER", "SALES_AGENT", "SUPPORT_AGENT"]).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
});

// PUT /api/admin/users/[id] - Update user role or status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }
    const { session } = accessCheck;

    const { id } = await params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true, isActive: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // SECURITY: Prevent admin from disabling themselves
    if (data.isActive === false && id === session?.user.id) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 }
      );
    }

    // SECURITY: Prevent admin from changing their own role (to prevent accidental lockout)
    if (data.role && id === session?.user.id && data.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log activity
    if (data.role && data.role !== existingUser.role) {
      await logActivity({
        userId: session!.user.id,
        action: ActivityActions.USER_ROLE_CHANGED,
        entity: "user",
        entityId: id,
        metadata: {
          targetEmail: existingUser.email,
          oldRole: existingUser.role,
          newRole: data.role,
        },
      });
    }

    if (data.isActive !== undefined && data.isActive !== existingUser.isActive) {
      await logActivity({
        userId: session!.user.id,
        action: data.isActive ? ActivityActions.USER_ENABLED : ActivityActions.USER_DISABLED,
        entity: "user",
        entityId: id,
        metadata: {
          targetEmail: existingUser.email,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
