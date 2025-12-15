"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Loader2,
  Receipt,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  type: string;
  brand: string | null;
  last4: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  cardholderName: string | null;
  isDefault: boolean;
  createdAt: string;
}

interface BillingHistoryItem {
  id: string;
  orderNumber: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string | null;
  date: string;
}

const cardBrands: Record<string, { name: string; color: string }> = {
  visa: { name: "Visa", color: "bg-blue-600" },
  mastercard: { name: "Mastercard", color: "bg-red-500" },
  amex: { name: "American Express", color: "bg-blue-400" },
  discover: { name: "Discover", color: "bg-orange-500" },
};

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cardholderName: "",
    setAsDefault: false,
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customer/billing");
      if (!response.ok) throw new Error("Failed to fetch billing data");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods);
      setBillingHistory(data.billingHistory);
    } catch {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const detectCardBrand = (cardNumber: string): string => {
    const num = cardNumber.replace(/\s/g, "");
    if (/^4/.test(num)) return "visa";
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "mastercard";
    if (/^3[47]/.test(num)) return "amex";
    if (/^6(?:011|5)/.test(num)) return "discover";
    return "card";
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const handleAddCard = async () => {
    const cardNum = newCard.cardNumber.replace(/\s/g, "");
    if (cardNum.length < 13) {
      toast.error("Please enter a valid card number");
      return;
    }
    if (!newCard.expiryMonth || !newCard.expiryYear) {
      toast.error("Please enter card expiry date");
      return;
    }

    try {
      setIsAddingCard(true);
      const response = await fetch("/api/customer/billing/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          brand: detectCardBrand(cardNum),
          last4: cardNum.slice(-4),
          expiryMonth: parseInt(newCard.expiryMonth),
          expiryYear: parseInt(newCard.expiryYear),
          cardholderName: newCard.cardholderName || null,
          setAsDefault: newCard.setAsDefault,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add card");
      }

      toast.success("Card added successfully");
      setAddDialogOpen(false);
      setNewCard({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cardholderName: "",
        setAsDefault: false,
      });
      fetchBillingData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add card");
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(`/api/customer/billing/payment-methods/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete card");
      }

      toast.success("Card removed successfully");
      fetchBillingData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete card");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/customer/billing/payment-methods/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to set default");
      }

      toast.success("Default payment method updated");
      fetchBillingData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set default");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and view billing history
          </p>
        </div>
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
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and view billing history
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchBillingData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Your saved cards for faster checkout
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Add a new card for future payments
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={newCard.cardNumber}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        cardNumber: formatCardNumber(e.target.value),
                      }))
                    }
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Month</Label>
                    <Select
                      value={newCard.expiryMonth}
                      onValueChange={(value) =>
                        setNewCard((prev) => ({ ...prev, expiryMonth: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Year</Label>
                    <Select
                      value={newCard.expiryYear}
                      onValueChange={(value) =>
                        setNewCard((prev) => ({ ...prev, expiryYear: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={newCard.cardholderName}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        cardholderName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="setAsDefault"
                    checked={newCard.setAsDefault}
                    onChange={(e) =>
                      setNewCard((prev) => ({
                        ...prev,
                        setAsDefault: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="setAsDefault" className="text-sm font-normal">
                    Set as default payment method
                  </Label>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddCard}
                  disabled={isAddingCard}
                >
                  {isAddingCard ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Card"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="py-8 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No payment methods</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a card to make checkout faster
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const brandInfo = cardBrands[method.brand || ""] || {
                  name: "Card",
                  color: "bg-gray-600",
                };
                return (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-16 items-center justify-center rounded ${brandInfo.color} text-white text-xs font-bold`}
                      >
                        {brandInfo.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            •••• •••• •••• {method.last4}
                          </p>
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.cardholderName || "Card"} • Expires{" "}
                          {method.expiryMonth?.toString().padStart(2, "0")}/
                          {method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          <Star className="mr-1 h-4 w-4" />
                          Set Default
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Card</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this card? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCard(method.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory.length === 0 ? (
            <div className="py-8 text-center">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No billing history</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.orderNumber} • {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{item.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.paymentMethod || "Card"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
