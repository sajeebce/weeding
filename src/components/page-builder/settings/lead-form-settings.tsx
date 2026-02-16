"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import type {
  LeadFormWidgetSettings,
  LeadFormField,
  FormSubmitTo,
} from "@/lib/page-builder/types";
import { DEFAULT_LEAD_FORM_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  TextInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ButtonStyleEditor } from "@/components/admin/button-style-editor";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";

interface TemplateOption {
  id: string;
  name: string;
  description: string | null;
  fields: LeadFormField[];
  isActive: boolean;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  textarea: "Textarea",
  radio: "Radio",
  checkbox: "Checkbox",
  number: "Number",
  date: "Date",
  country_select: "Country",
  service_select: "Service",
};

interface LeadFormWidgetSettingsPanelProps {
  settings: Partial<LeadFormWidgetSettings>;
  onChange: (settings: LeadFormWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function LeadFormWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab = "content",
}: LeadFormWidgetSettingsPanelProps) {
  // Debug: log when the settings panel renders
  console.log("[LeadFormSettings] Rendering, activeTab:", activeTab, "settings:", partialSettings);

  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Merge with defaults
  const settings: LeadFormWidgetSettings = {
    ...DEFAULT_LEAD_FORM_SETTINGS,
    ...partialSettings,
    submitButton: {
      ...DEFAULT_LEAD_FORM_SETTINGS.submitButton,
      ...partialSettings?.submitButton,
    },
    container: { ...DEFAULT_WIDGET_CONTAINER, ...partialSettings?.container },
  };

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      setLoadingTemplates(true);
      try {
        const res = await fetch("/api/admin/lead-form-templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(
            (data.templates || []).filter((t: TemplateOption) => t.isActive)
          );
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    }
    fetchTemplates();
  }, []);

  const updateField = <K extends keyof LeadFormWidgetSettings>(
    key: K,
    value: LeadFormWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateSubmitButton = (
    key: keyof LeadFormWidgetSettings["submitButton"],
    value: unknown
  ) => {
    onChange({
      ...settings,
      submitButton: { ...settings.submitButton, [key]: value },
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) {
      // "None" selected - use default fields
      onChange({
        ...settings,
        templateId: undefined,
        fields: DEFAULT_LEAD_FORM_SETTINGS.fields,
      });
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const mappedFields: LeadFormField[] = (template.fields || []).map(
      (f) => ({
        id: f.id || `f_${Math.random().toString(36).slice(2, 8)}`,
        type: f.type || "text",
        name: f.name || "",
        label: f.label || "",
        placeholder: f.placeholder || "",
        required: f.required || false,
        options: f.options,
        mapToLeadField: f.mapToLeadField,
      })
    );

    onChange({
      ...settings,
      templateId,
      fields: mappedFields,
    });
  };

  const handleSyncFromTemplate = () => {
    if (!settings.templateId) return;
    handleTemplateSelect(settings.templateId);
  };

  // Check if selected template still exists
  const templateExists =
    !settings.templateId ||
    templates.some((t) => t.id === settings.templateId);
  const selectedTemplate = templates.find(
    (t) => t.id === settings.templateId
  );

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Form Header */}
      <AccordionSection title="Form Header" defaultOpen>
        <div className="space-y-3">
          <TextInput
            label="Title"
            value={settings.title || ""}
            onChange={(v) => updateField("title", v)}
            placeholder="Form title..."
          />
          <TextInput
            label="Description"
            value={settings.description || ""}
            onChange={(v) => updateField("description", v)}
            placeholder="Form description..."
          />
        </div>
      </AccordionSection>

      {/* Form Template */}
      <AccordionSection title="Form Template" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Select Template"
            value={settings.templateId || "none"}
            onChange={(v) => handleTemplateSelect(v === "none" ? "" : v)}
            options={[
              {
                value: "none",
                label: loadingTemplates
                  ? "Loading templates..."
                  : "None (use default fields)",
              },
              ...templates.map((t) => ({
                value: t.id,
                label: `${t.name} (${(t.fields || []).length} fields)`,
              })),
            ]}
          />

          {/* Template not found warning */}
          {settings.templateId && !templateExists && !loadingTemplates && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Template no longer exists. Fields shown are from last sync.
              </span>
            </div>
          )}

          {/* Fields preview */}
          {settings.fields.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {settings.fields.length} field
                  {settings.fields.length !== 1 ? "s" : ""}
                  {settings.templateId && selectedTemplate
                    ? ` from "${selectedTemplate.name}"`
                    : " (default)"}
                </span>
              </div>
              <div className="space-y-1 rounded-md border bg-muted/30 p-2">
                {settings.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-4 text-right font-medium text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <span className="flex-1 truncate">{field.label}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0 px-1.5 py-0"
                    >
                      {FIELD_TYPE_LABELS[field.type] || field.type}
                    </Badge>
                    {field.required && (
                      <span className="text-red-500 text-[10px]">*</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Sync button (only when template is selected) */}
              {settings.templateId && templateExists && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleSyncFromTemplate}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Sync from template
                </Button>
              )}
            </div>
          )}

          {/* No templates hint */}
          {!loadingTemplates && templates.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No templates found. Create templates in Admin &gt; Leads &gt;
              Forms.
            </p>
          )}
        </div>
      </AccordionSection>

      {/* Submit Button */}
      <AccordionSection title="Submit Button" defaultOpen>
        <div className="space-y-3">
          <TextInput
            label="Button Text"
            value={settings.submitButton.text}
            onChange={(v) => updateSubmitButton("text", v)}
            placeholder="Submit"
          />
          <ToggleSwitch
            label="Full Width"
            checked={settings.submitButton.fullWidth}
            onChange={(checked) => updateSubmitButton("fullWidth", checked)}
          />
        </div>
      </AccordionSection>

      {/* Success Message */}
      <AccordionSection title="Success Message">
        <TextInput
          label="Message"
          value={settings.successMessage}
          onChange={(v) => updateField("successMessage", v)}
          placeholder="Thank you for your submission!"
        />
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-4">
      {/* Form Layout */}
      <AccordionSection title="Form Layout" defaultOpen>
        <div className="space-y-3">
          <NumberInput
            label="Max Width"
            value={settings.formMaxWidth || 0}
            onChange={(v) => updateField("formMaxWidth", v)}
            min={0}
            max={1200}
            step={20}
            unit="px"
            description="0 = full width"
          />
          <SelectInput
            label="Alignment"
            value={settings.formAlignment || "center"}
            onChange={(v) => updateField("formAlignment", v as "left" | "center" | "right")}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </div>
      </AccordionSection>

      {/* Button Layout */}
      <AccordionSection title="Button Layout">
        <div className="space-y-3">
          <SelectInput
            label="Direction"
            value={settings.buttonLayout || "vertical"}
            onChange={(v) => updateField("buttonLayout", v as "horizontal" | "vertical" | "stacked")}
            options={[
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
              { value: "stacked", label: "Stacked (Full Width)" },
            ]}
          />
          <SelectInput
            label="Alignment"
            value={settings.buttonAlignment || "center"}
            onChange={(v) => updateField("buttonAlignment", v as "left" | "center" | "right")}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <NumberInput
            label="Gap"
            value={settings.buttonGap ?? 12}
            onChange={(v) => updateField("buttonGap", v)}
            min={0}
            max={64}
            step={4}
            unit="px"
          />
          <NumberInput
            label="Button Width"
            value={settings.buttonWidth || 0}
            onChange={(v) => updateField("buttonWidth", v)}
            min={0}
            max={600}
            step={10}
            unit="px"
            description="0 = auto"
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Form Style" defaultOpen>
        <div className="space-y-3">
          <ColorInput
            label="Background Color"
            value={settings.backgroundColor || "#1e293b"}
            onChange={(v) => updateField("backgroundColor", v)}
          />
          <ColorInput
            label="Title Color"
            value={settings.titleColor || "#ffffff"}
            onChange={(v) => updateField("titleColor", v)}
          />
          <ColorInput
            label="Description Color"
            value={settings.descriptionColor || "#94a3b8"}
            onChange={(v) => updateField("descriptionColor", v)}
          />
          <ColorInput
            label="Label Color"
            value={settings.labelColor || "#e2e8f0"}
            onChange={(v) => updateField("labelColor", v)}
          />
          <ColorInput
            label="Input Text Color"
            value={settings.inputTextColor || "#ffffff"}
            onChange={(v) => updateField("inputTextColor", v)}
          />
          <NumberInput
            label="Padding"
            value={settings.padding}
            onChange={(v) => updateField("padding", v)}
            min={0}
            max={64}
            step={4}
            unit="px"
          />
          <NumberInput
            label="Border Radius"
            value={settings.borderRadius}
            onChange={(v) => updateField("borderRadius", v)}
            min={0}
            max={32}
            step={2}
            unit="px"
          />
          <ToggleSwitch
            label="Shadow"
            checked={settings.shadow}
            onChange={(checked) => updateField("shadow", checked)}
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Button Style">
        <ButtonStyleEditor
          style={(settings.submitButton.style as ButtonCustomStyle) || {}}
          onChange={(style: ButtonCustomStyle) =>
            updateSubmitButton("style", style)
          }
          buttonText={settings.submitButton.text || "Submit"}
          showPreview={true}
          showPresets={true}
        />
      </AccordionSection>

      {/* Container Style */}
      <ContainerStyleSection
        container={settings.container || DEFAULT_WIDGET_CONTAINER}
        onChange={(container) => onChange({ ...settings, container })}
      />
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <AccordionSection title="Form Submission" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Submit To"
            value={settings.submitTo}
            onChange={(v) => updateField("submitTo", v as FormSubmitTo)}
            options={[
              { value: "database", label: "Database (Save Locally)" },
              { value: "webhook", label: "Webhook URL" },
              { value: "email", label: "Email" },
            ]}
          />

          {settings.submitTo === "webhook" && (
            <TextInput
              label="Webhook URL"
              value={settings.webhookUrl || ""}
              onChange={(v) => updateField("webhookUrl", v)}
              placeholder="https://..."
              description="URL to send form data to"
            />
          )}

          {settings.submitTo === "email" && (
            <TextInput
              label="Email Address"
              value={settings.emailTo || ""}
              onChange={(v) => updateField("emailTo", v)}
              placeholder="admin@example.com"
              description="Email to receive form submissions"
            />
          )}
        </div>
      </AccordionSection>
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
