"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PaymentSettings {
  // Stripe
  "payment.stripe.enabled": boolean;
  "payment.stripe.mode": "test" | "live";
  "payment.stripe.test.publishableKey": string;
  "payment.stripe.test.secretKey": string;
  "payment.stripe.test.webhookSecret": string;
  "payment.stripe.live.publishableKey": string;
  "payment.stripe.live.secretKey": string;
  "payment.stripe.live.webhookSecret": string;
  // PayPal
  "payment.paypal.enabled": boolean;
  "payment.paypal.mode": "sandbox" | "live";
  "payment.paypal.sandbox.clientId": string;
  "payment.paypal.sandbox.clientSecret": string;
  "payment.paypal.sandbox.webhookId": string;
  "payment.paypal.live.clientId": string;
  "payment.paypal.live.clientSecret": string;
  "payment.paypal.live.webhookId": string;
}

const defaultSettings: PaymentSettings = {
  "payment.stripe.enabled": false,
  "payment.stripe.mode": "test",
  "payment.stripe.test.publishableKey": "",
  "payment.stripe.test.secretKey": "",
  "payment.stripe.test.webhookSecret": "",
  "payment.stripe.live.publishableKey": "",
  "payment.stripe.live.secretKey": "",
  "payment.stripe.live.webhookSecret": "",
  "payment.paypal.enabled": false,
  "payment.paypal.mode": "sandbox",
  "payment.paypal.sandbox.clientId": "",
  "payment.paypal.sandbox.clientSecret": "",
  "payment.paypal.sandbox.webhookId": "",
  "payment.paypal.live.clientId": "",
  "payment.paypal.live.clientSecret": "",
  "payment.paypal.live.webhookId": "",
};

