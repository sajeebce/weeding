"use client";

import { useState, useEffect, useRef } from "react";
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
  FileJson,
  FolderOpen,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  adminMenuLabel: string | null;
  adminMenuIcon: string | null;
  adminMenuPosition: number | null;
  hasAdminPages: boolean;
  hasPublicPages: boolean;
  hasWidgets: boolean;
  hasApiRoutes: boolean;
  installedAt: string;
  lastActivatedAt: string | null;
  lastError: string | null;
  errorAt: string | null;
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
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [manifestContent, setManifestContent] = useState("");
  const [installing, setInstalling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (!res.ok) {
        throw new Error("Failed to update plugin");
      }

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
      const res = await fetch(`/api/admin/plugins/${slug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to uninstall plugin");
      }

      toast.success("Plugin uninstalled successfully");
      fetchPlugins();
    } catch (error) {
      console.error("Error uninstalling plugin:", error);
      toast.error("Failed to uninstall plugin");
    } finally {
      setActionLoading(null);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Please select a plugin.json file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setManifestContent(content);
      try {
        JSON.parse(content);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  async function installPlugin() {
    if (!manifestContent) {
      toast.error("Please provide a plugin manifest");
      return;
    }

    let manifest: PluginManifest;
    try {
      manifest = JSON.parse(manifestContent);
    } catch {
      toast.error("Invalid JSON format");
      return;
    }

    if (!manifest.slug || !manifest.name) {
      toast.error("Plugin manifest must have slug and name");
      return;
    }

    setInstalling(true);
    try {
      const pluginData = {
        slug: manifest.slug,
        name: manifest.name,
        description: manifest.description,
        version: manifest.version || "1.0.0",
        author: manifest.author,
        authorUrl: manifest.authorUrl,
        icon: manifest.icon,
        manifest: manifest,
        adminMenuLabel: manifest.adminMenu?.label,
        adminMenuIcon: manifest.adminMenu?.icon,
        adminMenuPosition: manifest.adminMenu?.position,
        hasAdminPages: manifest.features?.adminPages ?? false,
        hasPublicPages: manifest.features?.publicPages ?? false,
        hasWidgets: manifest.features?.widgets ?? false,
        hasApiRoutes: manifest.features?.apiRoutes ?? false,
        menuItems: manifest.adminMenu?.items?.map((item, index) => ({
          label: item.label,
          path: item.path,
          icon: item.icon,
          sortOrder: index,
        })),
        settings: manifest.settings,
      };

      const res = await fetch("/api/admin/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pluginData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to install plugin");
      }

      toast.success(`${manifest.name} installed successfully!`);
      setInstallDialogOpen(false);
      setManifestContent("");
      fetchPlugins();
    } catch (error) {
      console.error("Error installing plugin:", error);
      toast.error(error instanceof Error ? error.message : "Failed to install plugin");
    } finally {
      setInstalling(false);
    }
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
          <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Install Plugin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Install Plugin</DialogTitle>
                <DialogDescription>
                  Upload a plugin.json manifest file to install a new plugin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload plugin.json</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or paste manifest JSON
                    </span>
                  </div>
                </div>

                {/* Manual JSON Input */}
                <div className="space-y-2">
                  <Label htmlFor="manifest">Plugin Manifest (JSON)</Label>
                  <textarea
                    id="manifest"
                    value={manifestContent}
                    onChange={(e) => setManifestContent(e.target.value)}
                    placeholder={`{
  "slug": "my-plugin",
  "name": "My Plugin",
  "description": "A custom plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "adminMenu": {
    "label": "My Plugin",
    "icon": "Puzzle",
    "items": [
      { "label": "Dashboard", "path": "/admin/my-plugin" }
    ]
  }
}`}
                    className="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted/50 resize-none"
                  />
                </div>

                {/* Preview */}
                {manifestContent && (() => {
                  try {
                    const parsed = JSON.parse(manifestContent);
                    return (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-medium">Valid manifest</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            {parsed.name} v{parsed.version || "1.0.0"}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  } catch {
                    return (
                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 text-red-700">
                            <XCircle className="h-4 w-4" />
                            <span className="font-medium">Invalid JSON</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                })()}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={installPlugin} disabled={installing || !manifestContent}>
                  {installing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Install
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

      {/* No plugins message */}
      {plugins.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No plugins installed</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Plugins extend your CMS with additional features. Click
              &quot;Install Plugin&quot; to add a new plugin using its manifest file.
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
                      <p className="text-xs text-muted-foreground">
                        v{plugin.version}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusConfig[plugin.status].color}
                  >
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
                  {plugin.lastActivatedAt && (
                    <p>Last activated: {formatDate(plugin.lastActivatedAt)}</p>
                  )}
                </div>

                {/* Features badges */}
                <div className="flex flex-wrap gap-1">
                  {plugin.hasAdminPages && (
                    <Badge variant="secondary" className="text-xs">
                      Admin Pages
                    </Badge>
                  )}
                  {plugin.hasWidgets && (
                    <Badge variant="secondary" className="text-xs">
                      Widgets
                    </Badge>
                  )}
                  {plugin.hasApiRoutes && (
                    <Badge variant="secondary" className="text-xs">
                      API Routes
                    </Badge>
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
                          Are you sure you want to uninstall{" "}
                          <strong>{plugin.name}</strong>? This will remove the
                          plugin and all its settings. This action cannot be
                          undone.
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
            <FileJson className="h-5 w-5" />
            How to Install Plugins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">1. Get the plugin.json</h4>
              <p className="text-sm text-muted-foreground">
                Each plugin comes with a <code className="bg-muted px-1 rounded">plugin.json</code> manifest
                file that describes the plugin&apos;s features and configuration.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">2. Upload or paste</h4>
              <p className="text-sm text-muted-foreground">
                Click &quot;Install Plugin&quot;, then upload the manifest file or paste
                its contents directly.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">3. Activate</h4>
              <p className="text-sm text-muted-foreground">
                After installation, activate the plugin to enable its features.
                Menu items will appear in the sidebar.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">4. Configure</h4>
              <p className="text-sm text-muted-foreground">
                Some plugins have settings. Click the settings icon on an active
                plugin to configure it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
