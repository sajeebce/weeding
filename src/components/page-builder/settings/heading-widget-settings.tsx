"use client";

import type {
  HeadingWidgetSettings,
  HeadingHighlightStyle,
  HeadingEntranceAnimationType,
  HeadingTextAnimationType,
  HeadingContinuousAnimationType,
  HeadingHoverAnimationType,
  HeadingEasingType,
} from "@/lib/page-builder/types";
import { DEFAULT_HEADING_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  TextInput,
  ToggleSwitch,
  TextAreaInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeadingWidgetSettingsPanelProps {
  settings: Partial<HeadingWidgetSettings>;
  onChange: (settings: HeadingWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
}

// Deep merge helper
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as T;
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = (target as Record<string, unknown>)[key];
    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
      (result as Record<string, unknown>)[key] = deepMerge(
        (targetValue || {}) as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }
  return result;
}

export function HeadingWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
}: HeadingWidgetSettingsPanelProps) {
  // Deep merge with defaults
  const settings: HeadingWidgetSettings = deepMerge(
    DEFAULT_HEADING_SETTINGS,
    partialSettings as Partial<HeadingWidgetSettings>
  );

  // Update nested content
  const updateContent = <K extends keyof HeadingWidgetSettings["content"]>(
    key: K,
    value: HeadingWidgetSettings["content"][K]
  ) => {
    onChange({
      ...settings,
      content: { ...settings.content, [key]: value },
    });
  };

  // Update nested style
  const updateStyle = <K extends keyof HeadingWidgetSettings["style"]>(
    key: K,
    value: HeadingWidgetSettings["style"][K]
  ) => {
    onChange({
      ...settings,
      style: { ...settings.style, [key]: value },
    });
  };

  // Update typography
  const updateTypography = <K extends keyof HeadingWidgetSettings["style"]["typography"]>(
    key: K,
    value: HeadingWidgetSettings["style"]["typography"][K]
  ) => {
    onChange({
      ...settings,
      style: {
        ...settings.style,
        typography: { ...settings.style.typography, [key]: value },
      },
    });
  };

  // Update text fill
  const updateTextFill = <K extends keyof HeadingWidgetSettings["style"]["textFill"]>(
    key: K,
    value: HeadingWidgetSettings["style"]["textFill"][K]
  ) => {
    onChange({
      ...settings,
      style: {
        ...settings.style,
        textFill: { ...settings.style.textFill, [key]: value },
      },
    });
  };

  // Update animation
  const updateAnimation = <K extends keyof NonNullable<HeadingWidgetSettings["animation"]>>(
    key: K,
    value: NonNullable<HeadingWidgetSettings["animation"]>[K]
  ) => {
    onChange({
      ...settings,
      animation: { ...settings.animation, [key]: value },
    });
  };

  // Update advanced
  const updateAdvanced = <K extends keyof NonNullable<HeadingWidgetSettings["advanced"]>>(
    key: K,
    value: NonNullable<HeadingWidgetSettings["advanced"]>[K]
  ) => {
    onChange({
      ...settings,
      advanced: { ...settings.advanced, [key]: value },
    });
  };

  // Content Tab
  if (activeTab === "content") {
    return (
      <div className="space-y-4">
        {/* Main Text */}
        <TextAreaInput
          label="Heading Text"
          value={settings.content.text}
          onChange={(v) => updateContent("text", v)}
          placeholder="Enter your heading text"
          rows={2}
        />

        {/* HTML Tag */}
        <SelectInput
          label="HTML Tag"
          value={settings.content.htmlTag}
          onChange={(v) => updateContent("htmlTag", v as HeadingWidgetSettings["content"]["htmlTag"])}
          options={[
            { value: "h1", label: "H1 - Main Heading" },
            { value: "h2", label: "H2 - Section Heading" },
            { value: "h3", label: "H3 - Subsection" },
            { value: "h4", label: "H4" },
            { value: "h5", label: "H5" },
            { value: "h6", label: "H6" },
            { value: "div", label: "Div" },
            { value: "span", label: "Span" },
            { value: "p", label: "Paragraph" },
          ]}
        />

        {/* Link Settings */}
        <AccordionSection title="Link" defaultOpen={!!settings.content.link?.url}>
          <div className="space-y-3">
            <TextInput
              label="URL"
              value={settings.content.link?.url || ""}
              onChange={(v) =>
                updateContent("link", {
                  url: v,
                  openInNewTab: settings.content.link?.openInNewTab || false,
                })
              }
              placeholder="https://..."
            />
            {settings.content.link?.url && (
              <ToggleSwitch
                label="Open in New Tab"
                checked={settings.content.link?.openInNewTab || false}
                onChange={(v: boolean) =>
                  updateContent("link", {
                    ...settings.content.link!,
                    openInNewTab: v,
                  })
                }
              />
            )}
          </div>
        </AccordionSection>

        {/* Highlight Words */}
        <AccordionSection title="Highlight Words" defaultOpen={settings.content.highlight?.enabled}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Highlighting"
              checked={settings.content.highlight?.enabled || false}
              onChange={(v: boolean) =>
                updateContent("highlight", {
                  ...settings.content.highlight!,
                  enabled: v,
                })
              }
            />
            {settings.content.highlight?.enabled && (
              <>
                <TextInput
                  label="Words to Highlight"
                  value={settings.content.highlight?.words || ""}
                  onChange={(v) =>
                    updateContent("highlight", {
                      ...settings.content.highlight!,
                      words: v,
                    })
                  }
                  placeholder="word1, word2, word3"
                  description="Comma-separated words"
                />
                <SelectInput
                  label="Highlight Style"
                  value={settings.content.highlight?.style || "color"}
                  onChange={(v) =>
                    updateContent("highlight", {
                      ...settings.content.highlight!,
                      style: v as HeadingHighlightStyle,
                    })
                  }
                  options={[
                    { value: "color", label: "Color Only" },
                    { value: "background", label: "Background" },
                    { value: "gradient", label: "Gradient Text" },
                    { value: "underline", label: "Underline" },
                    { value: "marker", label: "Marker Effect" },
                    { value: "glow", label: "Glow Effect" },
                  ]}
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Split Heading */}
        <AccordionSection title="Split Heading" defaultOpen={settings.content.splitHeading?.enabled}>
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Split Heading"
              checked={settings.content.splitHeading?.enabled || false}
              onChange={(v: boolean) =>
                updateContent("splitHeading", {
                  ...settings.content.splitHeading!,
                  enabled: v,
                })
              }
            />
            {settings.content.splitHeading?.enabled && (
              <>
                <TextInput
                  label="Before Text"
                  value={settings.content.splitHeading?.beforeText || ""}
                  onChange={(v) =>
                    updateContent("splitHeading", {
                      ...settings.content.splitHeading!,
                      beforeText: v,
                    })
                  }
                  placeholder="Start Your"
                />
                <TextInput
                  label="Main Text"
                  value={settings.content.splitHeading?.mainText || ""}
                  onChange={(v) =>
                    updateContent("splitHeading", {
                      ...settings.content.splitHeading!,
                      mainText: v,
                    })
                  }
                  placeholder="US Business"
                />
                <TextInput
                  label="After Text"
                  value={settings.content.splitHeading?.afterText || ""}
                  onChange={(v) =>
                    updateContent("splitHeading", {
                      ...settings.content.splitHeading!,
                      afterText: v,
                    })
                  }
                  placeholder="Today"
                />
              </>
            )}
          </div>
        </AccordionSection>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        {/* Alignment */}
        <div className="space-y-2">
          <Label className="text-xs text-slate-400">Alignment</Label>
          <div className="flex gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateStyle("alignment", align)}
                className={`flex-1 py-2 px-3 text-xs rounded border transition-colors ${
                  settings.style.alignment === align
                    ? "bg-orange-500/20 border-orange-500 text-orange-400"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <AccordionSection title="Typography" defaultOpen>
          <div className="space-y-3">
            <TextInput
              label="Font Family"
              value={settings.style.typography.fontFamily || ""}
              onChange={(v) => updateTypography("fontFamily", v || undefined)}
              placeholder="Inter, system-ui, sans-serif"
              description="Google Font or system font"
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Font Size"
                value={settings.style.typography.fontSize}
                onChange={(v) => updateTypography("fontSize", v)}
                min={12}
                max={120}
                step={1}
              />
              <SelectInput
                label="Unit"
                value={settings.style.typography.fontSizeUnit}
                onChange={(v) => updateTypography("fontSizeUnit", v as "px" | "em" | "rem" | "vw")}
                options={[
                  { value: "px", label: "px" },
                  { value: "em", label: "em" },
                  { value: "rem", label: "rem" },
                  { value: "vw", label: "vw" },
                ]}
              />
            </div>
            <SelectInput
              label="Font Weight"
              value={String(settings.style.typography.fontWeight)}
              onChange={(v) => updateTypography("fontWeight", Number(v) as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900)}
              options={[
                { value: "100", label: "100 - Thin" },
                { value: "200", label: "200 - Extra Light" },
                { value: "300", label: "300 - Light" },
                { value: "400", label: "400 - Normal" },
                { value: "500", label: "500 - Medium" },
                { value: "600", label: "600 - Semi Bold" },
                { value: "700", label: "700 - Bold" },
                { value: "800", label: "800 - Extra Bold" },
                { value: "900", label: "900 - Black" },
              ]}
            />
            <NumberInput
              label="Line Height"
              value={settings.style.typography.lineHeight}
              onChange={(v) => updateTypography("lineHeight", v)}
              min={0.5}
              max={3}
              step={0.1}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Letter Spacing"
                value={settings.style.typography.letterSpacing}
                onChange={(v) => updateTypography("letterSpacing", v)}
                min={-5}
                max={20}
                step={0.5}
              />
              <SelectInput
                label="Unit"
                value={settings.style.typography.letterSpacingUnit}
                onChange={(v) => updateTypography("letterSpacingUnit", v as "px" | "em")}
                options={[
                  { value: "px", label: "px" },
                  { value: "em", label: "em" },
                ]}
              />
            </div>
            <SelectInput
              label="Text Transform"
              value={settings.style.typography.textTransform}
              onChange={(v) => updateTypography("textTransform", v as "none" | "uppercase" | "lowercase" | "capitalize")}
              options={[
                { value: "none", label: "None" },
                { value: "uppercase", label: "UPPERCASE" },
                { value: "lowercase", label: "lowercase" },
                { value: "capitalize", label: "Capitalize" },
              ]}
            />
          </div>
        </AccordionSection>

        {/* Text Fill */}
        <AccordionSection title="Text Fill">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Fill Type</Label>
              <div className="flex gap-2">
                {(["solid", "gradient", "image"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateTextFill("type", type)}
                    className={`flex-1 py-2 px-3 text-xs rounded border transition-colors ${
                      settings.style.textFill.type === type
                        ? "bg-orange-500/20 border-orange-500 text-orange-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {settings.style.textFill.type === "solid" && (
              <ColorInput
                label="Text Color"
                value={settings.style.textFill.color || "#ffffff"}
                onChange={(v) => updateTextFill("color", v)}
              />
            )}

            {settings.style.textFill.type === "gradient" && (
              <div className="space-y-3">
                <SelectInput
                  label="Gradient Type"
                  value={settings.style.textFill.gradient?.type || "linear"}
                  onChange={(v) =>
                    updateTextFill("gradient", {
                      ...settings.style.textFill.gradient!,
                      type: v as "linear" | "radial",
                    })
                  }
                  options={[
                    { value: "linear", label: "Linear" },
                    { value: "radial", label: "Radial" },
                  ]}
                />
                {settings.style.textFill.gradient?.type === "linear" && (
                  <NumberInput
                    label="Angle"
                    value={settings.style.textFill.gradient?.angle || 90}
                    onChange={(v) =>
                      updateTextFill("gradient", {
                        ...settings.style.textFill.gradient!,
                        angle: v,
                      })
                    }
                    min={0}
                    max={360}
                    step={15}
                    unit="°"
                  />
                )}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-400">Gradient Colors</Label>
                  {settings.style.textFill.gradient?.colors?.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ColorInput
                        label=""
                        value={stop.color}
                        onChange={(v) => {
                          const newColors = [...(settings.style.textFill.gradient?.colors || [])];
                          newColors[index] = { ...newColors[index], color: v };
                          updateTextFill("gradient", {
                            ...settings.style.textFill.gradient!,
                            colors: newColors,
                          });
                        }}
                      />
                      <NumberInput
                        label=""
                        value={stop.position}
                        onChange={(v) => {
                          const newColors = [...(settings.style.textFill.gradient?.colors || [])];
                          newColors[index] = { ...newColors[index], position: v };
                          updateTextFill("gradient", {
                            ...settings.style.textFill.gradient!,
                            colors: newColors,
                          });
                        }}
                        min={0}
                        max={100}
                        step={5}
                        unit="%"
                      />
                      {(settings.style.textFill.gradient?.colors?.length || 0) > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const newColors = settings.style.textFill.gradient?.colors?.filter((_, i) => i !== index);
                            updateTextFill("gradient", {
                              ...settings.style.textFill.gradient!,
                              colors: newColors || [],
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const colors = settings.style.textFill.gradient?.colors || [];
                      updateTextFill("gradient", {
                        ...settings.style.textFill.gradient!,
                        colors: [...colors, { color: "#ffffff", position: 100 }],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Color Stop
                  </Button>
                </div>
              </div>
            )}

            {settings.style.textFill.type === "image" && (
              <div className="space-y-3">
                <TextInput
                  label="Image URL"
                  value={settings.style.textFill.image?.url || ""}
                  onChange={(v) =>
                    updateTextFill("image", {
                      ...settings.style.textFill.image!,
                      url: v,
                    })
                  }
                  placeholder="https://..."
                />
                <SelectInput
                  label="Size"
                  value={settings.style.textFill.image?.size || "cover"}
                  onChange={(v) =>
                    updateTextFill("image", {
                      ...settings.style.textFill.image!,
                      size: v as "cover" | "contain" | "auto",
                    })
                  }
                  options={[
                    { value: "cover", label: "Cover" },
                    { value: "contain", label: "Contain" },
                    { value: "auto", label: "Auto" },
                  ]}
                />
                <ToggleSwitch
                  label="Fixed (Parallax)"
                  checked={settings.style.textFill.image?.fixed || false}
                  onChange={(v: boolean) =>
                    updateTextFill("image", {
                      ...settings.style.textFill.image!,
                      fixed: v,
                    })
                  }
                />
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Text Stroke */}
        <AccordionSection title="Text Stroke (Outline)">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Stroke"
              checked={settings.style.textStroke?.enabled || false}
              onChange={(v: boolean) =>
                updateStyle("textStroke", {
                  ...settings.style.textStroke!,
                  enabled: v,
                })
              }
            />
            {settings.style.textStroke?.enabled && (
              <>
                <NumberInput
                  label="Stroke Width"
                  value={settings.style.textStroke?.width || 2}
                  onChange={(v) =>
                    updateStyle("textStroke", {
                      ...settings.style.textStroke!,
                      width: v,
                    })
                  }
                  min={1}
                  max={10}
                  step={1}
                  unit="px"
                />
                <ColorInput
                  label="Stroke Color"
                  value={settings.style.textStroke?.color || "#ffffff"}
                  onChange={(v) =>
                    updateStyle("textStroke", {
                      ...settings.style.textStroke!,
                      color: v,
                    })
                  }
                />
                <ColorInput
                  label="Fill Color (optional)"
                  value={settings.style.textStroke?.fillColor || ""}
                  onChange={(v) =>
                    updateStyle("textStroke", {
                      ...settings.style.textStroke!,
                      fillColor: v || undefined,
                    })
                  }
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Text Shadow */}
        <AccordionSection title="Text Shadow">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Shadow"
              checked={settings.style.textShadow?.enabled || false}
              onChange={(v: boolean) =>
                updateStyle("textShadow", {
                  ...settings.style.textShadow!,
                  enabled: v,
                })
              }
            />
            {settings.style.textShadow?.enabled && (
              <>
                {settings.style.textShadow?.shadows?.map((shadow, index) => (
                  <div key={index} className="p-3 bg-slate-800/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-slate-400">Shadow {index + 1}</Label>
                      {(settings.style.textShadow?.shadows?.length || 0) > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            const newShadows = settings.style.textShadow?.shadows?.filter((_, i) => i !== index);
                            updateStyle("textShadow", {
                              ...settings.style.textShadow!,
                              shadows: newShadows || [],
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <NumberInput
                        label="X"
                        value={shadow.offsetX}
                        onChange={(v) => {
                          const newShadows = [...(settings.style.textShadow?.shadows || [])];
                          newShadows[index] = { ...newShadows[index], offsetX: v };
                          updateStyle("textShadow", {
                            ...settings.style.textShadow!,
                            shadows: newShadows,
                          });
                        }}
                        min={-50}
                        max={50}
                        step={1}
                      />
                      <NumberInput
                        label="Y"
                        value={shadow.offsetY}
                        onChange={(v) => {
                          const newShadows = [...(settings.style.textShadow?.shadows || [])];
                          newShadows[index] = { ...newShadows[index], offsetY: v };
                          updateStyle("textShadow", {
                            ...settings.style.textShadow!,
                            shadows: newShadows,
                          });
                        }}
                        min={-50}
                        max={50}
                        step={1}
                      />
                      <NumberInput
                        label="Blur"
                        value={shadow.blur}
                        onChange={(v) => {
                          const newShadows = [...(settings.style.textShadow?.shadows || [])];
                          newShadows[index] = { ...newShadows[index], blur: v };
                          updateStyle("textShadow", {
                            ...settings.style.textShadow!,
                            shadows: newShadows,
                          });
                        }}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                    <ColorInput
                      label="Color"
                      value={shadow.color}
                      onChange={(v) => {
                        const newShadows = [...(settings.style.textShadow?.shadows || [])];
                        newShadows[index] = { ...newShadows[index], color: v };
                        updateStyle("textShadow", {
                          ...settings.style.textShadow!,
                          shadows: newShadows,
                        });
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const shadows = settings.style.textShadow?.shadows || [];
                    updateStyle("textShadow", {
                      ...settings.style.textShadow!,
                      shadows: [...shadows, { offsetX: 0, offsetY: 4, blur: 10, color: "rgba(0,0,0,0.3)" }],
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Shadow
                </Button>
              </>
            )}
          </div>
        </AccordionSection>

        {/* Highlight Style (when highlight is enabled) */}
        {settings.content.highlight?.enabled && (
          <AccordionSection title="Highlight Style">
            <div className="space-y-3">
              <ColorInput
                label="Highlight Color"
                value={settings.style.highlightStyle?.color || "#f97316"}
                onChange={(v) =>
                  updateStyle("highlightStyle", {
                    ...settings.style.highlightStyle,
                    color: v,
                  })
                }
              />
              {(settings.content.highlight?.style === "background" ||
                settings.content.highlight?.style === "marker") && (
                <ColorInput
                  label="Background Color"
                  value={settings.style.highlightStyle?.backgroundColor || "#f9731933"}
                  onChange={(v) =>
                    updateStyle("highlightStyle", {
                      ...settings.style.highlightStyle,
                      backgroundColor: v,
                    })
                  }
                />
              )}
            </div>
          </AccordionSection>
        )}
      </div>
    );
  }

  // Advanced Tab (includes Animation and other advanced settings)
  if (activeTab === "advanced") {
    return (
      <div className="space-y-4">
        {/* Entrance Animation */}
        <AccordionSection title="Entrance Animation" defaultOpen>
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Entrance Animation"
              checked={settings.animation?.entrance?.enabled || false}
              onChange={(v: boolean) =>
                updateAnimation("entrance", {
                  ...settings.animation?.entrance!,
                  enabled: v,
                })
              }
            />
            {settings.animation?.entrance?.enabled && (
              <>
                <SelectInput
                  label="Animation Type"
                  value={settings.animation?.entrance?.type || "fade-up"}
                  onChange={(v) =>
                    updateAnimation("entrance", {
                      ...settings.animation?.entrance!,
                      type: v as HeadingEntranceAnimationType,
                    })
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "fade", label: "Fade" },
                    { value: "fade-up", label: "Fade Up" },
                    { value: "fade-down", label: "Fade Down" },
                    { value: "fade-left", label: "Fade Left" },
                    { value: "fade-right", label: "Fade Right" },
                    { value: "zoom-in", label: "Zoom In" },
                    { value: "zoom-out", label: "Zoom Out" },
                    { value: "slide-up", label: "Slide Up" },
                    { value: "slide-down", label: "Slide Down" },
                    { value: "flip", label: "Flip" },
                    { value: "bounce", label: "Bounce" },
                  ]}
                />
                <NumberInput
                  label="Duration"
                  value={settings.animation?.entrance?.duration || 600}
                  onChange={(v) =>
                    updateAnimation("entrance", {
                      ...settings.animation?.entrance!,
                      duration: v,
                    })
                  }
                  min={100}
                  max={2000}
                  step={100}
                  unit="ms"
                />
                <NumberInput
                  label="Delay"
                  value={settings.animation?.entrance?.delay || 0}
                  onChange={(v) =>
                    updateAnimation("entrance", {
                      ...settings.animation?.entrance!,
                      delay: v,
                    })
                  }
                  min={0}
                  max={2000}
                  step={100}
                  unit="ms"
                />
                <SelectInput
                  label="Easing"
                  value={settings.animation?.entrance?.easing || "ease-out"}
                  onChange={(v) =>
                    updateAnimation("entrance", {
                      ...settings.animation?.entrance!,
                      easing: v as HeadingEasingType,
                    })
                  }
                  options={[
                    { value: "linear", label: "Linear" },
                    { value: "ease", label: "Ease" },
                    { value: "ease-in", label: "Ease In" },
                    { value: "ease-out", label: "Ease Out" },
                    { value: "ease-in-out", label: "Ease In Out" },
                    { value: "bounce", label: "Bounce" },
                    { value: "elastic", label: "Elastic" },
                  ]}
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Text Animation */}
        <AccordionSection title="Text Animation">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Text Animation"
              checked={settings.animation?.textAnimation?.enabled || false}
              onChange={(v: boolean) =>
                updateAnimation("textAnimation", {
                  ...settings.animation?.textAnimation!,
                  enabled: v,
                })
              }
            />
            {settings.animation?.textAnimation?.enabled && (
              <>
                <SelectInput
                  label="Animation Type"
                  value={settings.animation?.textAnimation?.type || "fade-in"}
                  onChange={(v) =>
                    updateAnimation("textAnimation", {
                      ...settings.animation?.textAnimation!,
                      type: v as HeadingTextAnimationType,
                    })
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "fade-in", label: "Fade In" },
                    { value: "slide-up", label: "Slide Up" },
                    { value: "slide-down", label: "Slide Down" },
                    { value: "scale", label: "Scale" },
                    { value: "rotate", label: "Rotate" },
                    { value: "blur-in", label: "Blur In (Framer)" },
                    { value: "typewriter", label: "Typewriter" },
                    { value: "wave", label: "Wave (Divi)" },
                    { value: "bounce", label: "Bounce" },
                    { value: "elastic", label: "Elastic" },
                    { value: "glitch", label: "Glitch" },
                    { value: "scramble", label: "Scramble" },
                  ]}
                />
                <SelectInput
                  label="Split By"
                  value={settings.animation?.textAnimation?.splitBy || "words"}
                  onChange={(v) =>
                    updateAnimation("textAnimation", {
                      ...settings.animation?.textAnimation!,
                      splitBy: v as "characters" | "words" | "lines",
                    })
                  }
                  options={[
                    { value: "characters", label: "Characters" },
                    { value: "words", label: "Words" },
                    { value: "lines", label: "Lines" },
                  ]}
                />
                <NumberInput
                  label="Stagger Delay"
                  value={settings.animation?.textAnimation?.staggerDelay || 50}
                  onChange={(v) =>
                    updateAnimation("textAnimation", {
                      ...settings.animation?.textAnimation!,
                      staggerDelay: v,
                    })
                  }
                  min={10}
                  max={500}
                  step={10}
                  unit="ms"
                />
                <NumberInput
                  label="Duration"
                  value={settings.animation?.textAnimation?.duration || 400}
                  onChange={(v) =>
                    updateAnimation("textAnimation", {
                      ...settings.animation?.textAnimation!,
                      duration: v,
                    })
                  }
                  min={100}
                  max={2000}
                  step={100}
                  unit="ms"
                />
                <ToggleSwitch
                  label="Loop Animation"
                  checked={settings.animation?.textAnimation?.loop || false}
                  onChange={(v: boolean) =>
                    updateAnimation("textAnimation", {
                      ...settings.animation?.textAnimation!,
                      loop: v,
                    })
                  }
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Continuous Animation */}
        <AccordionSection title="Continuous Animation">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Continuous Animation"
              checked={settings.animation?.continuousAnimation?.enabled || false}
              onChange={(v: boolean) =>
                updateAnimation("continuousAnimation", {
                  ...settings.animation?.continuousAnimation!,
                  enabled: v,
                })
              }
            />
            {settings.animation?.continuousAnimation?.enabled && (
              <>
                <SelectInput
                  label="Animation Type"
                  value={settings.animation?.continuousAnimation?.type || "none"}
                  onChange={(v) =>
                    updateAnimation("continuousAnimation", {
                      ...settings.animation?.continuousAnimation!,
                      type: v as HeadingContinuousAnimationType,
                    })
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "gradient-shift", label: "Gradient Shift" },
                    { value: "pulse", label: "Pulse" },
                    { value: "glow", label: "Glow" },
                    { value: "shimmer", label: "Shimmer" },
                    { value: "float", label: "Float" },
                  ]}
                />
                <NumberInput
                  label="Duration"
                  value={settings.animation?.continuousAnimation?.duration || 3000}
                  onChange={(v) =>
                    updateAnimation("continuousAnimation", {
                      ...settings.animation?.continuousAnimation!,
                      duration: v,
                    })
                  }
                  min={500}
                  max={10000}
                  step={500}
                  unit="ms"
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Hover Animation */}
        <AccordionSection title="Hover Animation">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Hover Animation"
              checked={settings.animation?.hoverAnimation?.enabled || false}
              onChange={(v: boolean) =>
                updateAnimation("hoverAnimation", {
                  ...settings.animation?.hoverAnimation!,
                  enabled: v,
                })
              }
            />
            {settings.animation?.hoverAnimation?.enabled && (
              <>
                <SelectInput
                  label="Animation Type"
                  value={settings.animation?.hoverAnimation?.type || "none"}
                  onChange={(v) =>
                    updateAnimation("hoverAnimation", {
                      ...settings.animation?.hoverAnimation!,
                      type: v as HeadingHoverAnimationType,
                    })
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "color-change", label: "Color Change" },
                    { value: "underline-grow", label: "Underline Grow" },
                    { value: "background-fill", label: "Background Fill" },
                    { value: "scale", label: "Scale" },
                    { value: "letter-spacing", label: "Letter Spacing" },
                    { value: "glow", label: "Glow" },
                  ]}
                />
                <NumberInput
                  label="Duration"
                  value={settings.animation?.hoverAnimation?.duration || 300}
                  onChange={(v) =>
                    updateAnimation("hoverAnimation", {
                      ...settings.animation?.hoverAnimation!,
                      duration: v,
                    })
                  }
                  min={100}
                  max={1000}
                  step={50}
                  unit="ms"
                />
              </>
            )}
          </div>
        </AccordionSection>

        {/* Max Width */}
        <AccordionSection title="Max Width">
          <div className="space-y-3">
            <ToggleSwitch
              label="Enable Max Width"
              checked={settings.advanced?.maxWidth?.enabled || false}
              onChange={(v: boolean) =>
                updateAdvanced("maxWidth", {
                  ...settings.advanced?.maxWidth!,
                  enabled: v,
                })
              }
            />
            {settings.advanced?.maxWidth?.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Value"
                  value={settings.advanced?.maxWidth?.value || 800}
                  onChange={(v) =>
                    updateAdvanced("maxWidth", {
                      ...settings.advanced?.maxWidth!,
                      value: v,
                    })
                  }
                  min={100}
                  max={2000}
                  step={50}
                />
                <SelectInput
                  label="Unit"
                  value={settings.advanced?.maxWidth?.unit || "px"}
                  onChange={(v) =>
                    updateAdvanced("maxWidth", {
                      ...settings.advanced?.maxWidth!,
                      unit: v as "px" | "ch" | "%" | "vw",
                    })
                  }
                  options={[
                    { value: "px", label: "px" },
                    { value: "ch", label: "ch (characters)" },
                    { value: "%", label: "%" },
                    { value: "vw", label: "vw" },
                  ]}
                />
              </div>
            )}
          </div>
        </AccordionSection>

        {/* Visibility */}
        <AccordionSection title="Visibility">
          <div className="space-y-3">
            <ToggleSwitch
              label="Hide on Desktop"
              checked={settings.advanced?.hideOnDesktop || false}
              onChange={(v: boolean) => updateAdvanced("hideOnDesktop", v)}
            />
            <ToggleSwitch
              label="Hide on Tablet"
              checked={settings.advanced?.hideOnTablet || false}
              onChange={(v: boolean) => updateAdvanced("hideOnTablet", v)}
            />
            <ToggleSwitch
              label="Hide on Mobile"
              checked={settings.advanced?.hideOnMobile || false}
              onChange={(v: boolean) => updateAdvanced("hideOnMobile", v)}
            />
          </div>
        </AccordionSection>

        {/* Custom CSS Class */}
        <AccordionSection title="Custom CSS">
          <div className="space-y-3">
            <TextInput
              label="Custom Class"
              value={settings.advanced?.customClass || ""}
              onChange={(v) => updateAdvanced("customClass", v || undefined)}
              placeholder="my-custom-class"
            />
            <TextInput
              label="Custom ID"
              value={settings.advanced?.customId || ""}
              onChange={(v) => updateAdvanced("customId", v || undefined)}
              placeholder="my-heading-id"
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}

export default HeadingWidgetSettingsPanel;
