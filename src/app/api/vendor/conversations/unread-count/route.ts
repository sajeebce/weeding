import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/vendor/conversations/unread-count
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ count: 0 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ count: 0 });

  const count = await prisma.vendorMessage.count({
    where: {
      isRead: false,
      senderRole: "GUEST",
      conversation: { vendorId: profile.id, status: "ACTIVE" },
    },
  });

  return NextResponse.json({ count });
}
