"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import type {
  ButtonGroupWidgetSettings,
  ButtonGroupButton,
} from "@/lib/page-builder/types";
import { DEFAULT_BUTTON_GROUP_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  TextInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Button } from "@/components/ui/button";
import { ButtonStyleEditor } from "@/components/admin/button-style-editor";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";

interface ButtonGroupWidgetSettingsPanelProps {
  settings: Partial<ButtonGroupWidgetSettings>;
  onChange: (settings: ButtonGroupWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function ButtonGroupWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab = "content",
}: ButtonGroupWidgetSettingsPanelProps) {
  const settings: ButtonGroupWidgetSettings = {
    ...DEFAULT_BUTTON_GROUP_SETTINGS,
    ...partialSettings,
  };

  const updateField = <K extends keyof ButtonGroupWidgetSettings>(
    key: K,
    value: ButtonGroupWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateButton = (index: number, updates: Partial<ButtonGroupButton>) => {
    const newButtons = [...settings.buttons];
    newButtons[index] = { ...newButtons[index], ...updates };
    onChange({ ...settings, buttons: newButtons });
  };

  const addButton = () => {
    const newBtn: ButtonGroupButton = {
      id: `btn_${Math.random().toString(36).slice(2, 8)}`,
      text: "Button",
      link: "#",
      style: {
        bgColor: "#F97316",
        textColor: "#ffffff",
        borderRadius: 8,
        hoverEffect: "shadow-lift",
      },
    };
    onChange({ ...settings, buttons: [...settings.buttons, newBtn] });
  };

  const removeButton = (index: number) => {
    const newButtons = settings.buttons.filter((_, i) => i !== index);
    onChange({ ...settings, buttons: newButtons });
  };

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {settings.buttons.map((btn, index) => (
        <AccordionSection
          key={btn.id}
          title={`Button ${index + 1}: ${btn.text}`}
          defaultOpen={index === 0}
        >
          <div className="space-y-3">
            <TextInput
              label="Button Text"
              value={btn.text}
              onChange={(v) => updateButton(index, { text: v })}
              placeholder="Click me"
            />
            <TextInput
              label="Link URL"
              value={btn.link}
              onChange={(v) => updateButton(index, { link: v })}
              placeholder="/services/llc-formation"
            />
            <ToggleSwitch
              label="Open in new tab"
              checked={btn.openInNewTab || false}
              onChange={(checked) =>
                updateButton(index, { openInNewTab: checked })
              }
            />

            <div className="mt-3 pt-3 border-t">
              <ButtonStyleEditor
                style={(btn.style as ButtonCustomStyle) || {}}
                onChange={(style: ButtonCustomStyle) =>
                  updateButton(index, { style })
                }
                buttonText={btn.text || "Button"}
                showPreview={true}
                showPresets={true}
                compact={true}
              />
            </div>

            {settings.buttons.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => removeButton(index)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove Button
              </Button>
            )}
          </div>
        </AccordionSection>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={addButton}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Button
      </Button>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-4">
      <AccordionSection title="Layout" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Direction"
            value={settings.layout}
            onChange={(v) =>
              updateField(
                "layout",
                v as ButtonGroupWidgetSettings["layout"]
              )
            }
            options={[
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
              { value: "stacked", label: "Stacked (Full Width)" },
            ]}
          />
          <SelectInput
            label="Alignment"
            value={settings.alignment}
            onChange={(v) =>
              updateField(
                "alignment",
                v as ButtonGroupWidgetSettings["alignment"]
              )
            }
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <NumberInput
            label="Gap"
            value={settings.gap}
            onChange={(v) => updateField("gap", v)}
            min={0}
            max={64}
            step={4}
            unit="px"
          />
        </div>
      </AccordionSection>
    </div>
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
    </>
  );
}
