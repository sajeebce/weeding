import type { PrismaClient } from '@prisma/client';
import type {
  ChatSession,
  CreateChatSessionInput,
  ServiceContext,
  ServiceResult,
  PaginationInput,
  PaginatedResult,
} from '../types';

export class ChatService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Start a new chat session
   */
  async startSession(
    input: CreateChatSessionInput,
    _context?: ServiceContext
  ): Promise<ServiceResult<ChatSession>> {
    const session = await this.prisma.chatSession.create({
      data: {
        visitorId: input.visitorId,
        visitorName: input.visitorName,
        visitorEmail: input.visitorEmail,
        department: input.department,
        metadata: input.metadata || {},
        status: 'WAITING',
      },
    });

    return { success: true, data: session as unknown as ChatSession };
  }

  /**
   * Get active chat sessions
   */
  async getActiveSessions(
    pagination: PaginationInput = {},
    _context?: ServiceContext
  ): Promise<PaginatedResult<ChatSession>> {
    const { page = 1, limit = 20, sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        where: {
          status: { in: ['WAITING', 'ACTIVE'] },
        },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          assignedAgent: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      this.prisma.chatSession.count({
        where: {
          status: { in: ['WAITING', 'ACTIVE'] },
        },
      }),
    ]);

    return {
      data: data as unknown as ChatSession[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + data.length < total,
    };
  }

  /**
   * Get a chat session by ID
   */
  async getById(
    sessionId: string,
    _context?: ServiceContext
  ): Promise<ServiceResult<ChatSession>> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true, image: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return { success: false, error: 'Chat session not found', code: 'NOT_FOUND' };
    }

    return { success: true, data: session as unknown as ChatSession };
  }

  /**
   * Assign an agent to a chat session
   */
  async assignAgent(
    sessionId: string,
    agentId: string,
    context?: ServiceContext
  ): Promise<ServiceResult<ChatSession>> {
    if (!context?.isAgent && !context?.isAdmin) {
      return { success: false, error: 'Only agents can accept chats', code: 'FORBIDDEN' };
    }

    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { success: false, error: 'Chat session not found', code: 'NOT_FOUND' };
    }

    if (session.status !== 'WAITING') {
      return { success: false, error: 'Chat already assigned', code: 'BAD_REQUEST' };
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        assignedAgentId: agentId,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return { success: true, data: updated as unknown as ChatSession };
  }

  /**
   * End a chat session
   */
  async endSession(
    sessionId: string,
    _context?: ServiceContext
  ): Promise<ServiceResult<ChatSession>> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { success: false, error: 'Chat session not found', code: 'NOT_FOUND' };
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });

    return { success: true, data: updated as unknown as ChatSession };
  }

  /**
   * Get chat session statistics
   */
  async getStats(_context?: ServiceContext): Promise<
    ServiceResult<{
      waiting: number;
      active: number;
      endedToday: number;
      avgWaitTime: number;
      avgChatDuration: number;
    }>
  > {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [waiting, active, endedToday] = await Promise.all([
      this.prisma.chatSession.count({ where: { status: 'WAITING' } }),
      this.prisma.chatSession.count({ where: { status: 'ACTIVE' } }),
      this.prisma.chatSession.count({
        where: {
          status: 'ENDED',
          endedAt: { gte: today },
        },
      }),
    ]);

    // Calculate average wait time (time from creation to acceptance)
    const acceptedSessions = await this.prisma.chatSession.findMany({
      where: {
        acceptedAt: { not: null },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true, acceptedAt: true },
    });

    let avgWaitTime = 0;
    if (acceptedSessions.length > 0) {
      const totalWaitTime = acceptedSessions.reduce((acc, session) => {
        return acc + (session.acceptedAt!.getTime() - session.createdAt.getTime());
      }, 0);
      avgWaitTime = Math.round(totalWaitTime / acceptedSessions.length / 1000); // in seconds
    }

    // Calculate average chat duration
    const endedSessions = await this.prisma.chatSession.findMany({
      where: {
        status: 'ENDED',
        acceptedAt: { not: null },
        endedAt: { not: null },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { acceptedAt: true, endedAt: true },
    });

    let avgChatDuration = 0;
    if (endedSessions.length > 0) {
      const totalDuration = endedSessions.reduce((acc, session) => {
        return acc + (session.endedAt!.getTime() - session.acceptedAt!.getTime());
      }, 0);
      avgChatDuration = Math.round(totalDuration / endedSessions.length / 1000); // in seconds
    }

    return {
      success: true,
      data: {
        waiting,
        active,
        endedToday,
        avgWaitTime,
        avgChatDuration,
      },
    };
  }

  /**
   * Transfer chat to another agent
   */
  async transferChat(
    sessionId: string,
    toAgentId: string,
    context?: ServiceContext
  ): Promise<ServiceResult<ChatSession>> {
    if (!context?.isAgent && !context?.isAdmin) {
      return { success: false, error: 'Only agents can transfer chats', code: 'FORBIDDEN' };
    }

    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { success: false, error: 'Chat session not found', code: 'NOT_FOUND' };
    }

    if (session.status !== 'ACTIVE') {
      return { success: false, error: 'Can only transfer active chats', code: 'BAD_REQUEST' };
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        assignedAgentId: toAgentId,
      },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return { success: true, data: updated as unknown as ChatSession };
  }
}
