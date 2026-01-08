"use client";

import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings, HeroVariant, DashboardVisualSettings } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import { AccordionSection } from "../ui/accordion-section";
import {
  SelectInput,
  ToggleSwitch,
  TextInput,
} from "../ui/form-controls";

interface HeroAdvancedSettingsProps {
  block: LandingPageBlock;
  settings: HeroSettings;
  onUpdateSettings: (settings: HeroSettings) => void;
}

export function HeroAdvancedSettings({
  block,
  settings,
  onUpdateSettings,
}: HeroAdvancedSettingsProps) {
  // Merge with defaults
  const s: HeroSettings = {
    ...defaultHeroSettings,
    ...settings,
  };

  return (
    <div className="space-y-2">
      {/* Layout Section */}
      <AccordionSection title="Layout">
        <SelectInput
          label="Hero Variant"
          value={s.variant}
          onChange={(v) => {
            onUpdateSettings({
              ...s,
              variant: v as HeroVariant,
            });
          }}
          options={[
            { value: "centered", label: "Centered" },
            { value: "split", label: "Split (Image Right)" },
            { value: "split-dashboard", label: "Split Dashboard" },
            { value: "minimal", label: "Minimal" },
          ]}
          description="Choose the layout style for your hero section"
        />
      </AccordionSection>

      {/* Visual Settings (for split variants) */}
      {(s.variant === "split" || s.variant === "split-dashboard") && (
        <AccordionSection title="Visual Settings">
          <SelectInput
            label="Position"
            value={s.visual?.position || "right"}
            onChange={(v) => {
              onUpdateSettings({
                ...s,
                visual: {
                  type: s.visual?.type || "image",
                  position: v as "left" | "right",
                  url: s.visual?.url,
                  alt: s.visual?.alt,
                  dashboardPreset: s.visual?.dashboardPreset,
                },
              });
            }}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />

          {s.variant === "split-dashboard" && (
            <SelectInput
              label="Dashboard Preset"
              value={s.visual?.dashboardPreset?.preset || "analytics"}
              onChange={(v) => {
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
                onUpdateSettings({
                  ...s,
                  visual: {
                    type: "dashboard-preset",
                    position: s.visual?.position || "right",
                    dashboardPreset: {
                      ...(s.visual?.dashboardPreset || defaultPreset),
                      preset: v as "analytics" | "ecommerce" | "saas" | "crm" | "custom",
                    },
                  },
                });
              }}
              options={[
                { value: "analytics", label: "Analytics Dashboard" },
                { value: "ecommerce", label: "E-commerce Dashboard" },
                { value: "saas", label: "SaaS Dashboard" },
                { value: "crm", label: "CRM Dashboard" },
              ]}
            />
          )}

          {s.variant === "split" && (
            <TextInput
              label="Image URL"
              value={s.visual?.url || ""}
              onChange={(v) => {
                onUpdateSettings({
                  ...s,
                  visual: {
                    type: "image",
                    position: s.visual?.position || "right",
                    url: v,
                    alt: s.visual?.alt,
                  },
                });
              }}
              placeholder="/images/hero-image.jpg"
            />
          )}
        </AccordionSection>
      )}

      {/* Responsive Section */}
      <AccordionSection title="Responsive" defaultOpen={false}>
        <ToggleSwitch
          label="Hide on Desktop"
          description="Don't show this block on desktop"
          checked={block.hideOnDesktop}
          onChange={() => {}}
        />
        <ToggleSwitch
          label="Hide on Mobile"
          description="Don't show this block on mobile"
          checked={block.hideOnMobile}
          onChange={() => {}}
        />
      </AccordionSection>
    </div>
  );
}
