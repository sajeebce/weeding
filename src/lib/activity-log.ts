import prisma from "@/lib/db";
import { headers } from "next/headers";

interface LogActivityParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an activity to the database
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    // Get IP address from headers
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ||
                      headersList.get("x-real-ip") ||
                      "unknown";

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata || null,
        ipAddress,
      },
    });
  } catch (error) {
    // Don't throw - logging should not break the main operation
    console.error("Failed to log activity:", error);
  }
}

// Pre-defined action types for consistency
export const ActivityActions = {
  // User actions
  USER_ROLE_CHANGED: "user.role_changed",
  USER_ENABLED: "user.enabled",
  USER_DISABLED: "user.disabled",
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",

  // Content actions
  SERVICE_CREATED: "service.created",
  SERVICE_UPDATED: "service.updated",
  SERVICE_DELETED: "service.deleted",
  BLOG_CREATED: "blog.created",
  BLOG_UPDATED: "blog.updated",
  BLOG_DELETED: "blog.deleted",

  // Ticket actions
  TICKET_STATUS_CHANGED: "ticket.status_changed",
  TICKET_ASSIGNED: "ticket.assigned",
  TICKET_REPLIED: "ticket.replied",
  TICKET_DELETED: "ticket.deleted",

  // Settings actions
  SETTINGS_UPDATED: "settings.updated",
} as const;

export type ActivityAction = typeof ActivityActions[keyof typeof ActivityActions];
