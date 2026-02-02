import { Suspense } from 'react';
import { StatsCards } from '@/components/admin/stats-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/db';
import { formatDateTime } from '@/lib/utils';

async function getStats() {
  const [
    totalLicenses,
    activeLicenses,
    expiredLicenses,
    suspendedLicenses,
    totalActivations,
    revenueUSD,
  ] = await Promise.all([
    prisma.license.count(),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
    prisma.license.count({ where: { status: 'EXPIRED' } }),
    prisma.license.count({ where: { status: 'SUSPENDED' } }),
    prisma.licenseActivation.count({ where: { isActive: true } }),
    prisma.license.aggregate({
      _sum: { purchasePrice: true },
      where: { purchaseCurrency: 'USD' },
    }),
  ]);

  return {
    totalLicenses,
    activeLicenses,
    expiredLicenses,
    suspendedLicenses,
    totalActivations,
    totalRevenue: {
      USD: Number(revenueUSD._sum.purchasePrice) || 0,
      BDT: 0,
    },
  };
}

async function getRecentActivity() {
  const recentLicenses = await prisma.license.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true },
  });

  const recentActivations = await prisma.licenseActivation.findMany({
    take: 5,
    orderBy: { activatedAt: 'desc' },
    include: { license: true },
  });

  const activities = [
    ...recentLicenses.map((l) => ({
      type: 'license.created',
      title: `License ${l.licenseKey.substring(0, 16)}... created`,
      description: l.customerEmail,
      time: l.createdAt,
    })),
    ...recentActivations.map((a) => ({
      type: 'activation',
      title: `Domain ${a.domain} activated`,
      description: a.license.licenseKey.substring(0, 16) + '...',
      time: a.activatedAt,
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);

  return activities;
}

function ActivityBadge({ type }: { type: string }) {
  if (type === 'license.created') {
    return <Badge variant="success">New</Badge>;
  }
  if (type === 'activation') {
    return <Badge variant="secondary">Activation</Badge>;
  }
  return <Badge variant="outline">{type}</Badge>;
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const activities = await getRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your license server metrics
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsCards stats={stats} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest license and activation events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ActivityBadge type={activity.type} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.time)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <a
                href="/admin/licenses/new"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <div className="rounded-md bg-primary/10 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Generate License</p>
                  <p className="text-sm text-muted-foreground">
                    Create a new license key
                  </p>
                </div>
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <div className="rounded-md bg-purple-100 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Manage Products</p>
                  <p className="text-sm text-muted-foreground">
                    View and edit products
                  </p>
                </div>
              </a>
              <a
                href="/admin/licenses"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <div className="rounded-md bg-green-100 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">View All Licenses</p>
                  <p className="text-sm text-muted-foreground">
                    Search and filter licenses
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
