import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { PERMISSION_CATEGORIES, ROLE_LABELS, EDITABLE_ROLES } from "@/lib/permissions";

// GET /api/admin/permissions - Get all role permissions
export async function GET() {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    // Get all permissions from database
    const dbPermissions = await prisma.rolePermission.findMany({
      orderBy: [{ role: "asc" }, { permission: "asc" }],
    });

    // Group by role
    const permissionsByRole: Record<string, string[]> = {};
    for (const rp of dbPermissions) {
      if (!permissionsByRole[rp.role]) {
        permissionsByRole[rp.role] = [];
      }
      permissionsByRole[rp.role].push(rp.permission);
    }

    return NextResponse.json({
      permissionsByRole,
      categories: PERMISSION_CATEGORIES,
      roleLabels: ROLE_LABELS,
      editableRoles: EDITABLE_ROLES,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
