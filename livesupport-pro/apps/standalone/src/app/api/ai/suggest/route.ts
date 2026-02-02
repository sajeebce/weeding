// AI Suggestions API - Generate suggestions for agents
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@livesupport-pro/database';
import { createAIChatService } from '@livesupport-pro/ai';
import { z } from 'zod';

const suggestSchema = z.object({
  ticketId: z.string().optional(),
  sessionId: z.string().optional(),
  query: z.string().min(1, 'Query is required'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).default([]),
});

// POST /api/ai/suggest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = suggestSchema.parse(body);

    // Get AI settings
    const settings = await (prisma as any).supportSettings.findFirst();
    const aiSettings = (settings?.metadata as Record<string, unknown>)?.ai as Record<string, unknown> | undefined;

    if (!aiSettings?.apiKey) {
      return NextResponse.json(
        { error: 'AI is not configured' },
        { status: 400 }
      );
    }

    if (!aiSettings.agentSuggestionsEnabled) {
      return NextResponse.json(
        { error: 'Agent suggestions are disabled' },
        { status: 400 }
      );
    }

    // Create AI service
    const aiService = createAIChatService(
      {
        provider: (aiSettings.provider as 'openai' | 'anthropic' | 'custom') || 'openai',
        model: (aiSettings.model as string) || 'gpt-4o-mini',
        apiKey: aiSettings.apiKey as string,
        baseUrl: aiSettings.baseUrl as string | undefined,
        temperature: (aiSettings.temperature as number) || 0.7,
        maxTokens: (aiSettings.maxTokens as number) || 1000,
        knowledgeBaseEnabled: (aiSettings.knowledgeBaseEnabled as boolean) ?? true,
      },
      prisma
    );

    // Generate response
    const response = await aiService.generateResponse(
      validatedData.query,
      validatedData.conversationHistory,
      {
        ticketId: validatedData.ticketId,
        sessionId: validatedData.sessionId,
      }
    );

    // Check if should escalate
    const shouldEscalate = aiService.shouldEscalateToHuman(response);

    return NextResponse.json({
      suggestion: response.content,
      confidence: response.confidence,
      sources: response.sources,
      suggestedActions: response.suggestedActions,
      shouldEscalate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error generating suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
