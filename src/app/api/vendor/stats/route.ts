import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/vendor/stats
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const [inquiryCount, newInquiryCount, reviewCount, avgRating] = await Promise.all([
    prisma.vendorInquiry.count({ where: { vendorId: profile.id } }),
    prisma.vendorInquiry.count({ where: { vendorId: profile.id, status: "NEW" } }),
    prisma.vendorReview.count({ where: { vendorId: profile.id, isApproved: true } }),
    prisma.vendorReview.aggregate({
      where: { vendorId: profile.id, isApproved: true },
      _avg: { rating: true },
    }),
  ]);

  return NextResponse.json({
    stats: {
      inquiryCount,
      newInquiryCount,
      reviewCount,
      avgRating: avgRating._avg.rating ?? null,
    },
  });
}
