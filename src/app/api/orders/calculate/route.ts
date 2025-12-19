import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// Validation schema
const calculateSchema = z.object({
  serviceId: z.string().optional(),
  packageId: z.string().optional(),
  stateCode: z.string().length(2).optional(),
  addons: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1).optional(),
  })).optional(),
  couponCode: z.string().optional(),
});

interface PriceBreakdown {
  basePrice: number;
  stateFee: number | null;
  stateFeeName: string | null;
  addonsTotal: number;
  addons: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount: number;
  discountType: string | null;
  couponCode: string | null;
  total: number;
  processingTime: string | null;
}

// POST /api/orders/calculate - Calculate order total
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId, stateCode, couponCode } = calculateSchema.parse(body);

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    // Get package details
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            processingTime: true,
          },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    const breakdown: PriceBreakdown = {
      basePrice: Number(pkg.priceUSD),
      stateFee: null,
      stateFeeName: null,
      addonsTotal: 0,
      addons: [],
      subtotal: Number(pkg.priceUSD),
      discount: 0,
      discountType: null,
      couponCode: null,
      total: Number(pkg.priceUSD),
      processingTime: pkg.service.processingTime,
    };

    // Get state fee if applicable
    if (stateCode) {
      const stateFee = await prisma.stateFee.findUnique({
        where: { stateCode: stateCode.toUpperCase() },
      });

      if (stateFee) {
        breakdown.stateFee = Number(stateFee.llcFee);
        breakdown.stateFeeName = stateFee.stateName;
        breakdown.subtotal += breakdown.stateFee;
        breakdown.total += breakdown.stateFee;

        // Update processing time if state has specific time
        if (stateFee.processingTime) {
          breakdown.processingTime = stateFee.processingTime;
        }
      }
    }

    // TODO: Add addon support when addon model is ready
    // For now, addons are empty

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      });

      if (coupon) {
        // Check usage limit
        const usageAllowed =
          coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit;

        // Check minimum order
        const meetsMinimum =
          coupon.minOrder === null ||
          Number(coupon.minOrder) <= breakdown.subtotal;

        if (usageAllowed && meetsMinimum) {
          breakdown.couponCode = coupon.code;
          breakdown.discountType = coupon.type;

          if (coupon.type === "PERCENTAGE") {
            breakdown.discount = (breakdown.subtotal * Number(coupon.value)) / 100;
            // Apply max discount if set
            if (coupon.maxDiscount && breakdown.discount > Number(coupon.maxDiscount)) {
              breakdown.discount = Number(coupon.maxDiscount);
            }
          } else {
            // FIXED amount
            breakdown.discount = Number(coupon.value);
          }

          breakdown.total = Math.max(0, breakdown.subtotal - breakdown.discount);
        }
      }
    }

    // Round to 2 decimal places
    breakdown.total = Math.round(breakdown.total * 100) / 100;
    breakdown.discount = Math.round(breakdown.discount * 100) / 100;
    breakdown.subtotal = Math.round(breakdown.subtotal * 100) / 100;

    return NextResponse.json({
      package: {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
      },
      service: {
        id: pkg.service.id,
        name: pkg.service.name,
      },
      breakdown,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error calculating order:", error);
    return NextResponse.json(
      { error: "Failed to calculate order" },
      { status: 500 }
    );
  }
}
