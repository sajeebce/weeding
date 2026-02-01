// Types
export * from './types';

// Providers
export * from './providers';

// Services
export { AIChatService, type AIChatServiceConfig } from './services/ai-chat-service';

// Factory function for creating AI service
import { OpenAIProvider } from './providers/openai';
import { AIChatService } from './services/ai-chat-service';
import type { AIConfig } from './types';
import type { PrismaClient } from '@prisma/client';

/**
 * Create an AI chat service with the specified configuration
 */
export function createAIChatService(
  config: AIConfig,
  prisma?: PrismaClient
): AIChatService {
  let provider;

  switch (config.provider) {
    case 'openai':
      provider = new OpenAIProvider({
        provider: 'openai',
        model: config.model,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });
      break;
    case 'anthropic':
      // TODO: Implement Anthropic provider
      throw new Error('Anthropic provider not yet implemented');
    case 'custom':
      throw new Error('Custom provider requires manual configuration');
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  return new AIChatService({
    provider,
    prisma,
    maxKnowledgeArticles: 3,
  });
}
