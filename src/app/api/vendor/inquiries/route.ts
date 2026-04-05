import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/vendor/inquiries?status=NEW&page=1
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { vendorId: profile.id };
  if (status) where.status = status;

  const [inquiries, total] = await Promise.all([
    prisma.vendorInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.vendorInquiry.count({ where }),
  ]);

  return NextResponse.json({ inquiries, total, page, totalPages: Math.ceil(total / limit) });
}
