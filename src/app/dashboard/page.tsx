"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  documentCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  service: string;
  state: string | null;
  status: string;
  date: string;
  total: string;
}

interface RecentDocument {
  id: string;
  name: string;
  type: string;
  status: string;
  date: string;
  url: string | null;
  orderNumber: string | null;
}

interface Alert {
  id: string;
  orderNumber: string;
  service: string;
  message: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  recentDocuments: RecentDocument[];
  alerts: Alert[];
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-700",
  in_progress: "bg-amber-100 text-amber-700",
  ready: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/overview");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      setData(result);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Orders",
      value: data?.stats.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed",
      value: data?.stats.completedOrders ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "In Progress",
      value: data?.stats.inProgressOrders ?? 0,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Documents",
      value: data?.stats.documentCount ?? 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your account.
          </p>
        </div>

        {/* Loading State */}
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your account.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Alert Banner */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Action Required</p>
              <p className="mt-1 text-sm text-amber-700">
                {data.alerts[0].message}{" "}
                <Link
                  href={`/dashboard/orders/${data.alerts[0].id}`}
                  className="font-medium underline"
                >
                  View details
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.orderNumber}
                        {order.state && ` • ${order.state}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status] || statusColors.pending}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                      <p className="mt-1 text-sm font-medium">{order.total}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start by creating your first LLC
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/services">Browse Services</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/documents">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data?.recentDocuments && data.recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {data.recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.date}
                        </p>
                      </div>
                    </div>
                    {doc.status === "approved" || doc.status === "ready" ? (
                      doc.url ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          className={statusColors[doc.status]}
                        >
                          {doc.status}
                        </Badge>
                      )
                    ) : (
                      <Badge
                        variant="secondary"
                        className={statusColors[doc.status] || statusColors.pending}
                      >
                        {doc.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Documents will appear here once your orders are processed
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/services/llc-formation">New LLC Formation</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/services/ein-application">Apply for EIN</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/support">Contact Support</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/documents">Upload Document</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
