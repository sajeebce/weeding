import type { PrismaClient } from '@prisma/client';
import type {
  Ticket,
  CreateTicketInput,
  UpdateTicketInput,
  TicketFilters,
  PaginationInput,
  PaginatedResult,
  ServiceContext,
  ServiceResult,
} from '../types';
import { generateTicketNumber } from '../utils/helpers';

export class TicketService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all tickets with filtering and pagination
   */
  async getAll(
    filters: TicketFilters = {},
    pagination: PaginationInput = {},
    context?: ServiceContext
  ): Promise<PaginatedResult<Ticket>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply filters
    if (filters.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters.priority) {
      where.priority = Array.isArray(filters.priority)
        ? { in: filters.priority }
        : filters.priority;
    }

    if (filters.assignedToId !== undefined) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.search) {
      where.OR = [
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
        { guestName: { contains: filters.search, mode: 'insensitive' } },
        { guestEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // If not admin/agent, only show own tickets
    if (context && !context.isAgent && !context.isAdmin && context.userId) {
      where.customerId = context.userId;
    }

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          _count: {
            select: { messages: true, internalNotes: true },
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: data as unknown as Ticket[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    };
  }

  /**
   * Get a single ticket by ID
   */
  async getById(
    id: string,
    context?: ServiceContext
  ): Promise<ServiceResult<Ticket>> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true, image: true, role: true },
            },
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        internalNotes: {
          include: {
            author: {
              select: { id: true, name: true, email: true, image: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
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

    return { success: true, data: ticket as unknown as Ticket };
  }

  /**
   * Create a new ticket
   */
  async create(
    input: CreateTicketInput,
    context?: ServiceContext
  ): Promise<ServiceResult<Ticket>> {
    const ticketNumber = generateTicketNumber();

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: input.subject,
        description: input.message,
        priority: (input.priority || 'NORMAL') as any,
        source: (input.source || 'WEB') as any,
        category: input.category,
        customerId: context?.userId,
        messages: {
          create: {
            content: input.message,
            senderType: 'CUSTOMER' as any,
            senderName: input.guestName || 'Guest',
            senderId: context?.userId,
            type: 'TEXT' as any,
          },
        },
      } as any,
      include: {
        customer: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true, image: true, role: true },
            },
            attachments: true,
          },
        },
      },
    });

    return { success: true, data: ticket as unknown as Ticket };
  }

  /**
   * Update a ticket
   */
  async update(
    id: string,
    input: UpdateTicketInput,
    context?: ServiceContext
  ): Promise<ServiceResult<Ticket>> {
    const existing = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Ticket not found', code: 'NOT_FOUND' };
    }

    // Check access for non-agents
    if (context && !context.isAgent && !context.isAdmin) {
      if (existing.customerId !== context.userId) {
        return { success: false, error: 'Access denied', code: 'FORBIDDEN' };
      }
      // Customers can only update limited fields
      input = { status: input.status };
    }

    const updateData: any = { ...input };

    // Set timestamps based on status changes
    if (input.status === 'RESOLVED' && existing.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }
    if (input.status === 'CLOSED' && existing.status !== 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const ticket = await this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    return { success: true, data: ticket as unknown as Ticket };
  }

  /**
   * Delete a ticket
   */
  async delete(
    id: string,
    context?: ServiceContext
  ): Promise<ServiceResult<void>> {
    if (!context?.isAdmin) {
      return { success: false, error: 'Only admins can delete tickets', code: 'FORBIDDEN' };
    }

    const existing = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: 'Ticket not found', code: 'NOT_FOUND' };
    }

    await this.prisma.supportTicket.delete({ where: { id } });

    return { success: true };
  }

  /**
   * Get ticket statistics
   */
  async getStats(context?: ServiceContext): Promise<ServiceResult<Record<string, number>>> {
    const where: any = {};

    // If not admin/agent, only count own tickets
    if (context && !context.isAgent && !context.isAdmin && context.userId) {
      where.customerId = context.userId;
    }

    const [open, inProgress, waiting, resolved, total, urgent] = await Promise.all([
      this.prisma.supportTicket.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({
        where: { ...where, status: { in: ['WAITING_FOR_CUSTOMER', 'WAITING_FOR_AGENT'] } },
      }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.count({ where: { ...where, priority: 'URGENT' } }),
    ]);

    return {
      success: true,
      data: { open, inProgress, waiting, resolved, total, urgent },
    };
  }

  /**
   * Assign ticket to agent
   */
  async assign(
    id: string,
    agentId: string | null,
    context?: ServiceContext
  ): Promise<ServiceResult<Ticket>> {
    if (!context?.isAgent && !context?.isAdmin) {
      return { success: false, error: 'Only agents can assign tickets', code: 'FORBIDDEN' };
    }

    return this.update(id, { assignedToId: agentId }, context);
  }
}
