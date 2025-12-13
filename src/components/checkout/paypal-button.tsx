"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";

interface PayPalButtonProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PayPalButton({
  orderId,
  amount,
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientId() {
      try {
        const res = await fetch("/api/checkout/gateways");
        const data = await res.json();

        if (data.paypal?.clientId) {
          setClientId(data.paypal.clientId);
        } else {
          setError("PayPal is not configured");
        }
      } catch {
        setError("Failed to load PayPal configuration");
      } finally {
        setLoading(false);
      }
    }

    fetchClientId();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !clientId) {
    return (
      <div className="text-center py-4 text-destructive">
        <p>{error || "PayPal is not available"}</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency,
        intent: "capture",
      }}
    >
      <PayPalButtons
        disabled={disabled}
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "pay",
          height: 45,
        }}
        createOrder={async () => {
          try {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                amount,
                currency,
              }),
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.error || "Failed to create PayPal order");
            }

            return data.paypalOrderId;
          } catch (err) {
            const message = err instanceof Error ? err.message : "PayPal error";
            onError(message);
            throw err;
          }
        }}
        onApprove={async (data) => {
          try {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paypalOrderId: data.orderID,
                orderId,
              }),
            });

            const result = await res.json();

            if (!res.ok) {
              throw new Error(result.error || "Failed to capture payment");
            }

            onSuccess(result.transactionId);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Payment failed";
            onError(message);
          }
        }}
        onCancel={() => {
          onCancel?.();
        }}
        onError={(err) => {
          console.error("PayPal error:", err);
          onError("PayPal encountered an error. Please try again.");
        }}
      />
    </PayPalScriptProvider>
  );
}
