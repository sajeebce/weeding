import { z } from 'zod';

/**
 * AI Provider types
 */
export type AIProvider = 'openai' | 'anthropic' | 'custom';

/**
 * AI Model configuration
 */
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Knowledge base document for AI context
 */
export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

/**
 * Chat message for AI conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * AI response
 */
export interface AIResponse {
  content: string;
  confidence: number;
  sources?: string[];
  suggestedActions?: string[];
}

/**
 * AI conversation context
 */
export interface ConversationContext {
  messages: ChatMessage[];
  knowledgeBase?: KnowledgeDocument[];
  customerInfo?: {
    name?: string;
    email?: string;
    previousTickets?: number;
  };
  ticketContext?: {
    subject?: string;
    category?: string;
    priority?: string;
  };
}

/**
 * AI service configuration schema
 */
export const AIConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'custom']),
  model: z.string(),
  apiKey: z.string(),
  baseUrl: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8000).default(1000),
  systemPrompt: z.string().optional(),
  knowledgeBaseEnabled: z.boolean().default(true),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;
