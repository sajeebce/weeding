// AI Settings API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@livesupport-pro/database';
import { z } from 'zod';

const aiSettingsSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'custom']).default('openai'),
  model: z.string().default('gpt-4o-mini'),
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(8000).default(1000),
  knowledgeBaseEnabled: z.boolean().default(true),
  autoResponseEnabled: z.boolean().default(false),
  autoResponseThreshold: z.number().min(0).max(1).default(0.8),
  agentSuggestionsEnabled: z.boolean().default(true),
});

// GET /api/ai/settings
export async function GET() {
  try {
    const settings = await (prisma as any).supportSettings.findFirst();

    // Get AI-specific settings from metadata or default
    const aiSettings = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
      baseUrl: '',
      temperature: 0.7,
      maxTokens: 1000,
      knowledgeBaseEnabled: true,
      autoResponseEnabled: false,
      autoResponseThreshold: 0.8,
      agentSuggestionsEnabled: true,
      ...((settings?.metadata as Record<string, unknown>)?.ai || {}),
    };

    // Mask API key for security
    if (aiSettings.apiKey) {
      const key = aiSettings.apiKey as string;
      aiSettings.apiKey = key.length > 8
        ? `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`
        : '********';
    }

    return NextResponse.json({ settings: aiSettings });
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

// POST /api/ai/settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = aiSettingsSchema.parse(body);

    // Get existing settings
    let settings = await (prisma as any).supportSettings.findFirst();

    // Prepare AI settings for storage
    const existingMetadata = (settings?.metadata || {}) as Record<string, unknown>;

    // If API key is masked, keep the existing one
    let apiKey = validatedData.apiKey;
    if (apiKey.includes('*')) {
      apiKey = ((existingMetadata.ai as Record<string, unknown>)?.apiKey as string) || '';
    }

    const aiMetadata = {
      ...existingMetadata,
      ai: {
        provider: validatedData.provider,
        model: validatedData.model,
        apiKey,
        baseUrl: validatedData.baseUrl,
        temperature: validatedData.temperature,
        maxTokens: validatedData.maxTokens,
        knowledgeBaseEnabled: validatedData.knowledgeBaseEnabled,
        autoResponseEnabled: validatedData.autoResponseEnabled,
        autoResponseThreshold: validatedData.autoResponseThreshold,
        agentSuggestionsEnabled: validatedData.agentSuggestionsEnabled,
      },
    };

    if (settings) {
      settings = await (prisma as any).supportSettings.update({
        where: { id: settings.id },
        data: { metadata: aiMetadata },
      });
    } else {
      settings = await (prisma as any).supportSettings.create({
        data: { metadata: aiMetadata },
      });
    }

    return NextResponse.json({ message: 'AI settings saved successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error saving AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to save AI settings' },
      { status: 500 }
    );
  }
}
