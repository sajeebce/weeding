import type { PrismaClient } from '@prisma/client';
import type {
  Notification,
  ServiceContext,
  ServiceResult,
  PaginationInput,
  PaginatedResult,
} from '../types';

export interface CreateNotificationInput {
  userId: string;
  type: 'NEW_TICKET' | 'NEW_MESSAGE' | 'TICKET_ASSIGNED' | 'TICKET_UPDATED' | 'MENTION' | 'CHAT_REQUEST';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a notification
   */
  async create(
    input: CreateNotificationInput,
    _context?: ServiceContext
  ): Promise<ServiceResult<Notification>> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type as any,
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: input.metadata || {},
        isRead: false,
      },
    });

    return { success: true, data: notification as unknown as Notification };
  }

  /**
   * Get notifications for a user
   */
  async getByUserId(
    userId: string,
    pagination: PaginationInput = {},
    _context?: ServiceContext
  ): Promise<PaginatedResult<Notification>> {
    const { page = 1, limit = 20, sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: data as unknown as Notification[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    };
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(
    userId: string,
    _context?: ServiceContext
  ): Promise<ServiceResult<number>> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { success: true, data: count };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    context?: ServiceContext
  ): Promise<ServiceResult<Notification>> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: 'Notification not found', code: 'NOT_FOUND' };
    }

    // Check access
    if (context?.userId && notification.userId !== context.userId) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, data: updated as unknown as Notification };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string,
    _context?: ServiceContext
  ): Promise<ServiceResult<void>> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Delete a notification
   */
  async delete(
    notificationId: string,
    context?: ServiceContext
  ): Promise<ServiceResult<void>> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: 'Notification not found', code: 'NOT_FOUND' };
    }

    // Check access
    if (context?.userId && notification.userId !== context.userId) {
      return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAll(
    userId: string,
    _context?: ServiceContext
  ): Promise<ServiceResult<void>> {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return { success: true };
  }

  /**
   * Create bulk notifications (e.g., for team announcements)
   */
  async createBulk(
    userIds: string[],
    input: Omit<CreateNotificationInput, 'userId'>,
    _context?: ServiceContext
  ): Promise<ServiceResult<number>> {
    const result = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: input.type as any,
        title: input.title,
        message: input.message,
        link: input.link,
        metadata: input.metadata || {},
        isRead: false,
      })),
    });

    return { success: true, data: result.count };
  }
}
