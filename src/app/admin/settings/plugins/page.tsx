"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Puzzle,
  Loader2,
  Power,
  PowerOff,
  Trash2,
  Settings,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Upload,
  FileArchive,
  Key,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";

interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  version: string;
  author: string | null;
  authorUrl: string | null;
  icon: string | null;
  status: "INSTALLED" | "ACTIVE" | "DISABLED" | "ERROR";
  licenseKey: string | null;
  licenseType: string | null;
  licenseVerifiedAt: string | null;
  hasAdminPages: boolean;
  hasPublicPages: boolean;
  hasWidgets: boolean;
  hasApiRoutes: boolean;
  installedAt: string;
  lastActivatedAt: string | null;
  lastError: string | null;
  _count: {
    settings: number;
    menuItems: number;
  };
}

interface PluginManifest {
  slug: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  authorUrl?: string;
  icon?: string;
  adminMenu?: {
    label: string;
    icon: string;
    position?: number;
    items: Array<{
      label: string;
      path: string;
      icon?: string;
    }>;
  };
  features?: {
    adminPages?: boolean;
    publicPages?: boolean;
    widgets?: boolean;
    apiRoutes?: boolean;
  };
  settings?: Array<{
    key: string;
    value: string;
    type?: string;
  }>;
  manifest?: {
    requiresLicense?: boolean;
    widgets?: Array<unknown>;
  };
}

interface UploadedPlugin {
  slug: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  icon?: string;
  requiresLicense: boolean;
  manifest: PluginManifest;
}

