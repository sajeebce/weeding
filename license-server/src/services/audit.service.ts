import prisma from '@/lib/db';

interface CreateAuditLogInput {
  adminId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  async log(input: CreateAuditLogInput) {
    return prisma.auditLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        previousValue: input.previousValue,
        newValue: input.newValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async getByEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByAdmin(adminId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecent(limit = 100) {
    return prisma.auditLog.findMany({
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const auditService = new AuditService();

// Pre-defined audit actions
export const AuditActions = {
  LICENSE_CREATED: 'license.created',
  LICENSE_UPDATED: 'license.updated',
  LICENSE_DELETED: 'license.deleted',
  LICENSE_SUSPENDED: 'license.suspended',
  LICENSE_REVOKED: 'license.revoked',
  LICENSE_REACTIVATED: 'license.reactivated',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  ADMIN_LOGIN: 'admin.login',
  ADMIN_LOGOUT: 'admin.logout',
  SETTINGS_UPDATED: 'settings.updated',
} as const;
