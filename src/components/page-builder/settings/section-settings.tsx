"use client";

import { useState } from "react";
import type {
  SectionSettings,
  SectionLayout,
  SectionBackground,
  BackgroundType,
  GradientType,
  BackgroundSize,
  BackgroundPosition,
  BackgroundRepeat,
} from "@/lib/page-builder/types";
import { DEFAULT_SECTION_SETTINGS, DEFAULT_SECTION_BACKGROUND } from "@/lib/page-builder/defaults";
import { SECTION_LAYOUTS } from "@/lib/page-builder/section-layouts";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionSettingsProps {
  settings: SectionSettings;
  layout: SectionLayout;
  onSettingsChange: (settings: SectionSettings) => void;
  onLayoutChange: (layout: SectionLayout) => void;
}

// Gradient color stop editor
interface GradientColorStopProps {
  color: string;
  position: number;
  onChange: (color: string, position: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function GradientColorStop({
  color,
  position,
  onChange,
  onRemove,
  canRemove,
}: GradientColorStopProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value, position)}
        className="h-8 w-8 rounded border border-slate-600 cursor-pointer"
      />
      <input
        type="number"
        value={position}
        onChange={(e) => onChange(color, parseInt(e.target.value) || 0)}
        min={0}
        max={100}
        className="flex-1 h-8 px-2 rounded border border-slate-600 bg-slate-800 text-sm text-white"
      />
      <span className="text-xs text-slate-400">%</span>
      {canRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SectionSettingsPanel({
  settings,
  layout,
  onSettingsChange,
  onLayoutChange,
}: SectionSettingsProps) {
  // Merge with defaults - use type assertion to handle optional fields
  const s = {
    ...DEFAULT_SECTION_SETTINGS,
    ...settings,
    background: {
      ...DEFAULT_SECTION_BACKGROUND,
      ...(settings?.background || {}),
      gradient: {
        ...DEFAULT_SECTION_BACKGROUND.gradient,
        ...(settings?.background?.gradient || {}),
      },
      image: {
        ...DEFAULT_SECTION_BACKGROUND.image,
        ...(settings?.background?.image || {}),
      },
      video: {
        ...DEFAULT_SECTION_BACKGROUND.video,
        ...(settings?.background?.video || {}),
      },
      overlay: {
        ...DEFAULT_SECTION_BACKGROUND.overlay,
        ...(settings?.background?.overlay || {}),
      },
    },
  } as SectionSettings;

  const updateField = <K extends keyof SectionSettings>(
    key: K,
    value: SectionSettings[K]
  ) => {
    onSettingsChange({ ...s, [key]: value });
  };

  const updateBackground = (updates: Partial<SectionBackground>) => {
    onSettingsChange({
      ...s,
      background: { ...s.background, ...updates },
    });
  };

  // Generate gradient CSS preview
  const getGradientPreview = () => {
    const { gradient } = s.background;
    if (!gradient) return "";
    const colorStops = gradient.colors
      .map((c) => `${c.color} ${c.position}%`)
      .join(", ");
    if (gradient.type === "linear") {
      return `linear-gradient(${gradient.angle}deg, ${colorStops})`;
    }
    return `radial-gradient(circle, ${colorStops})`;
  };

  return (
    <div className="space-y-4">
      {/* Layout */}
      <SelectInput
        label="Column Layout"
        value={layout}
        onChange={(v) => onLayoutChange(v as SectionLayout)}
        options={SECTION_LAYOUTS.map((l) => ({
          value: l.layout,
          label: l.name,
        }))}
      />

      {/* Max Width */}
      <SelectInput
        label="Container Width"
        value={s.maxWidth}
        onChange={(v) => updateField("maxWidth", v as SectionSettings["maxWidth"])}
        options={[
          { value: "sm", label: "Small (640px)" },
          { value: "md", label: "Medium (768px)" },
          { value: "lg", label: "Large (1024px)" },
          { value: "xl", label: "Extra Large (1280px)" },
          { value: "2xl", label: "2X Large (1536px)" },
          { value: "full", label: "Full Width" },
        ]}
      />

      {/* Full Width */}
      <ToggleSwitch
        label="Full Width Background"
        description="Background extends to edges, content stays in container"
        checked={s.fullWidth}
        onChange={(checked) => updateField("fullWidth", checked)}
      />

      {/* Spacing */}
      <AccordionSection title="Spacing">
        <div className="space-y-3">
          <NumberInput
            label="Padding Top"
            value={s.paddingTop}
            onChange={(v) => updateField("paddingTop", v)}
            min={0}
            max={200}
            step={8}
            unit="px"
          />
          <NumberInput
            label="Padding Bottom"
            value={s.paddingBottom}
            onChange={(v) => updateField("paddingBottom", v)}
            min={0}
            max={200}
            step={8}
            unit="px"
          />
          <NumberInput
            label="Column Gap"
            value={s.gap}
            onChange={(v) => updateField("gap", v)}
            min={0}
            max={100}
            step={4}
            unit="px"
          />
        </div>
      </AccordionSection>

      {/* Background */}
      <AccordionSection title="Background" defaultOpen>
        <div className="space-y-4">
          {/* Background Type Selector */}
          <SelectInput
            label="Background Type"
            value={s.background.type}
            onChange={(v) => updateBackground({ type: v as BackgroundType })}
            options={[
              { value: "solid", label: "Solid Color" },
              { value: "gradient", label: "Gradient" },
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
            ]}
          />

          {/* Solid Color */}
          {s.background.type === "solid" && (
            <ColorInput
              label="Background Color"
              value={s.background.color || "transparent"}
              onChange={(v) => updateBackground({ color: v })}
            />
          )}

          {/* Gradient */}
          {s.background.type === "gradient" && (
            <div className="space-y-4">
              {/* Gradient Preview */}
              <div
                className="h-16 rounded-lg border border-slate-600"
                style={{ background: getGradientPreview() }}
              />

              <SelectInput
                label="Gradient Type"
                value={s.background.gradient?.type || "linear"}
                onChange={(v) =>
                  updateBackground({
                    gradient: {
                      ...s.background.gradient!,
                      type: v as GradientType,
                    },
                  })
                }
                options={[
                  { value: "linear", label: "Linear" },
                  { value: "radial", label: "Radial" },
                ]}
              />

              {s.background.gradient?.type === "linear" && (
                <NumberInput
                  label="Angle"
                  value={s.background.gradient?.angle || 180}
                  onChange={(v) =>
                    updateBackground({
                      gradient: {
                        ...s.background.gradient!,
                        angle: v,
                      },
                    })
                  }
                  min={0}
                  max={360}
                  step={15}
                  unit="°"
                />
              )}

              {/* Color Stops */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">
                  Color Stops
                </label>
                {s.background.gradient?.colors.map((stop, index) => (
                  <GradientColorStop
                    key={index}
                    color={stop.color}
                    position={stop.position}
                    onChange={(color, position) => {
                      const newColors = [...(s.background.gradient?.colors || [])];
                      newColors[index] = { color, position };
                      updateBackground({
                        gradient: {
                          ...s.background.gradient!,
                          colors: newColors,
                        },
                      });
                    }}
                    onRemove={() => {
                      const newColors = s.background.gradient?.colors.filter(
                        (_, i) => i !== index
                      );
                      updateBackground({
                        gradient: {
                          ...s.background.gradient!,
                          colors: newColors || [],
                        },
                      });
                    }}
                    canRemove={(s.background.gradient?.colors.length || 0) > 2}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const colors = s.background.gradient?.colors || [];
                    const lastPos = colors.length > 0 ? colors[colors.length - 1].position : 0;
                    updateBackground({
                      gradient: {
                        ...s.background.gradient!,
                        colors: [
                          ...colors,
                          { color: "#ffffff", position: Math.min(lastPos + 25, 100) },
                        ],
                      },
                    });
                  }}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color Stop
                </Button>
              </div>
            </div>
          )}

          {/* Image */}
          {s.background.type === "image" && (
            <div className="space-y-3">
              <ImageUpload
                label="Background Image"
                description="Recommended: 1920×1080px or larger"
                accept="image/png,image/jpeg,image/webp"
                value={s.background.image?.url || ""}
                onChange={(url) =>
                  updateBackground({
                    image: { ...s.background.image!, url: url || "" },
                  })
                }
              />

              {s.background.image?.url && (
                <>
                  <SelectInput
                    label="Size"
                    value={s.background.image?.size || "cover"}
                    onChange={(v) =>
                      updateBackground({
                        image: { ...s.background.image!, size: v as BackgroundSize },
                      })
                    }
                    options={[
                      { value: "cover", label: "Cover (Fill)" },
                      { value: "contain", label: "Contain (Fit)" },
                      { value: "auto", label: "Original Size" },
                    ]}
                  />

                  <SelectInput
                    label="Position"
                    value={s.background.image?.position || "center"}
                    onChange={(v) =>
                      updateBackground({
                        image: { ...s.background.image!, position: v as BackgroundPosition },
                      })
                    }
                    options={[
                      { value: "center", label: "Center" },
                      { value: "top", label: "Top" },
                      { value: "bottom", label: "Bottom" },
                      { value: "left", label: "Left" },
                      { value: "right", label: "Right" },
                      { value: "top-left", label: "Top Left" },
                      { value: "top-right", label: "Top Right" },
                      { value: "bottom-left", label: "Bottom Left" },
                      { value: "bottom-right", label: "Bottom Right" },
                    ]}
                  />

                  <SelectInput
                    label="Repeat"
                    value={s.background.image?.repeat || "no-repeat"}
                    onChange={(v) =>
                      updateBackground({
                        image: { ...s.background.image!, repeat: v as BackgroundRepeat },
                      })
                    }
                    options={[
                      { value: "no-repeat", label: "No Repeat" },
                      { value: "repeat", label: "Repeat Both" },
                      { value: "repeat-x", label: "Repeat Horizontal" },
                      { value: "repeat-y", label: "Repeat Vertical" },
                    ]}
                  />

                  <ToggleSwitch
                    label="Fixed (Parallax)"
                    description="Image stays fixed while scrolling"
                    checked={s.background.image?.fixed || false}
                    onChange={(checked) =>
                      updateBackground({
                        image: { ...s.background.image!, fixed: checked },
                      })
                    }
                  />
                </>
              )}
            </div>
          )}

          {/* Video */}
          {s.background.type === "video" && (
            <div className="space-y-3">
              <TextInput
                label="Video URL"
                value={s.background.video?.url || ""}
                onChange={(v) =>
                  updateBackground({
                    video: { ...s.background.video!, url: v },
                  })
                }
                placeholder="https://example.com/video.mp4"
                description="Direct video URL (MP4, WebM)"
              />

              <ImageUpload
                label="Poster Image"
                description="Fallback image while video loads"
                accept="image/png,image/jpeg,image/webp"
                value={s.background.video?.poster || ""}
                onChange={(url) =>
                  updateBackground({
                    video: { ...s.background.video!, poster: url || undefined },
                  })
                }
              />

              <ToggleSwitch
                label="Muted"
                description="Video plays without sound"
                checked={s.background.video?.muted ?? true}
                onChange={(checked) =>
                  updateBackground({
                    video: { ...s.background.video!, muted: checked },
                  })
                }
              />

              <ToggleSwitch
                label="Loop"
                description="Video replays automatically"
                checked={s.background.video?.loop ?? true}
                onChange={(checked) =>
                  updateBackground({
                    video: { ...s.background.video!, loop: checked },
                  })
                }
              />
            </div>
          )}

          {/* Overlay - Available for all background types */}
          <div className="pt-4 border-t border-slate-700">
            <ToggleSwitch
              label="Background Overlay"
              description="Add a color overlay on top of background"
              checked={s.background.overlay?.enabled ?? false}
              onChange={(checked) =>
                updateBackground({
                  overlay: { ...s.background.overlay!, enabled: checked },
                })
              }
            />

            {s.background.overlay?.enabled && (
              <div className="mt-3 space-y-3">
                <ColorInput
                  label="Overlay Color"
                  value={s.background.overlay?.color || "#000000"}
                  onChange={(v) =>
                    updateBackground({
                      overlay: { ...s.background.overlay!, color: v },
                    })
                  }
                />
                <NumberInput
                  label="Overlay Opacity"
                  value={Math.round((s.background.overlay?.opacity || 0.5) * 100)}
                  onChange={(v) =>
                    updateBackground({
                      overlay: { ...s.background.overlay!, opacity: v / 100 },
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  unit="%"
                />
              </div>
            )}
          </div>
        </div>
      </AccordionSection>

      {/* Border */}
      <AccordionSection title="Border">
        <NumberInput
          label="Border Radius"
          value={s.borderRadius || 0}
          onChange={(v) => updateField("borderRadius", v)}
          min={0}
          max={50}
          step={4}
          unit="px"
        />
      </AccordionSection>
    </div>
  );
}
