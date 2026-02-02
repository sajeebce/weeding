import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { z } from 'zod';

// GET - List all canned responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const responses = await db.cannedResponse.findMany({
      where,
      orderBy: [{ useCount: 'desc' }, { title: 'asc' }],
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Get unique categories
    const categories = await db.cannedResponse.findMany({
      where: {
        category: { not: null },
      },
      select: { category: true },
      distinct: ['category'],
    });

    return NextResponse.json({
      responses,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching canned responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch canned responses' },
      { status: 500 }
    );
  }
}

// POST - Create a new canned response
const createResponseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
  createdById: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createResponseSchema.parse(body);

    const response = await db.cannedResponse.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        isPublic: data.isPublic,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating canned response:', error);
    return NextResponse.json(
      { error: 'Failed to create canned response' },
      { status: 500 }
    );
  }
}