const statusConfig = {
  ACTIVE: {
    label: "Active",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  INSTALLED: {
    label: "Installed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
  },
  DISABLED: {
    label: "Disabled",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: PowerOff,
  },
  ERROR: {
    label: "Error",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Upload states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedPlugin, setUploadedPlugin] = useState<UploadedPlugin | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // License activation states
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  async function fetchPlugins() {
    try {
      const res = await fetch("/api/admin/plugins?includeMenuItems=true");
      const data = await res.json();
      if (data.plugins) {
        setPlugins(data.plugins);
      }
    } catch (error) {
      console.error("Error fetching plugins:", error);
      toast.error("Failed to load plugins");
    } finally {
      setLoading(false);
    }
  }

  async function togglePlugin(slug: string, currentStatus: string) {
    setActionLoading(slug);
    try {
      const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
      const res = await fetch(`/api/admin/plugins/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update plugin");

      const data = await res.json();
      toast.success(data.message);
      fetchPlugins();
    } catch (error) {
      console.error("Error toggling plugin:", error);
      toast.error("Failed to update plugin status");
    } finally {
      setActionLoading(null);
    }
  }

  async function uninstallPlugin(slug: string) {
    setActionLoading(slug);
    try {
      const res = await fetch(`/api/admin/plugins/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to uninstall plugin");

      toast.success("Plugin uninstalled successfully");
      fetchPlugins();
    } catch (error) {
      console.error("Error uninstalling plugin:", error);
      toast.error("Failed to uninstall plugin");
    } finally {
      setActionLoading(null);
    }
  }

  // Handle ZIP file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      toast.error("Please select a ZIP file");
      return;
    }

    setUploading(true);
    setUploadedPlugin(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/plugins/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      setUploadedPlugin({
        slug: data.plugin.slug,
        name: data.plugin.name,
        version: data.plugin.version,
        description: data.plugin.description,
        author: data.plugin.author,
        icon: data.plugin.icon,
        requiresLicense: data.requiresLicense,
        manifest: data.manifest,
      });

      // If requires license, show license dialog
      if (data.requiresLicense) {
        setUploadDialogOpen(false);
        setLicenseDialogOpen(true);
      } else {
        // Install directly for free plugins
        await installFreePlugin(data.manifest);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload plugin");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // Install free plugin (no license required)
  async function installFreePlugin(manifest: PluginManifest) {
    try {
      const res = await fetch("/api/admin/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: manifest.slug,
          name: manifest.name,
          description: manifest.description,
          version: manifest.version,
          author: manifest.author,
          authorUrl: manifest.authorUrl,
          icon: manifest.icon,
          manifest,
          adminMenuLabel: manifest.adminMenu?.label,
          adminMenuIcon: manifest.adminMenu?.icon,
          adminMenuPosition: manifest.adminMenu?.position,
          hasAdminPages: manifest.features?.adminPages ?? false,
          hasPublicPages: manifest.features?.publicPages ?? false,
          hasWidgets: manifest.features?.widgets ?? false,
          hasApiRoutes: manifest.features?.apiRoutes ?? false,
          menuItems: manifest.adminMenu?.items,
          settings: manifest.settings,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Installation failed");
        return;
      }

      toast.success(`${manifest.name} installed successfully!`);
      setUploadDialogOpen(false);
      fetchPlugins();
    } catch (error) {
      console.error("Installation error:", error);
      toast.error("Failed to install plugin");
    }
  }

  // Activate plugin with license
  async function activateWithLicense() {
    if (!uploadedPlugin || !licenseKey.trim()) return;

    setActivating(true);
    setActivationError(null);

    try {
      const res = await fetch(`/api/admin/plugins/${uploadedPlugin.slug}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          manifest: uploadedPlugin.manifest,
          agreedToTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActivationError(data.message || data.error || "Activation failed");
        return;
      }

      toast.success(data.message || `${uploadedPlugin.name} activated successfully!`);
      setLicenseDialogOpen(false);
      resetUploadState();
      fetchPlugins();
    } catch (error) {
      console.error("Activation error:", error);
      setActivationError("Failed to activate plugin. Please try again.");
    } finally {
      setActivating(false);
    }
  }

  function resetUploadState() {
    setUploadedPlugin(null);
    setLicenseKey("");
    setAgreedToTerms(false);
    setActivationError(null);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Puzzle className="h-6 w-6" />
            Plugins
          </h1>
          <p className="text-muted-foreground">
            Manage installed plugins and extensions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Install Plugin
            </Button>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Install Plugin</DialogTitle>
                <DialogDescription>
                  Upload a plugin ZIP file to install. Premium plugins require a valid license key.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileArchive className="h-10 w-10 text-muted-foreground" />
                      <p className="font-medium">Click to upload plugin ZIP</p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop (max 50MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchPlugins}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Separator />

      {/* License Activation Dialog */}
      <Dialog open={licenseDialogOpen} onOpenChange={(open) => {
        setLicenseDialogOpen(open);
        if (!open) resetUploadState();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Activate License
            </DialogTitle>
            <DialogDescription>
              Enter your license key to activate {uploadedPlugin?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Plugin Info */}
            {uploadedPlugin && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      {uploadedPlugin.icon ? (
                        <span className="text-xl">{uploadedPlugin.icon}</span>
                      ) : (
                        <Puzzle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{uploadedPlugin.name}</p>
                      <p className="text-xs text-muted-foreground">
                        v{uploadedPlugin.version}
                        {uploadedPlugin.author && ` by ${uploadedPlugin.author}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* License Key Input */}
            <div className="space-y-2">
              <Label htmlFor="licenseKey">License Key</Label>
              <Input
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter the license key from your purchase confirmation email
              </p>
            </div>

            {/* Domain Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Globe className="h-4 w-4" />
              <span>
                License will be bound to: <strong>{typeof window !== 'undefined' ? window.location.hostname : 'your domain'}</strong>
              </span>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline" target="_blank">
                  terms and conditions
                </a>{" "}
                and understand that this license is for a single domain.
              </label>
            </div>

            {/* Error Message */}
            {activationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {activationError}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLicenseDialogOpen(false);
                resetUploadState();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={activateWithLicense}
              disabled={activating || !licenseKey.trim() || !agreedToTerms}
            >
              {activating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No plugins message */}
      {plugins.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No plugins installed</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Plugins extend your CMS with additional features. Click &quot;Install Plugin&quot; to upload a plugin ZIP file.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plugins Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => {
          const StatusIcon = statusConfig[plugin.status].icon;
          const isLoading = actionLoading === plugin.slug;

          return (
            <Card key={plugin.id} className="relative overflow-hidden">
              {/* Status indicator stripe */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  plugin.status === "ACTIVE"
                    ? "bg-green-500"
                    : plugin.status === "ERROR"
                    ? "bg-red-500"
                    : plugin.status === "DISABLED"
                    ? "bg-gray-400"
                    : "bg-blue-500"
                }`}
              />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      {plugin.icon ? (
                        <span className="text-xl">{plugin.icon}</span>
                      ) : (
                        <Puzzle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{plugin.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={statusConfig[plugin.status].color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[plugin.status].label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {plugin.description && (
                  <CardDescription className="line-clamp-2">
                    {plugin.description}
                  </CardDescription>
                )}

                {/* Plugin info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {plugin.author && (
                    <p className="flex items-center gap-1">
                      By{" "}
                      {plugin.authorUrl ? (
                        <a
                          href={plugin.authorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {plugin.author}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        plugin.author
                      )}
                    </p>
                  )}
                  <p>Installed: {formatDate(plugin.installedAt)}</p>
                  {plugin.licenseType && (
                    <p className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      License: {plugin.licenseType}
                    </p>
                  )}
                </div>

                {/* Features badges */}
                <div className="flex flex-wrap gap-1">
                  {plugin.hasAdminPages && (
                    <Badge variant="secondary" className="text-xs">Admin Pages</Badge>
                  )}
                  {plugin.hasWidgets && (
                    <Badge variant="secondary" className="text-xs">Widgets</Badge>
                  )}
                  {plugin.hasApiRoutes && (
                    <Badge variant="secondary" className="text-xs">API Routes</Badge>
                  )}
                </div>

                {/* Error message */}
                {plugin.status === "ERROR" && plugin.lastError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2">
                    <p className="text-xs text-red-700 flex items-start gap-1">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{plugin.lastError}</span>
                    </p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={plugin.status === "ACTIVE" ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    disabled={isLoading}
                    onClick={() => togglePlugin(plugin.slug, plugin.status)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : plugin.status === "ACTIVE" ? (
                      <>
                        <PowerOff className="h-4 w-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Power className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>

                  {plugin.status === "ACTIVE" && plugin._count.settings > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/settings/plugins/${plugin.slug}`}>
                        <Settings className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Uninstall Plugin</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to uninstall <strong>{plugin.name}</strong>?
                          This will remove the plugin and all its settings. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => uninstallPlugin(plugin.slug)}
                        >
                          Uninstall
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How to Install Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            How to Install Plugins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">1. Get the Plugin ZIP</h4>
              <p className="text-sm text-muted-foreground">
                Download the plugin ZIP file from CodeCanyon or the plugin provider.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">2. Upload & Enter License</h4>
              <p className="text-sm text-muted-foreground">
                Click &quot;Install Plugin&quot;, upload the ZIP, and enter your license key.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">3. Activate & Configure</h4>
              <p className="text-sm text-muted-foreground">
                Once verified, the plugin will be activated. Configure settings as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
