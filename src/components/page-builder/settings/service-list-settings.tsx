"use client";

import { useCallback } from "react";
import type { ServiceListWidgetSettings } from "@/lib/page-builder/types";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";
import { DEFAULT_SERVICE_LIST_SETTINGS } from "@/lib/page-builder/defaults";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import {
  TextInput,
  TextAreaInput,
  LinkInput,
  ToggleSwitch,
  SelectInput,
  ColorInput,
  NumberInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ButtonStyleEditor } from "@/components/admin/button-style-editor";

interface ServiceListWidgetSettingsProps {
  settings: ServiceListWidgetSettings;
  onChange: (settings: ServiceListWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function ServiceListWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: ServiceListWidgetSettingsProps) {
  // Merge with defaults
  const s: ServiceListWidgetSettings = {
    ...DEFAULT_SERVICE_LIST_SETTINGS,
    ...settings,
    header: { ...DEFAULT_SERVICE_LIST_SETTINGS.header, ...settings?.header },
    filters: { ...DEFAULT_SERVICE_LIST_SETTINGS.filters, ...settings?.filters },
    layout: { ...DEFAULT_SERVICE_LIST_SETTINGS.layout, ...settings?.layout },
    categoryCard: {
      ...DEFAULT_SERVICE_LIST_SETTINGS.categoryCard,
      ...settings?.categoryCard,
    },
    serviceItem: {
      ...DEFAULT_SERVICE_LIST_SETTINGS.serviceItem,
      ...settings?.serviceItem,
    },
    cta: { ...DEFAULT_SERVICE_LIST_SETTINGS.cta, ...settings?.cta },
    responsive: {
      ...DEFAULT_SERVICE_LIST_SETTINGS.responsive,
      ...settings?.responsive,
    },
  };

  const updateNested = useCallback(
    <K extends keyof ServiceListWidgetSettings>(
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

  const updateDeepNested = useCallback(
    <K extends keyof ServiceListWidgetSettings>(
      parentKey: K,
      childKey: string,
      grandchildKey: string,
      value: unknown
    ) => {
      const parent = s[parentKey] as Record<string, unknown>;
      const child = parent[childKey] as Record<string, unknown>;
      if (typeof parent === "object" && parent !== null && typeof child === "object" && child !== null) {
        onChange({
          ...s,
          [parentKey]: {
            ...parent,
            [childKey]: {
              ...child,
              [grandchildKey]: value,
            },
          },
        });
      }
    },
    [s, onChange]
  );

  // ============================================
  // CONTENT TAB - What to show
  // ============================================
  const renderContentTab = () => (
    <div className="space-y-3">
      {/* Section Header */}
      <AccordionSection title="Section Header">
        <ToggleSwitch
          label="Show Header"
          checked={s.header.show}
          onChange={(checked) => updateNested("header", "show", checked)}
        />
        {s.header.show && (
          <>
            <ToggleSwitch
              label="Show Badge"
              checked={s.header.badge.show}
              onChange={(checked) =>
                updateDeepNested("header", "badge", "show", checked)
              }
            />
            {s.header.badge.show && (
              <TextInput
                label="Badge Text"
                value={s.header.badge.text}
                onChange={(v) => updateDeepNested("header", "badge", "text", v)}
                placeholder="Services"
              />
            )}
            <TextInput
              label="Heading"
              value={s.header.heading.text}
              onChange={(v) => updateDeepNested("header", "heading", "text", v)}
              placeholder="All Services"
            />
            <TextInput
              label="Highlight Words"
              value={s.header.heading.highlightWords}
              onChange={(v) =>
                updateDeepNested("header", "heading", "highlightWords", v)
              }
              placeholder="Services"
              description="Words to highlight with accent color"
            />
            <ToggleSwitch
              label="Show Description"
              checked={s.header.description.show}
              onChange={(checked) =>
                updateDeepNested("header", "description", "show", checked)
              }
            />
            {s.header.description.show && (
              <TextAreaInput
                label="Description"
                value={s.header.description.text}
                onChange={(v) =>
                  updateDeepNested("header", "description", "text", v)
                }
                placeholder="Browse our complete range of services..."
                rows={3}
              />
            )}
          </>
        )}
      </AccordionSection>

      {/* Data Filters */}
      <AccordionSection title="Data Filters">
        <ToggleSwitch
          label="Show All Categories"
          checked={s.filters.showAllCategories}
          onChange={(checked) =>
            updateNested("filters", "showAllCategories", checked)
          }
        />
        <ToggleSwitch
          label="Active Services Only"
          checked={s.filters.activeOnly}
          onChange={(checked) => updateNested("filters", "activeOnly", checked)}
        />
        <NumberInput
          label="Services Per Category"
          value={s.filters.limitServicesPerCategory}
          onChange={(v) =>
            updateNested("filters", "limitServicesPerCategory", v)
          }
          min={0}
          max={20}
          description="0 = show all services"
        />
        <SelectInput
          label="Sort Services By"
          value={s.filters.sortServicesBy}
          onChange={(v) => updateNested("filters", "sortServicesBy", v)}
          options={[
            { value: "order", label: "Default Order" },
            { value: "name", label: "Name (A-Z)" },
            { value: "price-asc", label: "Price (Low to High)" },
            { value: "price-desc", label: "Price (High to Low)" },
          ]}
        />
      </AccordionSection>

      {/* Category Card Display */}
      <AccordionSection title="Category Card Display">
        <ToggleSwitch
          label="Show Category Icon"
          checked={s.categoryCard.showIcon}
          onChange={(checked) =>
            updateNested("categoryCard", "showIcon", checked)
          }
        />
        <ToggleSwitch
          label="Show Category Tagline"
          checked={s.categoryCard.showTagline}
          onChange={(checked) =>
            updateNested("categoryCard", "showTagline", checked)
          }
        />
      </AccordionSection>

      {/* Service Item Display */}
      <AccordionSection title="Service Item Display">
        <ToggleSwitch
          label="Show Price"
          checked={s.serviceItem.showPrice}
          onChange={(checked) =>
            updateNested("serviceItem", "showPrice", checked)
          }
        />
        <ToggleSwitch
          label="Show Dividers"
          checked={s.serviceItem.divider}
          onChange={(checked) =>
            updateNested("serviceItem", "divider", checked)
          }
        />
      </AccordionSection>

      {/* CTA Section */}
      <AccordionSection title="Call to Action">
        <ToggleSwitch
          label="Show CTA Section"
          checked={s.cta.show}
          onChange={(checked) => updateNested("cta", "show", checked)}
        />
        {s.cta.show && (
          <>
            <TextAreaInput
              label="CTA Text"
              value={s.cta.text}
              onChange={(v) => updateNested("cta", "text", v)}
              placeholder="Need help choosing the right service?"
              rows={2}
            />

            {/* Primary Button Section */}
            <AccordionSection title="Primary Button">
              <ToggleSwitch
                label="Show Primary Button"
                checked={s.cta.primaryButton.show}
                onChange={(checked) =>
                  updateDeepNested("cta", "primaryButton", "show", checked)
                }
              />
              {s.cta.primaryButton.show && (
                <>
                  <TextInput
                    label="Button Text"
                    value={s.cta.primaryButton.text}
                    onChange={(v) =>
                      updateDeepNested("cta", "primaryButton", "text", v)
                    }
                    placeholder="View All Services"
                  />
                  <LinkInput
                    label="Link URL"
                    value={s.cta.primaryButton.link}
                    onChange={(v) =>
                      updateDeepNested("cta", "primaryButton", "link", v)
                    }
                    placeholder="/services"
                    openInNewTab={s.cta.primaryButton.openInNewTab}
                    onOpenInNewTabChange={(v) =>
                      updateDeepNested("cta", "primaryButton", "openInNewTab", v)
                    }
                  />
                  <TextInput
                    label="Badge Text (optional)"
                    value={s.cta.primaryButton.badge || ""}
                    onChange={(v) =>
                      updateDeepNested("cta", "primaryButton", "badge", v)
                    }
                    placeholder="From $199"
                  />

                  {/* Button Style Editor */}
                  <div className="mt-4 pt-4 border-t">
                    <ButtonStyleEditor
                      style={(s.cta.primaryButton.style as ButtonCustomStyle) || {}}
                      onChange={(style: ButtonCustomStyle) =>
                        updateDeepNested("cta", "primaryButton", "style", style)
                      }
                      buttonText={s.cta.primaryButton.text || "Button"}
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
                checked={s.cta.secondaryButton.show}
                onChange={(checked) =>
                  updateDeepNested("cta", "secondaryButton", "show", checked)
                }
              />
              {s.cta.secondaryButton.show && (
                <>
                  <TextInput
                    label="Button Text"
                    value={s.cta.secondaryButton.text}
                    onChange={(v) =>
                      updateDeepNested("cta", "secondaryButton", "text", v)
                    }
                    placeholder="Get Free Consultation"
                  />
                  <LinkInput
                    label="Link URL"
                    value={s.cta.secondaryButton.link}
                    onChange={(v) =>
                      updateDeepNested("cta", "secondaryButton", "link", v)
                    }
                    placeholder="/contact"
                    openInNewTab={s.cta.secondaryButton.openInNewTab}
                    onOpenInNewTabChange={(v) =>
                      updateDeepNested("cta", "secondaryButton", "openInNewTab", v)
                    }
                  />

                  {/* Button Style Editor */}
                  <div className="mt-4 pt-4 border-t">
                    <ButtonStyleEditor
                      style={(s.cta.secondaryButton.style as ButtonCustomStyle) || {}}
                      onChange={(style: ButtonCustomStyle) =>
                        updateDeepNested("cta", "secondaryButton", "style", style)
                      }
                      buttonText={s.cta.secondaryButton.text || "Button"}
                      showPreview={true}
                      showPresets={true}
                      compact={true}
                    />
                  </div>
                </>
              )}
            </AccordionSection>
          </>
        )}
      </AccordionSection>
    </div>
  );

  // ============================================
  // STYLE TAB - How it looks
  // ============================================
  const renderStyleTab = () => (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionSection title="Layout">
        <SelectInput
          label="Columns"
          value={s.layout.columns.toString()}
          onChange={(v) =>
            updateNested("layout", "columns", parseInt(v) as 1 | 2 | 3 | 4)
          }
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
            { value: "4", label: "4 Columns" },
          ]}
        />
        <NumberInput
          label="Gap"
          value={s.layout.gap}
          onChange={(v) => updateNested("layout", "gap", v)}
          min={0}
          max={64}
          suffix="px"
        />
        <SelectInput
          label="Card Style"
          value={s.layout.cardStyle}
          onChange={(v) => updateNested("layout", "cardStyle", v)}
          options={[
            { value: "minimal", label: "Minimal" },
            { value: "bordered", label: "Bordered" },
            { value: "elevated", label: "Elevated" },
            { value: "glassmorphism", label: "Glassmorphism" },
          ]}
        />
      </AccordionSection>

      {/* Header Style */}
      {s.header.show && (
        <AccordionSection title="Header Style">
          <SelectInput
            label="Alignment"
            value={s.header.alignment}
            onChange={(v) =>
              updateNested("header", "alignment", v as "left" | "center" | "right")
            }
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <NumberInput
            label="Bottom Margin"
            value={s.header.marginBottom}
            onChange={(v) => updateNested("header", "marginBottom", v)}
            min={0}
            max={96}
            suffix="px"
          />
          <SelectInput
            label="Heading Size"
            value={s.header.heading.size}
            onChange={(v) => updateDeepNested("header", "heading", "size", v)}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
              { value: "2xl", label: "2X Large" },
            ]}
          />
          <ColorInput
            label="Heading Color"
            value={s.header.heading.color}
            onChange={(v) => updateDeepNested("header", "heading", "color", v)}
          />
          <ColorInput
            label="Highlight Color"
            value={s.header.heading.highlightColor}
            onChange={(v) =>
              updateDeepNested("header", "heading", "highlightColor", v)
            }
          />
          {s.header.description.show && (
            <>
              <SelectInput
                label="Description Size"
                value={s.header.description.size}
                onChange={(v) =>
                  updateDeepNested("header", "description", "size", v)
                }
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
              <ColorInput
                label="Description Color"
                value={s.header.description.color}
                onChange={(v) =>
                  updateDeepNested("header", "description", "color", v)
                }
              />
            </>
          )}
        </AccordionSection>
      )}

      {/* Badge Style */}
      {s.header.show && s.header.badge.show && (
        <AccordionSection title="Badge Style">
          <SelectInput
            label="Badge Style"
            value={s.header.badge.style}
            onChange={(v) => updateDeepNested("header", "badge", "style", v)}
            options={[
              { value: "pill", label: "Pill" },
              { value: "outline", label: "Outline" },
              { value: "solid", label: "Solid" },
            ]}
          />
          <ColorInput
            label="Background Color"
            value={s.header.badge.bgColor || "#f9731933"}
            onChange={(v) => updateDeepNested("header", "badge", "bgColor", v)}
          />
          <ColorInput
            label="Text Color"
            value={s.header.badge.textColor || "#fb923c"}
            onChange={(v) =>
              updateDeepNested("header", "badge", "textColor", v)
            }
          />
          <ColorInput
            label="Border Color"
            value={s.header.badge.borderColor || "#f9731980"}
            onChange={(v) =>
              updateDeepNested("header", "badge", "borderColor", v)
            }
          />
        </AccordionSection>
      )}

      {/* Category Card Style */}
      <AccordionSection title="Category Card Style">
        <NumberInput
          label="Border Radius"
          value={s.categoryCard.borderRadius}
          onChange={(v) => updateNested("categoryCard", "borderRadius", v)}
          min={0}
          max={32}
          suffix="px"
        />
        <NumberInput
          label="Border Width"
          value={s.categoryCard.borderWidth}
          onChange={(v) => updateNested("categoryCard", "borderWidth", v)}
          min={0}
          max={4}
          suffix="px"
        />
        <ColorInput
          label="Border Color"
          value={s.categoryCard.borderColor}
          onChange={(v) => updateNested("categoryCard", "borderColor", v)}
        />
        <ColorInput
          label="Background Color"
          value={s.categoryCard.backgroundColor}
          onChange={(v) => updateNested("categoryCard", "backgroundColor", v)}
        />
        <NumberInput
          label="Padding"
          value={s.categoryCard.padding}
          onChange={(v) => updateNested("categoryCard", "padding", v)}
          min={0}
          max={48}
          suffix="px"
        />
        <SelectInput
          label="Title Size"
          value={s.categoryCard.titleSize}
          onChange={(v) =>
            updateNested("categoryCard", "titleSize", v as "sm" | "md" | "lg")
          }
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
      </AccordionSection>

      {/* Icon Style */}
      {s.categoryCard.showIcon && (
        <AccordionSection title="Icon Style">
          <SelectInput
            label="Icon Shape"
            value={s.categoryCard.iconStyle}
            onChange={(v) =>
              updateNested(
                "categoryCard",
                "iconStyle",
                v as "rounded" | "circle" | "square"
              )
            }
            options={[
              { value: "rounded", label: "Rounded" },
              { value: "circle", label: "Circle" },
              { value: "square", label: "Square" },
            ]}
          />
          <SelectInput
            label="Icon Size"
            value={s.categoryCard.iconSize}
            onChange={(v) =>
              updateNested("categoryCard", "iconSize", v as "sm" | "md" | "lg")
            }
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />
          <ColorInput
            label="Icon Background"
            value={s.categoryCard.iconBgColor}
            onChange={(v) => updateNested("categoryCard", "iconBgColor", v)}
          />
          <ColorInput
            label="Icon Color"
            value={s.categoryCard.iconColor}
            onChange={(v) => updateNested("categoryCard", "iconColor", v)}
          />
        </AccordionSection>
      )}

      {/* Service Item Style */}
      <AccordionSection title="Service Item Style">
        <SelectInput
          label="Font Size"
          value={s.serviceItem.fontSize}
          onChange={(v) =>
            updateNested("serviceItem", "fontSize", v as "sm" | "md" | "lg")
          }
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
        <ColorInput
          label="Name Color"
          value={s.serviceItem.nameColor}
          onChange={(v) => updateNested("serviceItem", "nameColor", v)}
        />
        {s.serviceItem.showPrice && (
          <ColorInput
            label="Price Color"
            value={s.serviceItem.priceColor}
            onChange={(v) => updateNested("serviceItem", "priceColor", v)}
          />
        )}
        <SelectInput
          label="Hover Effect"
          value={s.serviceItem.hoverEffect}
          onChange={(v) =>
            updateNested(
              "serviceItem",
              "hoverEffect",
              v as "none" | "highlight" | "slide"
            )
          }
          options={[
            { value: "none", label: "None" },
            { value: "highlight", label: "Highlight" },
            { value: "slide", label: "Slide" },
          ]}
        />
        {s.serviceItem.divider && (
          <ColorInput
            label="Divider Color"
            value={s.serviceItem.dividerColor}
            onChange={(v) => updateNested("serviceItem", "dividerColor", v)}
          />
        )}
        <NumberInput
          label="Item Padding"
          value={s.serviceItem.padding}
          onChange={(v) => updateNested("serviceItem", "padding", v)}
          min={0}
          max={24}
          suffix="px"
        />
      </AccordionSection>

      {/* CTA Style */}
      {s.cta.show && (
        <AccordionSection title="CTA Style">
          <SelectInput
            label="Alignment"
            value={s.cta.alignment}
            onChange={(v) =>
              updateNested("cta", "alignment", v as "left" | "center" | "right")
            }
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <NumberInput
            label="Top Margin"
            value={s.cta.marginTop}
            onChange={(v) => updateNested("cta", "marginTop", v)}
            min={0}
            max={96}
            suffix="px"
          />
          <ColorInput
            label="Text Color"
            value={s.cta.textColor}
            onChange={(v) => updateNested("cta", "textColor", v)}
          />
        </AccordionSection>
      )}
    </div>
  );

  // ============================================
  // ADVANCED TAB - Technical settings
  // ============================================
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      {/* Responsive Settings */}
      <AccordionSection title="Responsive Columns">
        <SelectInput
          label="Tablet Columns"
          value={s.responsive.tablet.columns.toString()}
          onChange={(v) => {
            onChange({
              ...s,
              responsive: {
                ...s.responsive,
                tablet: { columns: parseInt(v) as 1 | 2 | 3 },
              },
            });
          }}
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
          ]}
        />
        <SelectInput
          label="Mobile Columns"
          value={s.responsive.mobile.columns.toString()}
          onChange={(v) => {
            onChange({
              ...s,
              responsive: {
                ...s.responsive,
                mobile: { columns: parseInt(v) as 1 | 2 },
              },
            });
          }}
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
          ]}
        />
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
