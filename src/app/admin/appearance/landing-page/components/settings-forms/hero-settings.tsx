"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings, HeroVariant, DashboardVisualSettings } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";

interface HeroSettingsFormProps {
  block: LandingPageBlock;
  settings: HeroSettings;
  activeTab: string;
  onUpdateSettings: (settings: HeroSettings) => void;
}

export function HeroSettingsForm({
  block,
  settings,
  activeTab,
  onUpdateSettings,
}: HeroSettingsFormProps) {
  // Merge with defaults to ensure all fields exist
  const mergedSettings: HeroSettings = {
    ...defaultHeroSettings,
    ...settings,
    background: { ...defaultHeroSettings.background, ...settings?.background },
    badge: { ...defaultHeroSettings.badge, ...settings?.badge },
    headline: { ...defaultHeroSettings.headline, ...settings?.headline },
    subheadline: { ...defaultHeroSettings.subheadline, ...settings?.subheadline },
    features: { ...defaultHeroSettings.features, ...settings?.features },
    primaryCTA: { ...defaultHeroSettings.primaryCTA, ...settings?.primaryCTA },
    secondaryCTA: { ...defaultHeroSettings.secondaryCTA, ...settings?.secondaryCTA },
    trustText: { ...defaultHeroSettings.trustText, ...settings?.trustText },
    trustBadges: { ...defaultHeroSettings.trustBadges, ...settings?.trustBadges },
    stats: { ...defaultHeroSettings.stats, ...settings?.stats },
  };

  const updateField = useCallback(
    <K extends keyof HeroSettings>(key: K, value: HeroSettings[K]) => {
      onUpdateSettings({
        ...mergedSettings,
        [key]: value,
      });
    },
    [mergedSettings, onUpdateSettings]
  );

  const updateNestedField = useCallback(
    <K extends keyof HeroSettings>(
      parentKey: K,
      childKey: string,
      value: unknown
    ) => {
      const parent = mergedSettings[parentKey];
      if (typeof parent === "object" && parent !== null) {
        onUpdateSettings({
          ...mergedSettings,
          [parentKey]: {
            ...parent,
            [childKey]: value,
          },
        });
      }
    },
    [mergedSettings, onUpdateSettings]
  );

  // Layout Tab
  if (activeTab === "layout") {
    return (
      <div className="space-y-6">
        {/* Variant Selector */}
        <div className="space-y-2">
          <Label>Hero Variant</Label>
          <Select
            value={mergedSettings.variant}
            onValueChange={(value) => updateField("variant", value as HeroVariant)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="centered">Centered</SelectItem>
              <SelectItem value="split">Split (Image Right)</SelectItem>
              <SelectItem value="split-dashboard">Split Dashboard</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the layout style for your hero section
          </p>
        </div>

        <Separator />

        {/* Visibility */}
        <div className="space-y-4">
          <Label>Visibility</Label>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Hide on Mobile</p>
              <p className="text-xs text-muted-foreground">
                Don&apos;t show this block on mobile devices
              </p>
            </div>
            <Switch checked={block.hideOnMobile} disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Hide on Desktop</p>
              <p className="text-xs text-muted-foreground">
                Don&apos;t show this block on desktop
              </p>
            </div>
            <Switch checked={block.hideOnDesktop} disabled />
          </div>
        </div>

        {/* Visual Settings (for split variants) */}
        {(mergedSettings.variant === "split" || mergedSettings.variant === "split-dashboard") && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label>Visual Settings</Label>
              <div className="space-y-2">
                <Label className="text-xs">Position</Label>
                <Select
                  value={mergedSettings.visual?.position || "right"}
                  onValueChange={(value) =>
                    updateNestedField("visual", "position", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mergedSettings.variant === "split-dashboard" && (
                <div className="space-y-2">
                  <Label className="text-xs">Dashboard Preset</Label>
                  <Select
                    value={mergedSettings.visual?.dashboardPreset?.preset || "analytics"}
                    onValueChange={(value) => {
                      const currentVisual = mergedSettings.visual || {
                        type: "dashboard-preset" as const,
                        position: "right" as const,
                      };
                      const defaultPreset: DashboardVisualSettings = {
                        preset: "analytics",
                        interactionEffect: {
                          type: "tilt-3d",
                          intensity: "medium",
                        },
                        style: {
                          shadow: "lg",
                          border: true,
                          borderRadius: "lg",
                          scale: 1,
                          rotation: 5,
                        },
                        entranceAnimation: {
                          type: "slide-up",
                          delay: 300,
                          duration: 600,
                        },
                      };
                      const currentPreset = currentVisual.dashboardPreset || defaultPreset;
                      onUpdateSettings({
                        ...mergedSettings,
                        visual: {
                          ...currentVisual,
                          type: "dashboard-preset",
                          dashboardPreset: {
                            ...currentPreset,
                            preset: value as "analytics" | "ecommerce" | "saas" | "crm" | "custom",
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                      <SelectItem value="ecommerce">E-commerce Dashboard</SelectItem>
                      <SelectItem value="saas">SaaS Dashboard</SelectItem>
                      <SelectItem value="crm">CRM Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mergedSettings.variant === "split" && (
                <div className="space-y-2">
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    value={mergedSettings.visual?.url || ""}
                    onChange={(e) => updateNestedField("visual", "url", e.target.value)}
                    placeholder="/images/hero-image.jpg"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Content Tab
  if (activeTab === "content") {
    return (
      <div className="space-y-6">
        {/* Badge */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Badge</Label>
            <Switch
              checked={mergedSettings.badge.enabled}
              onCheckedChange={(checked) => updateNestedField("badge", "enabled", checked)}
            />
          </div>
          {mergedSettings.badge.enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Text</Label>
                <Input
                  value={mergedSettings.badge.text}
                  onChange={(e) => updateNestedField("badge", "text", e.target.value)}
                  placeholder="Badge text..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Emoji (optional)</Label>
                <Input
                  value={mergedSettings.badge.emoji || ""}
                  onChange={(e) => updateNestedField("badge", "emoji", e.target.value)}
                  placeholder="🇺🇸"
                />
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Headline */}
        <div className="space-y-4">
          <Label>Headline</Label>
          <div className="space-y-2">
            <Label className="text-xs">Text</Label>
            <Input
              value={mergedSettings.headline.text}
              onChange={(e) => updateNestedField("headline", "text", e.target.value)}
              placeholder="Start Your US LLC in 24 Hours"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Highlight Word (optional)</Label>
            <Input
              value={mergedSettings.headline.highlightWord || ""}
              onChange={(e) => updateNestedField("headline", "highlightWord", e.target.value)}
              placeholder="US LLC"
            />
            <p className="text-xs text-muted-foreground">
              This word will be highlighted with primary color
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Size</Label>
            <Select
              value={mergedSettings.headline.size}
              onValueChange={(value) => updateNestedField("headline", "size", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
                <SelectItem value="2xl">2X Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Animated Words (for split-dashboard) */}
        {mergedSettings.variant === "split-dashboard" && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Animated Words</Label>
                <Switch
                  checked={mergedSettings.headline.animatedWords?.enabled ?? false}
                  onCheckedChange={(checked) => {
                    const currentHeadline = mergedSettings.headline;
                    const currentAnimated = currentHeadline.animatedWords || {
                      words: ["Growth", "Success", "Revenue"],
                      animation: {
                        type: "slide-up" as const,
                        duration: 3000,
                        transitionDuration: 500,
                        pauseOnHover: true,
                      },
                      style: {
                        color: "primary" as const,
                        underline: false,
                        background: true,
                      },
                    };
                    onUpdateSettings({
                      ...mergedSettings,
                      headline: {
                        ...currentHeadline,
                        animatedWords: {
                          ...currentAnimated,
                          enabled: checked,
                        },
                      },
                    });
                  }}
                />
              </div>
              {mergedSettings.headline.animatedWords?.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">Words (comma separated)</Label>
                    <Input
                      value={mergedSettings.headline.animatedWords?.words?.join(", ") || ""}
                      onChange={(e) => {
                        const words = e.target.value.split(",").map((w) => w.trim()).filter(Boolean);
                        const currentHeadline = mergedSettings.headline;
                        const currentAnimated = currentHeadline.animatedWords!;
                        onUpdateSettings({
                          ...mergedSettings,
                          headline: {
                            ...currentHeadline,
                            animatedWords: {
                              ...currentAnimated,
                              words,
                            },
                          },
                        });
                      }}
                      placeholder="Growth, Success, Revenue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Animation Style</Label>
                    <Select
                      value={mergedSettings.headline.animatedWords?.animation?.type || "slide-up"}
                      onValueChange={(value) => {
                        const currentHeadline = mergedSettings.headline;
                        const currentAnimated = currentHeadline.animatedWords!;
                        onUpdateSettings({
                          ...mergedSettings,
                          headline: {
                            ...currentHeadline,
                            animatedWords: {
                              ...currentAnimated,
                              animation: {
                                ...currentAnimated.animation,
                                type: value as "slide-up" | "fade" | "typewriter" | "flip",
                              },
                            },
                          },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="flip">Flip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Subheadline */}
        <div className="space-y-4">
          <Label>Subheadline</Label>
          <Textarea
            value={mergedSettings.subheadline.text}
            onChange={(e) => updateNestedField("subheadline", "text", e.target.value)}
            placeholder="Your supporting text here..."
            rows={3}
          />
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Features List</Label>
            <Switch
              checked={mergedSettings.features.enabled}
              onCheckedChange={(checked) => updateNestedField("features", "enabled", checked)}
            />
          </div>
          {mergedSettings.features.enabled && (
            <div className="space-y-2">
              <Label className="text-xs">Items (one per line)</Label>
              <Textarea
                value={mergedSettings.features.items.join("\n")}
                onChange={(e) => {
                  const items = e.target.value.split("\n").filter(Boolean);
                  updateNestedField("features", "items", items);
                }}
                placeholder="Fast 24-48 hour processing&#10;100% Compliance guaranteed&#10;Dedicated support team"
                rows={3}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Primary CTA */}
        <div className="space-y-4">
          <Label>Primary Button</Label>
          <div className="space-y-2">
            <Label className="text-xs">Button Text</Label>
            <Input
              value={mergedSettings.primaryCTA.text}
              onChange={(e) => updateNestedField("primaryCTA", "text", e.target.value)}
              placeholder="Start Your LLC Now"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Link URL</Label>
            <Input
              value={mergedSettings.primaryCTA.link}
              onChange={(e) => updateNestedField("primaryCTA", "link", e.target.value)}
              placeholder="/services/llc-formation"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Price</p>
              <p className="text-xs text-muted-foreground">Display price badge on button</p>
            </div>
            <Switch
              checked={mergedSettings.primaryCTA.showPrice ?? false}
              onCheckedChange={(checked) => updateNestedField("primaryCTA", "showPrice", checked)}
            />
          </div>
          {mergedSettings.primaryCTA.showPrice && (
            <div className="space-y-2">
              <Label className="text-xs">Price Text</Label>
              <Input
                value={mergedSettings.primaryCTA.priceText || ""}
                onChange={(e) => updateNestedField("primaryCTA", "priceText", e.target.value)}
                placeholder="From $0"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Secondary CTA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Secondary Button</Label>
            <Switch
              checked={mergedSettings.secondaryCTA.enabled}
              onCheckedChange={(checked) => updateNestedField("secondaryCTA", "enabled", checked)}
            />
          </div>
          {mergedSettings.secondaryCTA.enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Button Text</Label>
                <Input
                  value={mergedSettings.secondaryCTA.text}
                  onChange={(e) => updateNestedField("secondaryCTA", "text", e.target.value)}
                  placeholder="View Pricing"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Link URL</Label>
                <Input
                  value={mergedSettings.secondaryCTA.link}
                  onChange={(e) => updateNestedField("secondaryCTA", "link", e.target.value)}
                  placeholder="/pricing"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Trust Tab
  if (activeTab === "trust") {
    return (
      <div className="space-y-6">
        {/* Trust Text / Rating */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Trust Text</Label>
            <Switch
              checked={mergedSettings.trustText.enabled}
              onCheckedChange={(checked) => updateNestedField("trustText", "enabled", checked)}
            />
          </div>
          {mergedSettings.trustText.enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Text</Label>
                <Input
                  value={mergedSettings.trustText.text}
                  onChange={(e) => updateNestedField("trustText", "text", e.target.value)}
                  placeholder="4.9/5 from 2,000+ reviews"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show Star Rating</p>
                </div>
                <Switch
                  checked={mergedSettings.trustText.showRating}
                  onCheckedChange={(checked) => updateNestedField("trustText", "showRating", checked)}
                />
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Trust Badges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Trust Badges</Label>
            <Switch
              checked={mergedSettings.trustBadges.enabled}
              onCheckedChange={(checked) => updateNestedField("trustBadges", "enabled", checked)}
            />
          </div>
          {mergedSettings.trustBadges.enabled && (
            <p className="text-xs text-muted-foreground">
              Badge management coming soon. Currently using default badges.
            </p>
          )}
        </div>

        <Separator />

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Stats Section</Label>
            <Switch
              checked={mergedSettings.stats.enabled}
              onCheckedChange={(checked) => updateNestedField("stats", "enabled", checked)}
            />
          </div>
          {mergedSettings.stats.enabled && (
            <p className="text-xs text-muted-foreground">
              Stats management coming soon. Currently using default stats.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-6">
        {/* Background Type */}
        <div className="space-y-4">
          <Label>Background</Label>
          <div className="space-y-2">
            <Label className="text-xs">Type</Label>
            <Select
              value={mergedSettings.background.type}
              onValueChange={(value) => updateNestedField("background", "type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="pattern">Pattern</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mergedSettings.background.type === "solid" && (
            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2">
                <Input
                  value={mergedSettings.background.color || "#0A0F1E"}
                  onChange={(e) => updateNestedField("background", "color", e.target.value)}
                  placeholder="#0A0F1E"
                />
                <input
                  type="color"
                  value={mergedSettings.background.color || "#0A0F1E"}
                  onChange={(e) => updateNestedField("background", "color", e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border"
                />
              </div>
            </div>
          )}

          {mergedSettings.background.type === "gradient" && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">From Color</Label>
                <div className="flex gap-2">
                  <Input
                    value={mergedSettings.background.gradientFrom || "#0A0F1E"}
                    onChange={(e) => updateNestedField("background", "gradientFrom", e.target.value)}
                  />
                  <input
                    type="color"
                    value={mergedSettings.background.gradientFrom || "#0A0F1E"}
                    onChange={(e) => updateNestedField("background", "gradientFrom", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">To Color</Label>
                <div className="flex gap-2">
                  <Input
                    value={mergedSettings.background.gradientTo || "#1E2642"}
                    onChange={(e) => updateNestedField("background", "gradientTo", e.target.value)}
                  />
                  <input
                    type="color"
                    value={mergedSettings.background.gradientTo || "#1E2642"}
                    onChange={(e) => updateNestedField("background", "gradientTo", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border"
                  />
                </div>
              </div>
            </>
          )}

          {mergedSettings.background.type === "image" && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={mergedSettings.background.imageUrl || ""}
                  onChange={(e) => updateNestedField("background", "imageUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Overlay</p>
                </div>
                <Switch
                  checked={mergedSettings.background.overlay?.enabled ?? false}
                  onCheckedChange={(checked) => {
                    const currentBg = mergedSettings.background;
                    const currentOverlay = currentBg.overlay || {
                      color: "#000000",
                      opacity: 0.5,
                    };
                    onUpdateSettings({
                      ...mergedSettings,
                      background: {
                        ...currentBg,
                        overlay: {
                          ...currentOverlay,
                          enabled: checked,
                        },
                      },
                    });
                  }}
                />
              </div>
            </>
          )}

          {mergedSettings.background.type === "pattern" && (
            <div className="space-y-2">
              <Label className="text-xs">Pattern</Label>
              <Select
                value={mergedSettings.background.pattern?.type || "grid"}
                onValueChange={(value) => {
                  const currentBg = mergedSettings.background;
                  const currentPattern = currentBg.pattern || {
                    color: "#ffffff",
                    opacity: 0.03,
                  };
                  onUpdateSettings({
                    ...mergedSettings,
                    background: {
                      ...currentBg,
                      pattern: {
                        ...currentPattern,
                        type: value as "grid" | "dots" | "lines",
                      },
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="lines">Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
