import type { PrismaClient } from '@prisma/client';
import type {
  Message,
  CreateMessageInput,
  CreateInternalNoteInput,
  InternalNote,
  ServiceContext,
  ServiceResult,
  PaginationInput,
  PaginatedResult,
} from '../types';

export class MessageService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get messages for a ticket
   */
  async getByTicketId(
    ticketId: string,
    pagination: PaginationInput = {},
    context?: ServiceContext
  ): Promise<PaginatedResult<Message>> {
    const { page = 1, limit = 50, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * limit;

    // Verify ticket access
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { customerId: true },
    });

    if (!ticket) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false,
      };
    }

    // Check access
    if (context && !context.isAgent && !context.isAdmin) {
      if (ticket.customerId !== context.userId) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasMore: false,
        };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.supportMessage.findMany({
        where: { ticketId },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          sender: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          attachments: true,
        },
      }),
      this.prisma.supportMessage.count({ where: { ticketId } }),
    ]);

    return {
      data: data as unknown as Message[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    };
  }

  /**
   * Create a new message
   */
  async create(
    input: CreateMessageInput,
    context?: ServiceContext
  ): Promise<ServiceResult<Message>> {
    // Verify ticket exists
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: input.ticketId },
      select: { id: true, customerId: true, status: true },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found', code: 'NOT_FOUND' };
    }

    // Check access
    if (context && !context.isAgent && !context.isAdmin) {
      if (ticket.customerId !== context.userId) {
        return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
      }
    }

    // Determine sender type
    const senderType = context?.isAgent || context?.isAdmin
      ? 'AGENT'
      : 'CUSTOMER';

    // Get sender name
    let senderName = 'Unknown';
    if (context?.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: context.userId },
        select: { name: true },
      });
      senderName = user?.name || 'Unknown';
    }

    // Create message
    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId: input.ticketId,
        content: input.content,
        contentHtml: input.contentHtml,
        type: (input.type || 'TEXT') as any,
        senderType,
        senderName,
        senderId: context?.userId || null,
        attachments: input.attachments?.length
          ? {
              create: input.attachments.map((a) => ({
                fileName: a.fileName,
                fileUrl: a.fileUrl,
                fileType: a.fileType,
                fileSize: a.fileSize,
              })),
            }
          : undefined,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        attachments: true,
      },
    });

    // Update ticket status and timestamps
    const updateData: any = { updatedAt: new Date() };

    if (senderType === 'AGENT') {
      // Agent replied
      if (!ticket.status.includes('WAITING') && ticket.status !== 'RESOLVED') {
        updateData.status = 'WAITING_FOR_CUSTOMER';
      }
      // Set first response time if not set
      const ticketFull = await this.prisma.supportTicket.findUnique({
        where: { id: input.ticketId },
        select: { firstResponseAt: true },
      });
      if (!ticketFull?.firstResponseAt) {
        updateData.firstResponseAt = new Date();
      }
    } else {
      // Customer replied
      if (ticket.status === 'WAITING_FOR_CUSTOMER') {
        updateData.status = 'WAITING_FOR_AGENT';
      } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        updateData.status = 'OPEN'; // Reopen ticket
        updateData.resolvedAt = null;
        updateData.closedAt = null;
      }
    }

    await this.prisma.supportTicket.update({
      where: { id: input.ticketId },
      data: updateData,
    });

    return { success: true, data: message as unknown as Message };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(
    ticketId: string,
    messageIds: string[],
    _context?: ServiceContext
  ): Promise<ServiceResult<void>> {
    await this.prisma.supportMessage.updateMany({
      where: {
        id: { in: messageIds },
        ticketId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Get unread message count for a ticket
   */
  async getUnreadCount(
    ticketId: string,
    context?: ServiceContext
  ): Promise<ServiceResult<number>> {
    const senderTypeToExclude = context?.isAgent || context?.isAdmin
      ? 'AGENT'
      : 'CUSTOMER';

    const count = await this.prisma.supportMessage.count({
      where: {
        ticketId,
        isRead: false,
        senderType: { not: senderTypeToExclude },
      },
    });

    return { success: true, data: count };
  }

  /**
   * Create internal note
   */
  async createNote(
    input: CreateInternalNoteInput,
    context?: ServiceContext
  ): Promise<ServiceResult<InternalNote>> {
    if (!context?.isAgent && !context?.isAdmin) {
      return { success: false, error: 'Only agents can create notes', code: 'FORBIDDEN' };
    }

    if (!context.userId) {
      return { success: false, error: 'User ID required', code: 'BAD_REQUEST' };
    }

    const note = await this.prisma.internalNote.create({
      data: {
        ticketId: input.ticketId,
        content: input.content,
        authorId: context.userId,
        mentions: input.mentions || [],
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    return { success: true, data: note as unknown as InternalNote };
  }

  /**
   * Get internal notes for a ticket
   */
  async getNotesByTicketId(
    ticketId: string,
    context?: ServiceContext
  ): Promise<ServiceResult<InternalNote[]>> {
    if (!context?.isAgent && !context?.isAdmin) {
      return { success: false, error: 'Only agents can view notes', code: 'FORBIDDEN' };
    }

    const notes = await this.prisma.internalNote.findMany({
      where: { ticketId },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: notes as unknown as InternalNote[] };
  }
}
