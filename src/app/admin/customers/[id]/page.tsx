import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  FileText,
  MessageSquare,
  Edit,
  Ban,
  Key,
  Download,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBusinessConfig } from "@/lib/business-settings";
import { getCurrencySymbol } from "@/lib/currencies";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock customer data
const getCustomer = (id: string) => ({
  id,
  name: "John Doe",
  email: "john@example.com",
  phone: "+880 1712 345678",
  country: "Bangladesh",
  countryCode: "BD",
  status: "active",
  joinedAt: "2024-11-15",
  lastLogin: "2024-12-10 10:30 AM",
  stats: {
    totalOrders: 3,
    totalSpent: 747,
    avgOrderValue: 249,
  },
  orders: [
    {
      id: "LLC-2024-ABC123",
      service: "LLC Formation",
      amount: 249,
      status: "processing",
      date: "2024-12-10",
    },
    {
      id: "LLC-2024-DEF456",
      service: "EIN Application",
      amount: 99,
      status: "completed",
      date: "2024-11-25",
    },
    {
      id: "LLC-2024-GHI789",
      service: "Registered Agent",
      amount: 399,
      status: "completed",
      date: "2024-11-15",
    },
  ],
  documents: [
    {
      name: "Passport Copy",
      type: "ID Document",
      status: "approved",
      uploadedAt: "2024-11-15",
    },
    {
      name: "Address Proof",
      type: "ID Document",
      status: "approved",
      uploadedAt: "2024-11-15",
    },
    {
      name: "Articles of Organization",
      type: "LLC Document",
      status: "ready",
      uploadedAt: "2024-12-10",
    },
  ],
  tickets: [
    {
      id: "TKT-001",
      subject: "Question about EIN timeline",
      status: "resolved",
      date: "2024-11-28",
    },
    {
      id: "TKT-002",
      subject: "Need operating agreement update",
      status: "open",
      date: "2024-12-09",
    },
  ],
  activity: [
    { action: "Logged in", date: "2024-12-10 10:30 AM" },
    { action: "Viewed order LLC-2024-ABC123", date: "2024-12-10 10:32 AM" },
    { action: "Downloaded Operating Agreement", date: "2024-12-09 03:15 PM" },
    { action: "Created support ticket", date: "2024-12-09 02:45 PM" },
    { action: "Placed order LLC-2024-ABC123", date: "2024-12-08 11:00 AM" },
  ],
});

const statusColors: Record<string, string> = {
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  open: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  ready: "bg-green-100 text-green-700",
};

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = getCustomer(id);
  const businessConfig = await getBusinessConfig();
  const currencySymbol = getCurrencySymbol(businessConfig.currency);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Customers
      </Link>

      {/* Customer Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <Badge
                variant="secondary"
                className={
                  customer.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }
              >
                {customer.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders ({customer.orders.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({customer.documents.length})</TabsTrigger>
              <TabsTrigger value="tickets">Tickets ({customer.tickets.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>All orders placed by this customer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium hover:underline"
                          >
                            {order.id}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {order.service} • {order.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className={statusColors[order.status]}
                          >
                            {order.status}
                          </Badge>
                          <span className="font-medium">{currencySymbol}{order.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Uploaded and generated documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {doc.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={statusColors[doc.status]}
                          >
                            {doc.status}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Customer support history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <Link
                            href={`/admin/tickets/${ticket.id}`}
                            className="font-medium hover:underline"
                          >
                            {ticket.subject}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {ticket.id} • {ticket.date}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={statusColors[ticket.status]}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Recent customer activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.activity.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm">{item.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.country}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Joined {customer.joinedAt}</p>
                  <p className="text-xs text-muted-foreground">
                    Last login: {customer.lastLogin}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-medium">{customer.stats.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Spent</span>
                <span className="font-medium">{currencySymbol}{customer.stats.totalSpent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Order Value</span>
                <span className="font-medium">{currencySymbol}{customer.stats.avgOrderValue}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                Disable Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
