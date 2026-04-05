import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/vendor/inquiries/[id] — update status (VIEWED, RESPONDED, ARCHIVED)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const inquiry = await prisma.vendorInquiry.findFirst({
    where: { id, vendorId: profile.id },
  });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.vendorInquiry.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ inquiry: updated });
}
