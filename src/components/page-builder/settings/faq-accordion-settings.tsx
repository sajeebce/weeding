"use client";

import type { FaqAccordionWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_FAQ_ACCORDION_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  TextInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface FaqAccordionWidgetSettingsPanelProps {
  settings: Partial<FaqAccordionWidgetSettings>;
  onChange: (settings: FaqAccordionWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
}

const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "pricing", label: "Pricing & Payments" },
  { value: "international", label: "International" },
  { value: "account", label: "Account & Support" },
];

export function FaqAccordionWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
}: FaqAccordionWidgetSettingsPanelProps) {
  const settings: FaqAccordionWidgetSettings = {
    ...DEFAULT_FAQ_ACCORDION_SETTINGS,
    ...partialSettings,
    header: {
      ...DEFAULT_FAQ_ACCORDION_SETTINGS.header,
      ...partialSettings?.header,
    },
  };

  const updateField = <K extends keyof FaqAccordionWidgetSettings>(
    key: K,
    value: FaqAccordionWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateHeader = (
    key: keyof FaqAccordionWidgetSettings["header"],
    value: string | boolean
  ) => {
    onChange({
      ...settings,
      header: { ...settings.header, [key]: value },
    });
  };

  // Content Tab
  if (activeTab === "content") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Header" defaultOpen>
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Header"
              checked={settings.header.show}
              onChange={(v) => updateHeader("show", v)}
            />
            {settings.header.show && (
              <>
                <TextInput
                  label="Heading"
                  value={settings.header.heading}
                  onChange={(v) => updateHeader("heading", v)}
                  placeholder="Frequently Asked Questions"
                />
                <TextInput
                  label="Description"
                  value={settings.header.description}
                  onChange={(v) => updateHeader("description", v)}
                  placeholder="Get answers to common questions"
                />
                <SelectInput
                  label="Alignment"
                  value={settings.header.alignment}
                  onChange={(v) =>
                    updateHeader("alignment", v)
                  }
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                  ]}
                />
              </>
            )}
          </div>
        </AccordionSection>

        <AccordionSection title="Data Source" defaultOpen>
          <div className="space-y-3">
            <SelectInput
              label="Show FAQs"
              value={settings.source}
              onChange={(v) =>
                updateField("source", v as "all" | "category")
              }
              options={[
                { value: "all", label: "All Categories" },
                { value: "category", label: "Specific Categories" },
              ]}
            />
            {settings.source === "category" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Select Categories
                </label>
                <div className="space-y-1.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = settings.categories.includes(cat.value);
                    return (
                      <label
                        key={cat.value}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const next = isSelected
                              ? settings.categories.filter(
                                  (c) => c !== cat.value
                                )
                              : [...settings.categories, cat.value];
                            updateField("categories", next);
                          }}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <NumberInput
              label="Max Items"
              value={settings.maxItems}
              onChange={(v) => updateField("maxItems", v)}
              min={1}
              max={50}
              step={1}
              description="Maximum number of FAQs to display"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Behavior">
          <div className="space-y-3">
            <ToggleSwitch
              label="Expand First Item"
              description="Automatically expand the first FAQ on load"
              checked={settings.expandFirst}
              onChange={(v) => updateField("expandFirst", v)}
            />
            <ToggleSwitch
              label="Allow Multiple Open"
              description="Let users open multiple FAQs at once"
              checked={settings.allowMultipleOpen}
              onChange={(v) => updateField("allowMultipleOpen", v)}
            />
            <ToggleSwitch
              label="Show Category Tabs"
              description="Display category filter tabs above FAQs"
              checked={settings.showCategoryFilter}
              onChange={(v) => updateField("showCategoryFilter", v)}
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  // Style Tab
  if (activeTab === "style") {
    return (
      <div className="space-y-4">
        <AccordionSection title="Accordion Style" defaultOpen>
          <div className="space-y-3">
            <SelectInput
              label="Style Variant"
              value={settings.style}
              onChange={(v) =>
                updateField("style", v as "minimal" | "cards" | "bordered")
              }
              options={[
                { value: "minimal", label: "Minimal (Stripe-like)" },
                { value: "cards", label: "Cards (Premium)" },
                { value: "bordered", label: "Bordered (Numbered)" },
              ]}
            />
            <ColorInput
              label="Accent Color"
              value={settings.accentColor}
              onChange={(v) => updateField("accentColor", v)}
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  // Advanced Tab - common spacing is handled automatically
  return null;
}
