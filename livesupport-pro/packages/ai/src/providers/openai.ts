import OpenAI from 'openai';
import { BaseAIProvider } from './base';
import type { AIModelConfig, AIResponse, ConversationContext } from '../types';

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: AIModelConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  async generateResponse(context: ConversationContext): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI provider is not configured');
    }

    const systemPrompt = this.buildSystemPrompt(context);

    // Build messages array
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    for (const msg of context.messages) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 1000,
      });

      const responseContent = completion.choices[0]?.message?.content || '';
      const confidence = this.calculateConfidence(responseContent, context);
      const suggestedActions = this.extractSuggestedActions(responseContent);

      // Extract sources from knowledge base if used
      const sources = context.knowledgeBase?.map((doc) => doc.title) || [];

      return {
        content: responseContent,
        confidence,
        sources: sources.length > 0 ? sources : undefined,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI provider is not configured');
    }

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI embedding error: ${error.message}`);
      }
      throw error;
    }
  }
}
