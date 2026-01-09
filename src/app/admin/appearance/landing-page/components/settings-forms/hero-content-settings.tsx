"use client";

import { useCallback } from "react";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings, HeroVariant, FeatureItem, FeatureListLayout, FeatureIconPosition, ButtonCustomStyle, TrustBadgeItem, StatItem } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import { AccordionSection } from "../ui/accordion-section";
import {
  TextInput,
  TextAreaInput,
  LinkInput,
  ToggleSwitch,
  SelectInput,
} from "../ui/form-controls";
import { FeatureListEditor } from "../ui/feature-list-editor";
import { TrustBadgesEditor } from "../ui/trust-badges-editor";
import { StatsEditor } from "../ui/stats-editor";
import { ButtonStyleEditor } from "@/components/admin/button-style-editor";
import { NumberInput } from "../ui/form-controls";

interface HeroContentSettingsProps {
  block: LandingPageBlock;
  settings: HeroSettings;
  onUpdateSettings: (settings: HeroSettings) => void;
}

// Helper to migrate old string[] items to new FeatureItem[] format
function migrateFeatureItems(items: unknown): FeatureItem[] {
  if (!Array.isArray(items)) return defaultHeroSettings.features.items;

  // Check if already in new format
  if (items.length > 0 && typeof items[0] === 'object' && 'id' in items[0]) {
    return items as FeatureItem[];
  }

  // Convert old string[] format to new format
  return (items as string[]).map((text, index) => ({
    id: `feat_migrated_${index}_${Date.now()}`,
    text: String(text),
    icon: "CheckCircle",
  }));
}

