import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

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

// POST /api/vendor/register
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, phone, businessName, category, city, country, description, tagline } = body;

  if (!name || !email || !password || !businessName || !category) {
    return NextResponse.json(
      { error: "name, email, password, businessName, and category are required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (String(password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(String(password), 12);
  const slug = await uniqueSlug(slugify(String(businessName)));

  // Create user + vendor profile in a transaction
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  let result;
  try {
  result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        password: hashedPassword,
        phone: phone ? String(phone).trim() : null,
        role: "VENDOR",
      },
    });

    const profile = await tx.vendorProfile.create({
      data: {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        slug,
        userId: user.id,
        businessName: String(businessName).trim(),
        category,
        description: description ? String(description).trim() : null,
        tagline: tagline ? String(tagline).trim() : null,
        city: city ? String(city).trim() : null,
        country: country ? String(country).trim() : "SE",
        status: "PENDING",
        isApproved: false,
        isActive: true,
        trialEndsAt,
      },
    });

    return { user, profile };
  });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[vendor/register] transaction error:", msg);
    return NextResponse.json({ error: "Server error: " + msg }, { status: 500 });
  }

  return NextResponse.json(
    {
      message: "Registration successful. Your listing is pending admin approval.",
      userId: result.user.id,
      profileId: result.profile.id,
    },
    { status: 201 }
  );
}
