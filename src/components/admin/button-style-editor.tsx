"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";
import type { ButtonCustomStyle, ButtonHoverEffect, GradientDirection } from "@/lib/header-footer/types";

// Shared button utilities
import {
  getGradientCSS,
  getHoverEffectClass,
  isComplexHoverEffect,
  getComplexEffectStyles,
  getFinalBackground,
} from "@/lib/button-utils";

// Gradient direction options
const gradientDirectionOptions: { value: GradientDirection; label: string }[] = [
  { value: "to-r", label: "→ Right" },
  { value: "to-l", label: "← Left" },
  { value: "to-t", label: "↑ Up" },
  { value: "to-b", label: "↓ Down" },
  { value: "to-tr", label: "↗ Diagonal (Top Right)" },
  { value: "to-tl", label: "↖ Diagonal (Top Left)" },
  { value: "to-br", label: "↘ Diagonal (Bottom Right)" },
  { value: "to-bl", label: "↙ Diagonal (Bottom Left)" },
];

// Button hover effects
const hoverEffectOptions: { value: ButtonHoverEffect; label: string }[] = [
  { value: "none", label: "None" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "shadow-lift", label: "Shadow Lift" },
  { value: "shadow-press", label: "Shadow Press" },
  { value: "scale-up", label: "Scale Up" },
  { value: "scale-down", label: "Scale Down" },
  { value: "slide-fill", label: "Slide Fill" },
  { value: "border-fill", label: "Border Fill" },
  { value: "gradient-shift", label: "Gradient Shift" },
  { value: "glow-pulse", label: "Glow Pulse" },
  { value: "ripple", label: "Ripple" },
  { value: "craft-expand", label: "Craft Expand (Icon Circle)" },
  { value: "heartbeat", label: "Heartbeat Pulse" },
  { value: "flow-border", label: "Flow Border (Rotating Gradient)" },
  { value: "stitches", label: "Stitches (3D Dashed Border)" },
  { value: "ring-hover", label: "Ring Hover" },
  { value: "neural", label: "Neural (Animated Border Beam)" },
];

// 2025 Modern Button Style Presets
export interface ButtonStylePreset {
  id: string;
  name: string;
  description: string;
  style: ButtonCustomStyle;
}

