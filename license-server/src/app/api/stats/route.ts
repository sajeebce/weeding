import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/stats - Get dashboard statistics
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get counts
    const [
      totalLicenses,
      activeLicenses,
      expiredLicenses,
      suspendedLicenses,
      revokedLicenses,
      refundedLicenses,
      totalActivations,
      activeActivations,
    ] = await Promise.all([
      prisma.license.count(),
      prisma.license.count({ where: { status: 'ACTIVE' } }),
      prisma.license.count({ where: { status: 'EXPIRED' } }),
      prisma.license.count({ where: { status: 'SUSPENDED' } }),
      prisma.license.count({ where: { status: 'REVOKED' } }),
      prisma.license.count({ where: { status: 'REFUNDED' } }),
      prisma.licenseActivation.count(),
      prisma.licenseActivation.count({ where: { isActive: true } }),
    ]);

    // Get revenue by currency
    const revenueData = await prisma.license.groupBy({
      by: ['purchaseCurrency'],
      _sum: { purchasePrice: true },
      where: {
        purchasePrice: { not: null },
        status: { not: 'REFUNDED' },
      },
    });

    const totalRevenue: Record<string, number> = {};
    for (const item of revenueData) {
      if (item.purchaseCurrency) {
        totalRevenue[item.purchaseCurrency] = Number(item._sum.purchasePrice) || 0;
      }
    }

    // Get sales by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const salesByMonth = await prisma.license.groupBy({
      by: ['purchasedAt'],
      _count: true,
      _sum: { purchasePrice: true },
      where: {
        purchasedAt: { gte: sixMonthsAgo },
        status: { not: 'REFUNDED' },
      },
      orderBy: { purchasedAt: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, { count: number; revenue: number }> = {};
    for (const sale of salesByMonth) {
      const monthKey = sale.purchasedAt.toISOString().substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, revenue: 0 };
      }
      monthlyData[monthKey].count += sale._count;
      monthlyData[monthKey].revenue += Number(sale._sum.purchasePrice) || 0;
    }

    // Get sales by product
    const salesByProduct = await prisma.license.groupBy({
      by: ['productId'],
      _count: true,
      where: { status: { not: 'REFUNDED' } },
    });

    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));
    const salesByProductFormatted = salesByProduct.map((item) => ({
      product: productMap.get(item.productId) || 'Unknown',
      count: item._count,
    }));

    // Get activations by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activationsByDay = await prisma.licenseActivation.groupBy({
      by: ['activatedAt'],
      _count: true,
      where: {
        activatedAt: { gte: sevenDaysAgo },
      },
      orderBy: { activatedAt: 'asc' },
    });

    // Group by day
    const dailyActivations: Record<string, number> = {};
    for (const act of activationsByDay) {
      const dayKey = act.activatedAt.toISOString().substring(0, 10);
      if (!dailyActivations[dayKey]) {
        dailyActivations[dayKey] = 0;
      }
      dailyActivations[dayKey] += act._count;
    }

    // Get recent activity
    const recentLicenses = await prisma.license.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        licenseKey: true,
        customerEmail: true,
        createdAt: true,
      },
    });

    const recentActivations = await prisma.licenseActivation.findMany({
      take: 5,
      orderBy: { activatedAt: 'desc' },
      select: {
        domain: true,
        activatedAt: true,
        license: {
          select: { licenseKey: true },
        },
      },
    });

    const recentActivity = [
      ...recentLicenses.map((l) => ({
        type: 'license.created',
        licenseKey: l.licenseKey,
        customerEmail: l.customerEmail,
        createdAt: l.createdAt.toISOString(),
      })),
      ...recentActivations.map((a) => ({
        type: 'activation',
        licenseKey: a.license.licenseKey,
        domain: a.domain,
        createdAt: a.activatedAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      overview: {
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        suspendedLicenses,
        revokedLicenses,
        refundedLicenses,
        totalActivations,
        activeActivations,
        totalRevenue,
      },
      recentActivity,
      charts: {
        salesByMonth: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          count: data.count,
          revenue: data.revenue,
        })),
        salesByProduct: salesByProductFormatted,
        activationsByDay: Object.entries(dailyActivations).map(([date, count]) => ({
          date,
          count,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
