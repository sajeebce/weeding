"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  Bell,
  Send,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface EmailSettings {
  // Provider settings
  "email.provider": string;
  "email.resend.apiKey": string;
  "email.from.email": string;
  "email.from.name": string;
  "email.replyTo": string;
  // Admin notification
  "email.admin.email": string;
  "email.notify.adminNewOrder": boolean;
  // Customer notification triggers
  "email.notify.orderPlaced": boolean;
  "email.notify.orderConfirmed": boolean;
  "email.notify.orderProcessing": boolean;
  "email.notify.orderCompleted": boolean;
  "email.notify.paymentSuccess": boolean;
  "email.notify.paymentFailed": boolean;
}

const defaultSettings: EmailSettings = {
  "email.provider": "resend",
  "email.resend.apiKey": "",
  "email.from.email": "",
  "email.from.name": "LLCPad",
  "email.replyTo": "",
  "email.admin.email": "",
  "email.notify.adminNewOrder": true,
  "email.notify.orderPlaced": true,
  "email.notify.orderConfirmed": true,
  "email.notify.orderProcessing": true,
  "email.notify.orderCompleted": true,
  "email.notify.paymentSuccess": true,
  "email.notify.paymentFailed": true,
};

const SECRET_KEYS = ["email.resend.apiKey"];

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailConnected, setEmailConnected] = useState<boolean | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings?prefix=email.");
      const data = await res.json();

      if (data.settings) {
        const newSettings = { ...defaultSettings };
        Object.entries(data.settings).forEach(([key, val]) => {
          const settingVal = val as { value: string; type: string };
          if (key in newSettings) {
            if (settingVal.type === "boolean") {
              (newSettings as Record<string, boolean | string>)[key] =
                settingVal.value === "true";
            } else {
              (newSettings as Record<string, boolean | string>)[key] =
                settingVal.value;
            }
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load email settings");
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

      toast.success("Email settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save email settings");
    } finally {
      setSaving(false);
    }
  }

  async function testEmailConnection() {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
      });
      const data = await res.json();
      setEmailConnected(data.success);
      if (data.success) {
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        toast.error(data.message || "Email connection failed");
      }
    } catch {
      setEmailConnected(false);
      toast.error("Failed to test email connection");
    } finally {
      setTestingEmail(false);
    }
  }

  function toggleShowSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateSetting(key: keyof EmailSettings, value: string | boolean) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function SecretInput({
    settingKey,
    label,
    placeholder,
  }: {
    settingKey: keyof EmailSettings;
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

  function NotificationToggle({
    settingKey,
    label,
    description,
  }: {
    settingKey: keyof EmailSettings;
    label: string;
    description: string;
  }) {
    return (
      <div className="flex items-center justify-between py-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={settings[settingKey] as boolean}
          onCheckedChange={(checked) => updateSetting(settingKey, checked)}
        />
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
          <h1 className="text-2xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground">
            Configure email notifications for orders and payments
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
                API keys are encrypted before storing in the database. Make sure
                you have set the{" "}
                <code className="bg-yellow-100 px-1 rounded">ENCRYPTION_KEY</code>{" "}
                environment variable for secure key storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Provider Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Email Provider</CardTitle>
                <CardDescription>
                  Configure Resend for sending transactional emails
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Input value="Resend" disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Resend is the recommended email provider for transactional
                emails
              </p>
            </div>
            <div className="space-y-2">
              <Label>Connection Status</Label>
              <div className="flex items-center gap-2">
                {emailConnected === null ? (
                  <Badge variant="outline">Not Tested</Badge>
                ) : emailConnected ? (
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
                  onClick={testEmailConnection}
                  disabled={testingEmail}
                >
                  {testingEmail ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Send className="h-3 w-3 mr-1" />
                  )}
                  Send Test Email
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* API Key */}
          <SecretInput
            settingKey="email.resend.apiKey"
            label="Resend API Key"
            placeholder="re_..."
          />

          {/* From Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                type="email"
                value={settings["email.from.email"]}
                onChange={(e) =>
                  updateSetting("email.from.email", e.target.value)
                }
                placeholder="noreply@yourdomain.com"
              />
              <p className="text-xs text-muted-foreground">
                Must be a verified domain in Resend
              </p>
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={settings["email.from.name"]}
                onChange={(e) =>
                  updateSetting("email.from.name", e.target.value)
                }
                placeholder="LLCPad"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reply-To Email (Optional)</Label>
            <Input
              type="email"
              value={settings["email.replyTo"]}
              onChange={(e) => updateSetting("email.replyTo", e.target.value)}
              placeholder="support@yourdomain.com"
            />
            <p className="text-xs text-muted-foreground">
              Where customer replies will be sent
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Get API Key from Resend Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Admin Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Admin Notifications</CardTitle>
              <CardDescription>
                Get notified when new orders are placed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input
              type="email"
              value={settings["email.admin.email"]}
              onChange={(e) =>
                updateSetting("email.admin.email", e.target.value)
              }
              placeholder="admin@yourdomain.com"
            />
            <p className="text-xs text-muted-foreground">
              This email will receive admin notifications (new orders, etc.)
            </p>
          </div>

          <Separator />

          <NotificationToggle
            settingKey="email.notify.adminNewOrder"
            label="New Order Notification"
            description="Receive an email when a new order is placed"
          />
        </CardContent>
      </Card>

      {/* Customer Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Customer Notifications</CardTitle>
              <CardDescription>
                Choose which notifications customers receive
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <NotificationToggle
              settingKey="email.notify.orderPlaced"
              label="Order Placed"
              description="Confirmation email when an order is submitted"
            />
            <NotificationToggle
              settingKey="email.notify.orderConfirmed"
              label="Order Confirmed"
              description="Email when order is confirmed by admin"
            />
            <NotificationToggle
              settingKey="email.notify.orderProcessing"
              label="Order Processing"
              description="Updates when order status changes to processing"
            />
            <NotificationToggle
              settingKey="email.notify.orderCompleted"
              label="Order Completed"
              description="Notification when order is completed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>Payment Notifications</CardTitle>
              <CardDescription>
                Payment related email notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <NotificationToggle
              settingKey="email.notify.paymentSuccess"
              label="Payment Successful"
              description="Confirmation when payment is received"
            />
            <NotificationToggle
              settingKey="email.notify.paymentFailed"
              label="Payment Failed"
              description="Alert when payment fails or is declined"
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-blue-900">
                Beautiful HTML Email Templates
              </p>
              <p className="text-sm text-blue-700">
                All notification emails use professionally designed HTML
                templates with your brand colors. They are mobile-responsive and
                look great on all email clients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
