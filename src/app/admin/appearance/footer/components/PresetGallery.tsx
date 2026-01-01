"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Check,
  Sparkles,
  Filter,
  Eye,
  LayoutGrid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { FooterPreset } from "@/lib/header-footer/types";

interface PresetGalleryProps {
  footerId: string;
  onPresetApplied: () => void;
}

const categoryLabels: Record<string, string> = {
  minimal: "Minimal",
  professional: "Professional",
  modern: "Modern",
  creative: "Creative",
  industry: "Industry",
};

const categoryColors: Record<string, string> = {
  minimal: "bg-slate-100 text-slate-700",
  professional: "bg-blue-100 text-blue-700",
  modern: "bg-purple-100 text-purple-700",
  creative: "bg-pink-100 text-pink-700",
  industry: "bg-emerald-100 text-emerald-700",
};

export function PresetGallery({ footerId, onPresetApplied }: PresetGalleryProps) {
  const [presets, setPresets] = useState<FooterPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<FooterPreset | null>(null);
  const [previewPreset, setPreviewPreset] = useState<FooterPreset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [preserveWidgets, setPreserveWidgets] = useState(false);

  // Fetch presets
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/footer/presets");
      if (!response.ok) throw new Error("Failed to fetch presets");
      const data = await response.json();
      setPresets(data.presets || []);
    } catch (error) {
      console.error("Error fetching presets:", error);
      toast.error("Failed to load presets");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = async () => {
    if (!selectedPreset) return;

    try {
      setApplying(true);
      const response = await fetch("/api/admin/footer/apply-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          footerId,
          presetId: selectedPreset.id,
          preserveWidgets,
        }),
      });

      if (!response.ok) throw new Error("Failed to apply preset");

      const data = await response.json();
      toast.success(data.message || "Preset applied successfully!");
      setSelectedPreset(null);
      onPresetApplied();
    } catch (error) {
      console.error("Error applying preset:", error);
      toast.error("Failed to apply preset");
    } finally {
      setApplying(false);
    }
  };

  const filteredPresets = presets.filter((preset) => {
    if (categoryFilter === "all") return true;
    return preset.category === categoryFilter;
  });

  const categories = ["all", ...new Set(presets.map((p) => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Footer Presets
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a preset to quickly style your footer
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : categoryLabels[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPresets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={() => setSelectedPreset(preset)}
            onPreview={() => setPreviewPreset(preset)}
          />
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No presets found for this category</p>
        </div>
      )}

      {/* Apply Confirmation Dialog */}
      <Dialog open={!!selectedPreset} onOpenChange={() => setSelectedPreset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Preset: {selectedPreset?.name}</DialogTitle>
            <DialogDescription>
              This will update your footer styling with the selected preset configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Preview - Color-based */}
            <div
              className="relative aspect-video w-full overflow-hidden rounded-lg border p-4"
              style={{ backgroundColor: selectedPreset?.colorPalette?.bg || '#f1f5f9' }}
            >
              {selectedPreset?.colorPalette && (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div
                      className="h-6 w-6 rounded"
                      style={{ backgroundColor: selectedPreset.colorPalette.primary }}
                    />
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-3 w-8 rounded"
                          style={{ backgroundColor: selectedPreset.colorPalette?.secondary }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 space-y-2">
                        <div
                          className="h-3 w-full rounded"
                          style={{ backgroundColor: selectedPreset.colorPalette?.primary }}
                        />
                        <div className="space-y-1">
                          {[1, 2, 3].map((j) => (
                            <div
                              key={j}
                              className="h-2 rounded"
                              style={{
                                backgroundColor: selectedPreset.colorPalette?.text,
                                width: `${70 + Math.random() * 30}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="h-1.5 w-full rounded"
                    style={{ backgroundColor: selectedPreset.colorPalette.accent }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            {selectedPreset?.tags && selectedPreset.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPreset.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Color Palette */}
            {selectedPreset?.colorPalette && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Colors:</span>
                <div className="flex gap-1">
                  {Object.values(selectedPreset.colorPalette).map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Preserve Widgets Option */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="preserve-widgets">Preserve existing widgets</Label>
                <p className="text-xs text-muted-foreground">
                  Keep your current widget configuration
                </p>
              </div>
              <Switch
                id="preserve-widgets"
                checked={preserveWidgets}
                onCheckedChange={setPreserveWidgets}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPreset(null)}>
              Cancel
            </Button>
            <Button onClick={handleApplyPreset} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Apply Preset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewPreset} onOpenChange={() => setPreviewPreset(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewPreset?.name}</DialogTitle>
            <DialogDescription>{previewPreset?.description}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Color-based Preview */}
            <div
              className="aspect-video w-full overflow-hidden rounded-lg border p-6"
              style={{ backgroundColor: previewPreset?.colorPalette?.bg || '#f1f5f9' }}
            >
              {previewPreset?.colorPalette ? (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg"
                        style={{ backgroundColor: previewPreset.colorPalette.primary }}
                      />
                      <div
                        className="h-4 w-20 rounded"
                        style={{ backgroundColor: previewPreset.colorPalette.primary }}
                      />
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-4 w-10 rounded"
                          style={{ backgroundColor: previewPreset.colorPalette?.secondary }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-6 mt-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 space-y-3">
                        <div
                          className="h-4 w-3/4 rounded"
                          style={{ backgroundColor: previewPreset.colorPalette?.primary }}
                        />
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((j) => (
                            <div
                              key={j}
                              className="h-2.5 rounded"
                              style={{
                                backgroundColor: previewPreset.colorPalette?.text,
                                width: `${60 + Math.random() * 40}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-3">
                    <div
                      className="h-px w-full"
                      style={{ backgroundColor: previewPreset.colorPalette.secondary }}
                    />
                    <div className="flex justify-between items-center">
                      <div
                        className="h-3 w-32 rounded"
                        style={{ backgroundColor: previewPreset.colorPalette.text }}
                      />
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full"
                            style={{ backgroundColor: previewPreset.colorPalette?.accent }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <LayoutGrid className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Preset Details */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Category</h4>
                <Badge className={cn(categoryColors[previewPreset?.category || ""])}>
                  {categoryLabels[previewPreset?.category || ""] || previewPreset?.category}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {previewPreset?.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewPreset(null)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button
              onClick={() => {
                setSelectedPreset(previewPreset);
                setPreviewPreset(null);
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Use This Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Individual Preset Card
function PresetCard({
  preset,
  onSelect,
  onPreview,
}: {
  preset: FooterPreset;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all duration-200",
        "hover:ring-2 hover:ring-primary hover:shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail - Always show color preview since images don't exist */}
      <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: preset.colorPalette?.bg || '#f1f5f9' }}>
        {/* Color-based Preview */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {preset.colorPalette ? (
            <div className="w-full space-y-2">
              {/* Mini footer preview */}
              <div className="flex justify-between items-center">
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: preset.colorPalette.primary }}
                />
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-6 rounded"
                      style={{ backgroundColor: preset.colorPalette?.secondary || '#94a3b8' }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-1 space-y-1"
                  >
                    <div
                      className="h-2 w-full rounded"
                      style={{ backgroundColor: preset.colorPalette?.primary || '#1e293b' }}
                    />
                    <div
                      className="h-1.5 w-3/4 rounded"
                      style={{ backgroundColor: preset.colorPalette?.text || '#64748b' }}
                    />
                    <div
                      className="h-1.5 w-2/3 rounded"
                      style={{ backgroundColor: preset.colorPalette?.text || '#64748b' }}
                    />
                  </div>
                ))}
              </div>
              <div
                className="h-1 w-full rounded"
                style={{ backgroundColor: preset.colorPalette.accent }}
              />
            </div>
          ) : (
            <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>

        {/* Hover Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" onClick={onSelect}>
            <Check className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>

        {/* Built-in Badge */}
        {preset.isBuiltIn && (
          <Badge
            className="absolute top-2 right-2 bg-primary/90"
            variant="default"
          >
            Built-in
          </Badge>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-sm line-clamp-1">{preset.name}</h4>
            <Badge
              variant="secondary"
              className={cn("mt-1 text-xs", categoryColors[preset.category])}
            >
              {categoryLabels[preset.category] || preset.category}
            </Badge>
          </div>
        </div>
        {preset.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {preset.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
