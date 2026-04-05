import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

function requireAdmin(role: string | undefined) {
  return role === "ADMIN" || role === "CONTENT_MANAGER";
}

// PUT /api/admin/vendors/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!requireAdmin(session?.user?.role as string | undefined)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    businessName,
    category,
    description,
    tagline,
    email,
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
    status,
    planTier,
  } = body;

  const vendor = await prisma.vendorProfile.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(planTier !== undefined && { planTier }),
      ...(businessName !== undefined && { businessName: String(businessName).trim() }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description: description ? String(description).trim() : null }),
      ...(tagline !== undefined && { tagline: tagline ? String(tagline).trim() : null }),
      ...(email !== undefined && { email: email ? String(email).trim() : null }),
      ...(phone !== undefined && { phone: phone ? String(phone).trim() : null }),
      ...(website !== undefined && { website: website ? String(website).trim() : null }),
      ...(city !== undefined && { city: city ? String(city).trim() : null }),
      ...(country !== undefined && { country: String(country).trim() }),
      ...(lat !== undefined && { lat: lat ? parseFloat(lat) : null }),
      ...(lng !== undefined && { lng: lng ? parseFloat(lng) : null }),
      ...(serviceRadiusKm !== undefined && { serviceRadiusKm: serviceRadiusKm ? parseInt(serviceRadiusKm) : null }),
      ...(photos !== undefined && { photos: Array.isArray(photos) ? photos : [] }),
      ...(videoUrls !== undefined && { videoUrls: Array.isArray(videoUrls) ? videoUrls : [] }),
      ...(startingPrice !== undefined && { startingPrice: startingPrice ? parseInt(startingPrice) : null }),
      ...(currency !== undefined && { currency: String(currency) }),
      ...(yearsInBusiness !== undefined && { yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null }),
      ...(languages !== undefined && { languages: Array.isArray(languages) ? languages : [] }),
      ...(isApproved !== undefined && { isApproved: Boolean(isApproved) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ vendor });
}

// DELETE /api/admin/vendors/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!requireAdmin(session?.user?.role as string | undefined)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.vendorProfile.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
