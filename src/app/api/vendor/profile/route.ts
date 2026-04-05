import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

async function getVendorProfile(userId: string) {
  return prisma.vendorProfile.findUnique({ where: { userId } });
}

// GET /api/vendor/profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getVendorProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json({ profile });
}

// PUT /api/vendor/profile
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await getVendorProfile(session.user.id);
  if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const {
    businessName, category, description, tagline, email, phone, website,
    city, country, serviceRadiusKm, photos, videoUrls,
    startingPrice, currency, yearsInBusiness, languages,
  } = body;

  const profile = await prisma.vendorProfile.update({
    where: { id: existing.id },
    data: {
      ...(businessName !== undefined && { businessName: String(businessName).trim() }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description: description ? String(description).trim() : null }),
      ...(tagline !== undefined && { tagline: tagline ? String(tagline).trim() : null }),
      ...(email !== undefined && { email: email ? String(email).trim() : null }),
      ...(phone !== undefined && { phone: phone ? String(phone).trim() : null }),
      ...(website !== undefined && { website: website ? String(website).trim() : null }),
      ...(city !== undefined && { city: city ? String(city).trim() : null }),
      ...(country !== undefined && { country: String(country).trim() }),
      ...(serviceRadiusKm !== undefined && { serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : null }),
      ...(photos !== undefined && { photos: Array.isArray(photos) ? photos : [] }),
      ...(videoUrls !== undefined && { videoUrls: Array.isArray(videoUrls) ? videoUrls : [] }),
      ...(startingPrice !== undefined && { startingPrice: startingPrice ? parseInt(startingPrice) : null }),
      ...(currency !== undefined && { currency: String(currency) }),
      ...(yearsInBusiness !== undefined && { yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null }),
      ...(languages !== undefined && { languages: Array.isArray(languages) ? languages : [] }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ profile });
}
