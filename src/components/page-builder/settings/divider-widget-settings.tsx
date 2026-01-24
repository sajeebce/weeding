"use client";

import type { DividerWidgetSettings, DividerStyle } from "@/lib/page-builder/types";
import { DEFAULT_DIVIDER_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface DividerWidgetSettingsPanelProps {
  settings: Partial<DividerWidgetSettings>;
  onChange: (settings: DividerWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
}

export function DividerWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
}: DividerWidgetSettingsPanelProps) {
  // Merge with defaults
  const settings: DividerWidgetSettings = {
    ...DEFAULT_DIVIDER_SETTINGS,
    ...partialSettings,
  };

  const updateField = <K extends keyof DividerWidgetSettings>(
    key: K,
    value: DividerWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  // Content Tab
  if (activeTab === "content") {
    return (
      <div className="space-y-4">
        <SelectInput
          label="Divider Style"
          value={settings.style}
          onChange={(v) => updateField("style", v as DividerStyle)}
          options={[
            { value: "solid", label: "Solid Line" },
            { value: "dashed", label: "Dashed Line" },
            { value: "dotted", label: "Dotted Line" },
            { value: "gradient", label: "Gradient" },
            { value: "gradient-fade", label: "Gradient Fade" },
            { value: "double", label: "Double Line" },
            { value: "with-icon", label: "With Icon" },
            { value: "with-text", label: "With Text" },
          ]}
        />

        {/* Icon settings */}
        {settings.style === "with-icon" && (
          <AccordionSection title="Icon Settings" defaultOpen>
            <div className="space-y-3">
              <TextInput
                label="Icon Name"
                value={settings.icon || "Minus"}
                onChange={(v) => updateField("icon", v)}
                placeholder="Lucide icon name (e.g., Star, Heart)"
                description="Use any Lucide icon name"
              />
              <NumberInput
                label="Icon Size"
                value={settings.iconSize || 20}
                onChange={(v) => updateField("iconSize", v)}
                min={12}
                max={48}
                step={2}
                unit="px"
              />
              <ColorInput
                label="Icon Color"
                value={settings.iconColor || "#64748b"}
                onChange={(v) => updateField("iconColor", v)}
              />
            </div>
          </AccordionSection>
        )}

        {/* Text settings */}
        {settings.style === "with-text" && (
          <AccordionSection title="Text Settings" defaultOpen>
            <div className="space-y-3">
              <TextInput
                label="Text"
                value={settings.text || "OR"}
                onChange={(v) => updateField("text", v)}
                placeholder="Enter text"
              />
              <SelectInput
                label="Text Size"
                value={settings.textSize || "sm"}
                onChange={(v) => updateField("textSize", v as "sm" | "md" | "lg")}
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
              <ColorInput
                label="Text Color"
                value={settings.textColor || "#64748b"}
                onChange={(v) => updateField("textColor", v)}
              />
              <ColorInput
                label="Text Background"
                value={settings.textBackground || "#0f172a"}
                onChange={(v) => updateField("textBackground", v)}
              />
            </div>
          </AccordionSection>
        )}
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Line Style" defaultOpen>
          <div className="space-y-3">
            <ColorInput
              label="Primary Color"
              value={settings.color}
              onChange={(v) => updateField("color", v)}
            />

            {(settings.style === "gradient") && (
              <ColorInput
                label="Secondary Color"
                value={settings.secondaryColor || "#0f172a"}
                onChange={(v) => updateField("secondaryColor", v)}
              />
            )}

            <NumberInput
              label="Width"
              value={settings.width}
              onChange={(v) => updateField("width", v)}
              min={10}
              max={100}
              step={5}
              unit="%"
            />

            <NumberInput
              label="Thickness"
              value={settings.thickness}
              onChange={(v) => updateField("thickness", v)}
              min={1}
              max={10}
              step={1}
              unit="px"
            />

            <SelectInput
              label="Alignment"
              value={settings.alignment}
              onChange={(v) => updateField("alignment", v as "left" | "center" | "right")}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Spacing">
          <NumberInput
            label="Vertical Spacing"
            value={settings.spacing}
            onChange={(v) => updateField("spacing", v)}
            min={0}
            max={100}
            step={4}
            unit="px"
          />
        </AccordionSection>
      </div>
    );
  }

  // Advanced Tab - empty for now, handled by common spacing
  return null;
}
