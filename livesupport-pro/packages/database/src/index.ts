import { PrismaClient } from '@prisma/client';

// Global Prisma client to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client instance
 * Uses singleton pattern to prevent multiple connections
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Create a new Prisma client instance
 * Use this when you need a separate connection (e.g., for transactions)
 */
export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Re-export Prisma types and utilities
export { PrismaClient } from '@prisma/client';
export type { Prisma } from '@prisma/client';

// Re-export generated types
export type {
  User,
  UserRole,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketSource,
  SupportMessage,
  MessageType,
  SenderType,
  MessageAttachment,
  TicketAttachment,
  InternalNote,
  ChatSession,
  ChatStatus,
  ChatMessage,
  ChatSenderType,
  Department,
  Notification,
  NotificationType,
  CannedResponse,
  AgentAvailability,
  AgentStatus,
  SupportSettings,
  KnowledgeDocument,
  AIConversationLog,
} from '@prisma/client';
