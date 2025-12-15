import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const addNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  isInternal: z.boolean().default(true),
  authorId: z.string().optional(),
});

// Add note to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = addNoteSchema.parse(body);

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Create note
    const note = await prisma.orderNote.create({
      data: {
        orderId: order.id,
        content: data.content,
        isInternal: data.isInternal,
        authorId: data.authorId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.authorId,
        action: "ORDER_NOTE_ADDED",
        entity: "OrderNote",
        entityId: note.id,
        metadata: {
          orderNumber: order.orderNumber,
          isInternal: data.isInternal,
        },
      },
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Add note error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}

// Get notes for order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notes: order.notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Delete note
    await prisma.orderNote.delete({
      where: {
        id: noteId,
        orderId: order.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "ORDER_NOTE_DELETED",
        entity: "OrderNote",
        entityId: noteId,
        metadata: {
          orderNumber: order.orderNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