export const buttonStylePresets: ButtonStylePreset[] = [
  {
    id: "ocean-gradient",
    name: "Ocean",
    description: "Smooth blue-to-cyan gradient with lift effect",
    style: {
      useGradient: true,
      gradientFrom: "#0066FF",
      gradientTo: "#00D4FF",
      gradientDirection: "to-r",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 8,
      hoverEffect: "shadow-lift",
      shadow: "0 2px 8px rgba(0, 102, 255, 0.3)",
      hoverShadow: "0 8px 25px rgba(0, 102, 255, 0.4)",
    },
  },
  {
    id: "sunset-glow",
    name: "Sunset",
    description: "Orange-to-pink gradient with glow pulse",
    style: {
      useGradient: true,
      gradientFrom: "#FF6B35",
      gradientTo: "#F72585",
      gradientDirection: "to-r",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 25,
      hoverEffect: "glow-pulse",
      shadow: "0 4px 15px rgba(247, 37, 133, 0.3)",
    },
  },
  {
    id: "neon-cyber",
    name: "Neon",
    description: "Electric purple with slide fill effect",
    style: {
      bgColor: "#7C3AED",
      textColor: "#ffffff",
      borderWidth: 2,
      borderColor: "#A855F7",
      borderRadius: 6,
      hoverBgColor: "#A855F7",
      hoverEffect: "slide-fill",
      shadow: "0 0 20px rgba(168, 85, 247, 0.3)",
    },
  },
  {
    id: "emerald-success",
    name: "Emerald",
    description: "Rich green gradient with scale effect",
    style: {
      useGradient: true,
      gradientFrom: "#059669",
      gradientTo: "#10B981",
      gradientDirection: "to-tr",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 10,
      hoverEffect: "scale-up",
      shadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
    },
  },
  {
    id: "midnight-premium",
    name: "Midnight",
    description: "Deep dark with gold accent border fill",
    style: {
      bgColor: "#1a1a2e",
      textColor: "#FFD700",
      borderWidth: 2,
      borderColor: "#FFD700",
      borderRadius: 4,
      hoverBgColor: "#FFD700",
      hoverTextColor: "#1a1a2e",
      hoverEffect: "border-fill",
    },
  },
  {
    id: "coral-soft",
    name: "Coral",
    description: "Soft coral with ripple effect",
    style: {
      bgColor: "#FF6F61",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 20,
      hoverBgColor: "#FF8577",
      hoverEffect: "ripple",
      shadow: "0 3px 10px rgba(255, 111, 97, 0.3)",
    },
  },
  {
    id: "arctic-shift",
    name: "Arctic",
    description: "Cool blue gradient with shift animation",
    style: {
      useGradient: true,
      gradientFrom: "#667eea",
      gradientTo: "#764ba2",
      gradientDirection: "to-r",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 8,
      hoverBgColor: "#764ba2",
      hoverEffect: "gradient-shift",
    },
  },
  {
    id: "red-alert",
    name: "Red",
    description: "High-contrast red for urgent actions",
    style: {
      bgColor: "#DC2626",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 6,
      hoverBgColor: "#B91C1C",
      hoverEffect: "shadow-press",
      shadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
    },
  },
  {
    id: "outline-modern",
    name: "Outline",
    description: "Clean outline with slide fill on hover",
    style: {
      bgColor: "transparent",
      textColor: "#2563EB",
      borderWidth: 2,
      borderColor: "#2563EB",
      borderRadius: 8,
      hoverBgColor: "#2563EB",
      hoverTextColor: "#ffffff",
      hoverEffect: "slide-fill",
    },
  },
  {
    id: "craft-expand",
    name: "Craft",
    description: "Modern pill button with expanding icon circle on hover",
    style: {
      bgColor: "#18181b",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 9999,
      hoverEffect: "craft-expand",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      hoverShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  {
    id: "heartbeat",
    name: "Heartbeat",
    description: "Eye-catching pulsing animation for urgent CTAs",
    style: {
      bgColor: "#DC2626",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 8,
      hoverEffect: "heartbeat",
      shadow: "0 0 0 0 rgba(220, 38, 38, 0.7)",
    },
  },
  {
    id: "flow-border",
    name: "Flow",
    description: "Rotating border gradient with conic animation on hover",
    style: {
      bgColor: "#F97316",
      textColor: "#ffffff",
      borderWidth: 2,
      borderColor: "#F97316",
      borderRadius: 8,
      hoverEffect: "flow-border",
      shadow: "0 0 0 2px rgba(249, 115, 22, 0.3)",
    },
  },
  {
    id: "stitches",
    name: "Stitches",
    description: "3D stitched effect with dashed inner border and shadow depth",
    style: {
      bgColor: "#0ea5e9",
      textColor: "#ffffff",
      borderWidth: 2,
      borderColor: "#0ea5e9",
      borderRadius: 8,
      hoverEffect: "stitches",
    },
  },
  {
    id: "ring-hover",
    name: "Ring",
    description: "Elegant ring outline effect on hover with smooth transition",
    style: {
      bgColor: "#F97316",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 6,
      hoverEffect: "ring-hover",
    },
  },
  {
    id: "neural",
    name: "Neural",
    description: "Futuristic button with animated border beam and scale effects",
    style: {
      bgColor: "#0369a1",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 12,
      hoverEffect: "neural",
    },
  },
];

// Re-export getGradientCSS for backward compatibility (used by centered.tsx)
export { getGradientCSS } from "@/lib/button-utils";

// Re-export getHoverEffectClass as getPreviewHoverClass for backward compatibility
export { getHoverEffectClass as getPreviewHoverClass } from "@/lib/button-utils";

// Get Lucide icon component by name
function getLucideIcon(name: string): React.ComponentType<{ className?: string }> | null {
  if (!name) return null;
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  // Convert kebab-case to PascalCase (arrow-right -> ArrowRight)
  const pascalName = name.split('-').map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
  return icons[pascalName] || icons[name] || null;
}

// Render icon for preview
function renderPreviewIcon(style: ButtonCustomStyle) {
  if (style.customIconSvg?.trim()) {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: style.customIconSvg }}
      />
    );
  }

  if (style.icon) {
    const IconComponent = getLucideIcon(style.icon);
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
  }

  return null;
}

