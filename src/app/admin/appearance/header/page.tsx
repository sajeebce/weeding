"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Eye,
  Menu,
  Smartphone,
  Monitor,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { HeaderConfig, HeaderLayout, CTAButton, ButtonHoverEffect, ButtonCustomStyle, GradientDirection } from "@/lib/header-footer/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const layoutOptions: { value: HeaderLayout; label: string; description: string }[] = [
  { value: "DEFAULT", label: "Default", description: "Logo left, Nav center, CTA right" },
  { value: "CENTERED", label: "Centered", description: "Logo center, Nav below" },
  { value: "SPLIT", label: "Split", description: "Logo center, Nav split" },
  { value: "MINIMAL", label: "Minimal", description: "Logo left, Hamburger right" },
  { value: "MEGA", label: "Mega", description: "Full mega menu style" },
];

// Gradient direction options (Phase 5)
const gradientDirectionOptions: { value: GradientDirection; label: string }[] = [
  { value: "to-r", label: "Left → Right" },
  { value: "to-l", label: "Right → Left" },
  { value: "to-t", label: "Bottom → Top" },
  { value: "to-b", label: "Top → Bottom" },
  { value: "to-tr", label: "↗ Diagonal (Top Right)" },
  { value: "to-tl", label: "↖ Diagonal (Top Left)" },
  { value: "to-br", label: "↘ Diagonal (Bottom Right)" },
  { value: "to-bl", label: "↙ Diagonal (Bottom Left)" },
];

// Button hover effects (Phase 5)
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
];

// 2025 Modern Button Style Presets
// Research: https://shapebootstrap.net/hover-effects-for-buttons-modern-techniques-in-web-design-2025/
// Research: https://www.lambdatest.com/blog/best-css-button-hover-effects/
interface ButtonStylePreset {
  id: string;
  name: string;
  description: string;
  style: ButtonCustomStyle;
}

