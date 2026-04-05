import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/vendors/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!vendor || !vendor.isApproved || !vendor.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const avgRating =
    vendor.reviews.length > 0
      ? vendor.reviews.reduce((sum, r) => sum + r.rating, 0) /
        vendor.reviews.length
      : null;

  return NextResponse.json({ vendor: { ...vendor, avgRating } });
}
