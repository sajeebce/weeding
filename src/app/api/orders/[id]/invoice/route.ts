import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Generate unique invoice number
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}-${random}`;
}

const createInvoiceSchema = z.object({
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

// Create invoice for order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const data = createInvoiceSchema.parse(body);

    // Find order with items
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId: order.id },
    });

    if (existingInvoice) {
      return NextResponse.json({
        success: true,
        invoice: existingInvoice,
        message: "Invoice already exists for this order",
      });
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        orderId: order.id,
        subtotal: order.subtotalUSD,
        discount: order.discountUSD,
        tax: 0,
        total: order.totalUSD,
        currency: order.currency,
        status: order.paymentStatus === "PAID" ? "PAID" : "SENT",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paidAt: order.paidAt,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "INVOICE_GENERATED",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: {
          orderNumber: order.orderNumber,
          invoiceNumber: invoice.invoiceNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

// Get invoices for order
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
        invoices: {
          orderBy: { createdAt: "desc" },
        },
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            country: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Build invoice data with order details
    const invoiceData = {
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerCountry: order.customerCountry,
        llcName: order.llcName,
        llcState: order.llcState,
        items: order.items,
        subtotalUSD: order.subtotalUSD,
        discountUSD: order.discountUSD,
        totalUSD: order.totalUSD,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
      invoices: order.invoices,
    };

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error("Get invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// Update invoice status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { invoiceId, status, paidAt } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
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

    // Update invoice
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paidAt) updateData.paidAt = new Date(paidAt);
    if (status === "PAID" && !paidAt) updateData.paidAt = new Date();

    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        orderId: order.id,
      },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "INVOICE_UPDATED",
        entity: "Invoice",
        entityId: invoice.id,
        metadata: {
          orderNumber: order.orderNumber,
          invoiceNumber: invoice.invoiceNumber,
          changes: { status, paidAt },
        },
      },
    });

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