// Keys that need encryption (secret keys)
const SECRET_KEYS = [
  "payment.stripe.test.secretKey",
  "payment.stripe.test.webhookSecret",
  "payment.stripe.live.secretKey",
  "payment.stripe.live.webhookSecret",
  "payment.paypal.sandbox.clientSecret",
  "payment.paypal.live.clientSecret",
];

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null);
  const [paypalConnected, setPaypalConnected] = useState<boolean | null>(null);
  const [testingStripe, setTestingStripe] = useState(false);
  const [testingPaypal, setTestingPaypal] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings?prefix=payment.");
      const data = await res.json();

      if (data.settings) {
        const newSettings = { ...defaultSettings };
        Object.entries(data.settings).forEach(([key, val]) => {
          const settingVal = val as { value: string; type: string; isSecret?: boolean };
          if (key in newSettings) {
            if (settingVal.type === "boolean") {
              (newSettings as Record<string, boolean | string>)[key] =
                settingVal.value === "true";
            } else {
              // For secret keys, show masked value
              (newSettings as Record<string, boolean | string>)[key] =
                settingVal.value;
            }
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "boolean" ? "boolean" : "string",
        isSecret: SECRET_KEYS.includes(key),
      }));

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Payment settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  }

  async function testStripeConnection() {
    setTestingStripe(true);
    try {
      const res = await fetch("/api/admin/settings/test-stripe", {
        method: "POST",
      });
      const data = await res.json();
      setStripeConnected(data.success);
      if (data.success) {
        toast.success("Stripe connection successful");
      } else {
        toast.error(data.message || "Stripe connection failed");
      }
    } catch {
      setStripeConnected(false);
      toast.error("Failed to test Stripe connection");
    } finally {
      setTestingStripe(false);
    }
  }

  async function testPaypalConnection() {
    setTestingPaypal(true);
    try {
      const res = await fetch("/api/admin/settings/test-paypal", {
        method: "POST",
      });
      const data = await res.json();
      setPaypalConnected(data.success);
      if (data.success) {
        toast.success("PayPal connection successful");
      } else {
        toast.error(data.message || "PayPal connection failed");
      }
    } catch {
      setPaypalConnected(false);
      toast.error("Failed to test PayPal connection");
    } finally {
      setTestingPaypal(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function toggleShowSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateSetting(key: keyof PaymentSettings, value: string | boolean) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function SecretInput({
    settingKey,
    label,
    placeholder,
  }: {
    settingKey: keyof PaymentSettings;
    label: string;
    placeholder: string;
  }) {
    const value = settings[settingKey] as string;
    const isShown = showSecrets[settingKey];
    const isSecret = SECRET_KEYS.includes(settingKey);

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {isSecret && <Key className="h-3 w-3 text-muted-foreground" />}
          {label}
        </Label>
        <div className="relative">
          <Input
            type={isShown ? "text" : "password"}
            value={value}
            onChange={(e) => updateSetting(settingKey, e.target.value)}
            placeholder={placeholder}
            className="pr-10 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => toggleShowSecret(settingKey)}
          >
            {isShown ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">
            Configure payment gateways for your store
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-900">Security Notice</p>
              <p className="text-sm text-yellow-700">
                API keys are encrypted before storing in the database. Make sure you have set
                the <code className="bg-yellow-100 px-1 rounded">ENCRYPTION_KEY</code> environment
                variable for secure key storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#635BFF]/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-[#635BFF]" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Stripe
                  {settings["payment.stripe.enabled"] && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Accept credit/debit cards worldwide
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="stripe-enabled" className="text-sm">
                Enable Stripe
              </Label>
              <Switch
                id="stripe-enabled"
                checked={settings["payment.stripe.enabled"]}
                onCheckedChange={(checked) =>
                  updateSetting("payment.stripe.enabled", checked)
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={settings["payment.stripe.mode"]}
                onValueChange={(value: "test" | "live") =>
                  updateSetting("payment.stripe.mode", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test Mode</SelectItem>
                  <SelectItem value="live">Live Mode</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings["payment.stripe.mode"] === "test"
                  ? "Test mode uses test API keys. No real charges."
                  : "Live mode processes real payments."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Connection Status</Label>
              <div className="flex items-center gap-2">
                {stripeConnected === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : stripeConnected ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testStripeConnection}
                  disabled={testingStripe}
                >
                  {testingStripe ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* API Keys - Based on selected mode */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {settings["payment.stripe.mode"] === "test" ? "Test" : "Live"} Mode Keys
              </Badge>
            </div>
            {settings["payment.stripe.mode"] === "test" ? (
              <>
                <SecretInput
                  settingKey="payment.stripe.test.publishableKey"
                  label="Publishable Key"
                  placeholder="pk_test_..."
                />
                <SecretInput
                  settingKey="payment.stripe.test.secretKey"
                  label="Secret Key"
                  placeholder="sk_test_..."
                />
                <SecretInput
                  settingKey="payment.stripe.test.webhookSecret"
                  label="Webhook Secret"
                  placeholder="whsec_..."
                />
              </>
            ) : (
              <>
                <SecretInput
                  settingKey="payment.stripe.live.publishableKey"
                  label="Publishable Key"
                  placeholder="pk_live_..."
                />
                <SecretInput
                  settingKey="payment.stripe.live.secretKey"
                  label="Secret Key"
                  placeholder="sk_live_..."
                />
                <SecretInput
                  settingKey="payment.stripe.live.webhookSecret"
                  label="Webhook Secret"
                  placeholder="whsec_..."
                />
              </>
            )}
          </div>

          <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
            <p className="text-sm font-medium">Webhook URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background px-3 py-2 rounded border overflow-x-auto">
                {appUrl}/api/webhooks/stripe
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(`${appUrl}/api/webhooks/stripe`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this URL to your Stripe Dashboard &rarr; Developers &rarr; Webhooks
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Get API Keys from Stripe Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* PayPal Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#003087]/10 rounded-lg">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="#003087"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.61A.859.859 0 0 1 5.79 1.9h7.154c2.63 0 4.504.55 5.576 1.635.964.976 1.392 2.452 1.273 4.391-.025.41-.075.84-.15 1.29-.594 3.593-2.636 5.432-6.07 5.467h-2.567a.86.86 0 0 0-.847.738l-.862 5.464a.641.641 0 0 1-.632.542h-.589zm6.417-17.73H8.982a.214.214 0 0 0-.211.184L7.27 14.115a.161.161 0 0 0 .158.185h2.358a.214.214 0 0 0 .211-.184l.558-3.54a.214.214 0 0 1 .211-.184h1.37c2.545 0 4.06-1.234 4.49-3.67.192-1.086.078-1.938-.34-2.533-.457-.651-1.356-.982-2.793-.982z" />
                </svg>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  PayPal
                  {settings["payment.paypal.enabled"] && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Accept PayPal and PayPal Credit payments
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="paypal-enabled" className="text-sm">
                Enable PayPal
              </Label>
              <Switch
                id="paypal-enabled"
                checked={settings["payment.paypal.enabled"]}
                onCheckedChange={(checked) =>
                  updateSetting("payment.paypal.enabled", checked)
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={settings["payment.paypal.mode"]}
                onValueChange={(value: "sandbox" | "live") =>
                  updateSetting("payment.paypal.mode", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox Mode</SelectItem>
                  <SelectItem value="live">Live Mode</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings["payment.paypal.mode"] === "sandbox"
                  ? "Sandbox mode for testing. No real charges."
                  : "Live mode processes real payments."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Connection Status</Label>
              <div className="flex items-center gap-2">
                {paypalConnected === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : paypalConnected ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testPaypalConnection}
                  disabled={testingPaypal}
                >
                  {testingPaypal ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* API Keys - Based on selected mode */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {settings["payment.paypal.mode"] === "sandbox" ? "Sandbox" : "Live"} Mode Keys
              </Badge>
            </div>
            {settings["payment.paypal.mode"] === "sandbox" ? (
              <>
                <SecretInput
                  settingKey="payment.paypal.sandbox.clientId"
                  label="Client ID"
                  placeholder="Sandbox Client ID"
                />
                <SecretInput
                  settingKey="payment.paypal.sandbox.clientSecret"
                  label="Client Secret"
                  placeholder="Sandbox Client Secret"
                />
                <SecretInput
                  settingKey="payment.paypal.sandbox.webhookId"
                  label="Webhook ID"
                  placeholder="Sandbox Webhook ID (optional)"
                />
              </>
            ) : (
              <>
                <SecretInput
                  settingKey="payment.paypal.live.clientId"
                  label="Client ID"
                  placeholder="Live Client ID"
                />
                <SecretInput
                  settingKey="payment.paypal.live.clientSecret"
                  label="Client Secret"
                  placeholder="Live Client Secret"
                />
                <SecretInput
                  settingKey="payment.paypal.live.webhookId"
                  label="Webhook ID"
                  placeholder="Live Webhook ID (optional)"
                />
              </>
            )}
          </div>

          <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
            <p className="text-sm font-medium">Webhook URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background px-3 py-2 rounded border overflow-x-auto">
                {appUrl}/api/webhooks/paypal
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(`${appUrl}/api/webhooks/paypal`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this URL to your PayPal Developer Dashboard &rarr; Webhooks
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <a
              href="https://developer.paypal.com/dashboard/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Get API Keys from PayPal Developer Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-blue-900">
                Multiple Gateways Enabled
              </p>
              <p className="text-sm text-blue-700">
                When both Stripe and PayPal are enabled, customers can choose
                their preferred payment method at checkout. This increases
                conversion rates by offering more payment options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
