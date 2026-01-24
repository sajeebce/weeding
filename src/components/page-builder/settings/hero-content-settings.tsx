"use client";

import { useCallback } from "react";
import type { HeroContentWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_HERO_CONTENT_SETTINGS } from "@/lib/page-builder/defaults";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import {
  TextInput,
  TextAreaInput,
  LinkInput,
  ToggleSwitch,
  SelectInput,
  ColorInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { FeatureListEditor } from "@/app/admin/appearance/landing-page/components/ui/feature-list-editor";
import { ButtonStyleEditor } from "@/components/admin/button-style-editor";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";

interface HeroContentWidgetSettingsProps {
  settings: HeroContentWidgetSettings;
  onChange: (settings: HeroContentWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function HeroContentWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: HeroContentWidgetSettingsProps) {
  // Merge with defaults
  const s: HeroContentWidgetSettings = {
    ...DEFAULT_HERO_CONTENT_SETTINGS,
    ...settings,
    badge: { ...DEFAULT_HERO_CONTENT_SETTINGS.badge, ...settings?.badge },
    headline: { ...DEFAULT_HERO_CONTENT_SETTINGS.headline, ...settings?.headline },
    subheadline: { ...DEFAULT_HERO_CONTENT_SETTINGS.subheadline, ...settings?.subheadline },
    features: { ...DEFAULT_HERO_CONTENT_SETTINGS.features, ...settings?.features },
    primaryButton: { ...DEFAULT_HERO_CONTENT_SETTINGS.primaryButton, ...settings?.primaryButton },
    secondaryButton: { ...DEFAULT_HERO_CONTENT_SETTINGS.secondaryButton, ...settings?.secondaryButton },
    trustText: { ...DEFAULT_HERO_CONTENT_SETTINGS.trustText, ...settings?.trustText },
  };

  const updateNested = useCallback(
    <K extends keyof HeroContentWidgetSettings>(
      parentKey: K,
      childKey: string,
      value: unknown
    ) => {
      const parent = s[parentKey];
      if (typeof parent === "object" && parent !== null) {
        onChange({
          ...s,
          [parentKey]: {
            ...parent,
            [childKey]: value,
          },
        });
      }
    },
    [s, onChange]
  );

  // Content Tab - Only content, no styling
  const renderContentTab = () => (
    <div className="space-y-3">
      {/* Badge Section */}
      <AccordionSection title="Badge">
        <ToggleSwitch
          label="Show Badge"
          checked={s.badge.show}
          onChange={(checked) => updateNested("badge", "show", checked)}
        />
        {s.badge.show && (
          <>
            <TextInput
              label="Text"
              value={s.badge.text}
              onChange={(v) => updateNested("badge", "text", v)}
              placeholder="Badge text..."
            />
            <TextInput
              label="Icon"
              value={s.badge.icon}
              onChange={(v) => updateNested("badge", "icon", v)}
              placeholder="Flag"
              description="Lucide icon name (e.g., Flag, Star, Zap)"
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
          value={s.headline.highlightWords}
          onChange={(v) => updateNested("headline", "highlightWords", v)}
          placeholder="US LLC, 24 Hours"
          description="Separate multiple words with comma"
        />
      </AccordionSection>

      {/* Subheadline Section */}
      <AccordionSection title="Subheadline">
        <ToggleSwitch
          label="Show Subheadline"
          checked={s.subheadline.show}
          onChange={(checked) => updateNested("subheadline", "show", checked)}
        />
        {s.subheadline.show && (
          <TextAreaInput
            label="Text"
            value={s.subheadline.text}
            onChange={(v) => updateNested("subheadline", "text", v)}
            placeholder="Your supporting text here..."
            rows={3}
          />
        )}
      </AccordionSection>

      {/* Features Section */}
      <AccordionSection title="Features List">
        <FeatureListEditor
          enabled={s.features.show}
          items={s.features.items}
          onEnabledChange={(enabled) => updateNested("features", "show", enabled)}
          onItemsChange={(items) => updateNested("features", "items", items)}
        />
      </AccordionSection>

      {/* Primary Button Section */}
      <AccordionSection title="Primary Button">
        <ToggleSwitch
          label="Show Primary Button"
          checked={s.primaryButton.show}
          onChange={(checked) => updateNested("primaryButton", "show", checked)}
        />
        {s.primaryButton.show && (
          <>
            <TextInput
              label="Button Text"
              value={s.primaryButton.text}
              onChange={(v) => updateNested("primaryButton", "text", v)}
              placeholder="Get Started"
            />
            <LinkInput
              label="Link URL"
              value={s.primaryButton.link}
              onChange={(v) => updateNested("primaryButton", "link", v)}
              placeholder="/checkout"
              openInNewTab={s.primaryButton.openInNewTab}
              onOpenInNewTabChange={(v) => updateNested("primaryButton", "openInNewTab", v)}
            />
            <TextInput
              label="Badge Text (optional)"
              value={s.primaryButton.badge || ""}
              onChange={(v) => updateNested("primaryButton", "badge", v)}
              placeholder="From $199"
            />

            {/* Button Style Editor */}
            <div className="mt-4 pt-4 border-t">
              <ButtonStyleEditor
                style={(s.primaryButton.style as ButtonCustomStyle) || {}}
                onChange={(style: ButtonCustomStyle) => updateNested("primaryButton", "style", style)}
                buttonText={s.primaryButton.text || "Button"}
                showPreview={true}
                showPresets={true}
                compact={true}
              />
            </div>
          </>
        )}
      </AccordionSection>

      {/* Secondary Button Section */}
      <AccordionSection title="Secondary Button">
        <ToggleSwitch
          label="Show Secondary Button"
          checked={s.secondaryButton.show}
          onChange={(checked) => updateNested("secondaryButton", "show", checked)}
        />
        {s.secondaryButton.show && (
          <>
            <TextInput
              label="Button Text"
              value={s.secondaryButton.text}
              onChange={(v) => updateNested("secondaryButton", "text", v)}
              placeholder="Learn More"
            />
            <LinkInput
              label="Link URL"
              value={s.secondaryButton.link}
              onChange={(v) => updateNested("secondaryButton", "link", v)}
              placeholder="/about"
              openInNewTab={s.secondaryButton.openInNewTab}
              onOpenInNewTabChange={(v) => updateNested("secondaryButton", "openInNewTab", v)}
            />
            <SelectInput
              label="Button Style"
              value={s.secondaryButton.style}
              onChange={(v) => updateNested("secondaryButton", "style", v)}
              options={[
                { value: "outline", label: "Outline" },
                { value: "ghost", label: "Ghost" },
                { value: "link", label: "Link" },
              ]}
            />
          </>
        )}
      </AccordionSection>

      {/* Trust Text Section */}
      <AccordionSection title="Trust Text">
        <ToggleSwitch
          label="Show Trust Text"
          checked={s.trustText.show}
          onChange={(checked) => updateNested("trustText", "show", checked)}
        />
        {s.trustText.show && (
          <>
            <TextInput
              label="Text"
              value={s.trustText.text}
              onChange={(v) => updateNested("trustText", "text", v)}
              placeholder="4.9/5 from 500+ reviews"
            />
            <TextInput
              label="Rating"
              value={s.trustText.rating.toString()}
              onChange={(v) => updateNested("trustText", "rating", parseFloat(v) || 0)}
              placeholder="4.9"
            />
          </>
        )}
      </AccordionSection>
    </div>
  );

  // Style Tab - Additional styling options
  const renderStyleTab = () => (
    <div className="space-y-3">
      {/* Alignment */}
      <SelectInput
        label="Content Alignment"
        value={s.alignment}
        onChange={(v) => onChange({ ...s, alignment: v as "left" | "center" | "right" })}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
      />

      {/* Badge Style */}
      {s.badge.show && (
        <AccordionSection title="Badge Style">
          <SelectInput
            label="Style"
            value={s.badge.style}
            onChange={(v) => updateNested("badge", "style", v)}
            options={[
              { value: "pill", label: "Pill" },
              { value: "outline", label: "Outline" },
              { value: "solid", label: "Solid" },
            ]}
          />
          <ColorInput
            label="Background Color"
            value={s.badge.bgColor || "#f9731933"}
            onChange={(v) => updateNested("badge", "bgColor", v)}
          />
          <ColorInput
            label="Text Color"
            value={s.badge.textColor || "#fb923c"}
            onChange={(v) => updateNested("badge", "textColor", v)}
          />
          <ColorInput
            label="Border Color"
            value={s.badge.borderColor || "#f9731980"}
            onChange={(v) => updateNested("badge", "borderColor", v)}
          />
        </AccordionSection>
      )}

      {/* Headline Style */}
      <AccordionSection title="Headline Style">
        <SelectInput
          label="Size"
          value={s.headline.size}
          onChange={(v) => updateNested("headline", "size", v)}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra Large" },
          ]}
        />
        <ColorInput
          label="Highlight Color"
          value={s.headline.highlightColor}
          onChange={(v) => updateNested("headline", "highlightColor", v)}
        />
      </AccordionSection>

      {/* Features Style */}
      {s.features.show && (
        <AccordionSection title="Features Style">
          <SelectInput
            label="Layout"
            value={s.features.layout}
            onChange={(v) => updateNested("features", "layout", v)}
            options={[
              { value: "list", label: "List" },
              { value: "grid", label: "Grid" },
            ]}
          />
          <SelectInput
            label="Icon Position"
            value={s.features.iconPosition || "left"}
            onChange={(v) => updateNested("features", "iconPosition", v)}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
          <ColorInput
            label="Icon Color"
            value={s.features.iconColor}
            onChange={(v) => updateNested("features", "iconColor", v)}
          />
          {s.features.layout === "grid" && (
            <SelectInput
              label="Columns"
              value={s.features.columns?.toString() || "2"}
              onChange={(v) => updateNested("features", "columns", parseInt(v))}
              options={[
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
              ]}
            />
          )}
        </AccordionSection>
      )}

      {/* Trust Text Style */}
      {s.trustText.show && (
        <AccordionSection title="Trust Text Style">
          <ColorInput
            label="Text Color"
            value={s.trustText.textColor || "#9ca3af"}
            onChange={(v) => updateNested("trustText", "textColor", v)}
          />
          <ColorInput
            label="Star Color"
            value={s.trustText.starColor || "#facc15"}
            onChange={(v) => updateNested("trustText", "starColor", v)}
          />
        </AccordionSection>
      )}
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center py-4">
        Advanced settings coming soon.
      </p>
    </div>
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
