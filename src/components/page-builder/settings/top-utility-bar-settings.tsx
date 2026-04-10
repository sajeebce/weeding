"use client";

import { Plus, Trash2 } from "lucide-react";
import type { TopUtilityBarWidgetSettings, TopUtilityBarLink } from "@/lib/page-builder/types";
import { DEFAULT_TOP_UTILITY_BAR_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface TopUtilityBarSettingsPanelProps {
  settings: Partial<TopUtilityBarWidgetSettings>;
  onChange: (settings: TopUtilityBarWidgetSettings) => void;
  activeTab: "content" | "style" | "advanced";
}

function generateId() {
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function TopUtilityBarSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab,
}: TopUtilityBarSettingsPanelProps) {
  const settings: TopUtilityBarWidgetSettings = {
    ...DEFAULT_TOP_UTILITY_BAR_SETTINGS,
    ...partialSettings,
    links: partialSettings.links ?? DEFAULT_TOP_UTILITY_BAR_SETTINGS.links,
  };

  const update = <K extends keyof TopUtilityBarWidgetSettings>(
    key: K,
    value: TopUtilityBarWidgetSettings[K]
  ) => onChange({ ...settings, [key]: value });

  const updateLink = (id: string, patch: Partial<TopUtilityBarLink>) =>
    update("links", settings.links.map((l) => l.id === id ? { ...l, ...patch } : l));

  const removeLink = (id: string) =>
    update("links", settings.links.filter((l) => l.id !== id));

  const addLink = () => {
    update("links", [
      ...settings.links,
      { id: generateId(), label: "New Link", href: "#", showIcon: false, icon: "" },
    ]);
  };

  if (activeTab === "content") {
    // Split: first link is the "Text / Vendor" section, rest are in Links
    const [firstLink, ...restLinks] = settings.links;

    return (
      <div className="space-y-3">

        {/* Text section — first link (featured, e.g. "ARE YOU A VENDOR?") */}
        {firstLink && (
          <AccordionSection title="Text" defaultOpen>
            <div className="space-y-3">
              <TextInput
                label="Label"
                value={firstLink.label}
                onChange={(v) => updateLink(firstLink.id, { label: v })}
              />
              <TextInput
                label="Link (href)"
                value={firstLink.href}
                onChange={(v) => updateLink(firstLink.id, { href: v })}
              />
              <ToggleSwitch
                label="Show Icon"
                checked={firstLink.showIcon}
                onChange={(v) => updateLink(firstLink.id, { showIcon: v })}
              />
              {firstLink.showIcon && (
                <TextInput
                  label="Icon (Lucide name)"
                  value={firstLink.icon}
                  onChange={(v) => updateLink(firstLink.id, { icon: v })}
                />
              )}
            </div>
          </AccordionSection>
        )}

        {/* Links section — remaining links */}
        <AccordionSection title="Links" defaultOpen={restLinks.length > 0}>
          <div className="space-y-2">
            {restLinks.map((link, idx) => (
              <AccordionSection
                key={link.id}
                title={link.label || `Link ${idx + 2}`}
                defaultOpen={false}
                action={{
                  label: "",
                  icon: Trash2,
                  onClick: () => removeLink(link.id),
                }}
              >
                <div className="space-y-3">
                  <TextInput
                    label="Label"
                    value={link.label}
                    onChange={(v) => updateLink(link.id, { label: v })}
                  />
                  <TextInput
                    label="Link (href)"
                    value={link.href}
                    onChange={(v) => updateLink(link.id, { href: v })}
                  />
                  <ToggleSwitch
                    label="Show Icon"
                    checked={link.showIcon}
                    onChange={(v) => updateLink(link.id, { showIcon: v })}
                  />
                  {link.showIcon && (
                    <TextInput
                      label="Icon (Lucide name)"
                      value={link.icon}
                      onChange={(v) => updateLink(link.id, { icon: v })}
                    />
                  )}
                </div>
              </AccordionSection>
            ))}

            <button
              onClick={addLink}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </button>
          </div>
        </AccordionSection>

      </div>
    );
  }

  if (activeTab === "style") {
    return (
      <div className="space-y-3">
        <AccordionSection title="Background" defaultOpen>
          <div className="space-y-3">
            <ColorInput
              label="Gradient Start"
              value={settings.gradientFrom}
              onChange={(v) => update("gradientFrom", v)}
            />
            <ColorInput
              label="Gradient End"
              value={settings.gradientTo}
              onChange={(v) => update("gradientTo", v)}
            />
            <NumberInput
              label="Angle"
              value={settings.gradientAngle}
              onChange={(v) => update("gradientAngle", v)}
              min={0}
              max={360}
              step={5}
              unit="°"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Border">
          <div className="space-y-3">
            <ToggleSwitch
              label="Show Bottom Border"
              checked={settings.showBorderBottom}
              onChange={(v) => update("showBorderBottom", v)}
            />
            {settings.showBorderBottom && (
              <ColorInput
                label="Border Color"
                value={settings.borderBottomColor}
                onChange={(v) => update("borderBottomColor", v)}
              />
            )}
          </div>
        </AccordionSection>

        <AccordionSection title="Typography & Colors">
          <div className="space-y-3">
            <ColorInput
              label="Text Color"
              value={settings.textColor}
              onChange={(v) => update("textColor", v)}
            />
            <ColorInput
              label="Hover Color"
              value={settings.hoverColor}
              onChange={(v) => update("hoverColor", v)}
            />
            <NumberInput
              label="Font Size"
              value={settings.fontSize}
              onChange={(v) => update("fontSize", v)}
              min={10}
              max={20}
              unit="px"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Spacing">
          <div className="space-y-3">
            <NumberInput
              label="Height"
              value={settings.height}
              onChange={(v) => update("height", v)}
              min={28}
              max={80}
              unit="px"
            />
            <NumberInput
              label="Horizontal Padding"
              value={settings.paddingX}
              onChange={(v) => update("paddingX", v)}
              min={0}
              max={128}
              unit="px"
            />
            <NumberInput
              label="Gap between links"
              value={settings.gap}
              onChange={(v) => update("gap", v)}
              min={4}
              max={64}
              unit="px"
            />
          </div>
        </AccordionSection>
      </div>
    );
  }

  return null;
}
