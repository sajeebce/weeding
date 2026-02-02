import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { z } from 'zod';

// GET - Get a single canned response
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await db.cannedResponse.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Canned response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching canned response:', error);
    return NextResponse.json(
      { error: 'Failed to fetch canned response' },
      { status: 500 }
    );
  }
}

// PUT - Update a canned response
const updateResponseSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateResponseSchema.parse(body);

    // Check if response exists
    const existing = await db.cannedResponse.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Canned response not found' },
        { status: 404 }
      );
    }

    const response = await db.cannedResponse.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating canned response:', error);
    return NextResponse.json(
      { error: 'Failed to update canned response' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a canned response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if response exists
    const existing = await db.cannedResponse.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Canned response not found' },
        { status: 404 }
      );
    }

    await db.cannedResponse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting canned response:', error);
    return NextResponse.json(
      { error: 'Failed to delete canned response' },
      { status: 500 }
    );
  }
}

// PATCH - Increment use count (when response is used)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await db.cannedResponse.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error incrementing use count:', error);
    return NextResponse.json(
      { error: 'Failed to increment use count' },
      { status: 500 }
    );
  }
}
