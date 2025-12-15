"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Mail,
  Edit,
  RefreshCcw,
  FileText,
  Building2,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
  Trash2,
  Send,
  Upload,
  Eye,
  X,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  service?: {
    id: string;
    name: string;
    slug: string;
  };
  package?: {
    id: string;
    name: string;
  } | null;
}

interface OrderNote {
  id: string;
  content: string;
  isInternal: boolean;
  authorId: string | null;
  createdAt: string;
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
  paymentId: string | null;
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
  notes: OrderNote[];
  documents: OrderDocument[];
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    country: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_FOR_INFO", label: "Waiting for Info" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PARTIALLY_REFUNDED", label: "Partially Refunded" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  WAITING_FOR_INFO: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
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
      note: "Order received via website",
      completed: true,
    },
    {
      status: "Payment",
      date: order.paidAt ? formatDateTime(order.paidAt) : "Pending",
      note: order.paymentStatus === "PAID" ? `Payment successful via ${order.paymentMethod || "Payment Gateway"}` : "Awaiting payment",
      completed: order.paymentStatus === "PAID",
    },
    {
      status: "Processing",
      date: order.status === "PROCESSING" || ["IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status) ? "In Progress" : "Pending",
      note: "Order is being processed",
      completed: ["PROCESSING", "IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status),
      current: order.status === "PROCESSING",
    },
    {
      status: "In Progress",
      date: order.status === "IN_PROGRESS" || ["WAITING_FOR_INFO", "COMPLETED"].includes(order.status) ? "In Progress" : "Pending",
      note: "Documents being prepared",
      completed: ["IN_PROGRESS", "WAITING_FOR_INFO", "COMPLETED"].includes(order.status),
      current: order.status === "IN_PROGRESS",
    },
    {
      status: "Completed",
      date: order.status === "COMPLETED" ? formatDateTime(order.updatedAt) : "Pending",
      note: "Order completed and delivered",
      completed: order.status === "COMPLETED",
      current: order.status === "COMPLETED",
    },
  ];

  // Handle cancelled/refunded orders
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    steps.push({
      status: order.status === "CANCELLED" ? "Cancelled" : "Refunded",
      date: formatDateTime(order.updatedAt),
      note: order.status === "CANCELLED" ? "Order was cancelled" : "Order was refunded",
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price: string | number) {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `$${num.toFixed(2)}`;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  // Fetch order data
  const fetchOrder = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
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

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Update order status
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      setOrder(data.order);
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Update payment status
  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      const data = await response.json();
      setOrder(data.order);
      toast.success("Payment status updated successfully");
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const data = await response.json();
      setOrder(data.order);
      setNewNote("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          note: "Order cancelled by admin",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      const data = await response.json();
      setOrder(data.order);
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      toast.success("Order deleted successfully");
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setIsUpdating(false);
    }
  };

  // Send email (placeholder)
  const handleSendEmail = async () => {
    if (!order || !emailSubject.trim() || !emailBody.trim()) return;

    try {
      // TODO: Implement actual email sending via API
      toast.success("Email sent successfully (simulated)");
      setIsEmailDialogOpen(false);
      setEmailSubject("");
      setEmailBody("");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    }
  };

  // Parse metadata from first note (if it contains JSON)
  const getOrderMetadata = () => {
    if (!order || order.notes.length === 0) return null;

    const firstNote = order.notes[order.notes.length - 1]; // Get oldest note (metadata)
    try {
      return JSON.parse(firstNote.content);
    } catch {
      return null;
    }
  };

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
          href="/admin/orders"
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

  const metadata = getOrderMetadata();
  const timeline = getTimelineSteps(order);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <Badge variant="secondary" className={statusColors[order.status]}>
              {order.status.replace("_", " ")}
            </Badge>
            <Badge variant="secondary" className={paymentStatusColors[order.paymentStatus]}>
              {order.paymentStatus.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Created {formatDateTime(order.createdAt)} • Updated {formatDateTime(order.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Email Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Email to Customer</DialogTitle>
                <DialogDescription>
                  Send an email to {order.customerEmail}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Email message"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={!emailSubject.trim() || !emailBody.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <Button size="sm" asChild>
            <Link href={`/admin/orders/${orderId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <Link
                    href={`/admin/customers/${order.user.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.customerName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customerPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{order.customerCountry || "N/A"}</p>
                </div>
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
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">LLC Name</p>
                  <p className="font-medium">{order.llcName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{order.llcState || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LLC Type</p>
                  <p className="font-medium">
                    {order.llcType === "single" ? "Single-Member" : order.llcType === "multi" ? "Multi-Member" : order.llcType || "N/A"}
                  </p>
                </div>
                {metadata?.businessPurpose && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Business Purpose</p>
                    <p className="font-medium">{metadata.businessPurpose}</p>
                  </div>
                )}
                {metadata?.managementType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Management Type</p>
                    <p className="font-medium capitalize">{metadata.managementType}-Managed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Services included in this order</CardDescription>
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
                      {item.service && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Service: {item.service.name}
                          {item.package && ` • Package: ${item.package.name}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.priceUSD)}</p>
                      {item.stateFee && parseFloat(item.stateFee) > 0 && (
                        <p className="text-sm text-muted-foreground">
                          +{formatPrice(item.stateFee)} state fee
                        </p>
                      )}
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Progress</CardTitle>
              <Select
                value={order.status}
                onValueChange={(v) => handleStatusChange(v as OrderStatus)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      {item.note && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Order-related documents</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {order.documents.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No documents uploaded yet.
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
                            {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={documentStatusColors[doc.status]}
                        >
                          {doc.status.toLowerCase()}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.fileUrl} download={doc.fileName}>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>Staff-only notes about this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={isAddingNote || !newNote.trim()}
                >
                  {isAddingNote ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add Note
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                {order.notes.filter((note) => {
                  // Filter out metadata JSON notes
                  try {
                    JSON.parse(note.content);
                    return false;
                  } catch {
                    return true;
                  }
                }).length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No notes yet.
                  </p>
                ) : (
                  order.notes
                    .filter((note) => {
                      try {
                        JSON.parse(note.content);
                        return false;
                      } catch {
                        return true;
                      }
                    })
                    .map((note) => (
                      <div key={note.id} className="rounded-lg bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {note.isInternal ? "Staff" : "System"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(note.createdAt)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm">{note.content}</p>
                      </div>
                    ))
                )}
              </div>
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
              {order.items.map((item, index) => (
                <div key={item.id}>
                  <p className="text-sm text-muted-foreground">
                    {index === 0 ? "Service" : `Service ${index + 1}`}
                  </p>
                  <p className="font-medium">{item.name}</p>
                </div>
              ))}
              <Separator />
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
                <span className="text-lg">{formatPrice(order.totalUSD)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Method</p>
                <p className="font-medium">{order.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm break-all">{order.paymentId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Select
                  value={order.paymentStatus}
                  onValueChange={(v) => handlePaymentStatusChange(v as PaymentStatus)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Paid At</p>
                  <p className="text-sm">{formatDateTime(order.paidAt)}</p>
                </div>
              )}
              <Separator />
              <Button variant="outline" className="w-full" size="sm" disabled>
                Issue Refund
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsEmailDialogOpen(true)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Status Update
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Resend Documents
              </Button>
              <Separator />

              {/* Cancel Order */}
              {order.status !== "CANCELLED" && order.status !== "COMPLETED" && order.status !== "REFUNDED" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-amber-600 hover:text-amber-600"
                      disabled={isUpdating}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this order? This action can be reversed by changing the status later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, keep order</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelOrder}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Yes, cancel order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Delete Order */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    disabled={isUpdating}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the order and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteOrder}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
