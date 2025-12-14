"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Eye, EyeOff, ExternalLink, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PusherConfig {
  enabled: boolean;
  appId: string;
  key: string;
  secret: string;
  cluster: string;
}

export function RealtimeSettings() {
  const [config, setConfig] = useState<PusherConfig>({
    enabled: false,
    appId: "",
    key: "",
    secret: "",
    cluster: "ap2",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/pusher-config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to load Pusher config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/pusher-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Pusher configuration saved");
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save Pusher config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/admin/pusher-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setTestResult("success");
        toast.success("Connection successful!");
      } else {
        setTestResult("error");
        const data = await response.json();
        toast.error(data.error || "Connection failed");
      }
    } catch (error) {
      setTestResult("error");
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const updateConfig = (key: keyof PusherConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setTestResult(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Enable/Disable Real-time */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {config.enabled ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle>Real-time Updates</CardTitle>
          </div>
          <CardDescription>
            Enable instant message delivery using Pusher. Without this, messages will be polled every 5 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-md">
            <div>
              <Label htmlFor="enable-realtime">Enable Real-time Updates</Label>
              <p className="text-xs text-muted-foreground mt-1">
                {config.enabled ? "Instant message delivery enabled" : "Using polling (5 second delay)"}
              </p>
            </div>
            <Switch
              id="enable-realtime"
              checked={config.enabled}
              onCheckedChange={(checked) => updateConfig("enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pusher Configuration */}
      <Card className={!config.enabled ? "opacity-60" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pusher Configuration</CardTitle>
              <CardDescription>
                Get your credentials from{" "}
                <a
                  href="https://dashboard.pusher.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Pusher Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </div>
            {config.enabled && (
              <Badge variant={testResult === "success" ? "default" : testResult === "error" ? "destructive" : "secondary"}>
                {testResult === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                {testResult === "error" && <XCircle className="h-3 w-3 mr-1" />}
                {testResult === "success" ? "Connected" : testResult === "error" ? "Connection Failed" : "Not Tested"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pusher-app-id">App ID</Label>
              <Input
                id="pusher-app-id"
                value={config.appId}
                onChange={(e) => updateConfig("appId", e.target.value)}
                placeholder="123456"
                disabled={!config.enabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pusher-cluster">Cluster</Label>
              <Input
                id="pusher-cluster"
                value={config.cluster}
                onChange={(e) => updateConfig("cluster", e.target.value)}
                placeholder="ap2"
                disabled={!config.enabled}
              />
              <p className="text-xs text-muted-foreground">e.g., ap2, us2, eu</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pusher-key">Key</Label>
            <Input
              id="pusher-key"
              value={config.key}
              onChange={(e) => updateConfig("key", e.target.value)}
              placeholder="your-pusher-key"
              disabled={!config.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pusher-secret">Secret</Label>
            <div className="relative">
              <Input
                id="pusher-secret"
                type={showSecret ? "text" : "password"}
                value={config.secret}
                onChange={(e) => updateConfig("secret", e.target.value)}
                placeholder="your-pusher-secret"
                disabled={!config.enabled}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={!config.enabled}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!config.enabled || !config.appId || !config.key || !config.secret || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">1. Create a Pusher Account</h4>
            <p className="text-muted-foreground">
              Sign up at{" "}
              <a href="https://pusher.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                pusher.com
              </a>
              {" "}(free tier available with 200K messages/day)
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Create a Channels App</h4>
            <p className="text-muted-foreground">
              In your Pusher dashboard, create a new Channels app. Select a cluster closest to your users.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Copy Credentials</h4>
            <p className="text-muted-foreground">
              Go to "App Keys" tab and copy the App ID, Key, Secret, and Cluster values here.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">4. Test Connection</h4>
            <p className="text-muted-foreground">
              Click "Test Connection" to verify your credentials work correctly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
