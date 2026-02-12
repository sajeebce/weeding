"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrencySymbol } from "@/lib/currencies";
import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  Mail,
  ClipboardList,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  name: string;
  description: string | null;
  priceUSD: string;
  locationName: string | null;
  locationCode: string | null;
  service: { id: string; name: string; slug: string } | null;
  package: { id: string; name: string } | null;
}

interface OrderData {
  orderNumber: string;
  totalUSD: string;
  customerEmail: string;
  customerName: string;
  status: string;
  items: OrderItem[];
  formSubmissions: Array<{ data: Record<string, unknown> }>;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) {
          setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orderNumber) {
            setOrder(data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching order:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Processing your order...
          </p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No order information found. Please contact support if you believe
              this is an error.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Unable to load order details. Please contact support.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = order.items?.[0];
  const serviceName = item?.service?.name || item?.name || "Service";
  const packageName = item?.package?.name || null;
  const locationName = item?.locationName || null;
  const total = parseFloat(order.totalUSD) || 0;

  // Extract key display fields from form submission data
  const formData = order.formSubmissions?.[0]?.data as Record<string, unknown> | undefined;
  const displayFields: Array<{ label: string; value: string }> = [];

  // Always show Service
  displayFields.push({ label: "Service", value: serviceName });

  // Show Package if exists
  if (packageName) {
    displayFields.push({ label: "Package", value: packageName });
  }

  // Show Location if exists
  if (locationName) {
    displayFields.push({ label: "Service Location", value: locationName });
  }

  // Extract notable form fields (skip internal/account fields)
  if (formData) {
    const skipKeys = new Set([
      "email", "password", "confirmPassword", "phone", "country",
      "firstName", "lastName", "fullName", "contactName",
      "agreeTerms", "termsAccepted", "consent",
    ]);

    for (const [key, value] of Object.entries(formData)) {
      if (skipKeys.has(key)) continue;
      if (value === null || value === undefined || value === "") continue;
      if (typeof value === "object") continue;

      // Convert camelCase/snake_case to readable label
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

      displayFields.push({ label, value: String(value) });
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Thank you for your order. We&apos;ve received your payment successfully.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order #{order.orderNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {displayFields.map((field, index) => (
              <div key={index}>
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <p className="font-medium">{field.value}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-medium">Total Paid</span>
            <span className="text-xl font-bold text-primary">
              {currencySymbol}{total}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* What's Next Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>
            Here&apos;s what you can expect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Confirmation Email</h3>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to {order.customerEmail} with your order details and receipt.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Order Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will review your order and begin processing it. You can track the status from your dashboard at any time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Track Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Log in to your dashboard to view order updates, download documents, and communicate with our team.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/orders">
            View Order Status
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>

      {/* Support Info */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Have questions about your order?{" "}
        <Link
          href="/dashboard/support"
          className="text-primary hover:underline"
        >
          Contact our support team
        </Link>
      </p>
    </div>
  );
}

function SuccessLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
