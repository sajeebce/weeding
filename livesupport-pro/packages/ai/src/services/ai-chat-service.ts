import type { PrismaClient } from '@prisma/client';
import type { AIProviderInterface } from '../providers/base';
import type {
  AIResponse,
  ChatMessage,
  ConversationContext,
  KnowledgeDocument
} from '../types';

export interface AIChatServiceConfig {
  provider: AIProviderInterface;
  prisma?: PrismaClient;
  maxKnowledgeArticles?: number;
}

/**
 * AI Chat Service for handling AI-powered customer support
 */
export class AIChatService {
  private provider: AIProviderInterface;
  private prisma?: PrismaClient;
  private maxKnowledgeArticles: number;

  constructor(config: AIChatServiceConfig) {
    this.provider = config.provider;
    this.prisma = config.prisma;
    this.maxKnowledgeArticles = config.maxKnowledgeArticles ?? 3;
  }

  /**
   * Generate an AI response for a customer query
   */
  async generateResponse(
    query: string,
    conversationHistory: ChatMessage[] = [],
    options?: {
      ticketId?: string;
      sessionId?: string;
      customerId?: string;
    }
  ): Promise<AIResponse> {
    // Build conversation context
    const context: ConversationContext = {
      messages: [
        ...conversationHistory,
        { role: 'user', content: query },
      ],
    };

    // Fetch relevant knowledge base articles
    if (this.prisma) {
      context.knowledgeBase = await this.searchKnowledgeBase(query);
    }

    // Fetch customer info if available
    if (this.prisma && options?.customerId) {
      context.customerInfo = await this.getCustomerInfo(options.customerId);
    }

    // Fetch ticket context if available
    if (this.prisma && options?.ticketId) {
      context.ticketContext = await this.getTicketContext(options.ticketId);
    }

    // Generate response
    const response = await this.provider.generateResponse(context);

    // Log the conversation
    if (this.prisma) {
      await this.logConversation(query, response, options);
    }

    return response;
  }

  /**
   * Search knowledge base for relevant articles
   */
  private async searchKnowledgeBase(query: string): Promise<KnowledgeDocument[]> {
    if (!this.prisma) return [];

    try {
      // Simple keyword search (can be enhanced with vector search)
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

      const articles = await (this.prisma as any).knowledgeDocument.findMany({
        where: {
          isPublished: true,
          OR: keywords.map(keyword => ({
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { content: { contains: keyword, mode: 'insensitive' } },
              { tags: { has: keyword } },
            ],
          })),
        },
        take: this.maxKnowledgeArticles,
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          tags: true,
        },
      });

      return articles;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  /**
   * Get customer information for context
   */
  private async getCustomerInfo(customerId: string): Promise<ConversationContext['customerInfo']> {
    if (!this.prisma) return undefined;

    try {
      const customer = await (this.prisma as any).user.findUnique({
        where: { id: customerId },
        select: { name: true, email: true },
      });

      if (!customer) return undefined;

      const ticketCount = await (this.prisma as any).supportTicket.count({
        where: { customerId },
      });

      return {
        name: customer.name || undefined,
        email: customer.email,
        previousTickets: ticketCount,
      };
    } catch (error) {
      console.error('Error fetching customer info:', error);
      return undefined;
    }
  }

  /**
   * Get ticket context
   */
  private async getTicketContext(ticketId: string): Promise<ConversationContext['ticketContext']> {
    if (!this.prisma) return undefined;

    try {
      const ticket = await (this.prisma as any).supportTicket.findUnique({
        where: { id: ticketId },
        select: {
          subject: true,
          category: true,
          priority: true,
        },
      });

      if (!ticket) return undefined;

      return {
        subject: ticket.subject,
        category: ticket.category || undefined,
        priority: ticket.priority,
      };
    } catch (error) {
      console.error('Error fetching ticket context:', error);
      return undefined;
    }
  }

  /**
   * Log AI conversation for analytics and improvement
   */
  private async logConversation(
    query: string,
    response: AIResponse,
    options?: {
      ticketId?: string;
      sessionId?: string;
    }
  ): Promise<void> {
    if (!this.prisma) return;

    try {
      await (this.prisma as any).aIConversationLog.create({
        data: {
          sessionId: options?.sessionId,
          ticketId: options?.ticketId,
          query,
          response: response.content,
          confidence: response.confidence,
        },
      });
    } catch (error) {
      console.error('Error logging AI conversation:', error);
    }
  }

  /**
   * Submit feedback for an AI response
   */
  async submitFeedback(
    logId: string,
    wasHelpful: boolean,
    feedback?: string
  ): Promise<void> {
    if (!this.prisma) return;

    try {
      await (this.prisma as any).aIConversationLog.update({
        where: { id: logId },
        data: {
          wasHelpful,
          feedback,
        },
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }

  /**
   * Check if AI should handle the query or escalate to human
   */
  shouldEscalateToHuman(response: AIResponse): boolean {
    // Escalate if confidence is too low
    if (response.confidence < 0.3) {
      return true;
    }

    // Escalate if suggested action includes connecting with human
    if (response.suggestedActions?.some(action =>
      action.toLowerCase().includes('human') ||
      action.toLowerCase().includes('agent')
    )) {
      return true;
    }

    return false;
  }
}
