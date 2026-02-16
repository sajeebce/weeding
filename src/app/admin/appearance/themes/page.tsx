"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Paintbrush,
  Check,
  AlertTriangle,
  Palette,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ThemeListItem {
  id: string;
  meta: {
    name: string;
    version: string;
    description: string;
    category: string;
    thumbnail: string;
    serviceCount: number;
    author: string;
  };
  isActive: boolean;
}

// Gradient presets for theme thumbnail placeholders
const categoryGradients: Record<string, string> = {
  "legal-business": "from-orange-500 to-amber-600",
  technology: "from-blue-500 to-cyan-600",
  healthcare: "from-emerald-500 to-teal-600",
  creative: "from-purple-500 to-pink-600",
  education: "from-indigo-500 to-violet-600",
  default: "from-slate-500 to-gray-600",
};

const categoryBadgeColors: Record<string, string> = {
  "legal-business": "bg-orange-100 text-orange-700",
  technology: "bg-blue-100 text-blue-700",
  healthcare: "bg-emerald-100 text-emerald-700",
  creative: "bg-purple-100 text-purple-700",
  education: "bg-indigo-100 text-indigo-700",
  default: "bg-slate-100 text-slate-700",
};

export default function ThemeGalleryPage() {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemeListItem | null>(
    null
  );
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState<
    "full" | "colors" | null
  >(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  async function fetchThemes() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/themes");
      if (!response.ok) throw new Error("Failed to fetch themes");
      const data = await response.json();
      setThemes(data.themes || []);
    } catch (error) {
      console.error("Error fetching themes:", error);
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(themeId: string, includeContent: boolean) {
    try {
      setImporting(true);
      setImportType(includeContent ? "full" : "colors");

      const response = await fetch("/api/admin/themes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId, includeContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to import theme");
      }

      const data = await response.json();

      toast.success(
        data.summary
          ? `Theme activated successfully! ${data.summary}`
          : "Theme activated successfully!"
      );

      setSelectedTheme(null);
      // Refresh theme list to update active state
      await fetchThemes();
    } catch (error) {
      console.error("Error importing theme:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import theme"
      );
    } finally {
      setImporting(false);
      setImportType(null);
    }
  }

  function getGradient(category: string): string {
    return categoryGradients[category] || categoryGradients.default;
  }

  function getBadgeColor(category: string): string {
    return categoryBadgeColors[category] || categoryBadgeColors.default;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Theme Gallery</h1>
          <p className="text-muted-foreground">
            Browse and activate themes for your website
          </p>
        </div>
        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[16/10] bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-5 w-2/3 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Theme Gallery
          </h1>
          <p className="text-muted-foreground">
            Browse and activate themes for your website
          </p>
        </div>
      </div>

      {/* Theme Grid */}
      {themes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={cn(
                "group relative overflow-hidden transition-all duration-200",
                "hover:shadow-lg hover:scale-[1.02]",
                theme.isActive && "ring-2 ring-green-500 shadow-green-100"
              )}
            >
              {/* Thumbnail Placeholder */}
              <div
                className={cn(
                  "relative aspect-[16/10] bg-gradient-to-br flex items-center justify-center",
                  getGradient(theme.meta.category)
                )}
              >
                <div className="text-center text-white">
                  <Paintbrush className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-lg font-semibold opacity-90">
                    {theme.meta.name}
                  </p>
                </div>

                {/* Active Badge Overlay */}
                {theme.isActive && (
                  <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>

              {/* Card Content */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base line-clamp-1">
                    {theme.meta.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {theme.meta.description}
                  </p>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getBadgeColor(theme.meta.category))}
                  >
                    {theme.meta.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    {theme.meta.serviceCount} services
                  </Badge>
                </div>

                {/* Action Button */}
                <div className="pt-1">
                  {theme.isActive ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <Link href="/admin/appearance/themes/customize">
                          <Palette className="h-4 w-4 mr-2" />
                          Customize
                        </Link>
                      </Button>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-green-600 border-green-200 px-3"
                      >
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setSelectedTheme(theme)}
                    >
                      <Paintbrush className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No themes available</p>
          <p className="text-sm mt-1">
            Check back later or add theme files to the themes directory.
          </p>
        </div>
      )}

      {/* Activation Confirmation Dialog */}
      <Dialog
        open={!!selectedTheme}
        onOpenChange={() => {
          if (!importing) setSelectedTheme(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              Activate: {selectedTheme?.meta.name}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    This will replace all content data including services, pages,
                    blogs, FAQs, and settings. User accounts, orders, and leads
                    will be preserved.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Full Import Button */}
            <Button
              className="w-full justify-start h-auto py-3 px-4"
              disabled={importing}
              onClick={() =>
                selectedTheme && handleImport(selectedTheme.id, true)
              }
            >
              {importing && importType === "full" ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin shrink-0" />
              ) : (
                <Package className="h-5 w-5 mr-3 shrink-0" />
              )}
              <div className="text-left">
                <div className="font-medium">Activate with Demo Content</div>
                <div className="text-xs font-normal opacity-80 mt-0.5">
                  Import all services, pages, FAQs, and settings
                </div>
              </div>
            </Button>

            {/* Colors Only Button */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4"
              disabled={importing}
              onClick={() =>
                selectedTheme && handleImport(selectedTheme.id, false)
              }
            >
              {importing && importType === "colors" ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin shrink-0" />
              ) : (
                <Palette className="h-5 w-5 mr-3 shrink-0" />
              )}
              <div className="text-left">
                <div className="font-medium">Apply Colors Only</div>
                <div className="text-xs font-normal text-muted-foreground mt-0.5">
                  Only update color scheme and branding styles
                </div>
              </div>
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSelectedTheme(null)}
              disabled={importing}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
