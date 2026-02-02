// AI Auto-Response API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@livesupport-pro/database';
import { createAIChatService } from '@livesupport-pro/ai';
import { z } from 'zod';

const autoResponseSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  message: z.string().min(1, 'Message is required'),
});

// POST /api/ai/auto-response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = autoResponseSchema.parse(body);

    // Get AI settings
    const settings = await (prisma as any).supportSettings.findFirst();
    const aiSettings = (settings?.metadata as Record<string, unknown>)?.ai as Record<string, unknown> | undefined;

    if (!aiSettings?.apiKey) {
      return NextResponse.json(
        { error: 'AI is not configured', shouldFallbackToAgent: true },
        { status: 400 }
      );
    }

    if (!aiSettings.autoResponseEnabled) {
      return NextResponse.json(
        { error: 'Auto-response is disabled', shouldFallbackToAgent: true },
        { status: 400 }
      );
    }

    // Get chat session and history
    const session = await (prisma as any).chatSession.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10, // Last 10 messages for context
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', shouldFallbackToAgent: true },
        { status: 404 }
      );
    }

    // Build conversation history
    const conversationHistory = session.messages.map((msg: { senderType: string; content: string }) => ({
      role: msg.senderType === 'VISITOR' ? 'user' as const : 'assistant' as const,
      content: msg.content,
    }));

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
      validatedData.message,
      conversationHistory,
      { sessionId: validatedData.sessionId }
    );

    // Check confidence threshold
    const threshold = (aiSettings.autoResponseThreshold as number) || 0.8;
    const shouldEscalate = aiService.shouldEscalateToHuman(response);

    if (response.confidence < threshold || shouldEscalate) {
      return NextResponse.json({
        shouldRespond: false,
        shouldFallbackToAgent: true,
        confidence: response.confidence,
        reason: shouldEscalate
          ? 'Query requires human assistance'
          : `Confidence (${(response.confidence * 100).toFixed(0)}%) below threshold (${(threshold * 100).toFixed(0)}%)`,
      });
    }

    // Save AI message to chat
    await (prisma as any).chatMessage.create({
      data: {
        sessionId: validatedData.sessionId,
        content: response.content,
        senderType: 'AI',
        senderName: 'AI Assistant',
      },
    });

    return NextResponse.json({
      shouldRespond: true,
      response: response.content,
      confidence: response.confidence,
      sources: response.sources,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues, shouldFallbackToAgent: true },
        { status: 400 }
      );
    }
    console.error('Error generating auto-response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', shouldFallbackToAgent: true },
      { status: 500 }
    );
  }
}
