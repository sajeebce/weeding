import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/stripe";

const checkoutSchema = z.object({
  orderId: z.string().optional(), // Order number for existing orders
  serviceId: z.string(),
  packageId: z.string(),
  locationCode: z.string().optional(),
  stateCode: z.string().optional(), // Backward compat
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
  locationFee: z.number().optional(),
  stateFee: z.number().optional(), // Backward compat
  locationName: z.string().optional(),
  locationFeeLabel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = checkoutSchema.parse(body);

    // Resolve location code and fee
    const resolvedLocationCode = validatedData.locationCode || validatedData.stateCode || "";
    const resolvedLocationFee = validatedData.locationFee ?? validatedData.stateFee ?? 0;
    const resolvedLocationName = validatedData.locationName || resolvedLocationCode;
    const feeLabel = validatedData.locationFeeLabel || "Filing Fee";

    // Create line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Service - ${validatedData.packageId.charAt(0).toUpperCase() + validatedData.packageId.slice(1)} Package`,
            description: validatedData.llcName
              ? `${resolvedLocationName} Formation for ${validatedData.llcName}`
              : "Service package",
          },
          unit_amount: validatedData.serviceFee * 100, // Convert to cents
        },
        quantity: 1,
      },
      ...(resolvedLocationFee > 0
        ? [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${feeLabel} - ${resolvedLocationName}`,
                  description: `Official ${feeLabel.toLowerCase()} for ${resolvedLocationName}`,
                },
                unit_amount: resolvedLocationFee * 100, // Convert to cents
              },
              quantity: 1,
            },
          ]
        : []),
    ];

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      lineItems,
      customerEmail: validatedData.contactInfo.email,
      metadata: {
        orderId: validatedData.orderId || "",
        serviceId: validatedData.serviceId,
        packageId: validatedData.packageId,
        locationCode: resolvedLocationCode,
        stateCode: validatedData.stateCode || "", // Backward compat
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
      orderId: "ORD-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "001",
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