// isComplexHoverEffect is now imported from @/lib/button-utils

// Button Preview Component
function ButtonPreview({ style, text = "Button" }: { style: ButtonCustomStyle; text?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  const icon = renderPreviewIcon(style);
  const showIcon = icon !== null;

  // Special component for craft-expand effect
  if (style.hoverEffect === "craft-expand") {
    const craftIcon = showIcon ? icon : <ArrowUpRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />;
    return (
      <CraftButton
        bgColor={style.bgColor || "#18181b"}
        textColor={style.textColor || "#ffffff"}
        size="sm"
      >
        <CraftButtonLabel>{text}</CraftButtonLabel>
        <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
      </CraftButton>
    );
  }

  // Special component for flow-border effect
  if (style.hoverEffect === "flow-border") {
    return (
      <PrimaryFlowButton
        className="text-sm"
        style={{
          '--tw-ring-color': `${style.bgColor || '#F97316'}99`,
        } as React.CSSProperties}
      >
        {showIcon && style.iconPosition === "left" && icon}
        {text}
        {showIcon && style.iconPosition !== "left" && icon}
      </PrimaryFlowButton>
    );
  }

  // Special component for neural effect
  if (style.hoverEffect === "neural") {
    return (
      <NeuralButton size="sm">
        {showIcon && style.iconPosition === "left" && icon}
        {text}
        {showIcon && style.iconPosition !== "left" && icon}
      </NeuralButton>
    );
  }

  // Use shared utilities for styling
  const hasComplexEffect = isComplexHoverEffect(style.hoverEffect);
  const effectStyles = getComplexEffectStyles(style, isHovered);

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 overflow-hidden ${getHoverEffectClass(style.hoverEffect)}`}
      style={{
        background: getFinalBackground(style, isHovered),
        color: isHovered && style.hoverTextColor ? style.hoverTextColor : (style.textColor || "#ffffff"),
        borderWidth: `${style.borderWidth ?? 0}px`,
        borderStyle: "solid",
        borderColor: isHovered && style.hoverBorderColor ? style.hoverBorderColor : (style.borderColor || "transparent"),
        borderRadius: `${style.borderRadius ?? 6}px`,
        // Apply effect-specific styles
        ...effectStyles,
        // Override with custom shadow only if no complex effect is active
        ...((!hasComplexEffect && style.shadow) ? { boxShadow: isHovered && style.hoverShadow ? style.hoverShadow : style.shadow } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showIcon && style.iconPosition === "left" && icon}
      {text}
      {showIcon && style.iconPosition !== "left" && icon}
    </button>
  );
}

interface ButtonStyleEditorProps {
  style: ButtonCustomStyle;
  onChange: (style: ButtonCustomStyle) => void;
  buttonText?: string;
  showPreview?: boolean;
  showPresets?: boolean;
  compact?: boolean;
}

export function ButtonStyleEditor({
  style,
  onChange,
  buttonText = "Button",
  showPreview = true,
  showPresets = true,
  compact = false,
}: ButtonStyleEditorProps) {
  const updateStyle = (updates: Partial<ButtonCustomStyle>) => {
    onChange({ ...style, ...updates });
  };

  return (
    <div className="space-y-3">
      {/* Live Button Preview */}
      {showPreview && (
        <div className="rounded-lg border p-3">
          <Label className="text-xs text-muted-foreground mb-1 block">Preview (hover/tap to test)</Label>
          <div className="flex items-center justify-center py-1">
            <ButtonPreview style={style} text={buttonText} />
          </div>
        </div>
      )}

      {/* Style Presets */}
      {showPresets && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Style Presets</Label>
          <p className="text-xs text-muted-foreground">
            Tap to apply a style preset
          </p>
          <div className={`grid gap-1.5 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"}`}>
            {buttonStylePresets.map((preset) => {
              const previewBg = preset.style.useGradient
                ? `linear-gradient(${getGradientCSS(preset.style.gradientDirection)}, ${preset.style.gradientFrom}, ${preset.style.gradientTo})`
                : preset.style.bgColor || "#F97316";

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange({ ...preset.style })}
                  className="group relative flex flex-col items-center p-1.5 rounded-md border hover:border-primary hover:bg-muted/50 transition-all"
                  title={preset.description}
                >
                  <span
                    className="inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-medium rounded transition-all mb-0.5"
                    style={{
                      background: previewBg,
                      color: preset.style.textColor || "#ffffff",
                      borderWidth: `${preset.style.borderWidth ?? 0}px`,
                      borderStyle: "solid",
                      borderColor: preset.style.borderColor || "transparent",
                      borderRadius: `${Math.min(preset.style.borderRadius ?? 6, 4)}px`,
                    }}
                  >
                    Btn
                  </span>
                  <span className="text-[8px] text-muted-foreground group-hover:text-foreground text-center leading-tight truncate w-full">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Styling Accordion */}
      <Accordion type="multiple" className="w-full">
        {/* Colors Section */}
        <AccordionItem value="colors">
          <AccordionTrigger className="text-sm">Colors</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Gradient Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-2 sm:p-3 gap-2">
              <div className="min-w-0">
                <Label className="text-xs sm:text-sm">Use Gradient</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Enable gradient instead of solid</p>
              </div>
              <Switch
                checked={style.useGradient || false}
                onCheckedChange={(checked) => updateStyle({
                  useGradient: checked,
                  gradientFrom: checked ? (style.gradientFrom || "#F97316") : undefined,
                  gradientTo: checked ? (style.gradientTo || "#C2410C") : undefined,
                })}
              />
            </div>

            {style.useGradient ? (
              <div className="rounded-lg border p-2 sm:p-3 space-y-3 bg-muted/30">
                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Gradient From</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={style.gradientFrom || "#F97316"}
                        onChange={(e) => updateStyle({ gradientFrom: e.target.value })}
                        className="h-9 w-12 cursor-pointer p-1"
                      />
                      <Input
                        value={style.gradientFrom || ""}
                        onChange={(e) => updateStyle({ gradientFrom: e.target.value })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Gradient To</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={style.gradientTo || "#C2410C"}
                        onChange={(e) => updateStyle({ gradientTo: e.target.value })}
                        className="h-9 w-12 cursor-pointer p-1"
                      />
                      <Input
                        value={style.gradientTo || ""}
                        onChange={(e) => updateStyle({ gradientTo: e.target.value })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Direction</Label>
                    <Select
                      value={style.gradientDirection || "to-r"}
                      onValueChange={(value: GradientDirection) => updateStyle({ gradientDirection: value })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientDirectionOptions.map((dir) => (
                          <SelectItem key={dir.value} value={dir.value}>{dir.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={style.textColor || "#ffffff"}
                      onChange={(e) => updateStyle({ textColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                    <Input
                      value={style.textColor || ""}
                      onChange={(e) => updateStyle({ textColor: e.target.value })}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={style.bgColor || "#F97316"}
                      onChange={(e) => updateStyle({ bgColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                    <Input
                      value={style.bgColor || ""}
                      onChange={(e) => updateStyle({ bgColor: e.target.value })}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={style.textColor || "#ffffff"}
                      onChange={(e) => updateStyle({ textColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                    <Input
                      value={style.textColor || ""}
                      onChange={(e) => updateStyle({ textColor: e.target.value })}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={style.borderColor || "#F97316"}
                      onChange={(e) => updateStyle({ borderColor: e.target.value })}
                      className="h-9 w-12 cursor-pointer p-1"
                    />
                    <Input
                      value={style.borderColor || ""}
                      onChange={(e) => updateStyle({ borderColor: e.target.value })}
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Border Section */}
        <AccordionItem value="border">
          <AccordionTrigger className="text-sm">Border</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Border Width</Label>
                <span className="text-xs text-muted-foreground">
                  {style.borderWidth ?? 0}px
                </span>
              </div>
              <Slider
                value={[style.borderWidth ?? 0]}
                onValueChange={(value) => updateStyle({ borderWidth: value[0] })}
                min={0}
                max={4}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Border Radius</Label>
                <span className="text-xs text-muted-foreground">
                  {style.borderRadius ?? 6}px
                </span>
              </div>
              <Slider
                value={[style.borderRadius ?? 6]}
                onValueChange={(value) => updateStyle({ borderRadius: value[0] })}
                min={0}
                max={50}
                step={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Hover Effects Section */}
        <AccordionItem value="hover">
          <AccordionTrigger className="text-sm">Hover Effects</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Hover Effect</Label>
              <Select
                value={style.hoverEffect || "none"}
                onValueChange={(value: ButtonHoverEffect) => updateStyle({ hoverEffect: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hoverEffectOptions.map((effect) => (
                    <SelectItem key={effect.value} value={effect.value}>
                      {effect.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hover Background Color */}
            <div className="space-y-2">
              <Label className="text-xs">Hover Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={style.hoverBgColor || "#EA580C"}
                  onChange={(e) => updateStyle({ hoverBgColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer p-1"
                />
                <Input
                  value={style.hoverBgColor || ""}
                  onChange={(e) => updateStyle({ hoverBgColor: e.target.value })}
                  placeholder="#EA580C"
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            {/* Hover Text Color */}
            <div className="space-y-2">
              <Label className="text-xs">Hover Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={style.hoverTextColor || "#ffffff"}
                  onChange={(e) => updateStyle({ hoverTextColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer p-1"
                />
                <Input
                  value={style.hoverTextColor || ""}
                  onChange={(e) => updateStyle({ hoverTextColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shadow Section */}
        <AccordionItem value="shadow">
          <AccordionTrigger className="text-sm">Shadow</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Box Shadow</Label>
              <Input
                value={style.shadow || ""}
                onChange={(e) => updateStyle({ shadow: e.target.value })}
                placeholder="0 4px 14px rgba(0, 0, 0, 0.2)"
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Hover Shadow</Label>
              <Input
                value={style.hoverShadow || ""}
                onChange={(e) => updateStyle({ hoverShadow: e.target.value })}
                placeholder="0 8px 25px rgba(0, 0, 0, 0.3)"
                className="text-xs"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Icon Section */}
        <AccordionItem value="icon">
          <AccordionTrigger className="text-sm">Icon</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {/* Use Custom SVG Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-2 sm:p-3 gap-2">
              <div className="min-w-0">
                <Label className="text-xs sm:text-sm">Use Custom SVG</Label>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Paste your own SVG code instead of Lucide icon</p>
              </div>
              <Switch
                checked={!!style.customIconSvg}
                onCheckedChange={(checked) => updateStyle({
                  customIconSvg: checked ? style.customIconSvg : undefined,
                  icon: checked ? undefined : style.icon,
                })}
              />
            </div>

            {!style.customIconSvg ? (
              <>
                {/* Lucide Icon Name + Position */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Lucide Icon Name</Label>
                    <Input
                      value={style.icon || ""}
                      onChange={(e) => updateStyle({ icon: e.target.value })}
                      placeholder="arrow-right, rocket..."
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Icon Position</Label>
                    <Select
                      value={style.iconPosition || "right"}
                      onValueChange={(value: "left" | "right") => updateStyle({ iconPosition: value })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left of Text</SelectItem>
                        <SelectItem value="right">Right of Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Browse icons at{" "}
                  <a
                    href="https://lucide.dev/icons"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    lucide.dev/icons
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {" "}and copy the icon name
                </p>
              </>
            ) : (
              <>
                {/* Custom SVG Textarea */}
                <div className="space-y-2">
                  <Label className="text-xs">Custom SVG Code</Label>
                  <Textarea
                    value={style.customIconSvg || ""}
                    onChange={(e) => updateStyle({ customIconSvg: e.target.value })}
                    placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
                    className="text-xs font-mono h-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Icon Position</Label>
                  <Select
                    value={style.iconPosition || "right"}
                    onValueChange={(value: "left" | "right") => updateStyle({ iconPosition: value })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left of Text</SelectItem>
                      <SelectItem value="right">Right of Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
