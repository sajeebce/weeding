import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const addPaymentMethodSchema = z.object({
  type: z.enum(["card", "bank"]).default("card"),
  brand: z.string().optional(),
  last4: z.string().length(4),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(2024).optional(),
  cardholderName: z.string().optional(),
  stripePaymentMethodId: z.string().optional(),
  setAsDefault: z.boolean().default(false),
});

// POST - Add a new payment method
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = addPaymentMethodSchema.parse(body);

    // If setting as default, unset other defaults
    if (validatedData.setAsDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is the first payment method
    const existingMethods = await prisma.paymentMethod.count({
      where: { userId: session.user.id, isActive: true },
    });

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        type: validatedData.type,
        brand: validatedData.brand,
        last4: validatedData.last4,
        expiryMonth: validatedData.expiryMonth,
        expiryYear: validatedData.expiryYear,
        cardholderName: validatedData.cardholderName,
        stripePaymentMethodId: validatedData.stripePaymentMethodId,
        isDefault: validatedData.setAsDefault || existingMethods === 0,
      },
    });

    return NextResponse.json({ paymentMethod }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Add payment method error:", error);
    return NextResponse.json(
      { error: "Failed to add payment method" },
      { status: 500 }
    );
  }
}
