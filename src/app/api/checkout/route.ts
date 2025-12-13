import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/stripe";

const checkoutSchema = z.object({
  orderId: z.string().optional(), // Order number for existing orders
  serviceId: z.string(),
  packageId: z.string(),
  stateCode: z.string().optional(),
  llcName: z.string().optional(),
  llcActivity: z.string().optional(),
  members: z.array(
    z.object({
      name: z.string(),
      email: z.string().email(),
      ownership: z.number(),
    })
  ).optional(),
  contactInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    country: z.string().optional(),
  }),
  total: z.number(),
  serviceFee: z.number(),
  stateFee: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = checkoutSchema.parse(body);

    // Create line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `LLC Formation - ${validatedData.packageId.charAt(0).toUpperCase() + validatedData.packageId.slice(1)} Package`,
            description: `${validatedData.stateCode} LLC Formation for ${validatedData.llcName}`,
          },
          unit_amount: validatedData.serviceFee * 100, // Convert to cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `State Filing Fee - ${validatedData.stateCode}`,
            description: `Official state filing fee for ${validatedData.stateCode}`,
          },
          unit_amount: validatedData.stateFee * 100, // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      lineItems,
      customerEmail: validatedData.contactInfo.email,
      metadata: {
        orderId: validatedData.orderId || "",
        serviceId: validatedData.serviceId,
        packageId: validatedData.packageId,
        stateCode: validatedData.stateCode || "",
        llcName: validatedData.llcName || "",
        llcActivity: validatedData.llcActivity || "",
        customerName: validatedData.contactInfo.fullName,
        customerPhone: validatedData.contactInfo.phone || "",
        customerCountry: validatedData.contactInfo.country || "",
        members: JSON.stringify(validatedData.members || []),
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&orderId=${validatedData.orderId || ""}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true&orderId=${validatedData.orderId || ""}`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// Get checkout session status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For now, return mock data
    return NextResponse.json({
      status: "complete",
      orderId: "LLC-2024-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customerEmail: "customer@example.com",
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}
