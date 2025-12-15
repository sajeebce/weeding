import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const uploadDocumentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Valid file URL is required"),
  fileSize: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  type: z.enum([
    "PASSPORT",
    "ID_CARD",
    "ADDRESS_PROOF",
    "ARTICLES_OF_ORG",
    "EIN_LETTER",
    "OPERATING_AGREEMENT",
    "BANK_STATEMENT",
    "OTHER",
  ]).default("OTHER"),
  userId: z.string().optional(),
});

const updateDocumentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]).optional(),
  name: z.string().optional(),
});

// Upload document to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = uploadDocumentSchema.parse(body);

    // Find order with user
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

    // Create document
    const document = await prisma.document.create({
      data: {
        orderId: order.id,
        userId: data.userId || order.userId,
        name: data.name,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        type: data.type,
        status: "PENDING",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: data.userId || order.userId,
        action: "DOCUMENT_UPLOADED",
        entity: "Document",
        entityId: document.id,
        metadata: {
          orderNumber: order.orderNumber,
          documentName: data.name,
          documentType: data.type,
        },
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// Get documents for order
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
        documents: {
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
      documents: order.documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// Update document status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = updateDocumentSchema.parse(body);

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

    // Update document
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.name) updateData.name = data.name;

    const document = await prisma.document.update({
      where: {
        id: data.documentId,
        orderId: order.id,
      },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "DOCUMENT_UPDATED",
        entity: "Document",
        entityId: document.id,
        metadata: {
          orderNumber: order.orderNumber,
          changes: data,
        },
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Update document error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

// Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
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

    // Delete document
    await prisma.document.delete({
      where: {
        id: documentId,
        orderId: order.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "DOCUMENT_DELETED",
        entity: "Document",
        entityId: documentId,
        metadata: {
          orderNumber: order.orderNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
