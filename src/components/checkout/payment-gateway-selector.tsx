"use client";

import { CreditCard, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentGateway = "stripe" | "paypal";

interface PaymentGatewaySelectorProps {
  enabledGateways: PaymentGateway[];
  selectedGateway: PaymentGateway | null;
  onSelect: (gateway: PaymentGateway) => void;
  disabled?: boolean;
}

export function PaymentGatewaySelector({
  enabledGateways,
  selectedGateway,
  onSelect,
  disabled = false,
}: PaymentGatewaySelectorProps) {
  if (enabledGateways.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No payment methods available at this time.</p>
        <p className="text-sm">Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Select Payment Method</label>
      <div className="grid gap-3 sm:grid-cols-2">
        {enabledGateways.includes("stripe") && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect("stripe")}
            className={cn(
              "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              selectedGateway === "stripe"
                ? "border-primary bg-primary/5"
                : "border-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {selectedGateway === "stripe" && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-[#635BFF]" />
              <span className="font-semibold">Credit/Debit Card</span>
            </div>
            <div className="flex items-center gap-1">
              <CardIcon type="visa" />
              <CardIcon type="mastercard" />
              <CardIcon type="amex" />
              <CardIcon type="discover" />
            </div>
            <span className="text-xs text-muted-foreground">
              Powered by Stripe
            </span>
          </button>
        )}

        {enabledGateways.includes("paypal") && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect("paypal")}
            className={cn(
              "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
              "hover:border-primary/50 hover:bg-muted/50",
              selectedGateway === "paypal"
                ? "border-primary bg-primary/5"
                : "border-muted",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {selectedGateway === "paypal" && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <PayPalLogo className="h-6 w-24" />
            </div>
            <span className="text-xs text-muted-foreground mt-2">
              Pay with PayPal balance or cards
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function CardIcon({ type }: { type: "visa" | "mastercard" | "amex" | "discover" }) {
  const colors = {
    visa: "#1A1F71",
    mastercard: "#EB001B",
    amex: "#006FCF",
    discover: "#FF6000",
  };

  return (
    <div
      className="h-6 w-9 rounded border bg-white flex items-center justify-center text-[8px] font-bold"
      style={{ color: colors[type] }}
    >
      {type.toUpperCase().slice(0, 4)}
    </div>
  );
}

function PayPalLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 26"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#003087"
        d="M12.237 3.5H5.55a.9.9 0 0 0-.888.76L2.008 21.136a.54.54 0 0 0 .533.624h3.194a.9.9 0 0 0 .888-.76l.717-4.545a.9.9 0 0 1 .888-.76h2.048c4.263 0 6.722-2.063 7.366-6.153.29-1.79.012-3.197-.826-4.18C15.883 4.322 14.326 3.5 12.237 3.5zm.747 6.063c-.354 2.322-2.128 2.322-3.844 2.322h-.976l.685-4.34a.54.54 0 0 1 .533-.455h.448c1.168 0 2.271 0 2.84.665.34.398.443 1.013.314 1.808z"
      />
      <path
        fill="#003087"
        d="M35.998 9.483h-3.207a.54.54 0 0 0-.533.455l-.141.897-.224-.325c-.695-1.01-2.244-1.347-3.79-1.347-3.546 0-6.577 2.688-7.167 6.458-.307 1.88.129 3.677 1.195 4.932.979 1.153 2.377 1.634 4.04 1.634 2.856 0 4.44-1.836 4.44-1.836l-.143.891a.54.54 0 0 0 .533.624h2.89a.9.9 0 0 0 .888-.76l1.733-10.999a.54.54 0 0 0-.524-.624zm-4.473 6.246c-.31 1.835-1.767 3.067-3.625 3.067-.932 0-1.678-.3-2.159-.867-.477-.563-.657-1.365-.506-2.26.29-1.82 1.77-3.093 3.598-3.093.912 0 1.652.302 2.14.873.493.576.685 1.384.552 2.28z"
      />
      <path
        fill="#009CDE"
        d="M55.67 9.483h-3.222a.899.899 0 0 0-.744.394l-4.296 6.33-1.82-6.083a.9.9 0 0 0-.863-.641h-3.166a.54.54 0 0 0-.511.714l3.43 10.064-3.226 4.553a.54.54 0 0 0 .44.854h3.219a.9.9 0 0 0 .739-.385l10.358-14.96a.54.54 0 0 0-.438-.84z"
      />
      <path
        fill="#009CDE"
        d="M64.688 3.5h-6.687a.9.9 0 0 0-.889.76l-2.654 16.876a.54.54 0 0 0 .533.624h3.421a.63.63 0 0 0 .622-.532l.754-4.773a.9.9 0 0 1 .888-.76h2.048c4.263 0 6.722-2.063 7.366-6.153.29-1.79.012-3.197-.826-4.18C68.33 4.322 66.778 3.5 64.688 3.5zm.748 6.063c-.354 2.322-2.129 2.322-3.845 2.322h-.976l.686-4.34a.54.54 0 0 1 .533-.455h.447c1.169 0 2.272 0 2.84.665.341.398.444 1.013.315 1.808z"
      />
      <path
        fill="#009CDE"
        d="M88.449 9.483h-3.207a.54.54 0 0 0-.533.455l-.141.897-.224-.325c-.695-1.01-2.244-1.347-3.79-1.347-3.546 0-6.577 2.688-7.167 6.458-.307 1.88.129 3.677 1.195 4.932.979 1.153 2.377 1.634 4.04 1.634 2.856 0 4.44-1.836 4.44-1.836l-.143.891a.54.54 0 0 0 .533.624h2.89a.9.9 0 0 0 .888-.76l1.733-10.999a.538.538 0 0 0-.524-.624zm-4.472 6.246c-.31 1.835-1.768 3.067-3.626 3.067-.932 0-1.677-.3-2.158-.867-.478-.563-.658-1.365-.507-2.26.29-1.82 1.77-3.093 3.598-3.093.912 0 1.652.302 2.14.873.494.576.686 1.384.553 2.28z"
      />
      <path
        fill="#009CDE"
        d="M92.738 3.948l-2.694 17.139a.54.54 0 0 0 .533.624h2.763a.9.9 0 0 0 .888-.76L96.883 4.08a.54.54 0 0 0-.534-.624h-3.078a.539.539 0 0 0-.533.492z"
      />
    </svg>
  );
}
