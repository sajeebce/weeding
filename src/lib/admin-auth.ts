import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { UserRole } from "@prisma/client";
import { Permission } from "@/lib/permissions";

type RoleCheck = UserRole | UserRole[];

interface AuthResult {
  error?: string;
  status?: number;
  session?: {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
    };
  };
}

// Cache for permissions (5 minute TTL)
const permissionCache = new Map<string, { permissions: string[]; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get permissions for a role from database (with caching)
 */
async function getRolePermissions(role: UserRole): Promise<string[]> {
  const now = Date.now();
  const cached = permissionCache.get(role);

  if (cached && cached.expires > now) {
    return cached.permissions;
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role },
    select: { permission: true },
  });

  const permissions = rolePermissions.map((rp) => rp.permission);
  permissionCache.set(role, { permissions, expires: now + CACHE_TTL });

  return permissions;
}

/**
 * Clear permission cache (call after updating permissions)
 */
export function clearPermissionCache(role?: UserRole): void {
  if (role) {
    permissionCache.delete(role);
  } else {
    permissionCache.clear();
  }
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const role = session.user.role as UserRole;

  // ADMIN always has all permissions
  if (role === "ADMIN") {
    return { session: session as AuthResult["session"] };
  }

  // Check database permissions
  const permissions = await getRolePermissions(role);
  if (!permissions.includes(permission)) {
    return { error: "Forbidden - insufficient permissions", status: 403 };
  }

  return { session: session as AuthResult["session"] };
}

/**
 * Check if user has any of the specified permissions
 */
export async function checkAnyPermission(requiredPermissions: Permission[]): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const role = session.user.role as UserRole;

  // ADMIN always has all permissions
  if (role === "ADMIN") {
    return { session: session as AuthResult["session"] };
  }

  // Check database permissions
  const permissions = await getRolePermissions(role);
  const hasPermission = requiredPermissions.some((p) => permissions.includes(p));

  if (!hasPermission) {
    return { error: "Forbidden - insufficient permissions", status: 403 };
  }

  return { session: session as AuthResult["session"] };
}

/**
 * Check if user has admin access (any staff role)
 * Allowed: ADMIN, SUPPORT_AGENT, SALES_AGENT, CONTENT_MANAGER
 */
export async function checkAdminAccess(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles: UserRole[] = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT", "CONTENT_MANAGER"];
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session: session as AuthResult["session"] };
}

/**
 * Check if user has specific role(s)
 * @param roles - Single role or array of allowed roles
 */
export async function checkRole(roles: RoleCheck): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session: session as AuthResult["session"] };
}

/**
 * Check if user is ADMIN only
 */
export async function checkAdminOnly(): Promise<AuthResult> {
  return checkRole("ADMIN");
}

/**
 * Check if user can manage content (via permission or role)
 */
export async function checkContentAccess(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const role = session.user.role as UserRole;

  // ADMIN always has access
  if (role === "ADMIN") {
    return { session: session as AuthResult["session"] };
  }

  // Check for content permissions
  const permissions = await getRolePermissions(role);
  const contentPermissions = ["blog.view", "blog.create", "blog.edit", "services.view", "services.create", "services.edit"];
  const hasContentAccess = contentPermissions.some((p) => permissions.includes(p));

  if (!hasContentAccess) {
    return { error: "Forbidden", status: 403 };
  }

  return { session: session as AuthResult["session"] };
}

/**
 * Check if user can manage support (via permission or role)
 */
export async function checkSupportAccess(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const role = session.user.role as UserRole;

  // ADMIN always has access
  if (role === "ADMIN") {
    return { session: session as AuthResult["session"] };
  }

  // Check for support permissions
  const permissions = await getRolePermissions(role);
  const supportPermissions = ["tickets.view", "tickets.reply", "tickets.assign"];
  const hasSupportAccess = supportPermissions.some((p) => permissions.includes(p));

  if (!hasSupportAccess) {
    return { error: "Forbidden", status: 403 };
  }

  return { session: session as AuthResult["session"] };
}

/**
 * Helper to create error response from auth check
 */
export function authError(result: AuthResult): NextResponse {
  return NextResponse.json(
    { error: result.error },
    { status: result.status }
  );
}

/**
 * Wrapper function for route handlers with auth check
 */
export function withAuth<T>(
  handler: (session: NonNullable<AuthResult["session"]>) => Promise<T>,
  accessCheck: () => Promise<AuthResult> = checkAdminAccess
) {
  return async () => {
    const result = await accessCheck();
    if ("error" in result) {
      return authError(result);
    }
    return handler(result.session!);
  };
}
