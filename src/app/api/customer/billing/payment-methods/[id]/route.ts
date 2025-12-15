import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE - Remove a payment method
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false },
    });

    // If was default, set another as default
    if (paymentMethod.isDefault) {
      const nextDefault = await prisma.paymentMethod.findFirst({
        where: { userId: session.user.id, isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (nextDefault) {
        await prisma.paymentMethod.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    );
  }
}

// PATCH - Set as default
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId: session.user.id, isActive: true },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      );
    }

    // Unset other defaults
    await prisma.paymentMethod.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set this as default
    await prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set default payment method error:", error);
    return NextResponse.json(
      { error: "Failed to set default payment method" },
      { status: 500 }
    );
  }
}
