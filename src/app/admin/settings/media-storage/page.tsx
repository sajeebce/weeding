"use client";

import { useState, useEffect } from "react";
import {
  Cloud,
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface R2Settings {
  "storage.r2.accountId": string;
  "storage.r2.accessKeyId": string;
  "storage.r2.secretAccessKey": string;
  "storage.r2.bucketName": string;
  "storage.r2.publicUrl": string;
}

const defaultSettings: R2Settings = {
  "storage.r2.accountId": "",
  "storage.r2.accessKeyId": "",
  "storage.r2.secretAccessKey": "",
  "storage.r2.bucketName": "",
  "storage.r2.publicUrl": "",
};

export default function MediaStorageSettingsPage() {
  const [settings, setSettings] = useState<R2Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "error">("untested");
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings?prefix=storage.r2.");
      const data = await res.json();

      if (data.settings) {
        const newSettings = { ...defaultSettings };
        Object.entries(data.settings).forEach(([key, val]) => {
          const settingVal = val as { value: string };
          if (key in newSettings) {
            (newSettings as Record<string, string>)[key] = settingVal.value;
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load storage settings");
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
        type: "string",
      }));

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Storage settings saved successfully");
      setConnectionStatus("untested");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save storage settings");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/storage/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        setConnectionStatus("success");
        toast.success("R2 connection successful!");
      } else {
        setConnectionStatus("error");
        toast.error(data.error || "Connection failed");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      setConnectionStatus("error");
      toast.error("Failed to test connection");
    } finally {
      setTesting(false);
    }
  }

  function updateSetting(key: keyof R2Settings, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
    setConnectionStatus("untested");
  }

  const isConfigured = settings["storage.r2.accessKeyId"] &&
                       settings["storage.r2.secretAccessKey"] &&
                       settings["storage.r2.bucketName"];

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
          <h1 className="text-2xl font-bold">Media Storage</h1>
          <p className="text-muted-foreground">
            Configure Cloudflare R2 for image and file storage
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

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Cloud className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle>Cloudflare R2 Storage</CardTitle>
                <CardDescription>
                  S3-compatible object storage with zero egress fees
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "success" && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {connectionStatus === "error" && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
              {connectionStatus === "untested" && isConfigured && (
                <Badge variant="secondary">
                  Not Tested
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account ID */}
          <div className="space-y-2">
            <Label>Account ID</Label>
            <Input
              value={settings["storage.r2.accountId"]}
              onChange={(e) => updateSetting("storage.r2.accountId", e.target.value)}
              placeholder="your-cloudflare-account-id"
            />
            <p className="text-xs text-muted-foreground">
              Find this in Cloudflare Dashboard &gt; R2 &gt; Overview
            </p>
          </div>

          {/* Access Key ID */}
          <div className="space-y-2">
            <Label>Access Key ID</Label>
            <Input
              value={settings["storage.r2.accessKeyId"]}
              onChange={(e) => updateSetting("storage.r2.accessKeyId", e.target.value)}
              placeholder="your-r2-access-key-id"
            />
          </div>

          {/* Secret Access Key */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Secret Access Key
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </Label>
            <Input
              type={showSecrets ? "text" : "password"}
              value={settings["storage.r2.secretAccessKey"]}
              onChange={(e) => updateSetting("storage.r2.secretAccessKey", e.target.value)}
              placeholder="your-r2-secret-access-key"
            />
            <p className="text-xs text-muted-foreground">
              Create API token in R2 &gt; Manage R2 API Tokens
            </p>
          </div>

          {/* Bucket Name */}
          <div className="space-y-2">
            <Label>Bucket Name</Label>
            <Input
              value={settings["storage.r2.bucketName"]}
              onChange={(e) => updateSetting("storage.r2.bucketName", e.target.value)}
              placeholder="your-bucket-name"
            />
          </div>

          {/* Public URL */}
          <div className="space-y-2">
            <Label>Public URL (Custom Domain)</Label>
            <Input
              value={settings["storage.r2.publicUrl"]}
              onChange={(e) => updateSetting("storage.r2.publicUrl", e.target.value)}
              placeholder="https://media.yourdomain.com"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Custom domain for public access. Set up in R2 bucket settings.
            </p>
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || !isConfigured}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
            {!isConfigured && (
              <p className="text-sm text-muted-foreground">
                Fill in all required fields to test connection
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Cloud className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-blue-900">
                How to Set Up Cloudflare R2
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to Cloudflare Dashboard and enable R2</li>
                <li>Create a new bucket (e.g., "llcpad-media")</li>
                <li>Go to R2 &gt; Manage R2 API Tokens &gt; Create API Token</li>
                <li>Select "Object Read & Write" permission for your bucket</li>
                <li>Copy the Access Key ID and Secret Access Key</li>
                <li>(Optional) Set up a custom domain for public access</li>
              </ol>
              <a
                href="https://developers.cloudflare.com/r2/get-started/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
              >
                View Documentation <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
