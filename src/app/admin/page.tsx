import Link from "next/link";
import {
  DollarSign,
  Package,
  Users,
  MessageSquare,
  FileText,
  ArrowUpRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";

// Mock data
const stats = {
  revenue: { value: 12450, change: 12 },
  orders: { value: 48, change: 8 },
  customers: { value: 156, change: 15 },
  tickets: { value: 5, change: -20 },
};

const recentOrders = [
  {
    id: "LLC-2024-ABC123",
    customer: "John Doe",
    email: "john@example.com",
    service: "LLC Formation",
    amount: 249,
    status: "processing",
    date: "2024-12-10",
  },
  {
    id: "LLC-2024-DEF456",
    customer: "Jane Smith",
    email: "jane@example.com",
    service: "EIN Application",
    amount: 99,
    status: "completed",
    date: "2024-12-09",
  },
  {
    id: "LLC-2024-GHI789",
    customer: "Bob Wilson",
    email: "bob@example.com",
    service: "LLC Formation",
    amount: 349,
    status: "pending",
    date: "2024-12-09",
  },
  {
    id: "LLC-2024-JKL012",
    customer: "Alice Brown",
    email: "alice@example.com",
    service: "Amazon Seller",
    amount: 199,
    status: "in_progress",
    date: "2024-12-08",
  },
];

const recentTickets = [
  {
    id: "TKT-001",
    subject: "Question about EIN timeline",
    customer: "John Doe",
    status: "open",
    priority: "high",
    date: "2024-12-10",
  },
  {
    id: "TKT-002",
    subject: "Document upload issue",
    customer: "Jane Smith",
    status: "waiting",
    priority: "medium",
    date: "2024-12-09",
  },
  {
    id: "TKT-003",
    subject: "Need LLC operating agreement",
    customer: "Bob Wilson",
    status: "open",
    priority: "low",
    date: "2024-12-08",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  open: "bg-blue-100 text-blue-700",
  waiting: "bg-amber-100 text-amber-700",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">
            <Package className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.value.toLocaleString()}`}
          change={stats.revenue.change}
          changeLabel="vs last month"
          icon={<DollarSign className="h-6 w-6" />}
          iconBg="bg-green-100 text-green-600"
        />
        <StatCard
          title="Orders"
          value={stats.orders.value}
          change={stats.orders.change}
          changeLabel="vs last month"
          icon={<Package className="h-6 w-6" />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="New Customers"
          value={stats.customers.value}
          change={stats.customers.change}
          changeLabel="vs last month"
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Open Tickets"
          value={stats.tickets.value}
          change={stats.tickets.change}
          changeLabel="vs last month"
          icon={<MessageSquare className="h-6 w-6" />}
          iconBg="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/admin/orders?status=pending">
                <Clock className="h-5 w-5" />
                <span>Pending Orders</span>
                <Badge>3</Badge>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href="/admin/tickets?status=open">
                <MessageSquare className="h-5 w-5" />
                <span>Open Tickets</span>
                <Badge>5</Badge>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders across all services</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.id}
                      </Link>
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status]}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer} - {order.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.amount}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Open support tickets</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/tickets">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-medium hover:underline"
                      >
                        {ticket.subject}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.id} - {ticket.customer}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant="secondary"
                      className={statusColors[ticket.status]}
                    >
                      {ticket.status}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={priorityColors[ticket.priority]}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: CheckCircle,
                iconColor: "text-green-500",
                title: "Order LLC-2024-ABC123 marked as completed",
                time: "5 minutes ago",
              },
              {
                icon: Package,
                iconColor: "text-blue-500",
                title: "New order received from John Doe",
                time: "1 hour ago",
              },
              {
                icon: FileText,
                iconColor: "text-amber-500",
                title: "Document uploaded by Jane Smith",
                time: "2 hours ago",
              },
              {
                icon: MessageSquare,
                iconColor: "text-purple-500",
                title: "New support ticket from Bob Wilson",
                time: "3 hours ago",
              },
              {
                icon: Users,
                iconColor: "text-indigo-500",
                title: "New customer registration: Alice Brown",
                time: "5 hours ago",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`mt-1 ${activity.iconColor}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
