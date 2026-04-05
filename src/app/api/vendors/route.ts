import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { activePlanWhereClause } from "@/lib/vendor-plan";

// GET /api/vendors?category=PHOTOGRAPHY&city=Stockholm&q=name&featured=true&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as string | null;
  const city = searchParams.get("city");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 12;
  const skip = (page - 1) * limit;

  // Only show vendors with an active plan (BUSINESS or TRIAL not expired)
  const where: Record<string, unknown> = {
    isApproved: true,
    isActive: true,
    ...activePlanWhereClause(),
  };

  if (category) where.category = category;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (featured) where.isFeatured = true;
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [vendors, total] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        businessName: true,
        category: true,
        tagline: true,
        city: true,
        country: true,
        photos: true,
        startingPrice: true,
        currency: true,
        isFeatured: true,
        _count: { select: { reviews: { where: { isApproved: true } } } },
      },
    }),
    prisma.vendorProfile.count({ where }),
  ]);

  // Compute avg rating for each vendor
  const vendorIds = vendors.map((v) => v.id);
  const ratings =
    vendorIds.length > 0
      ? await prisma.vendorReview.groupBy({
          by: ["vendorId"],
          where: { vendorId: { in: vendorIds }, isApproved: true },
          _avg: { rating: true },
        })
      : [];

  const ratingMap = new Map(ratings.map((r) => [r.vendorId, r._avg.rating]));

  const result = vendors.map((v) => ({
    ...v,
    reviewCount: v._count.reviews,
    avgRating: ratingMap.get(v.id) ?? null,
    coverPhoto: v.photos[0] ?? null,
  }));

  return NextResponse.json({
    vendors: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
