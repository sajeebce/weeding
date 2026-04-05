import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

function requireAdmin(role: string | undefined) {
  return role === "ADMIN" || role === "CONTENT_MANAGER";
}

// POST /api/admin/vendors/[id]/create-account
// Creates a User login account for an admin-added vendor that has no userId
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!requireAdmin(session?.user?.role as string | undefined)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { password } = body;

  if (!password || String(password).length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { id },
    select: { id: true, userId: true, email: true, businessName: true, phone: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  if (profile.userId) {
    return NextResponse.json({ error: "This vendor already has a login account" }, { status: 409 });
  }

  const email = profile.email;
  if (!email) {
    return NextResponse.json({ error: "Vendor has no email address — add an email first" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Email already in User table — just link the profile to this user
    await prisma.vendorProfile.update({
      where: { id },
      data: { userId: existing.id },
    });
    return NextResponse.json({ message: "Linked to existing account", email });
  }

  const hashedPassword = await bcrypt.hash(String(password), 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: profile.businessName,
        email,
        password: hashedPassword,
        phone: profile.phone ?? null,
        role: "VENDOR",
      },
    });
    await tx.vendorProfile.update({
      where: { id },
      data: { userId: user.id },
    });
  });

  return NextResponse.json({ message: "Login account created", email }, { status: 201 });
}
