import type { AIModelConfig, AIResponse, ConversationContext } from '../types';

/**
 * Base AI provider interface
 */
export interface AIProviderInterface {
  /**
   * Generate a response based on conversation context
   */
  generateResponse(context: ConversationContext): Promise<AIResponse>;

  /**
   * Generate embeddings for text (for knowledge base search)
   */
  generateEmbedding?(text: string): Promise<number[]>;

  /**
   * Check if the provider is configured correctly
   */
  isConfigured(): boolean;
}

/**
 * Base AI provider class with common functionality
 */
export abstract class BaseAIProvider implements AIProviderInterface {
  protected config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  abstract generateResponse(context: ConversationContext): Promise<AIResponse>;

  abstract isConfigured(): boolean;

  /**
   * Build system prompt with knowledge base context
   */
  protected buildSystemPrompt(context: ConversationContext, basePrompt?: string): string {
    let systemPrompt = basePrompt || this.getDefaultSystemPrompt();

    // Add knowledge base context
    if (context.knowledgeBase && context.knowledgeBase.length > 0) {
      systemPrompt += '\n\n### Relevant Knowledge Base Articles:\n';
      context.knowledgeBase.forEach((doc) => {
        systemPrompt += `\n**${doc.title}**\n${doc.content}\n`;
      });
    }

    // Add customer context
    if (context.customerInfo) {
      systemPrompt += '\n\n### Customer Information:\n';
      if (context.customerInfo.name) {
        systemPrompt += `- Name: ${context.customerInfo.name}\n`;
      }
      if (context.customerInfo.previousTickets !== undefined) {
        systemPrompt += `- Previous tickets: ${context.customerInfo.previousTickets}\n`;
      }
    }

    // Add ticket context
    if (context.ticketContext) {
      systemPrompt += '\n\n### Current Ticket:\n';
      if (context.ticketContext.subject) {
        systemPrompt += `- Subject: ${context.ticketContext.subject}\n`;
      }
      if (context.ticketContext.category) {
        systemPrompt += `- Category: ${context.ticketContext.category}\n`;
      }
      if (context.ticketContext.priority) {
        systemPrompt += `- Priority: ${context.ticketContext.priority}\n`;
      }
    }

    return systemPrompt;
  }

  /**
   * Default system prompt for customer support
   */
  protected getDefaultSystemPrompt(): string {
    return `You are a helpful customer support assistant. Your role is to:

1. Answer customer questions accurately and helpfully
2. Use the provided knowledge base articles when relevant
3. Be polite, professional, and empathetic
4. If you're not sure about something, say so and offer to connect with a human agent
5. Keep responses concise but complete
6. Suggest relevant follow-up actions when appropriate

Important guidelines:
- Never make up information that isn't in the knowledge base
- If the question is beyond your scope, recommend connecting with a human agent
- Maintain a friendly and supportive tone
- Address the customer by name when available`;
  }

  /**
   * Calculate confidence based on response characteristics
   */
  protected calculateConfidence(response: string, context: ConversationContext): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence if knowledge base was used
    if (context.knowledgeBase && context.knowledgeBase.length > 0) {
      confidence += 0.2;
    }

    // Higher confidence for shorter, more direct responses
    if (response.length < 500) {
      confidence += 0.1;
    }

    // Lower confidence if response mentions uncertainty
    const uncertaintyPhrases = [
      "i'm not sure",
      "i don't know",
      "i'm uncertain",
      "i cannot",
      "human agent",
    ];
    const lowerResponse = response.toLowerCase();
    for (const phrase of uncertaintyPhrases) {
      if (lowerResponse.includes(phrase)) {
        confidence -= 0.15;
        break;
      }
    }

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * Extract suggested actions from response
   */
  protected extractSuggestedActions(response: string): string[] {
    const actions: string[] = [];

    // Check for common action patterns
    if (response.toLowerCase().includes('contact support') ||
        response.toLowerCase().includes('human agent')) {
      actions.push('Connect with human agent');
    }

    if (response.toLowerCase().includes('knowledge base') ||
        response.toLowerCase().includes('documentation')) {
      actions.push('View documentation');
    }

    if (response.toLowerCase().includes('submit a ticket')) {
      actions.push('Create support ticket');
    }

    return actions;
  }
}
