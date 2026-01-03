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
  ChevronDown,
  ChevronRight,
  X,
  GripVertical,
  Plus,
  Megaphone,
  Pin,
  Layers,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { Button } from "@/components/ui/button";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { HeaderConfig, HeaderLayout, CTAButton, ButtonHoverEffect, ButtonCustomStyle, GradientDirection, TopBarContent, AnnouncementBarStyle, AnnouncementBarPreset, AnnouncementItem, AnimationEffect, AnimationMode } from "@/lib/header-footer/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  { value: "craft-expand", label: "Craft Expand (Icon Circle)" },
  { value: "heartbeat", label: "Heartbeat Pulse" },
  { value: "flow-border", label: "Flow Border (Rotating Gradient)" },
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
  // 6. Coral Soft - Friendly, approachable, warm
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
  // 11. Craft Button - Modern expanding icon effect (shadcnstudio)
  {
    id: "craft-expand",
    name: "Craft Button",
    description: "Modern pill button with expanding icon circle on hover",
    style: {
      bgColor: "#18181b",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 9999, // fully rounded (pill shape)
      hoverEffect: "craft-expand",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      hoverShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  // 12. Heartbeat Effect - Attention-grabbing pulsing animation
  {
    id: "heartbeat",
    name: "Heartbeat Effect",
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
  // 13. Flow Button - Rotating border gradient effect
  {
    id: "flow-border",
    name: "Flow Button",
    description: "Rotating border gradient with conic animation on hover",
    style: {
      bgColor: "#2563eb",
      textColor: "#ffffff",
      borderWidth: 2,
      borderColor: "#2563eb",
      borderRadius: 8,
      hoverEffect: "flow-border",
      shadow: "0 0 0 2px rgba(37, 99, 235, 0.3)",
    },
  },
];

// Announcement Bar Style Presets (adapted from button presets)
const announcementBarPresets: AnnouncementBarPreset[] = [
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Professional blue background",
    style: {
      bgColor: "#1e40af",
      textColor: "#ffffff",
      linkColor: "#fbbf24",
      linkHoverColor: "#fcd34d",
      linkStyle: "bold",
    },
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    description: "Vibrant orange to pink gradient",
    style: {
      useGradient: true,
      gradientFrom: "#FF6B35",
      gradientTo: "#F72585",
      gradientDirection: "to-r",
      textColor: "#ffffff",
      linkColor: "#ffffff",
      linkHoverColor: "#fef3c7",
      linkStyle: "underline",
    },
  },
  {
    id: "emerald-success",
    name: "Emerald Success",
    description: "Green for positive announcements",
    style: {
      bgColor: "#059669",
      textColor: "#ffffff",
      linkColor: "#fbbf24",
      linkHoverColor: "#fcd34d",
      linkStyle: "bold",
    },
  },
  {
    id: "red-alert",
    name: "Red Alert",
    description: "Urgent red for important notices",
    style: {
      bgColor: "#DC2626",
      textColor: "#ffffff",
      linkColor: "#fef08a",
      linkHoverColor: "#fef9c3",
      linkStyle: "bold",
    },
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    description: "Premium dark with gold accents",
    style: {
      bgColor: "#1a1a2e",
      textColor: "#FFD700",
      linkColor: "#FFD700",
      linkHoverColor: "#FFF8DC",
      linkStyle: "underline",
    },
  },
  {
    id: "coral-soft",
    name: "Coral Soft",
    description: "Friendly warm coral",
    style: {
      bgColor: "#FF6F61",
      textColor: "#ffffff",
      linkColor: "#ffffff",
      linkHoverColor: "#fef3c7",
      linkStyle: "bold",
    },
  },
  {
    id: "warning-yellow",
    name: "Warning Yellow",
    description: "Attention-grabbing yellow",
    style: {
      bgColor: "#FCD34D",
      textColor: "#1f2937",
      linkColor: "#1f2937",
      linkHoverColor: "#374151",
      linkStyle: "underline",
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
    case "heartbeat":
      return "animate-heartbeat";
    // Complex effects handled via inline styles in component or special components
    case "slide-fill":
    case "border-fill":
    case "gradient-shift":
    case "ripple":
    case "flow-border":
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
    // Check if this is a CraftButton style (craft-expand effect)
    if (btn.style.hoverEffect === "craft-expand") {
      // Get the icon for CraftButton
      const craftIcon = btn.style.icon && btn.style.icon !== "none" && btn.style.icon.trim() !== ""
        ? renderPreviewIcon(btn.style)
        : <ArrowUpRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />;

      return (
        <CraftButton
          bgColor={btn.style.bgColor || "#18181b"}
          textColor={btn.style.textColor || "#ffffff"}
          size="sm"
          style={{
            boxShadow: btn.style.shadow,
            borderRadius: `${btn.style.borderRadius ?? 9999}px`,
          }}
        >
          <CraftButtonLabel>{btn.text}</CraftButtonLabel>
          <CraftButtonIcon>
            {craftIcon}
          </CraftButtonIcon>
        </CraftButton>
      );
    }

    // Check if this is a FlowButton style (flow-border effect)
    if (btn.style.hoverEffect === "flow-border") {
      return (
        <PrimaryFlowButton
          className="text-sm"
          style={{
            // Override ring color to match button color
            '--tw-ring-color': `${btn.style.bgColor || '#2563eb'}99`,
          } as React.CSSProperties}
        >
          {btn.text}
        </PrimaryFlowButton>
      );
    }

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
          "relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer overflow-hidden",
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
        {btn.style?.iconPosition === "left" && renderPreviewIcon(btn.style)}
        {btn.text}
        {btn.style?.iconPosition !== "left" && renderPreviewIcon(btn.style)}
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
    <Button size="sm" variant={variant} className="gap-2">
      {btn.style?.iconPosition === "left" && renderPreviewIcon(btn.style)}
      {btn.text}
      {btn.style?.iconPosition !== "left" && renderPreviewIcon(btn.style)}
    </Button>
  );
}

// Helper function to render icon in preview
function renderPreviewIcon(style?: ButtonCustomStyle) {
  if (!style?.icon || style.icon === "none" || style.icon.trim() === "") return null;

  // Custom SVG
  if (style.icon === "custom") {
    if (!style.customIconSvg?.trim()) return null;
    return (
      <span
        className="inline-flex shrink-0 size-4"
        dangerouslySetInnerHTML={{ __html: style.customIconSvg }}
      />
    );
  }

  // Lucide icon - use DynamicIcon for dynamic loading by name
  // Only render if icon name looks valid (contains only letters, numbers, and hyphens)
  const iconName = style.icon.trim().toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(iconName)) return null;

  return (
    <DynamicIcon
      // @ts-expect-error - DynamicIcon accepts any valid lucide icon name
      name={iconName}
      className="size-4 shrink-0"
    />
  );
}

// Logo position is now determined by layout choice, not a separate setting

export default function HeaderBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [header, setHeader] = useState<HeaderConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [expandedButtons, setExpandedButtons] = useState<number[]>([]);
  const [deleteButtonIndex, setDeleteButtonIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // Auth button position: index where auth button appears (null = at end after all CTA buttons)
  const [authButtonPosition, setAuthButtonPosition] = useState<number | null>(null);

  // Default top bar content
  const defaultTopBarContent: TopBarContent = {
    text: "🎉 Welcome! Get 10% off your first order with code WELCOME10",
    links: [],
    announcements: [],
    style: {
      bgColor: "#1e40af",
      textColor: "#ffffff",
      linkColor: "#fbbf24",
      linkHoverColor: "#fcd34d",
      linkStyle: "bold",
    },
    dismissible: true,
    position: "fixed",
    // Unified Animation System
    animationMode: "once",
    animationEffect: "slide-down",
    animationInterval: 5,
  };

  // Generate unique ID
  function generateAnnouncementId(): string {
    return `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  // Form state
  const [formData, setFormData] = useState({
    name: "Default Header",
    layout: "DEFAULT" as HeaderLayout,
    sticky: true,
    transparent: false,
    topBarEnabled: false,
    topBarContent: defaultTopBarContent,
    logoMaxHeight: 56,
    showAuthButtons: true,
    loginText: "Sign In",
    loginUrl: "/login",
    loginStyle: {
      bgColor: "transparent",
      textColor: "#374151",
      borderWidth: 0,
      borderRadius: 6,
      hoverBgColor: "#f3f4f6",
    } as ButtonCustomStyle,
    registerText: "Get Started",
    registerUrl: "/services/llc-formation",
    registerStyle: {
      bgColor: "#2563eb",
      textColor: "#ffffff",
      borderWidth: 0,
      borderRadius: 6,
      hoverBgColor: "#1d4ed8",
    } as ButtonCustomStyle,
    searchEnabled: false,
    mobileBreakpoint: 1024,
    height: 80,
    bgColor: "",
    textColor: "",
    hoverColor: "",
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
          topBarContent: activeHeader.topBarContent || defaultTopBarContent,
          logoMaxHeight: activeHeader.logoMaxHeight,
          showAuthButtons: activeHeader.showAuthButtons,
          loginText: activeHeader.loginText,
          loginUrl: "/login", // Fixed URL - not editable
          loginStyle: activeHeader.loginStyle || {
            bgColor: "transparent",
            textColor: "#374151",
            borderWidth: 0,
            borderRadius: 6,
            hoverBgColor: "#f3f4f6",
          },
          registerText: activeHeader.registerText,
          registerUrl: activeHeader.registerUrl,
          registerStyle: activeHeader.registerStyle || {
            bgColor: "#2563eb",
            textColor: "#ffffff",
            borderWidth: 0,
            borderRadius: 6,
            hoverBgColor: "#1d4ed8",
          },
          searchEnabled: activeHeader.searchEnabled,
          mobileBreakpoint: activeHeader.mobileBreakpoint,
          height: activeHeader.height,
          bgColor: activeHeader.bgColor || "",
          textColor: activeHeader.textColor || "",
          hoverColor: activeHeader.hoverColor || "",
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
      const payload = {
        id: header.id,
        ...formData,
        bgColor: formData.bgColor || null,
        textColor: formData.textColor || null,
        hoverColor: formData.hoverColor || null,
      };
      console.log("Saving header with payload:", JSON.stringify(payload, null, 2));

      const res = await fetch("/api/admin/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("API Error Response:", res.status, data);
        const details = data.details ? `: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}` : '';
        throw new Error(data.error || `Failed to save (HTTP ${res.status})` + details);
      }

      toast.success("Header configuration saved");
      fetchHeader();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save header configuration";
      toast.error(message);
      console.error("Save error:", error);
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
    // Also remove from expanded list
    setExpandedButtons(expandedButtons.filter((i) => i !== index));
    setDeleteButtonIndex(null);
  }

  function handleDeleteClick(index: number) {
    setDeleteButtonIndex(index);
  }

  function toggleButtonExpanded(index: number) {
    setExpandedButtons((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  }

  // Drag and drop handlers for CTA button reordering
  // Note: index -1 represents the auth button
  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    // Handle auth button drag (-1 index)
    if (draggedIndex === -1) {
      // Auth button being dragged to a new position
      // dropIndex is the CTA button index where it should be placed
      setAuthButtonPosition(dropIndex);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (dropIndex === -1) {
      // Dropping a CTA button onto auth button position
      // Swap positions: auth button takes CTA button's old position
      const currentAuthPos = authButtonPosition ?? formData.ctaButtons.length;
      if (draggedIndex < currentAuthPos) {
        setAuthButtonPosition(draggedIndex);
      } else {
        setAuthButtonPosition(draggedIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Regular CTA button reordering
    const newButtons = [...formData.ctaButtons];
    const [draggedButton] = newButtons.splice(draggedIndex, 1);
    newButtons.splice(dropIndex, 0, draggedButton);

    setFormData({ ...formData, ctaButtons: newButtons });

    // Update auth button position if needed
    if (authButtonPosition !== null) {
      let newAuthPos = authButtonPosition;
      if (draggedIndex < authButtonPosition && dropIndex >= authButtonPosition) {
        newAuthPos = authButtonPosition - 1;
      } else if (draggedIndex > authButtonPosition && dropIndex <= authButtonPosition) {
        newAuthPos = authButtonPosition + 1;
      } else if (draggedIndex === authButtonPosition) {
        // This shouldn't happen as auth is -1
      }
      setAuthButtonPosition(newAuthPos);
    }

    // Update expanded buttons indices after reorder
    setExpandedButtons((prev) => {
      return prev.map((i) => {
        if (i < 0) return i; // Keep auth button expansion state
        if (i === draggedIndex) return dropIndex;
        if (draggedIndex < dropIndex) {
          if (i > draggedIndex && i <= dropIndex) return i - 1;
        } else {
          if (i >= dropIndex && i < draggedIndex) return i + 1;
        }
        return i;
      });
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
          <TabsTrigger value="cta">Buttons</TabsTrigger>
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

              {/* Behavior Settings - Vertical Collapsible Cards */}
              <div className="space-y-3">
                {/* 1. Sticky Header */}
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Pin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-base">Sticky Header</Label>
                        <p className="text-sm text-muted-foreground">
                          Header stays fixed when scrolling
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.sticky}
                      onCheckedChange={(checked) => setFormData({ ...formData, sticky: checked })}
                    />
                  </div>
                </div>

                {/* 2. Transparent on Hero */}
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-base">Transparent on Hero</Label>
                        <p className="text-sm text-muted-foreground">
                          Transparent background over hero section
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.transparent}
                      onCheckedChange={(checked) => setFormData({ ...formData, transparent: checked })}
                    />
                  </div>
                </div>

                {/* 3. Enable Search */}
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Search className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-base">Enable Search</Label>
                        <p className="text-sm text-muted-foreground">
                          Show search icon in header
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.searchEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, searchEnabled: checked })}
                    />
                  </div>
                </div>

                {/* 4. Top Announcement Bar - Collapsible */}
                <div className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label className="text-base">Top Announcement Bar</Label>
                        <p className="text-sm text-muted-foreground">
                          Show promotional bar above header
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.topBarEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, topBarEnabled: checked })}
                    />
                  </div>

                  {/* Expanded Settings when enabled */}
                  {formData.topBarEnabled && (
                    <div className="border-t px-4 pb-4 pt-4 space-y-4">
                      {/* Announcements Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Announcements</Label>
                            <p className="text-xs text-muted-foreground">Add multiple announcements to rotate automatically</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newAnnouncement: AnnouncementItem = {
                                id: generateAnnouncementId(),
                                text: "",
                                links: [],
                                isActive: true,
                              };
                              // If no announcements yet, migrate the legacy text
                              const currentAnnouncements = formData.topBarContent.announcements || [];
                              if (currentAnnouncements.length === 0 && formData.topBarContent.text) {
                                // First, add existing text as first announcement
                                const legacyAnnouncement: AnnouncementItem = {
                                  id: generateAnnouncementId(),
                                  text: formData.topBarContent.text,
                                  links: formData.topBarContent.links || [],
                                  isActive: true,
                                };
                                setFormData({
                                  ...formData,
                                  topBarContent: {
                                    ...formData.topBarContent,
                                    announcements: [legacyAnnouncement, newAnnouncement],
                                  }
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  topBarContent: {
                                    ...formData.topBarContent,
                                    announcements: [...currentAnnouncements, newAnnouncement],
                                  }
                                });
                              }
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Announcement
                          </Button>
                        </div>

                        {/* Show single text field if no multiple announcements */}
                        {(!formData.topBarContent.announcements || formData.topBarContent.announcements.length === 0) && (
                          <div className="space-y-2">
                            <Label className="text-xs">Announcement Text</Label>
                            <Input
                              value={formData.topBarContent.text}
                              onChange={(e) => setFormData({
                                ...formData,
                                topBarContent: { ...formData.topBarContent, text: e.target.value }
                              })}
                              placeholder="🎉 Welcome! Get 10% off your first order..."
                            />
                            {/* Single announcement links */}
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">Links (optional)</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => setFormData({
                                    ...formData,
                                    topBarContent: {
                                      ...formData.topBarContent,
                                      links: [...(formData.topBarContent.links || []), { label: "Learn More", url: "/", target: "_self" }]
                                    }
                                  })}
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add Link
                                </Button>
                              </div>
                              {formData.topBarContent.links && formData.topBarContent.links.length > 0 && (
                                <div className="space-y-2">
                                  {formData.topBarContent.links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <Input
                                        value={link.label}
                                        onChange={(e) => {
                                          const newLinks = [...(formData.topBarContent.links || [])];
                                          newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                          setFormData({
                                            ...formData,
                                            topBarContent: { ...formData.topBarContent, links: newLinks }
                                          });
                                        }}
                                        placeholder="Label"
                                        className="flex-1 h-8 text-sm"
                                      />
                                      <Input
                                        value={link.url}
                                        onChange={(e) => {
                                          const newLinks = [...(formData.topBarContent.links || [])];
                                          newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                          setFormData({
                                            ...formData,
                                            topBarContent: { ...formData.topBarContent, links: newLinks }
                                          });
                                        }}
                                        placeholder="URL"
                                        className="flex-1 h-8 text-sm"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          const newLinks = (formData.topBarContent.links || []).filter((_, i) => i !== idx);
                                          setFormData({
                                            ...formData,
                                            topBarContent: { ...formData.topBarContent, links: newLinks }
                                          });
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Multiple Announcements List */}
                        {formData.topBarContent.announcements && formData.topBarContent.announcements.length > 0 && (
                          <div className="space-y-3">
                            {formData.topBarContent.announcements.map((announcement, annIdx) => (
                              <div key={announcement.id} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {annIdx + 1}
                                      </Badge>
                                      <Switch
                                        checked={announcement.isActive !== false}
                                        onCheckedChange={(checked) => {
                                          const newAnnouncements = [...(formData.topBarContent.announcements || [])];
                                          newAnnouncements[annIdx] = { ...newAnnouncements[annIdx], isActive: checked };
                                          setFormData({
                                            ...formData,
                                            topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                          });
                                        }}
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {announcement.isActive !== false ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                    <Input
                                      value={announcement.text}
                                      onChange={(e) => {
                                        const newAnnouncements = [...(formData.topBarContent.announcements || [])];
                                        newAnnouncements[annIdx] = { ...newAnnouncements[annIdx], text: e.target.value };
                                        setFormData({
                                          ...formData,
                                          topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                        });
                                      }}
                                      placeholder="Enter announcement text..."
                                      className="text-sm"
                                    />
                                    {/* Announcement Links */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Links</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs px-2"
                                          onClick={() => {
                                            const newAnnouncements = [...(formData.topBarContent.announcements || [])];
                                            newAnnouncements[annIdx] = {
                                              ...newAnnouncements[annIdx],
                                              links: [...(newAnnouncements[annIdx].links || []), { label: "Learn More", url: "/", target: "_self" }]
                                            };
                                            setFormData({
                                              ...formData,
                                              topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                            });
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-1" /> Link
                                        </Button>
                                      </div>
                                      {announcement.links && announcement.links.length > 0 && (
                                        <div className="space-y-1">
                                          {announcement.links.map((link, linkIdx) => (
                                            <div key={linkIdx} className="flex gap-1 items-center">
                                              <Input
                                                value={link.label}
                                                onChange={(e) => {
                                                  const newAnnouncements = [...(formData.topBarContent.announcements || [])];
                                                  const newLinks = [...(newAnnouncements[annIdx].links || [])];
                                                  newLinks[linkIdx] = { ...newLinks[linkIdx], label: e.target.value };
                                                  newAnnouncements[annIdx] = { ...newAnnouncements[annIdx], links: newLinks };
                                                  setFormData({
                                                    ...formData,
                                                    topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                                  });
                                                }}
                                                placeholder="Label"
                                                className="flex-1 h-7 text-xs"
                                              />
                                              <Input
                                                value={link.url}
                                                onChange={(e) => {
                                                  const newAnnouncements = [...(formData.topBarContent.announcements || [])];
                                                  const newLinks = [...(newAnnouncements[annIdx].links || [])];
                                                  newLinks[linkIdx] = { ...newLinks[linkIdx], url: e.target.value };
                                                  newAnnouncements[annIdx] = { ...newAnnouncements[annIdx], links: newLinks };
                                                  setFormData({
                                                    ...formData,
                                                    topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                                  });
                                                }}
                                                placeholder="URL"
                                                className="flex-1 h-7 text-xs"
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => {
                                                  const newAnnouncements = [...(formData.topBarContent.announcements || [])];
                                                  const newLinks = (newAnnouncements[annIdx].links || []).filter((_, i) => i !== linkIdx);
                                                  newAnnouncements[annIdx] = { ...newAnnouncements[annIdx], links: newLinks };
                                                  setFormData({
                                                    ...formData,
                                                    topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                                  });
                                                }}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      const newAnnouncements = (formData.topBarContent.announcements || []).filter((_, i) => i !== annIdx);
                                      setFormData({
                                        ...formData,
                                        topBarContent: { ...formData.topBarContent, announcements: newAnnouncements }
                                      });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Unified Animation Settings */}
                      <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                        <div>
                          <Label className="text-sm font-medium">Animation</Label>
                          <p className="text-xs text-muted-foreground">
                            How the announcement bar appears and rotates
                          </p>
                        </div>

                        {/* Animation Mode */}
                        <div className="space-y-1">
                          <Label className="text-xs">Mode</Label>
                          <Select
                            value={formData.topBarContent.animationMode || "once"}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              topBarContent: { ...formData.topBarContent, animationMode: value as AnimationMode }
                            })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <div className="flex flex-col">
                                  <span>None</span>
                                  <span className="text-xs text-muted-foreground">Show instantly, no animation</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="once">
                                <div className="flex flex-col">
                                  <span>Once (on load)</span>
                                  <span className="text-xs text-muted-foreground">Animate once when page loads</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="loop">
                                <div className="flex flex-col">
                                  <span>Loop</span>
                                  <span className="text-xs text-muted-foreground">Continuously rotate/re-animate</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Animation Effect - show only when mode is not "none" */}
                        {formData.topBarContent.animationMode !== "none" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Effect</Label>
                              <Select
                                value={formData.topBarContent.animationEffect || "slide-down"}
                                onValueChange={(value) => setFormData({
                                  ...formData,
                                  topBarContent: { ...formData.topBarContent, animationEffect: value as AnimationEffect }
                                })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fade">Fade</SelectItem>
                                  <SelectItem value="slide-down">Slide Down</SelectItem>
                                  <SelectItem value="slide-up">Slide Up</SelectItem>
                                  <SelectItem value="pulse">Pulse</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Interval - show only when mode is "loop" */}
                            {formData.topBarContent.animationMode === "loop" && (
                              <div className="space-y-1">
                                <Label className="text-xs">Interval (seconds)</Label>
                                <Input
                                  type="number"
                                  min={2}
                                  max={60}
                                  value={formData.topBarContent.animationInterval ?? 5}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    topBarContent: { ...formData.topBarContent, animationInterval: parseInt(e.target.value) || 5 }
                                  })}
                                  className="h-8"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Mode description */}
                        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          {formData.topBarContent.animationMode === "none" && "Bar appears instantly without any animation."}
                          {formData.topBarContent.animationMode === "once" && (
                            (formData.topBarContent.announcements?.length || 0) > 1
                              ? "Bar animates once on load. Multiple announcements will cycle through once then stop."
                              : "Bar animates once when the page loads."
                          )}
                          {formData.topBarContent.animationMode === "loop" && (
                            (formData.topBarContent.announcements?.length || 0) > 1
                              ? `Announcements rotate every ${formData.topBarContent.animationInterval || 5} seconds continuously.`
                              : `Announcement re-animates every ${formData.topBarContent.animationInterval || 5} seconds.`
                          )}
                        </p>
                      </div>

                      {/* Style Presets */}
                      <div className="space-y-2">
                        <Label>Quick Style Presets</Label>
                        <p className="text-xs text-muted-foreground">Click to apply. Customize further below.</p>
                        <div className="grid grid-cols-4 gap-2">
                          {announcementBarPresets.map((preset) => {
                            const previewBg = preset.style.useGradient
                              ? `linear-gradient(${getGradientCSS(preset.style.gradientDirection)}, ${preset.style.gradientFrom}, ${preset.style.gradientTo})`
                              : preset.style.bgColor || "#1e40af";
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  topBarContent: {
                                    ...formData.topBarContent,
                                    style: { ...preset.style }
                                  }
                                })}
                                className="group relative flex flex-col items-center p-2 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all"
                                title={preset.description}
                              >
                                <span
                                  className="w-full h-6 rounded text-[10px] flex items-center justify-center font-medium"
                                  style={{
                                    background: previewBg,
                                    color: preset.style.textColor || "#ffffff",
                                  }}
                                >
                                  Sample
                                </span>
                                <span className="text-[10px] text-muted-foreground group-hover:text-foreground mt-1">
                                  {preset.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Styling */}
                      <Accordion type="multiple" className="w-full">
                        <AccordionItem value="colors">
                          <AccordionTrigger className="text-sm">
                            Colors
                            {(formData.topBarContent.style?.bgColor || formData.topBarContent.style?.useGradient) && (
                              <Badge variant="secondary" className="ml-2 text-xs">Customized</Badge>
                            )}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            {/* Gradient Toggle */}
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-xs">Use Gradient Background</Label>
                                <p className="text-xs text-muted-foreground">Enable gradient instead of solid color</p>
                              </div>
                              <Switch
                                checked={formData.topBarContent.style?.useGradient || false}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData,
                                  topBarContent: {
                                    ...formData.topBarContent,
                                    style: {
                                      ...formData.topBarContent.style,
                                      useGradient: checked,
                                      gradientFrom: checked ? (formData.topBarContent.style?.gradientFrom || "#FF6B35") : formData.topBarContent.style?.gradientFrom,
                                      gradientTo: checked ? (formData.topBarContent.style?.gradientTo || "#F72585") : formData.topBarContent.style?.gradientTo,
                                    }
                                  }
                                })}
                              />
                            </div>

                            {formData.topBarContent.style?.useGradient ? (
                              <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Gradient From</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={formData.topBarContent.style?.gradientFrom || "#FF6B35"}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          topBarContent: {
                                            ...formData.topBarContent,
                                            style: { ...formData.topBarContent.style, gradientFrom: e.target.value }
                                          }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={formData.topBarContent.style?.gradientFrom || ""}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          topBarContent: {
                                            ...formData.topBarContent,
                                            style: { ...formData.topBarContent.style, gradientFrom: e.target.value }
                                          }
                                        })}
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Gradient To</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={formData.topBarContent.style?.gradientTo || "#F72585"}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          topBarContent: {
                                            ...formData.topBarContent,
                                            style: { ...formData.topBarContent.style, gradientTo: e.target.value }
                                          }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={formData.topBarContent.style?.gradientTo || ""}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          topBarContent: {
                                            ...formData.topBarContent,
                                            style: { ...formData.topBarContent.style, gradientTo: e.target.value }
                                          }
                                        })}
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Direction</Label>
                                    <Select
                                      value={formData.topBarContent.style?.gradientDirection || "to-r"}
                                      onValueChange={(value: GradientDirection) => setFormData({
                                        ...formData,
                                        topBarContent: {
                                          ...formData.topBarContent,
                                          style: { ...formData.topBarContent.style, gradientDirection: value }
                                        }
                                      })}
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {gradientDirectionOptions.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label className="text-xs">Background Color</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={formData.topBarContent.style?.bgColor || "#1e40af"}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      topBarContent: {
                                        ...formData.topBarContent,
                                        style: { ...formData.topBarContent.style, bgColor: e.target.value }
                                      }
                                    })}
                                    className="h-9 w-12 cursor-pointer p-1"
                                  />
                                  <Input
                                    value={formData.topBarContent.style?.bgColor || ""}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      topBarContent: {
                                        ...formData.topBarContent,
                                        style: { ...formData.topBarContent.style, bgColor: e.target.value }
                                      }
                                    })}
                                    placeholder="#1e40af"
                                    className="flex-1 text-xs"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-xs">Text Color</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={formData.topBarContent.style?.textColor || "#ffffff"}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      topBarContent: {
                                        ...formData.topBarContent,
                                        style: { ...formData.topBarContent.style, textColor: e.target.value }
                                      }
                                    })}
                                    className="h-9 w-12 cursor-pointer p-1"
                                  />
                                  <Input
                                    value={formData.topBarContent.style?.textColor || ""}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      topBarContent: {
                                        ...formData.topBarContent,
                                        style: { ...formData.topBarContent.style, textColor: e.target.value }
                                      }
                                    })}
                                    placeholder="#ffffff"
                                    className="flex-1 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Link Color</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={formData.topBarContent.style?.linkColor || "#fbbf24"}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      topBarContent: {
                                        ...formData.topBarContent,
                                        style: { ...formData.topBarContent.style, linkColor: e.target.value }
                                      }
                                    })}
                                    className="h-9 w-12 cursor-pointer p-1"
                                  />
                                  <Input
                                    value={formData.topBarContent.style?.linkColor || ""}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      topBarContent: {
                                        ...formData.topBarContent,
                                        style: { ...formData.topBarContent.style, linkColor: e.target.value }
                                      }
                                    })}
                                    placeholder="#fbbf24"
                                    className="flex-1 text-xs"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Link Style</Label>
                              <Select
                                value={formData.topBarContent.style?.linkStyle || "bold"}
                                onValueChange={(value: "underline" | "bold" | "button") => setFormData({
                                  ...formData,
                                  topBarContent: {
                                    ...formData.topBarContent,
                                    style: { ...formData.topBarContent.style, linkStyle: value }
                                  }
                                })}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="underline">Underlined</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="button">Button Style</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="behavior">
                          <AccordionTrigger className="text-sm">Behavior</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-xs">Allow Dismiss</Label>
                                <p className="text-xs text-muted-foreground">Show close button</p>
                              </div>
                              <Switch
                                checked={formData.topBarContent.dismissible !== false}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData,
                                  topBarContent: { ...formData.topBarContent, dismissible: checked }
                                })}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Preview */}
                      <div className="space-y-2 pt-2">
                        <Label className="text-xs text-muted-foreground">Preview</Label>
                        <div
                          className="rounded-lg overflow-hidden text-sm py-2 px-4 flex items-center justify-center gap-4 relative"
                          style={{
                            background: formData.topBarContent.style?.useGradient
                              ? `linear-gradient(${getGradientCSS(formData.topBarContent.style?.gradientDirection)}, ${formData.topBarContent.style?.gradientFrom || "#FF6B35"}, ${formData.topBarContent.style?.gradientTo || "#F72585"})`
                              : formData.topBarContent.style?.bgColor || "#1e40af",
                            color: formData.topBarContent.style?.textColor || "#ffffff",
                          }}
                        >
                          {/* Show first announcement or legacy text */}
                          <span>
                            {formData.topBarContent.announcements && formData.topBarContent.announcements.length > 0
                              ? formData.topBarContent.announcements[0]?.text || "Your announcement here..."
                              : formData.topBarContent.text || "Your announcement here..."
                            }
                          </span>
                          {/* Show links from first announcement or legacy */}
                          {(() => {
                            const links = formData.topBarContent.announcements && formData.topBarContent.announcements.length > 0
                              ? formData.topBarContent.announcements[0]?.links
                              : formData.topBarContent.links;
                            return links && links.length > 0 && (
                              <span
                                style={{
                                  color: formData.topBarContent.style?.linkColor || "#fbbf24",
                                  fontWeight: formData.topBarContent.style?.linkStyle === "bold" ? "bold" : "normal",
                                  textDecoration: formData.topBarContent.style?.linkStyle === "underline" ? "underline" : "none",
                                }}
                              >
                                {links[0].label}
                              </span>
                            );
                          })()}
                          {formData.topBarContent.dismissible !== false && (
                            <X className="h-4 w-4 opacity-70" />
                          )}
                          {/* Show dots indicator for multiple announcements */}
                          {formData.topBarContent.announcements && formData.topBarContent.announcements.length > 1 && (
                            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
                              {formData.topBarContent.announcements.map((_, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "w-1 h-1 rounded-full",
                                    idx === 0 ? "bg-white" : "bg-white/40"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {formData.topBarContent.announcements && formData.topBarContent.announcements.length > 1 && formData.topBarContent.animationMode === "loop" && (
                          <p className="text-xs text-muted-foreground text-center">
                            {formData.topBarContent.announcements.filter(a => a.isActive !== false).length} announcements will rotate every {formData.topBarContent.animationInterval || 5}s
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
            <CardContent className="space-y-2">
              {formData.ctaButtons.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                  <p className="text-muted-foreground">No CTA buttons configured</p>
                </div>
              ) : (
                <>
                  {formData.ctaButtons.map((btn, index) => {
                    const isExpanded = expandedButtons.includes(index);
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;
                    return (
                    <div
                      key={index}
                      className={cn(
                        "rounded-lg border bg-card transition-all",
                        isDragging && "opacity-50 scale-[0.98]",
                        isDragOver && "border-primary border-2 bg-primary/5"
                      )}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={(e) => handleDragLeave(e)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Collapsible Header - Always Visible */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleButtonExpanded(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{btn.text || "Untitled Button"}</span>
                          <span className="text-sm text-muted-foreground">→ {btn.url || "/"}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={btn.enabled !== false}
                            onCheckedChange={(checked) => {
                              updateCTAButton(index, { enabled: checked });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(index);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t p-4 space-y-4">
                          {/* Basic Settings Row */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Button Text</Label>
                              <Input
                                value={btn.text}
                                onChange={(e) => updateCTAButton(index, { text: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL</Label>
                              <Input
                                value={btn.url}
                                onChange={(e) => updateCTAButton(index, { url: e.target.value })}
                              />
                            </div>
                          </div>

                      {/* Custom Button Styling */}
                      <Accordion type="multiple" defaultValue={["colors"]} className="w-full">
                          {/* Colors Section */}
                          <AccordionItem value="colors">
                            <AccordionTrigger className="text-sm">
                              Colors
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
                        </Accordion>

                        {/* Border, Hover, Shadow, Icon - 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {/* Border Section */}
                          <Accordion type="multiple" className="w-full">
                          <AccordionItem value="border" className="border rounded-lg px-3">
                            <AccordionTrigger className="text-sm py-2">
                              Border
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pb-3">
                              <div className="space-y-3">
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
                          </Accordion>

                          {/* Hover Effects Section */}
                          <Accordion type="multiple" className="w-full">
                          <AccordionItem value="hover" className="border rounded-lg px-3">
                            <AccordionTrigger className="text-sm py-2">
                              Hover Effects
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pb-3">
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
                          </Accordion>

                          {/* Shadow Section */}
                          <Accordion type="multiple" className="w-full">
                          <AccordionItem value="shadow" className="border rounded-lg px-3">
                            <AccordionTrigger className="text-sm py-2">
                              Shadow
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pb-3">
                              <div className="space-y-3">
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

                          {/* Icon Section */}
                          <Accordion type="multiple" className="w-full">
                          <AccordionItem value="icon" className="border rounded-lg px-3">
                            <AccordionTrigger className="text-sm py-2">
                              Icon
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3 pb-3">
                              {/* Use Custom SVG Toggle */}
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                  <Label className="text-sm">Use Custom SVG</Label>
                                  <p className="text-xs text-muted-foreground">
                                    Paste your own SVG code instead of Lucide icon
                                  </p>
                                </div>
                                <Switch
                                  checked={btn.style?.icon === "custom"}
                                  onCheckedChange={(checked) => updateCTAButton(index, {
                                    style: {
                                      ...btn.style,
                                      icon: checked ? "custom" : undefined,
                                      customIconSvg: checked ? btn.style?.customIconSvg : undefined
                                    }
                                  })}
                                />
                              </div>

                              {/* Lucide Icon Name Input + Position (side by side) */}
                              {btn.style?.icon !== "custom" && (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs">Lucide Icon Name</Label>
                                      <Input
                                        value={btn.style?.icon || ""}
                                        onChange={(e) => updateCTAButton(index, {
                                          style: { ...btn.style, icon: e.target.value || undefined }
                                        })}
                                        placeholder="arrow-right, rocket..."
                                        className="text-xs"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs">Icon Position</Label>
                                      <Select
                                        value={btn.style?.iconPosition || "right"}
                                        onValueChange={(value: "left" | "right") => updateCTAButton(index, {
                                          style: { ...btn.style, iconPosition: value }
                                        })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="left">Left of Text</SelectItem>
                                          <SelectItem value="right">Right of Text</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Browse icons at{" "}
                                    <a
                                      href="https://lucide.dev/icons"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary underline"
                                    >
                                      lucide.dev/icons
                                    </a>
                                    {" "}and copy the icon name
                                  </p>
                                </div>
                              )}

                              {/* Custom SVG Input + Position (side by side for position) */}
                              {btn.style?.icon === "custom" && (
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Custom SVG Code</Label>
                                    <textarea
                                      value={btn.style?.customIconSvg || ""}
                                      onChange={(e) => updateCTAButton(index, {
                                        style: { ...btn.style, customIconSvg: e.target.value }
                                      })}
                                      placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="..."/></svg>'
                                      className="w-full h-24 p-2 text-xs font-mono border rounded-md resize-none bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Paste SVG code from any icon source
                                    </p>
                                  </div>
                                  <div className="w-1/2 space-y-2">
                                    <Label className="text-xs">Icon Position</Label>
                                    <Select
                                      value={btn.style?.iconPosition || "right"}
                                      onValueChange={(value: "left" | "right") => updateCTAButton(index, {
                                        style: { ...btn.style, iconPosition: value }
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left">Left of Text</SelectItem>
                                        <SelectItem value="right">Right of Text</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                          </Accordion>
                        </div>

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
                      )}
                    </div>
                  );
                  })}
                </>
              )}

              {/* Auth Buttons - Sign In (non-deletable, draggable) */}
              {formData.showAuthButtons && (
                <div
                  className={cn(
                    "rounded-lg border bg-card transition-all",
                    draggedIndex === -1 && "opacity-50 scale-[0.98]",
                    dragOverIndex === -1 && "border-primary border-2 bg-primary/5"
                  )}
                  draggable
                  onDragStart={(e) => handleDragStart(e, -1)}
                  onDragOver={(e) => handleDragOver(e, -1)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  onDrop={(e) => handleDrop(e, -1)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedButtons(prev =>
                      prev.includes(-1) ? prev.filter(i => i !== -1) : [...prev, -1]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-muted rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{formData.loginText || "Sign In"}</span>
                      <span className="text-sm text-muted-foreground">→ /login</span>
                      <Badge variant="secondary" className="text-xs">Auth</Badge>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedButtons.includes(-1) && "rotate-180"
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.showAuthButtons}
                        onCheckedChange={(checked) => {
                          setFormData({ ...formData, showAuthButtons: checked });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {expandedButtons.includes(-1) && (
                    <div className="border-t p-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={formData.loginText}
                            onChange={(e) => setFormData({ ...formData, loginText: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>URL</Label>
                          <Input
                            value={formData.loginUrl}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Login URL is fixed and cannot be changed
                          </p>
                        </div>
                      </div>

                      <Accordion type="multiple" defaultValue={["colors"]} className="w-full">
                        {/* Colors Section */}
                        <AccordionItem value="colors">
                          <AccordionTrigger className="text-sm">
                            Colors
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            {/* Gradient Toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                              <div>
                                <Label className="text-sm">Use Gradient Background</Label>
                                <p className="text-xs text-muted-foreground">Enable gradient instead of solid color</p>
                              </div>
                              <Switch
                                checked={formData.loginStyle?.useGradient || false}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData,
                                  loginStyle: {
                                    ...formData.loginStyle,
                                    useGradient: checked,
                                    gradientFrom: checked ? (formData.loginStyle?.gradientFrom || "#2563eb") : formData.loginStyle?.gradientFrom,
                                    gradientTo: checked ? (formData.loginStyle?.gradientTo || "#7c3aed") : formData.loginStyle?.gradientTo,
                                  }
                                })}
                              />
                            </div>

                            {formData.loginStyle?.useGradient ? (
                              <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Gradient From</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={formData.loginStyle?.gradientFrom || "#2563eb"}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          loginStyle: { ...formData.loginStyle, gradientFrom: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={formData.loginStyle?.gradientFrom || ""}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          loginStyle: { ...formData.loginStyle, gradientFrom: e.target.value }
                                        })}
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Gradient To</Label>
                                    <div className="flex gap-2">
                                      <Input
                                        type="color"
                                        value={formData.loginStyle?.gradientTo || "#7c3aed"}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          loginStyle: { ...formData.loginStyle, gradientTo: e.target.value }
                                        })}
                                        className="h-9 w-12 cursor-pointer p-1"
                                      />
                                      <Input
                                        value={formData.loginStyle?.gradientTo || ""}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          loginStyle: { ...formData.loginStyle, gradientTo: e.target.value }
                                        })}
                                        className="flex-1 text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Direction</Label>
                                    <Select
                                      value={formData.loginStyle?.gradientDirection || "to-r"}
                                      onValueChange={(value: GradientDirection) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, gradientDirection: value }
                                      })}
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
                                <div className="space-y-2 pt-2">
                                  <Label className="text-xs">Text Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      value={formData.loginStyle?.textColor || "#ffffff"}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, textColor: e.target.value }
                                      })}
                                      className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                      value={formData.loginStyle?.textColor || ""}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, textColor: e.target.value }
                                      })}
                                      className="flex-1 text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">Background Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      value={formData.loginStyle?.bgColor || "#ffffff"}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, bgColor: e.target.value }
                                      })}
                                      className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                      value={formData.loginStyle?.bgColor || ""}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, bgColor: e.target.value }
                                      })}
                                      placeholder="transparent"
                                      className="flex-1 text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Text Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      value={formData.loginStyle?.textColor || "#374151"}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, textColor: e.target.value }
                                      })}
                                      className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                      value={formData.loginStyle?.textColor || ""}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, textColor: e.target.value }
                                      })}
                                      placeholder="#374151"
                                      className="flex-1 text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Border Color</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="color"
                                      value={formData.loginStyle?.borderColor || "#e5e7eb"}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, borderColor: e.target.value }
                                      })}
                                      className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                      value={formData.loginStyle?.borderColor || ""}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, borderColor: e.target.value }
                                      })}
                                      placeholder="#e5e7eb"
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
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Border Width</Label>
                                  <span className="text-xs text-muted-foreground">{formData.loginStyle?.borderWidth ?? 0}px</span>
                                </div>
                                <Slider
                                  value={[formData.loginStyle?.borderWidth ?? 0]}
                                  onValueChange={(value) => setFormData({
                                    ...formData,
                                    loginStyle: { ...formData.loginStyle, borderWidth: value[0] }
                                  })}
                                  min={0}
                                  max={4}
                                  step={1}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Border Radius</Label>
                                  <span className="text-xs text-muted-foreground">{formData.loginStyle?.borderRadius ?? 6}px</span>
                                </div>
                                <Slider
                                  value={[formData.loginStyle?.borderRadius ?? 6]}
                                  onValueChange={(value) => setFormData({
                                    ...formData,
                                    loginStyle: { ...formData.loginStyle, borderRadius: value[0] }
                                  })}
                                  min={0}
                                  max={24}
                                  step={2}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Hover Effects */}
                        <AccordionItem value="hover">
                          <AccordionTrigger className="text-sm">Hover Effects</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Hover Effect</Label>
                              <Select
                                value={formData.loginStyle?.hoverEffect || "none"}
                                onValueChange={(value: ButtonHoverEffect) => setFormData({
                                  ...formData,
                                  loginStyle: { ...formData.loginStyle, hoverEffect: value }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {hoverEffectOptions.map((effect) => (
                                    <SelectItem key={effect.value} value={effect.value}>{effect.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-xs">Hover Background Color</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={formData.loginStyle?.hoverBgColor || "#f3f4f6"}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      loginStyle: { ...formData.loginStyle, hoverBgColor: e.target.value }
                                    })}
                                    className="h-9 w-12 cursor-pointer p-1"
                                  />
                                  <Input
                                    value={formData.loginStyle?.hoverBgColor || ""}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      loginStyle: { ...formData.loginStyle, hoverBgColor: e.target.value }
                                    })}
                                    placeholder="#f3f4f6"
                                    className="flex-1 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Hover Text Color</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={formData.loginStyle?.hoverTextColor || "#000000"}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      loginStyle: { ...formData.loginStyle, hoverTextColor: e.target.value }
                                    })}
                                    className="h-9 w-12 cursor-pointer p-1"
                                  />
                                  <Input
                                    value={formData.loginStyle?.hoverTextColor || ""}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      loginStyle: { ...formData.loginStyle, hoverTextColor: e.target.value }
                                    })}
                                    className="flex-1 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Shadow */}
                        <AccordionItem value="shadow">
                          <AccordionTrigger className="text-sm">Shadow</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Box Shadow</Label>
                              <Input
                                value={formData.loginStyle?.shadow || ""}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  loginStyle: { ...formData.loginStyle, shadow: e.target.value }
                                })}
                                placeholder="0 4px 14px rgba(0,0,0,0.1)"
                                className="text-xs"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Hover Shadow</Label>
                              <Input
                                value={formData.loginStyle?.hoverShadow || ""}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  loginStyle: { ...formData.loginStyle, hoverShadow: e.target.value }
                                })}
                                placeholder="0 8px 20px rgba(0,0,0,0.15)"
                                className="text-xs"
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Icon Section */}
                        <AccordionItem value="icon">
                          <AccordionTrigger className="text-sm">
                            Icon
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            {/* Use Custom SVG Toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                              <div>
                                <Label className="text-sm">Use Custom SVG</Label>
                                <p className="text-xs text-muted-foreground">
                                  Paste your own SVG code instead of Lucide icon
                                </p>
                              </div>
                              <Switch
                                checked={formData.loginStyle?.icon === "custom"}
                                onCheckedChange={(checked) => setFormData({
                                  ...formData,
                                  loginStyle: {
                                    ...formData.loginStyle,
                                    icon: checked ? "custom" : undefined,
                                    customIconSvg: checked ? formData.loginStyle?.customIconSvg : undefined
                                  }
                                })}
                              />
                            </div>

                            {/* Lucide Icon Name Input + Position (side by side) */}
                            {formData.loginStyle?.icon !== "custom" && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs">Lucide Icon Name</Label>
                                    <Input
                                      value={formData.loginStyle?.icon || ""}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, icon: e.target.value || undefined }
                                      })}
                                      placeholder="arrow-right, rocket..."
                                      className="text-xs"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs">Icon Position</Label>
                                    <Select
                                      value={formData.loginStyle?.iconPosition || "right"}
                                      onValueChange={(value: "left" | "right") => setFormData({
                                        ...formData,
                                        loginStyle: { ...formData.loginStyle, iconPosition: value }
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left">Left of Text</SelectItem>
                                        <SelectItem value="right">Right of Text</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Browse icons at{" "}
                                  <a
                                    href="https://lucide.dev/icons"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                  >
                                    lucide.dev/icons
                                  </a>
                                  {" "}and copy the icon name
                                </p>
                              </div>
                            )}

                            {/* Custom SVG Input + Position */}
                            {formData.loginStyle?.icon === "custom" && (
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">Custom SVG Code</Label>
                                  <textarea
                                    value={formData.loginStyle?.customIconSvg || ""}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      loginStyle: { ...formData.loginStyle, customIconSvg: e.target.value }
                                    })}
                                    placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="..."/></svg>'
                                    className="w-full h-24 p-2 text-xs font-mono border rounded-md resize-none bg-background"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Paste SVG code from any icon source
                                  </p>
                                </div>
                                <div className="w-1/2 space-y-2">
                                  <Label className="text-xs">Icon Position</Label>
                                  <Select
                                    value={formData.loginStyle?.iconPosition || "right"}
                                    onValueChange={(value: "left" | "right") => setFormData({
                                      ...formData,
                                      loginStyle: { ...formData.loginStyle, iconPosition: value }
                                    })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Left of Text</SelectItem>
                                    <SelectItem value="right">Right of Text</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      {/* Preview */}
                      <div className="pt-2 border-t">
                        <Label className="text-xs text-muted-foreground mb-2 block">Preview (hover to test effect)</Label>
                        <PreviewCTAButton btn={{
                          text: formData.loginText,
                          url: formData.loginUrl,
                          variant: "ghost",
                          style: formData.loginStyle
                        }} />
                      </div>

                      {/* Quick Style Presets */}
                      <div className="pt-4 border-t">
                        <Label className="text-sm font-medium mb-3 block">Quick Style Presets</Label>
                        <p className="text-xs text-muted-foreground mb-3">
                          Click to apply a modern 2025 button style. You can customize further after applying.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {buttonStylePresets.map((preset) => {
                            const previewBg = preset.style.useGradient
                              ? `linear-gradient(${getGradientCSS(preset.style.gradientDirection)}, ${preset.style.gradientFrom}, ${preset.style.gradientTo})`
                              : preset.style.bgColor || "#2563eb";
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  loginStyle: { ...preset.style }
                                })}
                                className="group relative flex flex-col items-center p-2 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all"
                                title={preset.description}
                              >
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
                                  {formData.loginText || "Sign In"}
                                </span>
                                <span className="text-[10px] text-muted-foreground group-hover:text-foreground text-center leading-tight">
                                  {preset.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Save and Add Buttons at bottom */}
              <div className="pt-4 border-t mt-4 space-y-3">
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
                <Button variant="outline" onClick={addCTAButton} className="w-full border-dashed">
                  + Add new button
                </Button>
              </div>
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
              <div className="grid gap-4 md:grid-cols-3">
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

                <div className="space-y-2">
                  <Label htmlFor="hoverColor">Menu Hover Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hoverColor"
                      type="color"
                      value={formData.hoverColor || "#2563eb"}
                      onChange={(e) => setFormData({ ...formData, hoverColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.hoverColor}
                      onChange={(e) => setFormData({ ...formData, hoverColor: e.target.value })}
                      placeholder="#2563eb (click color to set)"
                      className="flex-1"
                    />
                  </div>
                  {!formData.hoverColor && (
                    <p className="text-xs text-amber-600">Click the color picker to set a hover color</p>
                  )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteButtonIndex !== null} onOpenChange={(open) => !open && setDeleteButtonIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CTA Button?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{deleteButtonIndex !== null ? formData.ctaButtons[deleteButtonIndex]?.text || "this button" : "this button"}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteButtonIndex !== null && removeCTAButton(deleteButtonIndex)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
