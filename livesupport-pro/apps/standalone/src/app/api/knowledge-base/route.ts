// Knowledge Base API - List and Create
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@livesupport-pro/database';
import { z } from 'zod';

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

// GET /api/knowledge-base
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (published !== null) {
      where.isPublished = published === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [documents, total] = await Promise.all([
      (prisma as any).knowledgeDocument.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          tags: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      (prisma as any).knowledgeDocument.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/knowledge-base
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createDocumentSchema.parse(body);

    const document = await (prisma as any).knowledgeDocument.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        category: validatedData.category,
        tags: validatedData.tags,
        isPublished: validatedData.isPublished,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
