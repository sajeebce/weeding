import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/order-utils";

const orderSchema = z.object({
  // Service & Package
  serviceId: z.string(),
  serviceName: z.string().optional(),
  packageId: z.string(),
  packageName: z.string().optional(),

  // Location (replaces State)
  locationCode: z.string().optional(),
  locationName: z.string().optional(),
  locationFee: z.number().default(0),
  locationFeeLabel: z.string().optional(),
  // Backward compat
  stateCode: z.string().optional(),
  stateName: z.string().optional(),
  stateFee: z.number().default(0),

  // LLC Details
  llcName: z.string().min(1, "LLC name is required"),
  llcNameAlt1: z.string().optional(),
  llcNameAlt2: z.string().optional(),
  llcType: z.enum(["single", "multi"]).default("single"),
  managementType: z.enum(["member", "manager"]).default("member"),
  businessPurpose: z.string().optional(),
  businessIndustry: z.string().optional(),

  // Manager Details (for manager-managed LLC)
  managerType: z.enum(["member", "nonMember"]).optional(),
  nonMemberManager: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    country: z.string(),
  }).nullable().optional(),

  // Profit Distribution (for multi-member)
  profitDistribution: z.enum(["proportional", "equal", "custom"]).nullable().optional(),

  // Owner Information
  owner: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone number is required"),
    country: z.string().min(1, "Country is required"),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    passportNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    ownershipPercentage: z.number().default(100),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
  }),

  // Additional Members (for multi-member LLC)
  additionalMembers: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    ownershipPercentage: z.number(),
  })).optional(),

  // Additional Services
  needsEIN: z.boolean().default(true),
  needsRegisteredAgent: z.boolean().default(true),
  needsBankingAssistance: z.boolean().default(false),
  expeditedProcessing: z.boolean().default(false),

  // Pricing
  serviceFee: z.number(),
  expeditedFee: z.number().default(0),
  totalAmount: z.number(),

  // Add-ons
  addons: z.array(z.object({
    featureId: z.string(),
    name: z.string(),
    price: z.number(),
  })).optional(),
  addonsTotal: z.number().default(0),

  // Logged-in user
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = orderSchema.parse(body);

    // Hash the password if provided
    const hashedPassword = data.owner.password
      ? await bcrypt.hash(data.owner.password, 10)
      : undefined;

    // Find or create user by email
    let user = data.userId
      ? await prisma.user.findUnique({ where: { id: data.userId } })
      : await prisma.user.findUnique({ where: { email: data.owner.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: data.owner.email,
          name: `${data.owner.firstName} ${data.owner.lastName}`,
          phone: data.owner.phone,
          country: data.owner.country,
          role: "CUSTOMER",
          ...(hashedPassword ? { password: hashedPassword } : {}),
        },
      });
    } else if (!user.password && hashedPassword) {
      // Update existing user with password if they don't have one
      user = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Find or create service by slug
    let service = await prisma.service.findUnique({
      where: { slug: data.serviceId },
    });

    if (!service) {
      // Create default service if not found
      service = await prisma.service.create({
        data: {
          name: data.serviceName || "LLC Formation",
          slug: data.serviceId,
          shortDesc: "US LLC Formation Service",
          description: "US LLC Formation Service",
          isActive: true,
        },
      });
    }

    // Build order metadata (store additional info)
    const orderMetadata = {
      llcNameAlt1: data.llcNameAlt1,
      llcNameAlt2: data.llcNameAlt2,
      managementType: data.managementType,
      businessPurpose: data.businessPurpose,
      businessIndustry: data.businessIndustry,
      // Manager details (for manager-managed LLC)
      managerType: data.managerType,
      nonMemberManager: data.nonMemberManager,
      // Multi-member details
      profitDistribution: data.profitDistribution,
      additionalMembers: data.additionalMembers || [],
      // Owner details
      ownerAddress: data.owner.address,
      ownerCity: data.owner.city,
      ownerPostalCode: data.owner.postalCode,
      ownerPassportNumber: data.owner.passportNumber,
      ownerDateOfBirth: data.owner.dateOfBirth,
      ownershipPercentage: data.owner.ownershipPercentage,
      // Additional services
      needsEIN: data.needsEIN,
      needsRegisteredAgent: data.needsRegisteredAgent,
      needsBankingAssistance: data.needsBankingAssistance,
      expeditedProcessing: data.expeditedProcessing,
      // Add-ons
      addons: data.addons || [],
      addonsTotal: data.addonsTotal,
    };

    // Create order with items and notes
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotalUSD: data.serviceFee,
        totalUSD: data.totalAmount,
        currency: "USD",
        llcName: data.llcName,
        llcState: data.locationCode || data.stateCode,
        llcType: data.llcType,
        customerName: `${data.owner.firstName} ${data.owner.lastName}`,
        customerEmail: data.owner.email,
        customerPhone: data.owner.phone,
        customerCountry: data.owner.country,
        items: {
          create: [
            {
              serviceId: service.id,
              name: `${data.serviceName || "LLC Formation"} - ${data.packageName || "Standard"} Package`,
              description: `${data.locationName || data.stateName || ""} Formation`,
              priceUSD: data.serviceFee,
              stateFee: data.locationFee || data.stateFee,
              locationCode: data.locationCode || (data.stateCode ? `US-${data.stateCode}` : undefined),
              locationName: data.locationName || data.stateName,
              locationFeeLabel: data.locationFeeLabel,
            },
            // Add-on items
            ...(data.addons || []).map((addon) => ({
              serviceId: service!.id,
              name: addon.name,
              description: "Add-on service",
              priceUSD: addon.price,
              stateFee: 0,
            })),
          ],
        },
        notes: {
          create: [
            {
              content: JSON.stringify(orderMetadata, null, 2),
              isInternal: true,
            },
          ],
        },
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "ORDER_CREATED",
        entity: "Order",
        entityId: order.id,
        metadata: {
          orderNumber,
          llcName: data.llcName,
          locationCode: data.locationCode || data.stateCode,
          total: data.totalAmount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      message: "Order created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create order", details: errorMessage },
      { status: 500 }
    );
  }
}

// Get orders (for admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { items: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              service: { select: { id: true, name: true, slug: true } },
              package: { select: { id: true, name: true } },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              country: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