export function HeroContentSettings({
  block,
  settings,
  onUpdateSettings,
}: HeroContentSettingsProps) {
  // Migrate features if needed
  const migratedFeatures = {
    ...defaultHeroSettings.features,
    ...settings?.features,
    items: migrateFeatureItems(settings?.features?.items),
  };

  // Merge with defaults
  const s: HeroSettings = {
    ...defaultHeroSettings,
    ...settings,
    badge: { ...defaultHeroSettings.badge, ...settings?.badge },
    headline: { ...defaultHeroSettings.headline, ...settings?.headline },
    subheadline: { ...defaultHeroSettings.subheadline, ...settings?.subheadline },
    features: migratedFeatures,
    primaryCTA: { ...defaultHeroSettings.primaryCTA, ...settings?.primaryCTA },
    secondaryCTA: { ...defaultHeroSettings.secondaryCTA, ...settings?.secondaryCTA },
    trustText: { ...defaultHeroSettings.trustText, ...settings?.trustText },
    trustBadges: { ...defaultHeroSettings.trustBadges, ...settings?.trustBadges },
    stats: { ...defaultHeroSettings.stats, ...settings?.stats },
  };

  const updateNested = useCallback(
    <K extends keyof HeroSettings>(
      parentKey: K,
      childKey: string,
      value: unknown
    ) => {
      const parent = s[parentKey];
      if (typeof parent === "object" && parent !== null) {
        onUpdateSettings({
          ...s,
          [parentKey]: {
            ...parent,
            [childKey]: value,
          },
        });
      }
    },
    [s, onUpdateSettings]
  );

  return (
    <div className="space-y-3">
      {/* Badge Section */}
      <AccordionSection title="Badge">
        <ToggleSwitch
          label="Show Badge"
          checked={s.badge.enabled}
          onChange={(checked) => updateNested("badge", "enabled", checked)}
        />
        {s.badge.enabled && (
          <>
            <TextInput
              label="Text"
              value={s.badge.text}
              onChange={(v) => updateNested("badge", "text", v)}
              placeholder="Badge text..."
            />
            <TextInput
              label="Emoji (optional)"
              value={s.badge.emoji || ""}
              onChange={(v) => updateNested("badge", "emoji", v)}
              placeholder="🇺🇸"
            />
          </>
        )}
      </AccordionSection>

      {/* Headline Section */}
      <AccordionSection title="Headline">
        <TextInput
          label="Text"
          value={s.headline.text}
          onChange={(v) => updateNested("headline", "text", v)}
          placeholder="Start Your US LLC in 24 Hours"
        />
        <TextInput
          label="Highlight Words"
          value={s.headline.highlightWord || ""}
          onChange={(v) => updateNested("headline", "highlightWord", v)}
          placeholder="US LLC, 24 Hours"
          description="Separate multiple words with comma (e.g., US LLC, 24 Hours)"
        />
        <SelectInput
          label="Size"
          value={s.headline.size}
          onChange={(v) => updateNested("headline", "size", v)}
          options={[
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra Large" },
            { value: "2xl", label: "2X Large" },
          ]}
        />
      </AccordionSection>

      {/* Animated Words (for split-dashboard) */}
      {s.variant === "split-dashboard" && (
        <AccordionSection title="Animated Words">
          <ToggleSwitch
            label="Enable Animation"
            checked={s.headline.animatedWords?.enabled ?? false}
            onChange={(checked) => {
              const currentAnimated = s.headline.animatedWords || {
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
                ...s,
                headline: {
                  ...s.headline,
                  animatedWords: {
                    ...currentAnimated,
                    enabled: checked,
                  },
                },
              });
            }}
          />
          {s.headline.animatedWords?.enabled && (
            <>
              <TextInput
                label="Words (comma separated)"
                value={s.headline.animatedWords?.words?.join(", ") || ""}
                onChange={(v) => {
                  const words = v.split(",").map((w) => w.trim()).filter(Boolean);
                  const currentAnimated = s.headline.animatedWords!;
                  onUpdateSettings({
                    ...s,
                    headline: {
                      ...s.headline,
                      animatedWords: {
                        ...currentAnimated,
                        words,
                      },
                    },
                  });
                }}
                placeholder="Growth, Success, Revenue"
              />
              <SelectInput
                label="Animation Style"
                value={s.headline.animatedWords?.animation?.type || "slide-up"}
                onChange={(v) => {
                  const currentAnimated = s.headline.animatedWords!;
                  onUpdateSettings({
                    ...s,
                    headline: {
                      ...s.headline,
                      animatedWords: {
                        ...currentAnimated,
                        animation: {
                          ...currentAnimated.animation,
                          type: v as "slide-up" | "fade" | "typewriter" | "flip",
                        },
                      },
                    },
                  });
                }}
                options={[
                  { value: "slide-up", label: "Slide Up" },
                  { value: "fade", label: "Fade" },
                  { value: "flip", label: "Flip" },
                ]}
              />
            </>
          )}
        </AccordionSection>
      )}

      {/* Subheadline Section */}
      <AccordionSection title="Subheadline">
        <TextAreaInput
          label="Text"
          value={s.subheadline.text}
          onChange={(v) => updateNested("subheadline", "text", v)}
          placeholder="Your supporting text here..."
          rows={3}
        />
      </AccordionSection>

      {/* Features Section */}
      <AccordionSection title="Features List">
        <FeatureListEditor
          enabled={s.features.enabled}
          items={s.features.items}
          layout={s.features.layout}
          iconPosition={s.features.iconPosition}
          iconColor={s.features.iconColor}
          columns={s.features.columns}
          onEnabledChange={(enabled) => updateNested("features", "enabled", enabled)}
          onItemsChange={(items) => updateNested("features", "items", items)}
          onLayoutChange={(layout) => updateNested("features", "layout", layout)}
          onIconPositionChange={(position) => updateNested("features", "iconPosition", position)}
          onIconColorChange={(color) => updateNested("features", "iconColor", color)}
          onColumnsChange={(columns) => updateNested("features", "columns", columns)}
        />
      </AccordionSection>

      {/* Primary CTA Section */}
      <AccordionSection title="Primary Button">
        <TextInput
          label="Button Text"
          value={s.primaryCTA.text}
          onChange={(v) => updateNested("primaryCTA", "text", v)}
          placeholder="Start Your LLC Now"
        />
        <LinkInput
          label="Link URL"
          value={s.primaryCTA.link}
          onChange={(v) => updateNested("primaryCTA", "link", v)}
          placeholder="/services/llc-formation"
          openInNewTab={s.primaryCTA.openInNewTab}
          onOpenInNewTabChange={(v) => updateNested("primaryCTA", "openInNewTab", v)}
        />
        <ToggleSwitch
          label="Show Price"
          description="Display price badge on button"
          checked={s.primaryCTA.showPrice ?? false}
          onChange={(checked) => updateNested("primaryCTA", "showPrice", checked)}
        />
        {s.primaryCTA.showPrice && (
          <TextInput
            label="Price Text"
            value={s.primaryCTA.priceText || ""}
            onChange={(v) => updateNested("primaryCTA", "priceText", v)}
            placeholder="From $0"
          />
        )}

        {/* Button Style Editor */}
        <div className="mt-4 pt-4 border-t">
          <ButtonStyleEditor
            style={s.primaryCTA.style || {}}
            onChange={(style: ButtonCustomStyle) => updateNested("primaryCTA", "style", style)}
            buttonText={s.primaryCTA.text || "Button"}
            showPreview={true}
            showPresets={true}
            compact={true}
          />
        </div>
      </AccordionSection>

      {/* Secondary CTA Section */}
      <AccordionSection title="Secondary Button">
        <ToggleSwitch
          label="Show Secondary Button"
          checked={s.secondaryCTA.enabled}
          onChange={(checked) => updateNested("secondaryCTA", "enabled", checked)}
        />
        {s.secondaryCTA.enabled && (
          <>
            <TextInput
              label="Button Text"
              value={s.secondaryCTA.text}
              onChange={(v) => updateNested("secondaryCTA", "text", v)}
              placeholder="View Pricing"
            />
            <LinkInput
              label="Link URL"
              value={s.secondaryCTA.link}
              onChange={(v) => updateNested("secondaryCTA", "link", v)}
              placeholder="/pricing"
              openInNewTab={s.secondaryCTA.openInNewTab}
              onOpenInNewTabChange={(v) => updateNested("secondaryCTA", "openInNewTab", v)}
            />

            {/* Button Style Editor */}
            <div className="mt-4 pt-4 border-t">
              <ButtonStyleEditor
                style={s.secondaryCTA.style || {}}
                onChange={(style: ButtonCustomStyle) => updateNested("secondaryCTA", "style", style)}
                buttonText={s.secondaryCTA.text || "Button"}
                showPreview={true}
                showPresets={true}
                compact={true}
              />
            </div>
          </>
        )}
      </AccordionSection>

      {/* Trust Text Section */}
      <AccordionSection title="Trust Text">
        <ToggleSwitch
          label="Show Trust Text"
          checked={s.trustText?.enabled ?? false}
          onChange={(checked) => updateNested("trustText", "enabled", checked)}
        />
        {s.trustText?.enabled && (
          <>
            <TextInput
              label="Trust Text"
              value={s.trustText?.text || ""}
              onChange={(v) => updateNested("trustText", "text", v)}
              placeholder="4.9/5 from 2,000+ reviews"
            />
            <ToggleSwitch
              label="Show Star Rating"
              checked={s.trustText?.showRating ?? false}
              onChange={(checked) => updateNested("trustText", "showRating", checked)}
            />
            {s.trustText?.showRating && (
              <TextInput
                label="Rating Value"
                value={s.trustText?.rating?.toString() || "4.9"}
                onChange={(v) => updateNested("trustText", "rating", parseFloat(v) || 0)}
                placeholder="4.9"
              />
            )}
          </>
        )}
      </AccordionSection>

      {/* Trust Badges Section */}
      <AccordionSection title="Trust Badges">
        <TrustBadgesEditor
          enabled={s.trustBadges?.enabled ?? false}
          items={s.trustBadges?.items || []}
          onEnabledChange={(enabled) => updateNested("trustBadges", "enabled", enabled)}
          onItemsChange={(items) => updateNested("trustBadges", "items", items)}
        />
      </AccordionSection>

      {/* Stats Section */}
      <AccordionSection title="Stats Section">
        <StatsEditor
          enabled={s.stats?.enabled ?? false}
          items={s.stats?.items || []}
          onEnabledChange={(enabled) => updateNested("stats", "enabled", enabled)}
          onItemsChange={(items) => updateNested("stats", "items", items)}
        />
      </AccordionSection>
    </div>
  );
}
