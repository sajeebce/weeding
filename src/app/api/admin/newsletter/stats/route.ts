import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

export async function GET() {
  try {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      return authError();
    }

    // Get total subscribers
    const total = await prisma.newsletterSubscriber.count({
      where: { status: "ACTIVE" }
    });

    // Get subscribers from this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await prisma.newsletterSubscriber.count({
      where: {
        status: "ACTIVE",
        subscribedAt: {
          gte: startOfMonth
        }
      }
    });

    return NextResponse.json({
      total,
      thisMonth,
    });
  } catch (error) {
    console.error("Newsletter stats error:", error);
    // Return zeros if table doesn't exist yet
    return NextResponse.json({
      total: 0,
      thisMonth: 0,
    });
  }
}
