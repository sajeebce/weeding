// AI Connection Test API
import { NextResponse } from 'next/server';
import { prisma } from '@livesupport-pro/database';
import { createAIChatService } from '@livesupport-pro/ai';

// POST /api/ai/test
export async function POST() {
  try {
    const settings = await (prisma as any).supportSettings.findFirst();
    const aiSettings = (settings?.metadata as Record<string, unknown>)?.ai as Record<string, unknown> | undefined;

    if (!aiSettings?.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 400 }
      );
    }

    // Create AI service and test connection
    const aiService = createAIChatService({
      provider: (aiSettings.provider as 'openai' | 'anthropic' | 'custom') || 'openai',
      model: (aiSettings.model as string) || 'gpt-4o-mini',
      apiKey: aiSettings.apiKey as string,
      baseUrl: aiSettings.baseUrl as string | undefined,
      temperature: (aiSettings.temperature as number) || 0.7,
      maxTokens: (aiSettings.maxTokens as number) || 1000,
    });

    // Test with a simple query
    const response = await aiService.generateResponse('Hello, this is a test message.');

    return NextResponse.json({
      success: true,
      message: 'Connection successful!',
      model: aiSettings.model,
      confidence: response.confidence,
    });
  } catch (error) {
    console.error('AI connection test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    );
  }
}
