"use client";

import { useCallback } from "react";
import { Paintbrush, Image as ImageIcon, Palette, Grid, Circle } from "lucide-react";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import { AccordionSection } from "../ui/accordion-section";
import {
  SelectInput,
  ColorPicker,
  SliderInput,
  ToggleSwitch,
  TextInput,
  IconButtonGroup,
} from "../ui/form-controls";

interface HeroStyleSettingsProps {
  block: LandingPageBlock;
  settings: HeroSettings;
  onUpdateSettings: (settings: HeroSettings) => void;
}

export function HeroStyleSettings({
  block,
  settings,
  onUpdateSettings,
}: HeroStyleSettingsProps) {
  // Merge with defaults
  const s: HeroSettings = {
    ...defaultHeroSettings,
    ...settings,
    background: { ...defaultHeroSettings.background, ...settings?.background },
    trustText: { ...defaultHeroSettings.trustText, ...settings?.trustText },
    trustBadges: { ...defaultHeroSettings.trustBadges, ...settings?.trustBadges },
    stats: { ...defaultHeroSettings.stats, ...settings?.stats },
  };

  const updateBg = useCallback(
    (key: string, value: unknown) => {
      onUpdateSettings({
        ...s,
        background: {
          ...s.background,
          [key]: value,
        },
      });
    },
    [s, onUpdateSettings]
  );

  const bgTypeOptions = [
    { value: "solid", icon: Circle, tooltip: "Solid Color" },
    { value: "gradient", icon: Palette, tooltip: "Gradient" },
    { value: "image", icon: ImageIcon, tooltip: "Image" },
    { value: "pattern", icon: Grid, tooltip: "Pattern" },
  ];

  return (
    <div className="space-y-2">
      {/* Background Section */}
      <AccordionSection title="Background">
        <IconButtonGroup
          label="Background Type"
          value={s.background.type}
          onChange={(v) => updateBg("type", v)}
          options={bgTypeOptions}
        />

        {/* Solid Color */}
        {s.background.type === "solid" && (
          <ColorPicker
            label="Color"
            value={s.background.color || "#0A0F1E"}
            onChange={(v) => updateBg("color", v)}
          />
        )}

        {/* Gradient */}
        {s.background.type === "gradient" && (
          <>
            <ColorPicker
              label="From Color"
              value={s.background.gradientFrom || "#0A0F1E"}
              onChange={(v) => updateBg("gradientFrom", v)}
            />
            <ColorPicker
              label="To Color"
              value={s.background.gradientTo || "#1E2642"}
              onChange={(v) => updateBg("gradientTo", v)}
            />
            <SliderInput
              label="Angle"
              value={s.background.gradientAngle || 180}
              onChange={(v) => updateBg("gradientAngle", v)}
              min={0}
              max={360}
              unit="°"
            />
          </>
        )}

        {/* Image */}
        {s.background.type === "image" && (
          <>
            <TextInput
              label="Image URL"
              value={s.background.imageUrl || ""}
              onChange={(v) => updateBg("imageUrl", v)}
              placeholder="https://..."
            />
            <ToggleSwitch
              label="Enable Overlay"
              checked={s.background.overlay?.enabled ?? false}
              onChange={(checked) => {
                const currentOverlay = s.background.overlay || {
                  color: "#000000",
                  opacity: 0.5,
                };
                onUpdateSettings({
                  ...s,
                  background: {
                    ...s.background,
                    overlay: {
                      ...currentOverlay,
                      enabled: checked,
                    },
                  },
                });
              }}
            />
            {s.background.overlay?.enabled && (
              <>
                <ColorPicker
                  label="Overlay Color"
                  value={s.background.overlay?.color || "#000000"}
                  onChange={(v) => {
                    onUpdateSettings({
                      ...s,
                      background: {
                        ...s.background,
                        overlay: {
                          ...s.background.overlay!,
                          color: v,
                        },
                      },
                    });
                  }}
                />
                <SliderInput
                  label="Overlay Opacity"
                  value={(s.background.overlay?.opacity || 0.5) * 100}
                  onChange={(v) => {
                    onUpdateSettings({
                      ...s,
                      background: {
                        ...s.background,
                        overlay: {
                          ...s.background.overlay!,
                          opacity: v / 100,
                        },
                      },
                    });
                  }}
                  min={0}
                  max={100}
                  unit="%"
                />
              </>
            )}
          </>
        )}

        {/* Pattern */}
        {s.background.type === "pattern" && (
          <>
            <SelectInput
              label="Pattern Type"
              value={s.background.pattern?.type || "grid"}
              onChange={(v) => {
                const currentPattern = s.background.pattern || {
                  color: "#ffffff",
                  opacity: 0.03,
                };
                onUpdateSettings({
                  ...s,
                  background: {
                    ...s.background,
                    pattern: {
                      ...currentPattern,
                      type: v as "grid" | "dots" | "lines",
                    },
                  },
                });
              }}
              options={[
                { value: "grid", label: "Grid" },
                { value: "dots", label: "Dots" },
                { value: "lines", label: "Lines" },
              ]}
            />
            <ColorPicker
              label="Pattern Color"
              value={s.background.pattern?.color || "#ffffff"}
              onChange={(v) => {
                onUpdateSettings({
                  ...s,
                  background: {
                    ...s.background,
                    pattern: {
                      ...s.background.pattern!,
                      color: v,
                    },
                  },
                });
              }}
            />
            <SliderInput
              label="Pattern Opacity"
              value={(s.background.pattern?.opacity || 0.03) * 100}
              onChange={(v) => {
                onUpdateSettings({
                  ...s,
                  background: {
                    ...s.background,
                    pattern: {
                      ...s.background.pattern!,
                      opacity: v / 100,
                    },
                  },
                });
              }}
              min={1}
              max={30}
              unit="%"
            />
          </>
        )}
      </AccordionSection>

      {/* Trust Indicators Section */}
      <AccordionSection title="Trust Indicators">
        <ToggleSwitch
          label="Show Trust Text"
          checked={s.trustText?.enabled ?? false}
          onChange={(checked) => {
            onUpdateSettings({
              ...s,
              trustText: {
                ...s.trustText,
                enabled: checked,
              },
            });
          }}
        />
        {s.trustText?.enabled && (
          <>
            <TextInput
              label="Trust Text"
              value={s.trustText?.text || ""}
              onChange={(v) => {
                onUpdateSettings({
                  ...s,
                  trustText: {
                    ...s.trustText,
                    text: v,
                  },
                });
              }}
              placeholder="4.9/5 from 2,000+ reviews"
            />
            <ToggleSwitch
              label="Show Star Rating"
              checked={s.trustText?.showRating ?? false}
              onChange={(checked) => {
                onUpdateSettings({
                  ...s,
                  trustText: {
                    ...s.trustText,
                    showRating: checked,
                  },
                });
              }}
            />
          </>
        )}

        <ToggleSwitch
          label="Show Trust Badges"
          checked={s.trustBadges?.enabled ?? false}
          onChange={(checked) => {
            onUpdateSettings({
              ...s,
              trustBadges: {
                ...s.trustBadges,
                enabled: checked,
              },
            });
          }}
        />

        <ToggleSwitch
          label="Show Stats Section"
          checked={s.stats?.enabled ?? false}
          onChange={(checked) => {
            onUpdateSettings({
              ...s,
              stats: {
                ...s.stats,
                enabled: checked,
              },
            });
          }}
        />
      </AccordionSection>

      {/* Button Styles Section */}
      <AccordionSection title="Button Styles" defaultOpen={false}>
        <SelectInput
          label="Primary Button Variant"
          value={s.primaryCTA?.variant || "solid"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              primaryCTA: {
                ...s.primaryCTA,
                variant: v as "solid" | "outline" | "secondary" | "ghost",
              },
            });
          }}
          options={[
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "secondary", label: "Secondary" },
            { value: "ghost", label: "Ghost" },
          ]}
        />
      </AccordionSection>
    </div>
  );
}
