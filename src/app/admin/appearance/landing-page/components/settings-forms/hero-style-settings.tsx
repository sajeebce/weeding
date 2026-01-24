"use client";

import { useCallback } from "react";
import { Paintbrush, Image as ImageIcon, Palette, Grid, Circle } from "lucide-react";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import { AccordionSection } from "../ui/accordion-section";
import {
  TextInput,
  SelectInput,
  ColorPicker,
  SliderInput,
  ToggleSwitch,
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
    badge: { ...defaultHeroSettings.badge, ...settings?.badge },
    headline: { ...defaultHeroSettings.headline, ...settings?.headline },
    subheadline: { ...defaultHeroSettings.subheadline, ...settings?.subheadline },
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

      {/* Badge Style */}
      <AccordionSection title="Badge Style" defaultOpen={false}>
        <ColorPicker
          label="Background Color"
          value={s.badge?.bgColor || "#f9731933"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              badge: {
                ...s.badge,
                bgColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Text Color"
          value={s.badge?.textColor || "#fb923c"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              badge: {
                ...s.badge,
                textColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Border Color"
          value={s.badge?.borderColor || "#f9731980"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              badge: {
                ...s.badge,
                borderColor: v,
              },
            });
          }}
        />
      </AccordionSection>

      {/* Headline Style */}
      <AccordionSection title="Headline Style" defaultOpen={false}>
        <ColorPicker
          label="Text Color"
          value={s.headline?.color || "#ffffff"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              headline: {
                ...s.headline,
                color: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Highlight Color"
          value={s.headline?.highlightColor || "#f97316"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              headline: {
                ...s.headline,
                highlightColor: v,
              },
            });
          }}
        />
      </AccordionSection>

      {/* Subheadline Style */}
      <AccordionSection title="Subheadline Style" defaultOpen={false}>
        <ColorPicker
          label="Text Color"
          value={s.subheadline?.color || "#94a3b8"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              subheadline: {
                ...s.subheadline,
                color: v,
              },
            });
          }}
        />
      </AccordionSection>

      {/* Trust Text Style */}
      <AccordionSection title="Trust Text Style" defaultOpen={false}>
        <ColorPicker
          label="Text Color"
          value={s.trustText?.textColor || "#9ca3af"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              trustText: {
                ...s.trustText,
                textColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Star Color"
          value={s.trustText?.starColor || "#facc15"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              trustText: {
                ...s.trustText,
                starColor: v,
              },
            });
          }}
        />
      </AccordionSection>

      {/* Trust Badges Style */}
      <AccordionSection title="Trust Badges Style" defaultOpen={false}>
        <ColorPicker
          label="Icon Color"
          value={s.trustBadges?.iconColor || "#f97316"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              trustBadges: {
                ...s.trustBadges,
                iconColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Text Color"
          value={s.trustBadges?.textColor || "#ffffff"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              trustBadges: {
                ...s.trustBadges,
                textColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Background Color"
          value={s.trustBadges?.bgColor || "#1e293b"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              trustBadges: {
                ...s.trustBadges,
                bgColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Border Color"
          value={s.trustBadges?.borderColor || "#334155"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              trustBadges: {
                ...s.trustBadges,
                borderColor: v,
              },
            });
          }}
        />
      </AccordionSection>

      {/* Stats Style */}
      <AccordionSection title="Stats Style" defaultOpen={false}>
        <ColorPicker
          label="Value Color"
          value={s.stats?.valueColor || "#f97316"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              stats: {
                ...s.stats,
                valueColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Label Color"
          value={s.stats?.labelColor || "#9ca3af"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              stats: {
                ...s.stats,
                labelColor: v,
              },
            });
          }}
        />
        <ColorPicker
          label="Divider Color"
          value={s.stats?.dividerColor || "#334155"}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              stats: {
                ...s.stats,
                dividerColor: v,
              },
            });
          }}
        />
        <ToggleSwitch
          label="Counting Animation"
          description="Numbers animate from 0 to value on page load"
          checked={s.stats?.animateCount ?? true}
          onChange={(checked) => {
            onUpdateSettings({
              ...s,
              stats: {
                ...s.stats,
                animateCount: checked,
              },
            });
          }}
        />
      </AccordionSection>
    </div>
  );
}