const buttonStylePresets: ButtonStylePreset[] = [
  // 1. Ocean Gradient - Calm, trustworthy, professional
  {
    id: "ocean-gradient",
    name: "Ocean Gradient",
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
  // 2. Sunset Glow - Energetic, vibrant, attention-grabbing
  {
    id: "sunset-glow",
    name: "Sunset Glow",
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
  // 3. Neon Cyber - Futuristic, tech-forward, bold
  {
    id: "neon-cyber",
    name: "Neon Cyber",
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
  // 4. Emerald Success - Growth, positive action, eco-friendly
  {
    id: "emerald-success",
    name: "Emerald Success",
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
  // 5. Midnight Premium - Luxury, high-end, sophisticated
  {
    id: "midnight-premium",
    name: "Midnight Premium",
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
  // 6. Glass Morph - Modern, minimal, trendy 2025 (dark glass for visibility)
  {
    id: "glass-morph",
    name: "Glass Morph",
    description: "Frosted dark glass with subtle border",
    style: {
      bgColor: "rgba(30, 41, 59, 0.8)",
      textColor: "#f8fafc",
      borderWidth: 1,
      borderColor: "rgba(148, 163, 184, 0.3)",
      borderRadius: 12,
      hoverBgColor: "rgba(51, 65, 85, 0.9)",
      hoverEffect: "shadow-lift",
      shadow: "0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      hoverShadow: "0 8px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
    },
  },
  // 7. Coral Soft - Friendly, approachable, warm
  {
    id: "coral-soft",
    name: "Coral Soft",
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
  // 8. Arctic Shift - Cool, modern, dynamic
  {
    id: "arctic-shift",
    name: "Arctic Shift",
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
  // 9. Red Alert CTA - Urgency, action, conversion-focused
  {
    id: "red-alert",
    name: "Red Alert CTA",
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
  // 10. Outline Modern - Clean, minimal, versatile
  {
    id: "outline-modern",
    name: "Outline Modern",
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
];

// Convert gradient direction to CSS
function getGradientCSS(direction?: GradientDirection): string {
  switch (direction) {
    case "to-r": return "to right";
    case "to-l": return "to left";
    case "to-t": return "to top";
    case "to-b": return "to bottom";
    case "to-tr": return "to top right";
    case "to-tl": return "to top left";
    case "to-br": return "to bottom right";
    case "to-bl": return "to bottom left";
    default: return "to right";
  }
}

// Helper to check if button has custom styles
function hasCustomStyle(style?: ButtonCustomStyle): boolean {
  if (!style) return false;
  return !!(
    style.bgColor ||
    style.textColor ||
    style.borderColor ||
    style.borderWidth ||
    style.borderRadius ||
    style.hoverBgColor ||
    style.hoverTextColor ||
    style.hoverEffect
  );
}

// Get hover effect CSS class for preview (simple effects only)
function getPreviewHoverClass(effect?: ButtonHoverEffect): string {
  switch (effect) {
    case "darken":
      return "hover:brightness-90";
    case "lighten":
      return "hover:brightness-110";
    case "shadow-lift":
      return "hover:-translate-y-0.5 hover:shadow-lg";
    case "shadow-press":
      return "hover:translate-y-0.5 hover:shadow-sm";
    case "scale-up":
      return "hover:scale-105";
    case "scale-down":
      return "hover:scale-95";
    case "glow-pulse":
      return "hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]";
    // Complex effects handled via inline styles in component
    case "slide-fill":
    case "border-fill":
    case "gradient-shift":
    case "ripple":
      return "";
    default:
      return "";
  }
}

// Check if effect needs special rendering
function isComplexHoverEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "slide-fill" || effect === "border-fill" || effect === "gradient-shift" || effect === "ripple";
}

// Preview CTA Button component with custom style support
function PreviewCTAButton({ btn }: { btn: CTAButton }) {
  const [isHovered, setIsHovered] = useState(false);

  // Use btn.style !== undefined to detect custom mode (same as admin UI logic)
  if (btn.style !== undefined) {
    const hoverClass = getPreviewHoverClass(btn.style.hoverEffect);
    const hasComplexEffect = isComplexHoverEffect(btn.style.hoverEffect);

    // Determine background based on gradient settings
    const getNormalBackground = () => {
      if (btn.style?.useGradient) {
        return `linear-gradient(${getGradientCSS(btn.style.gradientDirection)}, ${btn.style.gradientFrom || "#2563eb"}, ${btn.style.gradientTo || "#7c3aed"})`;
      }
      return btn.style?.bgColor || "#2563eb";
    };

    const getHoverBackground = () => {
      if (btn.style?.hoverUseGradient) {
        return `linear-gradient(${getGradientCSS(btn.style.hoverGradientDirection)}, ${btn.style.hoverGradientFrom || "#1d4ed8"}, ${btn.style.hoverGradientTo || "#6d28d9"})`;
      }
      if (btn.style?.hoverBgColor) {
        return btn.style.hoverBgColor;
      }
      // Fallback to normal gradient or color
      return getNormalBackground();
    };

    // For gradient-shift effect, we need a larger gradient that shifts position
    const getGradientShiftBackground = (hovered: boolean) => {
      const fromColor = btn.style?.bgColor || "#2563eb";
      const toColor = btn.style?.hoverBgColor || "#7c3aed";
      // Create a gradient that's twice the width so we can shift it
      return `linear-gradient(90deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`;
    };

    // Get base styles for complex effects (non-hover state needs setup too)
    const getBaseStylesForEffect = (): React.CSSProperties => {
      if (!hasComplexEffect) return {};

      switch (btn.style?.hoverEffect) {
        case "slide-fill":
          // Slide fill: uses inset box-shadow that slides from left
          // Non-hover: shadow is positioned off-screen to the left
          return {
            boxShadow: isHovered
              ? `inset 200px 0 0 0 ${btn.style?.hoverBgColor || "#1d4ed8"}`
              : `inset 0 0 0 0 ${btn.style?.hoverBgColor || "#1d4ed8"}`,
          };
        case "border-fill":
          // Border fill: inset box-shadow grows to fill the button
          return {
            boxShadow: isHovered
              ? `inset 0 0 0 50px ${btn.style?.hoverBgColor || "#1d4ed8"}`
              : `inset 0 0 0 0 ${btn.style?.hoverBgColor || "#1d4ed8"}`,
          };
        case "gradient-shift":
          // Gradient shift: background-position animates across a larger gradient
          return {
            backgroundSize: "200% 100%",
            backgroundPosition: isHovered ? "100% 0" : "0% 0",
          };
        case "ripple":
          // Ripple: expanding ring from center outward
          return {
            boxShadow: isHovered
              ? `0 0 0 8px ${(btn.style?.bgColor || "#2563eb")}30, 0 0 20px ${(btn.style?.bgColor || "#2563eb")}20`
              : `0 0 0 0 ${(btn.style?.bgColor || "#2563eb")}30`,
          };
        default:
          return {};
      }
    };

    const effectStyles = getBaseStylesForEffect();

    // Determine final background based on effect type
    const getFinalBackground = () => {
      if (btn.style?.hoverEffect === "gradient-shift") {
        return getGradientShiftBackground(isHovered);
      }
      // For slide-fill and border-fill, keep the original background
      // The box-shadow creates the fill effect
      if (btn.style?.hoverEffect === "slide-fill" || btn.style?.hoverEffect === "border-fill") {
        return getNormalBackground();
      }
      return isHovered ? getHoverBackground() : getNormalBackground();
    };

    return (
      <span
        className={cn(
          "relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium cursor-pointer overflow-hidden",
          hoverClass,
          // Longer transition for complex effects to see the animation
          hasComplexEffect ? "transition-all duration-500 ease-out" : "transition-all duration-300"
        )}
        style={{
          background: getFinalBackground(),
          color: isHovered && btn.style.hoverTextColor ? btn.style.hoverTextColor : (btn.style.textColor || "#ffffff"),
          borderWidth: `${btn.style.borderWidth ?? 1}px`,
          borderStyle: "solid",
          borderColor: btn.style.borderColor || btn.style.bgColor || "#2563eb",
          borderRadius: `${btn.style.borderRadius ?? 6}px`,
          // Apply effect-specific styles (box-shadow, background-position, etc.)
          ...effectStyles,
          // Override with custom shadow only if no complex effect is active
          ...((!hasComplexEffect && btn.style.shadow) ? { boxShadow: isHovered && btn.style.hoverShadow ? btn.style.hoverShadow : btn.style.shadow } : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {btn.text}
      </span>
    );
  }

  // Preset variant button
  const variant = btn.variant === "outline"
    ? "outline"
    : btn.variant === "ghost"
    ? "ghost"
    : btn.variant === "secondary"
    ? "secondary"
    : "default";

  return (
    <Button size="sm" variant={variant}>
      {btn.text}
    </Button>
  );
}

// Logo position is now determined by layout choice, not a separate setting

export default function HeaderBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [header, setHeader] = useState<HeaderConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Form state
  const [formData, setFormData] = useState({
    name: "Default Header",
    layout: "DEFAULT" as HeaderLayout,
    sticky: true,
    transparent: false,
    topBarEnabled: false,
    logoMaxHeight: 40,
    showAuthButtons: true,
    loginText: "Sign In",
    registerText: "Get Started",
    registerUrl: "/services/llc-formation",
    searchEnabled: false,
    mobileBreakpoint: 1024,
    height: 64,
    bgColor: "",
    textColor: "",
    ctaButtons: [] as CTAButton[],
  });

  useEffect(() => {
    fetchHeader();
  }, []);

  async function fetchHeader() {
    try {
      const res = await fetch("/api/admin/header");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.headers && data.headers.length > 0) {
        const activeHeader = data.headers.find((h: HeaderConfig) => h.isActive) || data.headers[0];
        setHeader(activeHeader);
        setFormData({
          name: activeHeader.name,
          layout: activeHeader.layout,
          sticky: activeHeader.sticky,
          transparent: activeHeader.transparent,
          topBarEnabled: activeHeader.topBarEnabled,
          logoMaxHeight: activeHeader.logoMaxHeight,
          showAuthButtons: activeHeader.showAuthButtons,
          loginText: activeHeader.loginText,
          registerText: activeHeader.registerText,
          registerUrl: activeHeader.registerUrl,
          searchEnabled: activeHeader.searchEnabled,
          mobileBreakpoint: activeHeader.mobileBreakpoint,
          height: activeHeader.height,
          bgColor: activeHeader.bgColor || "",
          textColor: activeHeader.textColor || "",
          // Ensure all buttons have style property (migration from preset-only buttons)
          ctaButtons: (activeHeader.ctaButtons || []).map((btn: CTAButton) => ({
            ...btn,
            style: btn.style || {
              bgColor: "#2563eb",
              textColor: "#ffffff",
              borderRadius: 6,
              borderWidth: 1,
            },
          })),
        });
      }
    } catch (error) {
      toast.error("Failed to load header configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!header) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: header.id,
          ...formData,
          bgColor: formData.bgColor || null,
          textColor: formData.textColor || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Header configuration saved");
      fetchHeader();
    } catch (error) {
      toast.error("Failed to save header configuration");
    } finally {
      setSaving(false);
    }
  }

  function updateCTAButton(index: number, updates: Partial<CTAButton>) {
    const newButtons = [...formData.ctaButtons];
    newButtons[index] = { ...newButtons[index], ...updates };
    setFormData({ ...formData, ctaButtons: newButtons });
  }

  function addCTAButton() {
    setFormData({
      ...formData,
      ctaButtons: [
        ...formData.ctaButtons,
        {
          text: "New Button",
          url: "/",
          variant: "primary",
          style: {
            bgColor: "#2563eb",
            textColor: "#ffffff",
            borderRadius: 6,
            borderWidth: 1,
          }
        },
      ],
    });
  }

  function removeCTAButton(index: number) {
    const newButtons = formData.ctaButtons.filter((_, i) => i !== index);
    setFormData({ ...formData, ctaButtons: newButtons });
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Header Builder</h1>
          <p className="text-muted-foreground">
            Customize your website header layout and appearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/appearance/header/menu">
              <Menu className="mr-2 h-4 w-4" />
              Edit Menu
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Live Preview</CardTitle>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <Button
                variant={previewMode === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "mx-auto overflow-hidden rounded-lg border bg-background transition-all",
              previewMode === "mobile" ? "max-w-[375px]" : "w-full"
            )}
            style={{
              backgroundColor: formData.bgColor || undefined,
              color: formData.textColor || undefined,
            }}
          >
            {/* Layout-specific Preview */}
            {formData.layout === "DEFAULT" && (
              /* DEFAULT: Logo left, Nav center, CTA right */
              <div
                className="flex items-center justify-between px-4"
                style={{ height: `${formData.height}px` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                </div>
                {previewMode === "desktop" && (
                  <nav className="flex items-center gap-4 text-sm">
                    <span className="cursor-pointer hover:text-primary">Home</span>
                    <span className="cursor-pointer hover:text-primary">Services</span>
                    <span className="cursor-pointer hover:text-primary">Pricing</span>
                    <span className="cursor-pointer hover:text-primary">About</span>
                  </nav>
                )}
                <div className="flex items-center gap-2">
                  {formData.showAuthButtons && previewMode === "desktop" && (
                    <Button variant="ghost" size="sm">{formData.loginText}</Button>
                  )}
                  {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                    <PreviewCTAButton key={i} btn={btn} />
                  ))}
                  {formData.ctaButtons.length === 0 && (
                    <Button size="sm">Get Started</Button>
                  )}
                  {previewMode === "mobile" && <Menu className="h-5 w-5" />}
                </div>
              </div>
            )}

            {formData.layout === "CENTERED" && (
              /* CENTERED: Two rows - Logo centered top, Nav centered below */
              <div>
                <div
                  className="relative flex items-center justify-center px-4 border-b border-border/30"
                  style={{ height: `${Math.floor(formData.height * 0.6)}px` }}
                >
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                  {previewMode === "mobile" && (
                    <div className="absolute right-4">
                      <Menu className="h-5 w-5" />
                    </div>
                  )}
                </div>
                {previewMode === "desktop" && (
                  <div
                    className="flex items-center justify-center gap-6 px-4"
                    style={{ height: `${Math.floor(formData.height * 0.5)}px` }}
                  >
                    <nav className="flex items-center gap-6 text-sm">
                      <span className="cursor-pointer hover:text-primary">Home</span>
                      <span className="cursor-pointer hover:text-primary">Services</span>
                      <span className="cursor-pointer hover:text-primary">Pricing</span>
                      <span className="cursor-pointer hover:text-primary">About</span>
                    </nav>
                    <div className="flex items-center gap-2">
                      {formData.showAuthButtons && (
                        <Button variant="ghost" size="sm">{formData.loginText}</Button>
                      )}
                      {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                        <PreviewCTAButton key={i} btn={btn} />
                      ))}
                      {formData.ctaButtons.length === 0 && (
                        <Button size="sm">Get Started</Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.layout === "SPLIT" && (
              /* SPLIT: Nav left, Logo center, Nav + CTA right */
              <div
                className="relative flex items-center justify-between px-4"
                style={{ height: `${formData.height}px` }}
              >
                {previewMode === "desktop" && (
                  <nav className="flex items-center gap-4 text-sm">
                    <span className="cursor-pointer hover:text-primary">Home</span>
                    <span className="cursor-pointer hover:text-primary">Services</span>
                  </nav>
                )}
                {previewMode === "mobile" && <div />}
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {previewMode === "desktop" && (
                    <>
                      <nav className="flex items-center gap-4 text-sm">
                        <span className="cursor-pointer hover:text-primary">Pricing</span>
                        <span className="cursor-pointer hover:text-primary">About</span>
                      </nav>
                      <div className="flex items-center gap-2">
                        {formData.showAuthButtons && (
                          <Button variant="ghost" size="sm">{formData.loginText}</Button>
                        )}
                        {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                          <PreviewCTAButton key={i} btn={btn} />
                        ))}
                        {formData.ctaButtons.length === 0 && (
                          <Button size="sm">Get Started</Button>
                        )}
                      </div>
                    </>
                  )}
                  {previewMode === "mobile" && <Menu className="h-5 w-5" />}
                </div>
              </div>
            )}

            {formData.layout === "MINIMAL" && (
              /* MINIMAL: Logo left, Hamburger right (always) */
              <div
                className="flex items-center justify-between px-4"
                style={{ height: `${formData.height}px` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                </div>
                <Menu className="h-5 w-5 cursor-pointer" />
              </div>
            )}

            {formData.layout === "MEGA" && (
              /* MEGA: Two rows - Logo+CTA top, full-width nav bar below */
              <div>
                <div
                  className="flex items-center justify-between px-4 border-b border-border/30"
                  style={{ height: `${Math.floor(formData.height * 0.65)}px` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                      style={{ height: `${formData.logoMaxHeight}px` }}
                    >
                      LP
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.showAuthButtons && previewMode === "desktop" && (
                      <Button variant="ghost" size="sm">{formData.loginText}</Button>
                    )}
                    {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                      <PreviewCTAButton key={i} btn={btn} />
                    ))}
                    {formData.ctaButtons.length === 0 && previewMode === "desktop" && (
                      <Button size="sm">Get Started</Button>
                    )}
                    {previewMode === "mobile" && <Menu className="h-5 w-5" />}
                  </div>
                </div>
                {previewMode === "desktop" && (
                  <div
                    className="flex items-center px-4 bg-muted/30"
                    style={{ height: `${Math.floor(formData.height * 0.55)}px` }}
                  >
                    <nav className="flex items-center gap-1">
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Home</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Services ▾</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Pricing</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">About</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Contact</span>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="cta">CTA Buttons</TabsTrigger>
          <TabsTrigger value="auth">Auth Buttons</TabsTrigger>
          <TabsTrigger value="style">Styling</TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Layout</CardTitle>
              <CardDescription>Choose the overall layout structure for your header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Layout Options */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {layoutOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, layout: option.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:border-primary/50",
                      formData.layout === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                  >
                    <div className="flex h-12 w-full items-center justify-center rounded bg-muted">
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>

              <Separator />

              {/* Behavior Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Sticky Header</Label>
                    <p className="text-sm text-muted-foreground">
                      Header stays fixed when scrolling
                    </p>
                  </div>
                  <Switch
                    checked={formData.sticky}
                    onCheckedChange={(checked) => setFormData({ ...formData, sticky: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Transparent on Hero</Label>
                    <p className="text-sm text-muted-foreground">
                      Transparent background over hero section
                    </p>
                  </div>
                  <Switch
                    checked={formData.transparent}
                    onCheckedChange={(checked) => setFormData({ ...formData, transparent: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Enable Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Show search icon in header
                    </p>
                  </div>
                  <Switch
                    checked={formData.searchEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, searchEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Top Announcement Bar</Label>
                    <p className="text-sm text-muted-foreground">
                      Show promotional bar above header
                    </p>
                  </div>
                  <Switch
                    checked={formData.topBarEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, topBarEnabled: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* Size Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Header Height</Label>
                    <span className="text-sm text-muted-foreground">{formData.height}px</span>
                  </div>
                  <Slider
                    value={[formData.height]}
                    onValueChange={(value) => setFormData({ ...formData, height: value[0] })}
                    min={48}
                    max={100}
                    step={4}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Logo Max Height</Label>
                    <span className="text-sm text-muted-foreground">{formData.logoMaxHeight}px</span>
                  </div>
                  <Slider
                    value={[formData.logoMaxHeight]}
                    onValueChange={(value) => setFormData({ ...formData, logoMaxHeight: value[0] })}
                    min={24}
                    max={80}
                    step={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Logo image is configured in{" "}
                    <Link href="/admin/settings" className="text-primary hover:underline">
                      General Settings
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mobile Breakpoint</Label>
                    <span className="text-sm text-muted-foreground">{formData.mobileBreakpoint}px</span>
                  </div>
                  <Slider
                    value={[formData.mobileBreakpoint]}
                    onValueChange={(value) => setFormData({ ...formData, mobileBreakpoint: value[0] })}
                    min={768}
                    max={1280}
                    step={64}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Buttons Tab */}
        <TabsContent value="cta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Buttons</CardTitle>
              <CardDescription>Configure header CTA buttons with preset or custom styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ctaButtons.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                  <p className="mb-4 text-muted-foreground">No CTA buttons configured</p>
                  <Button onClick={addCTAButton}>Add CTA Button</Button>
                </div>
              ) : (
                <>
                  {formData.ctaButtons.map((btn, index) => (
                    <div key={index} className="rounded-lg border p-4 space-y-4">
                      {/* Basic Settings Row */}
                      <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={btn.text}
                            onChange={(e) => updateCTAButton(index, { text: e.target.value })}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={btn.url}
                            onChange={(e) => updateCTAButton(index, { url: e.target.value })}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeCTAButton(index)}
                        >
                          &times;
                        </Button>
                      </div>

                      {/* Custom Button Styling */}
                      <Accordion type="multiple" defaultValue={["colors"]} className="w-full">
                          {/* Colors Section */}
                          <AccordionItem value="colors">
                            <AccordionTrigger className="text-sm">
                              Colors
                              {(btn.style?.bgColor || btn.style?.textColor || btn.style?.useGradient) && (
                                <Badge variant="secondary" className="ml-2 text-xs">Customized</Badge>
                              )}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              {/* Gradient Toggle */}
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                  <Label className="text-sm">Use Gradient Background</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Enable gradient instead of solid color
                                  </p>
                                </div>
                                <Switch
                                  checked={btn.style?.useGradient || false}
                                  onCheckedChange={(checked) => updateCTAButton(index, {
                                    style: {
                                      ...btn.style,
                                      useGradient: checked,
                                      gradientFrom: checked ? (btn.style?.gradientFrom || "#2563eb") : btn.style?.gradientFrom,
                                      gradientTo: checked ? (btn.style?.gradientTo || "#7c3aed") : btn.style?.gradientTo,
                                      gradientDirection: checked ? (btn.style?.gradientDirection || "to-r") : btn.style?.gradientDirection,
                                    }
                                  })}
                                />
                              </div>

                              {/* Gradient Colors */}
                              {btn.style?.useGradient && (
                                <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                                  <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                      <Label className="text-xs">Gradient From</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={btn.style?.gradientFrom || "#2563eb"}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, gradientFrom: e.target.value }
                                          })}
                                          className="h-9 w-12 cursor-pointer p-1"
                                        />
                                        <Input
                                          value={btn.style?.gradientFrom || ""}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, gradientFrom: e.target.value }
                                          })}
                                          placeholder="#2563eb"
                                          className="flex-1 text-xs"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Gradient To</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={btn.style?.gradientTo || "#7c3aed"}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, gradientTo: e.target.value }
                                          })}
                                          className="h-9 w-12 cursor-pointer p-1"
                                        />
                                        <Input
                                          value={btn.style?.gradientTo || ""}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, gradientTo: e.target.value }
                                          })}
                                          placeholder="#7c3aed"
                                          className="flex-1 text-xs"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Direction</Label>
                                      <Select
                                        value={btn.style?.gradientDirection || "to-r"}
                                        onValueChange={(value: GradientDirection) => updateCTAButton(index, {
                                          style: { ...btn.style, gradientDirection: value }
                                        })}
                                      >
                                        <SelectTrigger className="text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {gradientDirectionOptions.map((dir) => (
                                            <SelectItem key={dir.value} value={dir.value}>
                                              {dir.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  {/* Gradient Preview */}
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Gradient Preview</Label>
                                    <div
                                      className="h-8 rounded-md border"
                                      style={{
                                        background: `linear-gradient(${getGradientCSS(btn.style?.gradientDirection)}, ${btn.style?.gradientFrom || "#2563eb"}, ${btn.style?.gradientTo || "#7c3aed"})`
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Solid Colors (shown when gradient is off) */}
                              {!btn.style?.useGradient && (
                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Background Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.bgColor || "#2563eb"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, bgColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.bgColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, bgColor: e.target.value }
                                        })}
                                        placeholder="#2563eb"
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Text Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.textColor || "#ffffff"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, textColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.textColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, textColor: e.target.value }
                                        })}
                                        placeholder="#ffffff"
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Border Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.borderColor || "#2563eb"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, borderColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.borderColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, borderColor: e.target.value }
                                        })}
                                        placeholder="#2563eb"
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Text Color (always visible) */}
                              {btn.style?.useGradient && (
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Text Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.textColor || "#ffffff"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, textColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.textColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, textColor: e.target.value }
                                        })}
                                        placeholder="#ffffff"
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Border Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.borderColor || "#2563eb"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, borderColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.borderColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, borderColor: e.target.value }
                                        })}
                                        placeholder="#2563eb"
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
                            <AccordionTrigger className="text-sm">
                              Border
                              {(btn.style?.borderWidth || btn.style?.borderRadius) && (
                                <Badge variant="secondary" className="ml-2 text-xs">Customized</Badge>
                              )}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Border Width</Label>
                                    <span className="text-xs text-muted-foreground">
                                      {btn.style?.borderWidth ?? 1}px
                                    </span>
                                  </div>
                                  <Slider
                                    value={[btn.style?.borderWidth ?? 1]}
                                    onValueChange={(value) => updateCTAButton(index, {
                                      style: { ...btn.style, borderWidth: value[0] }
                                    })}
                                    min={0}
                                    max={4}
                                    step={1}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs">Border Radius</Label>
                                    <span className="text-xs text-muted-foreground">
                                      {btn.style?.borderRadius ?? 6}px
                                    </span>
                                  </div>
                                  <Slider
                                    value={[btn.style?.borderRadius ?? 6]}
                                    onValueChange={(value) => updateCTAButton(index, {
                                      style: { ...btn.style, borderRadius: value[0] }
                                    })}
                                    min={0}
                                    max={24}
                                    step={2}
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {/* Hover Effects Section */}
                          <AccordionItem value="hover">
                            <AccordionTrigger className="text-sm">
                              Hover Effects
                              {(btn.style?.hoverEffect || btn.style?.hoverBgColor || btn.style?.hoverUseGradient) && (
                                <Badge variant="secondary" className="ml-2 text-xs">Customized</Badge>
                              )}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <Label className="text-xs">Hover Effect</Label>
                                <Select
                                  value={btn.style?.hoverEffect || "none"}
                                  onValueChange={(value: ButtonHoverEffect) => updateCTAButton(index, {
                                    style: { ...btn.style, hoverEffect: value }
                                  })}
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

                              {/* Hover Gradient Toggle */}
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                  <Label className="text-sm">Use Gradient on Hover</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Enable gradient background on hover
                                  </p>
                                </div>
                                <Switch
                                  checked={btn.style?.hoverUseGradient || false}
                                  onCheckedChange={(checked) => updateCTAButton(index, {
                                    style: {
                                      ...btn.style,
                                      hoverUseGradient: checked,
                                      hoverGradientFrom: checked ? (btn.style?.hoverGradientFrom || "#1d4ed8") : btn.style?.hoverGradientFrom,
                                      hoverGradientTo: checked ? (btn.style?.hoverGradientTo || "#6d28d9") : btn.style?.hoverGradientTo,
                                      hoverGradientDirection: checked ? (btn.style?.hoverGradientDirection || "to-r") : btn.style?.hoverGradientDirection,
                                    }
                                  })}
                                />
                              </div>

                              {/* Hover Gradient Colors */}
                              {btn.style?.hoverUseGradient && (
                                <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                                  <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                      <Label className="text-xs">Hover Gradient From</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={btn.style?.hoverGradientFrom || "#1d4ed8"}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, hoverGradientFrom: e.target.value }
                                          })}
                                          className="h-9 w-12 cursor-pointer p-1"
                                        />
                                        <Input
                                          value={btn.style?.hoverGradientFrom || ""}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, hoverGradientFrom: e.target.value }
                                          })}
                                          placeholder="#1d4ed8"
                                          className="flex-1 text-xs"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Hover Gradient To</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={btn.style?.hoverGradientTo || "#6d28d9"}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, hoverGradientTo: e.target.value }
                                          })}
                                          className="h-9 w-12 cursor-pointer p-1"
                                        />
                                        <Input
                                          value={btn.style?.hoverGradientTo || ""}
                                          onChange={(e) => updateCTAButton(index, {
                                            style: { ...btn.style, hoverGradientTo: e.target.value }
                                          })}
                                          placeholder="#6d28d9"
                                          className="flex-1 text-xs"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Hover Direction</Label>
                                      <Select
                                        value={btn.style?.hoverGradientDirection || "to-r"}
                                        onValueChange={(value: GradientDirection) => updateCTAButton(index, {
                                          style: { ...btn.style, hoverGradientDirection: value }
                                        })}
                                      >
                                        <SelectTrigger className="text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {gradientDirectionOptions.map((dir) => (
                                            <SelectItem key={dir.value} value={dir.value}>
                                              {dir.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  {/* Hover Gradient Preview */}
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Hover Gradient Preview</Label>
                                    <div
                                      className="h-8 rounded-md border"
                                      style={{
                                        background: `linear-gradient(${getGradientCSS(btn.style?.hoverGradientDirection)}, ${btn.style?.hoverGradientFrom || "#1d4ed8"}, ${btn.style?.hoverGradientTo || "#6d28d9"})`
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Solid Hover Colors (shown when hover gradient is off) */}
                              {!btn.style?.hoverUseGradient && (
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Hover Background</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.hoverBgColor || "#1d4ed8"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, hoverBgColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.hoverBgColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, hoverBgColor: e.target.value }
                                        })}
                                        placeholder="#1d4ed8"
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Hover Text Color</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={btn.style?.hoverTextColor || "#ffffff"}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, hoverTextColor: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={btn.style?.hoverTextColor || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, hoverTextColor: e.target.value }
                                        })}
                                        placeholder="#ffffff"
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Hover Text Color (when gradient is on) */}
                              {btn.style?.hoverUseGradient && (
                                <div className="w-1/2 space-y-2">
                                  <Label className="text-xs">Hover Text Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      value={btn.style?.hoverTextColor || "#ffffff"}
                                      onChange={(e) => updateCTAButton(index, {
                                        style: { ...btn.style, hoverTextColor: e.target.value }
                                      })}
                                      className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                      value={btn.style?.hoverTextColor || ""}
                                      onChange={(e) => updateCTAButton(index, {
                                        style: { ...btn.style, hoverTextColor: e.target.value }
                                      })}
                                      placeholder="#ffffff"
                                      className="flex-1 text-xs"
                                    />
                                  </div>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>

                          {/* Shadow Section */}
                          <AccordionItem value="shadow">
                            <AccordionTrigger className="text-sm">
                              Shadow
                              {(btn.style?.shadow || btn.style?.hoverShadow) && (
                                <Badge variant="secondary" className="ml-2 text-xs">Customized</Badge>
                              )}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-xs">Box Shadow</Label>
                                  <Input
                                    value={btn.style?.shadow || ""}
                                    onChange={(e) => updateCTAButton(index, {
                                      style: { ...btn.style, shadow: e.target.value }
                                    })}
                                    placeholder="0 1px 3px rgba(0,0,0,0.1)"
                                    className="text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Hover Shadow</Label>
                                  <Input
                                    value={btn.style?.hoverShadow || ""}
                                    onChange={(e) => updateCTAButton(index, {
                                      style: { ...btn.style, hoverShadow: e.target.value }
                                    })}
                                    placeholder="0 4px 12px rgba(0,0,0,0.15)"
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                      {/* Live Button Preview with Hover */}
                      <div className="pt-2 border-t">
                        <Label className="text-xs text-muted-foreground mb-2 block">Preview (hover to test effect)</Label>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-muted-foreground">Normal:</span>
                          <PreviewCTAButton btn={btn} />
                        </div>
                      </div>

                      {/* Style Presets - 2025 Modern Designs */}
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-medium mb-3 block">Quick Style Presets</Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Click to apply a modern 2025 button style. You can customize further after applying.
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {buttonStylePresets.map((preset) => {
                              // Generate preview background for preset
                              const previewBg = preset.style.useGradient
                                ? `linear-gradient(${getGradientCSS(preset.style.gradientDirection)}, ${preset.style.gradientFrom}, ${preset.style.gradientTo})`
                                : preset.style.bgColor || "#2563eb";

                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => updateCTAButton(index, {
                                    style: { ...preset.style }
                                  })}
                                  className="group relative flex flex-col items-center p-2 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all"
                                  title={preset.description}
                                >
                                  {/* Mini button preview */}
                                  <span
                                    className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] font-medium rounded transition-all mb-1.5"
                                    style={{
                                      background: previewBg,
                                      color: preset.style.textColor || "#ffffff",
                                      borderWidth: `${preset.style.borderWidth ?? 0}px`,
                                      borderStyle: "solid",
                                      borderColor: preset.style.borderColor || "transparent",
                                      borderRadius: `${preset.style.borderRadius ?? 6}px`,
                                      boxShadow: preset.style.shadow,
                                    }}
                                  >
                                    {btn.text || "Button"}
                                  </span>
                                  {/* Preset name */}
                                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground text-center leading-tight">
                                    {preset.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCTAButton}>
                    Add Another Button
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth Buttons Tab */}
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Buttons</CardTitle>
              <CardDescription>Configure sign in and register buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Show Auth Buttons</Label>
                  <p className="text-sm text-muted-foreground">
                    Display sign in/register buttons for logged out users
                  </p>
                </div>
                <Switch
                  checked={formData.showAuthButtons}
                  onCheckedChange={(checked) => setFormData({ ...formData, showAuthButtons: checked })}
                />
              </div>

              {formData.showAuthButtons && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="loginText">Sign In Button Text</Label>
                    <Input
                      id="loginText"
                      value={formData.loginText}
                      onChange={(e) => setFormData({ ...formData, loginText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerText">Register Button Text</Label>
                    <Input
                      id="registerText"
                      value={formData.registerText}
                      onChange={(e) => setFormData({ ...formData, registerText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerUrl">Register URL</Label>
                    <Input
                      id="registerUrl"
                      value={formData.registerUrl}
                      onChange={(e) => setFormData({ ...formData, registerUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Styling Tab */}
        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Styling</CardTitle>
              <CardDescription>Customize colors and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={formData.bgColor || "#ffffff"}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      placeholder="#ffffff or transparent"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor || "#1f2937"}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Leave colors empty to use the default theme colors. Custom colors will override the theme.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Items Info */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Navigation Menu</p>
              <p className="text-sm text-muted-foreground">
                {header?.menuItemsCount || 0} menu items configured
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/appearance/header/menu">
              Edit Menu Items
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
