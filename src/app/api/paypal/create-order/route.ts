import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPayPalOrder } from "@/lib/paypal";

const createOrderSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  description: z.string().optional(),
});

// POST /api/paypal/create-order - Create a PayPal order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";

    const result = await createPayPalOrder({
      orderId: validatedData.orderId,
      amount: validatedData.amount,
      currency: validatedData.currency,
      description: validatedData.description || `LLCPad Order ${validatedData.orderId}`,
      returnUrl: `${origin}/checkout/success?gateway=paypal&orderId=${validatedData.orderId}`,
      cancelUrl: `${origin}/checkout?cancelled=true`,
    });

    return NextResponse.json({
      success: true,
      paypalOrderId: result.id,
      approvalUrl: result.approvalUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating PayPal order:", error);
    const message = error instanceof Error ? error.message : "Failed to create PayPal order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
