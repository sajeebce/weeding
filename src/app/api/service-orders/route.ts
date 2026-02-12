import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/order-utils";

// Schema for service order - more flexible than LLC-specific
const serviceOrderSchema = z.object({
  // Service details
  serviceId: z.string(),
  serviceName: z.string(),

  // Package details (optional)
  packageId: z.string().optional(),
  packageName: z.string().optional(),
  packagePrice: z.number().optional(),

  // Form data - flexible object for any service
  formData: z.record(z.string(), z.unknown()),

  // Pricing
  totalAmount: z.number(),

  // Location (optional - not all services need it)
  locationCode: z.string().optional(),
  locationName: z.string().optional(),
  // Backward compat
  stateCode: z.string().optional(),
  stateName: z.string().optional(),

  // Account creation (required for new users)
  account: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    country: z.string().optional(),
  }).optional(),

  // For logged-in users
  userId: z.string().optional(),
});

// Check if email exists
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      exists: !!user,
      user: user ? { name: user.name } : null,
    });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = serviceOrderSchema.parse(body);

    let user;

    // Case 1: User is logged in (userId provided)
    if (data.userId) {
      user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please login again." },
          { status: 401 }
        );
      }
    }
    // Case 2: New user or guest (account data provided)
    else if (data.account) {
      const email = data.account.email.toLowerCase();

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // User exists but has password - they need to login
        if (existingUser.password) {
          return NextResponse.json(
            {
              error: "EMAIL_EXISTS",
              message: "An account with this email already exists. Please login to continue.",
              userName: existingUser.name,
            },
            { status: 409 }
          );
        }

        // User exists but no password (created from previous order without account)
        // Update with password
        const hashedPassword = await bcrypt.hash(data.account.password, 10);
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            name: `${data.account.firstName} ${data.account.lastName}`,
            phone: data.account.phone || existingUser.phone,
            country: data.account.country || existingUser.country,
          },
        });
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(data.account.password, 10);
        user = await prisma.user.create({
          data: {
            email,
            name: `${data.account.firstName} ${data.account.lastName}`,
            phone: data.account.phone,
            country: data.account.country,
            role: "CUSTOMER",
            password: hashedPassword,
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: "Account information or user ID is required" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Find or create service by slug
    let service = await prisma.service.findUnique({
      where: { slug: data.serviceId },
    });

    if (!service) {
      service = await prisma.service.create({
        data: {
          name: data.serviceName,
          slug: data.serviceId,
          shortDesc: `${data.serviceName} Service`,
          description: `${data.serviceName} Service`,
          isActive: true,
        },
      });
    }

    // Extract customer info from form data or account
    const customerName = data.account
      ? `${data.account.firstName} ${data.account.lastName}`
      : (data.formData.fullName as string) || (data.formData.contactName as string) || user.name || "Customer";

    const customerEmail = data.account?.email || (data.formData.email as string) || user.email;
    const customerPhone = data.account?.phone || (data.formData.phone as string) || user.phone || "";
    const customerCountry = data.account?.country || (data.formData.country as string) || user.country || "";

    // Find package if provided (packageId from checkout is the slug-like name)
    let packageRecord = null;
    if (data.packageId) {
      packageRecord = await prisma.package.findFirst({
        where: {
          serviceId: service.id,
          OR: [
            { id: data.packageId },
            { name: { equals: data.packageId, mode: "insensitive" } },
            { name: { equals: data.packageName || "", mode: "insensitive" } },
          ],
        },
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotalUSD: data.totalAmount,
        totalUSD: data.totalAmount,
        currency: "USD",
        llcState: data.locationCode || data.stateCode,
        customerName,
        customerEmail,
        customerPhone,
        customerCountry,
        items: {
          create: [
            {
              serviceId: service.id,
              packageId: packageRecord?.id || undefined,
              name: data.serviceName,
              description: `${data.packageName ? data.packageName + " - " : ""}${data.serviceName}${data.locationName || data.stateName ? ` - ${data.locationName || data.stateName}` : ""}`.trim(),
              priceUSD: data.totalAmount,
              stateFee: 0,
              locationCode: data.locationCode || (data.stateCode ? `US-${data.stateCode}` : undefined),
              locationName: data.locationName || data.stateName,
            },
          ],
        },
        notes: {
          create: [
            {
              content: JSON.stringify(data.formData, null, 2),
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
            role: true,
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
          service: data.serviceName,
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
    console.error("Service order creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create order", details: errorMessage },
      { status: 500 }
    );
  }
}
