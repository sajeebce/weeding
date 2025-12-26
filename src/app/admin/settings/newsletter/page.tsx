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
  Send,
  Users,
  BarChart3,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface NewsletterSettings {
  "newsletter.enabled": boolean;
  "newsletter.provider": string;
  "newsletter.brevo.apiKey": string;
  "newsletter.brevo.listId": string;
  "newsletter.doubleOptIn": boolean;
  "newsletter.welcomeEmail": boolean;
  "newsletter.storeLocally": boolean;
}

const defaultSettings: NewsletterSettings = {
  "newsletter.enabled": true,
  "newsletter.provider": "brevo",
  "newsletter.brevo.apiKey": "",
  "newsletter.brevo.listId": "",
  "newsletter.doubleOptIn": true,
  "newsletter.welcomeEmail": true,
  "newsletter.storeLocally": true,
};

const SECRET_KEYS = ["newsletter.brevo.apiKey"];

const providers = [
  {
    value: "brevo",
    label: "Brevo (Sendinblue)",
    description: "Recommended - Unlimited contacts, 300 emails/day free",
  },
  {
    value: "mailchimp",
    label: "Mailchimp",
    description: "Popular choice - 500 contacts free",
  },
  {
    value: "local",
    label: "Local Only",
    description: "Store subscribers locally without external service",
  },
];

export default function NewsletterSettingsPage() {
  const [settings, setSettings] = useState<NewsletterSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<{ total: number; thisMonth: number } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings?prefix=newsletter.");
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
      toast.error("Failed to load newsletter settings");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/newsletter/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Stats endpoint might not exist yet
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

      toast.success("Newsletter settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save newsletter settings");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/newsletter/test", {
        method: "POST",
      });
      const data = await res.json();
      setConnectionStatus(data.success);
      if (data.success) {
        toast.success("Successfully connected to Brevo!");
      } else {
        toast.error(data.message || "Connection failed");
      }
    } catch {
      setConnectionStatus(false);
      toast.error("Failed to test connection");
    } finally {
      setTesting(false);
    }
  }

  function toggleShowSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function updateSetting(key: keyof NewsletterSettings, value: string | boolean) {
    setSettings((s) => ({ ...s, [key]: value }));
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
          <h1 className="text-2xl font-bold">Newsletter Settings</h1>
          <p className="text-muted-foreground">
            Configure email newsletter and subscriber management
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enable Newsletter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <Label className="text-base font-medium">Enable Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Allow visitors to subscribe to your newsletter
                </p>
              </div>
            </div>
            <Switch
              checked={settings["newsletter.enabled"]}
              onCheckedChange={(checked) => updateSetting("newsletter.enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {settings["newsletter.enabled"] && (
        <>
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

          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Email Marketing Provider</CardTitle>
                  <CardDescription>
                    Choose a service to manage your newsletter subscribers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={settings["newsletter.provider"]}
                  onValueChange={(value) => updateSetting("newsletter.provider", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div>
                          <span className="font-medium">{provider.label}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            - {provider.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {settings["newsletter.provider"] === "brevo" && (
                <>
                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Key className="h-3 w-3 text-muted-foreground" />
                        Brevo API Key
                      </Label>
                      <div className="relative">
                        <Input
                          type={showSecrets["newsletter.brevo.apiKey"] ? "text" : "password"}
                          value={settings["newsletter.brevo.apiKey"]}
                          onChange={(e) => updateSetting("newsletter.brevo.apiKey", e.target.value)}
                          placeholder="xkeysib-..."
                          className="pr-10 font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => toggleShowSecret("newsletter.brevo.apiKey")}
                        >
                          {showSecrets["newsletter.brevo.apiKey"] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Connection Status</Label>
                      <div className="flex items-center gap-2">
                        {connectionStatus === null ? (
                          <Badge variant="outline">Not Tested</Badge>
                        ) : connectionStatus ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={testConnection}
                          disabled={testing || !settings["newsletter.brevo.apiKey"]}
                        >
                          {testing ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>List ID (Optional)</Label>
                    <Input
                      value={settings["newsletter.brevo.listId"]}
                      onChange={(e) => updateSetting("newsletter.brevo.listId", e.target.value)}
                      placeholder="Leave empty to use default list"
                    />
                    <p className="text-xs text-muted-foreground">
                      Specific list to add subscribers to. Leave empty to use your default contact list.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <a
                      href="https://app.brevo.com/settings/keys/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Get API Key from Brevo Dashboard <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </>
              )}

              {settings["newsletter.provider"] === "mailchimp" && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Mailchimp integration coming soon. For now, we recommend using Brevo
                      which offers unlimited contacts on the free tier.
                    </p>
                  </div>
                </>
              )}

              {settings["newsletter.provider"] === "local" && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-blue-50 border-blue-200 border p-4">
                    <p className="text-sm text-blue-700">
                      Subscribers will be stored in your database only. You can export them
                      anytime to use with any email marketing service.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Subscription Options */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Options</CardTitle>
              <CardDescription>Configure how subscriptions are handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Double Opt-In</Label>
                  <p className="text-xs text-muted-foreground">
                    Send confirmation email before adding to list (recommended for GDPR)
                  </p>
                </div>
                <Switch
                  checked={settings["newsletter.doubleOptIn"]}
                  onCheckedChange={(checked) => updateSetting("newsletter.doubleOptIn", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Welcome Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Send a welcome email after successful subscription
                  </p>
                </div>
                <Switch
                  checked={settings["newsletter.welcomeEmail"]}
                  onCheckedChange={(checked) => updateSetting("newsletter.welcomeEmail", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Store Locally</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep a local copy of subscribers in your database (backup)
                  </p>
                </div>
                <Switch
                  checked={settings["newsletter.storeLocally"]}
                  onCheckedChange={(checked) => updateSetting("newsletter.storeLocally", checked)}
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
                    Why Brevo?
                  </p>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Unlimited contacts on free tier</li>
                    <li>300 emails per day free</li>
                    <li>Built-in GDPR compliance (unsubscribe, double opt-in)</li>
                    <li>Email automation and templates</li>
                    <li>Detailed analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
