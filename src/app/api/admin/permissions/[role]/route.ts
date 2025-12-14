import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError, clearPermissionCache } from "@/lib/admin-auth";
import { ALL_PERMISSIONS, EDITABLE_ROLES } from "@/lib/permissions";
import { logActivity } from "@/lib/activity-log";
import { UserRole } from "@prisma/client";

const updatePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

// PUT /api/admin/permissions/[role] - Update permissions for a role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ role: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }
    const { session } = accessCheck;

    const { role } = await params;

    // Validate role
    if (!EDITABLE_ROLES.includes(role as typeof EDITABLE_ROLES[number])) {
      return NextResponse.json(
        { error: "Cannot edit permissions for this role" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { permissions } = updatePermissionsSchema.parse(body);

    // Validate all permissions are valid
    const invalidPermissions = permissions.filter(p => !ALL_PERMISSIONS.includes(p as typeof ALL_PERMISSIONS[number]));
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: "Invalid permissions", invalid: invalidPermissions },
        { status: 400 }
      );
    }

    // Get current permissions for comparison
    const currentPermissions = await prisma.rolePermission.findMany({
      where: { role: role as UserRole },
      select: { permission: true },
    });
    const currentPermissionSet = currentPermissions.map(p => p.permission);

    // Delete all existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { role: role as UserRole },
    });

    // Insert new permissions
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(permission => ({
          role: role as UserRole,
          permission,
        })),
      });
    }

    // Clear permission cache for this role
    clearPermissionCache(role as UserRole);

    // Log activity
    await logActivity({
      userId: session!.user.id,
      action: "permissions.updated",
      entity: "role",
      entityId: role,
      metadata: {
        role,
        added: permissions.filter(p => !currentPermissionSet.includes(p)),
        removed: currentPermissionSet.filter(p => !permissions.includes(p)),
        total: permissions.length,
      },
    });

    return NextResponse.json({
      success: true,
      role,
      permissions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating permissions:", error);
    return NextResponse.json(
      { error: "Failed to update permissions" },
      { status: 500 }
    );
  }
}
