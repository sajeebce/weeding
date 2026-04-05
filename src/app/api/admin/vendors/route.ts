import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

function requireAdmin(role: string | undefined) {
  return role === "ADMIN" || role === "CONTENT_MANAGER";
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await prisma.vendorProfile.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// GET /api/admin/vendors
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!requireAdmin(session?.user?.role as string | undefined)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;
  const q = searchParams.get("q");

  const where = q
    ? {
        OR: [
          { businessName: { contains: q, mode: "insensitive" as const } },
          { city: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [vendors, total, approvedCount, pendingCount, featuredCount] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { inquiries: true, reviews: true } },
        user: { select: { email: true, phone: true, name: true } },
      },
    }),
    prisma.vendorProfile.count({ where }),
    prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
    prisma.vendorProfile.count({ where: { status: "PENDING" } }),
    prisma.vendorProfile.count({ where: { isFeatured: true } }),
  ]);

  return NextResponse.json({
    vendors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: { approved: approvedCount, pending: pendingCount, featured: featuredCount },
  });
}

// POST /api/admin/vendors
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!requireAdmin(session?.user?.role as string | undefined)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    businessName,
    category,
    description,
    tagline,
    email,
    password,
    phone,
    website,
    city,
    country,
    lat,
    lng,
    serviceRadiusKm,
    photos,
    videoUrls,
    startingPrice,
    currency,
    yearsInBusiness,
    languages,
    isApproved,
    isActive,
    isFeatured,
  } = body;

  if (!businessName || !category) {
    return NextResponse.json(
      { error: "businessName and category are required" },
      { status: 400 }
    );
  }

  const emailStr = email ? String(email).toLowerCase().trim() : null;
  const passwordStr = password ? String(password) : null;

  // If email + password provided, create a User account so vendor can log in
  if (emailStr && passwordStr) {
    if (passwordStr.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email: emailStr } });
    if (existing) {
      return NextResponse.json({ error: "A user account with this email already exists" }, { status: 409 });
    }
  }

  const slug = await uniqueSlug(slugify(String(businessName)));
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const profileData = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    slug,
    businessName: String(businessName).trim(),
    category,
    description: description ? String(description).trim() : null,
    tagline: tagline ? String(tagline).trim() : null,
    email: emailStr,
    phone: phone ? String(phone).trim() : null,
    website: website ? String(website).trim() : null,
    city: city ? String(city).trim() : null,
    country: country ? String(country).trim() : "SE",
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
    serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : null,
    photos: Array.isArray(photos) ? photos : [],
    videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
    startingPrice: startingPrice ? parseInt(startingPrice) : null,
    currency: currency || "SEK",
    yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
    languages: Array.isArray(languages) ? languages : [],
    isApproved: isApproved !== false,
    isActive: isActive !== false,
    isFeatured: isFeatured === true,
    status: isApproved !== false ? "APPROVED" : "PENDING",
    trialEndsAt,
  };

  let vendor;
  if (emailStr && passwordStr) {
    // Create User + VendorProfile linked together
    const hashedPassword = await bcrypt.hash(passwordStr, 12);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: String(businessName).trim(),
          email: emailStr,
          password: hashedPassword,
          phone: phone ? String(phone).trim() : null,
          role: "VENDOR",
        },
      });
      return tx.vendorProfile.create({ data: { ...profileData, userId: user.id } });
    });
    vendor = result;
  } else {
    // No login account — profile only (vendor cannot log in until account is created)
    vendor = await prisma.vendorProfile.create({ data: profileData });
  }

  return NextResponse.json({ vendor }, { status: 201 });
}
