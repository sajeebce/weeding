"use client";

import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings, HeroVariant } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import { AccordionSection } from "../ui/accordion-section";
import {
  TextInput,
  TextAreaInput,
  LinkInput,
  ToggleSwitch,
  SelectInput,
} from "../ui/form-controls";

interface HeroContentSettingsProps {
  block: LandingPageBlock;
  settings: HeroSettings;
  onUpdateSettings: (settings: HeroSettings) => void;
}

export function HeroContentSettings({
  block,
  settings,
  onUpdateSettings,
}: HeroContentSettingsProps) {
  // Merge with defaults
  const s: HeroSettings = {
    ...defaultHeroSettings,
    ...settings,
    badge: { ...defaultHeroSettings.badge, ...settings?.badge },
    headline: { ...defaultHeroSettings.headline, ...settings?.headline },
    subheadline: { ...defaultHeroSettings.subheadline, ...settings?.subheadline },
    features: { ...defaultHeroSettings.features, ...settings?.features },
    primaryCTA: { ...defaultHeroSettings.primaryCTA, ...settings?.primaryCTA },
    secondaryCTA: { ...defaultHeroSettings.secondaryCTA, ...settings?.secondaryCTA },
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
    <div className="space-y-2">
      {/* Badge Section */}
      <AccordionSection title="Badge" defaultOpen={s.badge.enabled}>
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
      <AccordionSection
        title="Headline"
        action={{
          label: "Edit with AI",
          icon: Sparkles,
          onClick: () => console.log("AI Edit"),
        }}
      >
        <TextInput
          label="Text"
          value={s.headline.text}
          onChange={(v) => updateNested("headline", "text", v)}
          placeholder="Start Your US LLC in 24 Hours"
        />
        <TextInput
          label="Highlight Word"
          value={s.headline.highlightWord || ""}
          onChange={(v) => updateNested("headline", "highlightWord", v)}
          placeholder="US LLC"
          description="This word will be highlighted with primary color"
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
      <AccordionSection
        title="Subheadline"
        action={{
          label: "Edit with AI",
          icon: Sparkles,
          onClick: () => console.log("AI Edit"),
        }}
      >
        <TextAreaInput
          label="Text"
          value={s.subheadline.text}
          onChange={(v) => updateNested("subheadline", "text", v)}
          placeholder="Your supporting text here..."
          rows={3}
        />
      </AccordionSection>

      {/* Features Section */}
      <AccordionSection title="Features List" defaultOpen={s.features.enabled}>
        <ToggleSwitch
          label="Show Features"
          checked={s.features.enabled}
          onChange={(checked) => updateNested("features", "enabled", checked)}
        />
        {s.features.enabled && (
          <TextAreaInput
            label="Items (one per line)"
            value={s.features.items.join("\n")}
            onChange={(v) => {
              const items = v.split("\n").filter(Boolean);
              updateNested("features", "items", items);
            }}
            placeholder="Fast 24-48 hour processing&#10;100% Compliance guaranteed&#10;Dedicated support team"
            rows={4}
          />
        )}
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
      </AccordionSection>

      {/* Secondary CTA Section */}
      <AccordionSection title="Secondary Button" defaultOpen={s.secondaryCTA.enabled}>
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
            />
          </>
        )}
      </AccordionSection>
    </div>
  );
}
