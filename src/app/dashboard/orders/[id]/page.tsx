"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
  Phone,
  Loader2,
  Eye,
  MessageCircle,
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
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

type OrderStatus = "PENDING" | "PROCESSING" | "IN_PROGRESS" | "WAITING_FOR_INFO" | "COMPLETED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";

interface OrderItem {
  id: string;
  name: string;
  description: string | null;
  priceUSD: string;
  stateFee: string | null;
  quantity: number;
}

interface OrderDocument {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  type: string;
  status: DocumentStatus;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  subtotalUSD: string;
  discountUSD: string;
  totalUSD: string;
  currency: string;
  llcName: string | null;
  llcState: string | null;
  llcType: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerCountry: string | null;
  items: OrderItem[];
  documents: OrderDocument[];
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  WAITING_FOR_INFO: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_INFO: "Waiting for Info",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-700",
};

const documentStatusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-700",
};

// Timeline steps based on order status
const getTimelineSteps = (order: Order) => {
  const steps = [
    {
      status: "Order Placed",
      date: formatDateTime(order.createdAt),
      completed: true,
    },
    {
      status: "Payment",
      date: order.paidAt ? formatDateTime(order.paidAt) : "Pending",
      completed: order.paymentStatus === "PAID",
    },
    {
      status: "Processing",
      date: ["PROCESSING", "IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status) ? "In Progress" : "Pending",
      completed: ["PROCESSING", "IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status),
      current: order.status === "PROCESSING",
    },
    {
      status: "In Progress",
      date: ["IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status) ? "In Progress" : "Pending",
      completed: ["IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status),
      current: order.status === "IN_PROGRESS" || order.status === "WAITING_FOR_INFO",
    },
    {
      status: "Completed",
      date: order.status === "COMPLETED" ? formatDateTime(order.updatedAt) : "Pending",
      completed: order.status === "COMPLETED",
      current: order.status === "COMPLETED",
    },
  ];

  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    steps.push({
      status: order.status === "CANCELLED" ? "Cancelled" : "Refunded",
      date: formatDateTime(order.updatedAt),
      completed: true,
      current: true,
    });
  }

  return steps;
};

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPrice(price: string | number) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `$${num.toFixed(2)}`;
}

export default function OrderDetailPage({ params }: PageProps) {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve params
  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  // Fetch order data
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Order not found</h3>
            <p className="text-sm text-muted-foreground">
              The order you are looking for does not exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline = getTimelineSteps(order);
  const serviceName = order.items[0]?.name.split(" - ")[0] || "Service";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{order.orderNumber}</h1>
            <Badge variant="secondary" className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {serviceName} • {order.llcState || "N/A"}
          </p>
        </div>
        {order.documents.some((doc) => doc.status === "APPROVED") && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All Documents
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items - First */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.priceUSD)}</p>
                      {item.stateFee && parseFloat(item.stateFee) > 0 && (
                        <p className="text-sm text-muted-foreground">
                          +{formatPrice(item.stateFee)} state fee
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LLC Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                LLC Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">LLC Name</p>
                <p className="font-medium">{order.llcName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">State</p>
                <p className="font-medium">{order.llcState || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entity Type</p>
                <p className="font-medium">
                  {order.llcType === "single" ? "Single-Member LLC" : order.llcType === "multi" ? "Multi-Member LLC" : order.llcType || "LLC"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  {order.status === "COMPLETED" ? "Formation Complete" : "Pending Approval"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
              <CardDescription>Track your order status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          item.completed
                            ? "bg-primary text-primary-foreground"
                            : item.current
                            ? "border-2 border-primary bg-background"
                            : "bg-muted"
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : item.current ? (
                          <Clock className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 ${
                            item.completed ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${
                          item.current ? "text-primary" : ""
                        }`}
                      >
                        {item.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Download your LLC formation documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.documents.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No documents available yet. Documents will appear here once your order is processed.
                </p>
              ) : (
                <div className="space-y-3">
                  {order.documents.map((doc) => (
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
                            {doc.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      {doc.status === "APPROVED" ? (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.fileUrl} download={doc.fileName}>
                              <Download className="mr-1 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className={documentStatusColors[doc.status]}
                        >
                          {doc.status.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotalUSD)}</span>
              </div>
              {parseFloat(order.discountUSD) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discountUSD)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.totalUSD)}</span>
              </div>
              <Badge className={`w-full justify-center ${paymentStatusColors[order.paymentStatus]}`}>
                {order.paymentStatus === "PAID" ? "Paid" : order.paymentStatus.replace("_", " ")}
              </Badge>
              {order.paidAt && (
                <p className="text-xs text-center text-muted-foreground">
                  Paid on {formatDateTime(order.paidAt)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customerEmail}</span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.customerPhone}</span>
                </div>
              )}
              {order.customerCountry && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.customerCountry}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Need Help?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Have questions about your order?
                  </p>
                  <Button className="mt-3" variant="outline" size="sm" asChild>
                    <Link href="/dashboard/support">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
