"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

type OrderStatus = "PENDING" | "PROCESSING" | "IN_PROGRESS" | "WAITING_FOR_INFO" | "COMPLETED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

interface OrderItem {
  id: string;
  name: string;
  description: string | null;
  priceUSD: string;
  stateFee: string | null;
  quantity: number;
  serviceId: string;
  packageId: string | null;
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
  notes: Array<{
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
  }>;
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

interface FormData {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentId: string;
  llcName: string;
  llcState: string;
  llcType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  subtotalUSD: string;
  discountUSD: string;
  totalUSD: string;
  items: OrderItem[];
  note: string;
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

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export default function AdminOrderEditPage({ params }: PageProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<FormData>({
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "",
    paymentId: "",
    llcName: "",
    llcState: "",
    llcType: "single",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCountry: "",
    subtotalUSD: "0",
    discountUSD: "0",
    totalUSD: "0",
    items: [],
    note: "",
  });

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
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data);
        setFormData({
          status: data.status,
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod || "",
          paymentId: data.paymentId || "",
          llcName: data.llcName || "",
          llcState: data.llcState || "",
          llcType: data.llcType || "single",
          customerName: data.customerName || "",
          customerEmail: data.customerEmail || "",
          customerPhone: data.customerPhone || "",
          customerCountry: data.customerCountry || "",
          subtotalUSD: data.subtotalUSD || "0",
          discountUSD: data.discountUSD || "0",
          totalUSD: data.totalUSD || "0",
          items: data.items || [],
          note: "",
        });
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `new-${Date.now()}`,
          name: "",
          description: "",
          priceUSD: "0",
          stateFee: "0",
          quantity: 1,
          serviceId: "",
          packageId: null,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const price = parseFloat(item.priceUSD) || 0;
      const stateFee = parseFloat(item.stateFee || "0") || 0;
      return sum + (price + stateFee) * item.quantity;
    }, 0);
    const discount = parseFloat(formData.discountUSD) || 0;
    const total = subtotal - discount;
    setFormData((prev) => ({
      ...prev,
      subtotalUSD: subtotal.toFixed(2),
      totalUSD: total.toFixed(2),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          paymentMethod: formData.paymentMethod || null,
          paymentId: formData.paymentId || null,
          llcName: formData.llcName || null,
          llcState: formData.llcState || null,
          llcType: formData.llcType || null,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone || null,
          customerCountry: formData.customerCountry || null,
          subtotalUSD: parseFloat(formData.subtotalUSD),
          discountUSD: parseFloat(formData.discountUSD),
          totalUSD: parseFloat(formData.totalUSD),
          items: formData.items.map((item) => ({
            id: item.id.startsWith("new-") ? undefined : item.id,
            name: item.name,
            description: item.description,
            priceUSD: parseFloat(item.priceUSD),
            stateFee: item.stateFee ? parseFloat(item.stateFee) : null,
            quantity: item.quantity,
          })),
          note: formData.note || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order");
      }

      toast.success("Order updated successfully");
      router.push(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setIsSaving(false);
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
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/admin/orders/${orderId}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Order Details
      </Link>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Order</h1>
          <p className="text-muted-foreground">{order.orderNumber}</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* LLC Details */}
            <Card>
              <CardHeader>
                <CardTitle>LLC Details</CardTitle>
                <CardDescription>Company registration information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="llcName">LLC Name</Label>
                    <Input
                      id="llcName"
                      value={formData.llcName}
                      onChange={(e) => handleInputChange("llcName", e.target.value)}
                      placeholder="Enter LLC name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="llcState">Formation State</Label>
                    <Select
                      value={formData.llcState}
                      onValueChange={(v) => handleInputChange("llcState", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="llcType">LLC Type</Label>
                    <Select
                      value={formData.llcType}
                      onValueChange={(v) => handleInputChange("llcType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single-Member</SelectItem>
                        <SelectItem value="multi">Multi-Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Contact details for the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerCountry">Country</Label>
                    <Input
                      id="customerCountry"
                      value={formData.customerCountry}
                      onChange={(e) => handleInputChange("customerCountry", e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>Services and products in this order</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.items.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No items in this order. Click &quot;Add Item&quot; to add services.
                  </p>
                ) : (
                  formData.items.map((item, index) => (
                    <div key={item.id} className="rounded-lg border p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Item #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Item Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleItemChange(index, "name", e.target.value)}
                            placeholder="Service name"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description || ""}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Price (USD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.priceUSD}
                            onChange={(e) => {
                              handleItemChange(index, "priceUSD", e.target.value);
                              setTimeout(calculateTotal, 0);
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>State Fee (USD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.stateFee || ""}
                            onChange={(e) => {
                              handleItemChange(index, "stateFee", e.target.value);
                              setTimeout(calculateTotal, 0);
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              handleItemChange(index, "quantity", parseInt(e.target.value) || 1);
                              setTimeout(calculateTotal, 0);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Internal Note */}
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
                <CardDescription>Add an internal note about this update</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Enter a note about the changes..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => handleInputChange("status", v as OrderStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(v) => handleInputChange("paymentStatus", v as PaymentStatus)}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    placeholder="e.g., Stripe, SSLCommerz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentId">Transaction ID</Label>
                  <Input
                    id="paymentId"
                    value={formData.paymentId}
                    onChange={(e) => handleInputChange("paymentId", e.target.value)}
                    placeholder="Transaction reference"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotalUSD">Subtotal (USD)</Label>
                  <Input
                    id="subtotalUSD"
                    type="number"
                    step="0.01"
                    value={formData.subtotalUSD}
                    onChange={(e) => handleInputChange("subtotalUSD", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountUSD">Discount (USD)</Label>
                  <Input
                    id="discountUSD"
                    type="number"
                    step="0.01"
                    value={formData.discountUSD}
                    onChange={(e) => {
                      handleInputChange("discountUSD", e.target.value);
                      const subtotal = parseFloat(formData.subtotalUSD) || 0;
                      const discount = parseFloat(e.target.value) || 0;
                      handleInputChange("totalUSD", (subtotal - discount).toFixed(2));
                    }}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="totalUSD">Total (USD)</Label>
                  <Input
                    id="totalUSD"
                    type="number"
                    step="0.01"
                    value={formData.totalUSD}
                    onChange={(e) => handleInputChange("totalUSD", e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={calculateTotal}
                >
                  Recalculate Total
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
