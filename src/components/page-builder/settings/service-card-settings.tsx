"use client";

import { useEffect, useState } from "react";
import type {
  ServiceCardWidgetSettings,
  ServiceCardStyle,
  ServiceCardHoverEffect,
  ServiceCardIconStyle,
  ServiceCardIconAnimation,
  ServiceCardSortBy,
  BadgeStyle,
} from "@/lib/page-builder/types";
import { DEFAULT_SERVICE_CARD_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
  TextAreaInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Service category type
interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

interface ServiceCardWidgetSettingsProps {
  settings: ServiceCardWidgetSettings;
  onChange: (settings: ServiceCardWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function ServiceCardWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: ServiceCardWidgetSettingsProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Merge with defaults
  const s: ServiceCardWidgetSettings = {
    ...DEFAULT_SERVICE_CARD_SETTINGS,
    ...settings,
    header: {
      ...DEFAULT_SERVICE_CARD_SETTINGS.header,
      ...settings?.header,
      badge: { ...DEFAULT_SERVICE_CARD_SETTINGS.header.badge, ...settings?.header?.badge },
      heading: { ...DEFAULT_SERVICE_CARD_SETTINGS.header.heading, ...settings?.header?.heading },
      description: { ...DEFAULT_SERVICE_CARD_SETTINGS.header.description, ...settings?.header?.description },
    },
    filters: { ...DEFAULT_SERVICE_CARD_SETTINGS.filters, ...settings?.filters },
    layout: { ...DEFAULT_SERVICE_CARD_SETTINGS.layout, ...settings?.layout },
    icon: { ...DEFAULT_SERVICE_CARD_SETTINGS.icon, ...settings?.icon },
    content: { ...DEFAULT_SERVICE_CARD_SETTINGS.content, ...settings?.content },
    hover: { ...DEFAULT_SERVICE_CARD_SETTINGS.hover, ...settings?.hover },
    colors: { ...DEFAULT_SERVICE_CARD_SETTINGS.colors, ...settings?.colors },
    responsive: { ...DEFAULT_SERVICE_CARD_SETTINGS.responsive, ...settings?.responsive },
    container: { ...DEFAULT_WIDGET_CONTAINER, ...settings?.container },
  };

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/services/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const updateFilters = (
    key: keyof ServiceCardWidgetSettings["filters"],
    value: unknown
  ) => {
    onChange({
      ...s,
      filters: { ...s.filters, [key]: value },
    });
  };

  const updateLayout = (
    key: keyof ServiceCardWidgetSettings["layout"],
    value: unknown
  ) => {
    onChange({
      ...s,
      layout: { ...s.layout, [key]: value },
    });
  };

  const updateIcon = (
    key: keyof ServiceCardWidgetSettings["icon"],
    value: unknown
  ) => {
    onChange({
      ...s,
      icon: { ...s.icon, [key]: value },
    });
  };

  const updateContent = (
    key: keyof ServiceCardWidgetSettings["content"],
    value: unknown
  ) => {
    onChange({
      ...s,
      content: { ...s.content, [key]: value },
    });
  };

  const updateHover = (
    key: keyof ServiceCardWidgetSettings["hover"],
    value: unknown
  ) => {
    onChange({
      ...s,
      hover: { ...s.hover, [key]: value },
    });
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategories = s.filters.categories;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    updateFilters("categories", newCategories);
  };

  const updateHeader = (updates: Partial<ServiceCardWidgetSettings["header"]>) => {
    onChange({
      ...s,
      header: { ...s.header, ...updates },
    });
  };

  const updateHeaderBadge = (updates: Partial<ServiceCardWidgetSettings["header"]["badge"]>) => {
    onChange({
      ...s,
      header: { ...s.header, badge: { ...s.header.badge, ...updates } },
    });
  };

  const updateHeaderHeading = (updates: Partial<ServiceCardWidgetSettings["header"]["heading"]>) => {
    onChange({
      ...s,
      header: { ...s.header, heading: { ...s.header.heading, ...updates } },
    });
  };

  const updateHeaderDescription = (updates: Partial<ServiceCardWidgetSettings["header"]["description"]>) => {
    onChange({
      ...s,
      header: { ...s.header, description: { ...s.header.description, ...updates } },
    });
  };

  // Content Tab - What to show (data, text, toggles)
  const renderContentTab = () => (
    <div className="space-y-3">
      {/* Section Header Accordion - Content only */}
      <AccordionSection title="Section Header">
        <ToggleSwitch
          label="Show Header"
          checked={s.header.show}
          onChange={(checked) => updateHeader({ show: checked })}
        />
      </AccordionSection>

      {/* Badge Accordion - Content only */}
      {s.header.show && (
        <AccordionSection title="Badge">
          <ToggleSwitch
            label="Show Badge"
            checked={s.header.badge.show}
            onChange={(checked) => updateHeaderBadge({ show: checked })}
          />

          {s.header.badge.show && (
            <div className="mt-4">
              <TextInput
                label="Badge Text"
                value={s.header.badge.text}
                onChange={(v) => updateHeaderBadge({ text: v })}
                placeholder="Our Services"
              />
            </div>
          )}
        </AccordionSection>
      )}

      {/* Heading Accordion - Content only */}
      {s.header.show && (
        <AccordionSection title="Heading">
          <TextAreaInput
            label="Heading Text"
            value={s.header.heading.text}
            onChange={(v) => updateHeaderHeading({ text: v })}
            placeholder="Everything You Need to Start Your US Business"
            rows={2}
          />

          <TextInput
            label="Highlight Words"
            value={s.header.heading.highlightWords || ""}
            onChange={(v) => updateHeaderHeading({ highlightWords: v })}
            placeholder="US Business"
            description="Comma separated words to highlight"
          />
        </AccordionSection>
      )}

      {/* Description Accordion - Content only */}
      {s.header.show && (
        <AccordionSection title="Description">
          <ToggleSwitch
            label="Show Description"
            checked={s.header.description.show}
            onChange={(checked) => updateHeaderDescription({ show: checked })}
          />

          {s.header.description.show && (
            <div className="mt-4">
              <TextAreaInput
                label="Description Text"
                value={s.header.description.text}
                onChange={(v) => updateHeaderDescription({ text: v })}
                placeholder="From LLC formation to Amazon seller accounts..."
                rows={3}
              />
            </div>
          )}
        </AccordionSection>
      )}

      {/* Data Filters Accordion */}
      <AccordionSection title="Data Filters">
        <NumberInput
          label="Number of Services"
          value={s.filters.limit}
          onChange={(v) => updateFilters("limit", v)}
          min={1}
          max={24}
          step={1}
        />

        <SelectInput
          label="Sort By"
          value={s.filters.sortBy}
          onChange={(v) => updateFilters("sortBy", v as ServiceCardSortBy)}
          options={[
            { value: "popular", label: "Popular First" },
            { value: "sort-order", label: "Manual Order" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
            { value: "name", label: "Name (A-Z)" },
            { value: "newest", label: "Newest First" },
          ]}
        />

        <ToggleSwitch
          label="Active Services Only"
          checked={s.filters.activeOnly}
          onChange={(checked) => updateFilters("activeOnly", checked)}
        />

        <ToggleSwitch
          label="Popular Services Only"
          checked={s.filters.popularOnly}
          onChange={(checked) => updateFilters("popularOnly", checked)}
        />

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Filter by Categories
          </Label>
          {loadingCategories ? (
            <div className="text-xs text-muted-foreground">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-xs text-muted-foreground">No categories found</div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={s.filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={`cat-${category.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          {s.filters.categories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No filter = Show all categories
            </p>
          )}
        </div>
      </AccordionSection>

      {/* Display Options Accordion - All show/hide toggles */}
      <AccordionSection title="Display Options">
        <ToggleSwitch
          label="Show Icon"
          checked={s.icon.show}
          onChange={(checked) => updateIcon("show", checked)}
        />

        <ToggleSwitch
          label="Show Description"
          checked={s.content.showDescription}
          onChange={(checked) => updateContent("showDescription", checked)}
        />

        <ToggleSwitch
          label="Show Price"
          checked={s.content.showPrice}
          onChange={(checked) => updateContent("showPrice", checked)}
        />

        <ToggleSwitch
          label="Show Popular Badge"
          checked={s.content.showBadge}
          onChange={(checked) => updateContent("showBadge", checked)}
        />

        <ToggleSwitch
          label="Show Category"
          checked={s.content.showCategory}
          onChange={(checked) => updateContent("showCategory", checked)}
        />

        <ToggleSwitch
          label="Show Arrow Icon"
          checked={s.content.showArrow}
          onChange={(checked) => updateContent("showArrow", checked)}
        />

        <ToggleSwitch
          label="Show Features"
          checked={s.content.showFeatures}
          onChange={(checked) => updateContent("showFeatures", checked)}
        />
      </AccordionSection>
    </div>
  );

  // Style Tab - How it looks (visual styling)
  const renderStyleTab = () => (
    <div className="space-y-3">
      {/* Section Header Style - when header is shown */}
      {s.header.show && (
        <AccordionSection title="Header Style">
          <SelectInput
            label="Alignment"
            value={s.header.alignment}
            onChange={(v) => updateHeader({ alignment: v as "left" | "center" | "right" })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />

          <NumberInput
            label="Bottom Margin"
            value={s.header.marginBottom}
            onChange={(v) => updateHeader({ marginBottom: v })}
            min={0}
            max={96}
            step={8}
            unit="px"
          />
        </AccordionSection>
      )}

      {/* Badge Style - when badge is shown */}
      {s.header.show && s.header.badge.show && (
        <AccordionSection title="Badge Style">
          <SelectInput
            label="Style"
            value={s.header.badge.style}
            onChange={(v) => updateHeaderBadge({ style: v as BadgeStyle })}
            options={[
              { value: "pill", label: "Pill" },
              { value: "outline", label: "Outline" },
              { value: "solid", label: "Solid" },
            ]}
          />

          <ColorInput
            label="Background Color"
            value={s.header.badge.bgColor || "#f9731933"}
            onChange={(v) => updateHeaderBadge({ bgColor: v })}
          />

          <ColorInput
            label="Text Color"
            value={s.header.badge.textColor || "#fb923c"}
            onChange={(v) => updateHeaderBadge({ textColor: v })}
          />
        </AccordionSection>
      )}

      {/* Heading Style - when header is shown */}
      {s.header.show && (
        <AccordionSection title="Heading Style">
          <SelectInput
            label="Size"
            value={s.header.heading.size}
            onChange={(v) => updateHeaderHeading({ size: v as "sm" | "md" | "lg" | "xl" | "2xl" })}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
              { value: "2xl", label: "2X Large" },
            ]}
          />

          <ColorInput
            label="Text Color"
            value={s.header.heading.color || "#ffffff"}
            onChange={(v) => updateHeaderHeading({ color: v })}
          />

          <ColorInput
            label="Highlight Color"
            value={s.header.heading.highlightColor || "#f97316"}
            onChange={(v) => updateHeaderHeading({ highlightColor: v })}
          />
        </AccordionSection>
      )}

      {/* Description Style - when description is shown */}
      {s.header.show && s.header.description.show && (
        <AccordionSection title="Description Style">
          <SelectInput
            label="Size"
            value={s.header.description.size}
            onChange={(v) => updateHeaderDescription({ size: v as "sm" | "md" | "lg" })}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />

          <ColorInput
            label="Text Color"
            value={s.header.description.color || "#94a3b8"}
            onChange={(v) => updateHeaderDescription({ color: v })}
          />
        </AccordionSection>
      )}

      {/* Card Style Accordion */}
      <AccordionSection title="Card Style">
        <SelectInput
          label="Style Variant"
          value={s.cardStyle}
          onChange={(v) => onChange({ ...s, cardStyle: v as ServiceCardStyle })}
          options={[
            { value: "minimal", label: "Minimal" },
            { value: "elevated", label: "Elevated (Default)" },
            { value: "glassmorphism", label: "Glassmorphism" },
            { value: "gradient-border", label: "Gradient Border" },
            { value: "spotlight", label: "Spotlight" },
            { value: "neon-glow", label: "Neon Glow" },
          ]}
        />

        <NumberInput
          label="Border Radius"
          value={s.borderRadius}
          onChange={(v) => onChange({ ...s, borderRadius: v })}
          min={0}
          max={32}
          step={2}
          unit="px"
        />

        {s.cardStyle !== "minimal" && s.cardStyle !== "gradient-border" && (
          <NumberInput
            label="Border Width"
            value={s.borderWidth}
            onChange={(v) => onChange({ ...s, borderWidth: v })}
            min={0}
            max={4}
            step={1}
            unit="px"
          />
        )}
      </AccordionSection>

      {/* Layout Accordion */}
      <AccordionSection title="Layout">
        <SelectInput
          label="Columns (Desktop)"
          value={s.layout.columns.toString()}
          onChange={(v) => updateLayout("columns", parseInt(v) as 1 | 2 | 3 | 4)}
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
          onChange={(v) => updateLayout("gap", v)}
          min={8}
          max={48}
          step={4}
          unit="px"
        />

        <SelectInput
          label="Card Alignment"
          value={s.layout.cardAlignment}
          onChange={(v) => updateLayout("cardAlignment", v as "stretch" | "start" | "center")}
          options={[
            { value: "stretch", label: "Stretch" },
            { value: "start", label: "Top" },
            { value: "center", label: "Center" },
          ]}
        />
      </AccordionSection>

      {/* Icon Style - when icon is enabled */}
      {s.icon.show && (
        <AccordionSection title="Icon Style">
          <SelectInput
            label="Style"
            value={s.icon.style}
            onChange={(v) => updateIcon("style", v as ServiceCardIconStyle)}
            options={[
              { value: "circle", label: "Circle" },
              { value: "rounded", label: "Rounded" },
              { value: "square", label: "Square" },
              { value: "none", label: "No Background" },
            ]}
          />

          <SelectInput
            label="Size"
            value={s.icon.size}
            onChange={(v) => updateIcon("size", v as "sm" | "md" | "lg")}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />

          <SelectInput
            label="Position"
            value={s.icon.position}
            onChange={(v) => updateIcon("position", v as "top-left" | "top-center" | "inline")}
            options={[
              { value: "top-left", label: "Top Left" },
              { value: "top-center", label: "Top Center" },
              { value: "inline", label: "Inline with Title" },
            ]}
          />

          <ColorInput
            label="Background Color"
            value={s.icon.backgroundColor || "rgb(249 115 22 / 0.1)"}
            onChange={(v) => updateIcon("backgroundColor", v)}
          />

          <ColorInput
            label="Icon Color"
            value={s.icon.iconColor || "#f97316"}
            onChange={(v) => updateIcon("iconColor", v)}
          />
        </AccordionSection>
      )}

      {/* Content Style - positions and display options */}
      <AccordionSection title="Content Style">
        {s.content.showDescription && (
          <SelectInput
            label="Description Lines"
            value={s.content.descriptionLines.toString()}
            onChange={(v) => updateContent("descriptionLines", parseInt(v) as 1 | 2 | 3)}
            options={[
              { value: "1", label: "1 Line" },
              { value: "2", label: "2 Lines" },
              { value: "3", label: "3 Lines" },
            ]}
          />
        )}

        {s.content.showPrice && (
          <SelectInput
            label="Price Position"
            value={s.content.pricePosition}
            onChange={(v) => updateContent("pricePosition", v as "bottom" | "top-right" | "badge")}
            options={[
              { value: "bottom", label: "Bottom" },
              { value: "top-right", label: "Top Right" },
              { value: "badge", label: "As Badge" },
            ]}
          />
        )}

        {s.content.showBadge && (
          <SelectInput
            label="Badge Position"
            value={s.content.badgePosition}
            onChange={(v) => updateContent("badgePosition", v as "top-right" | "top-left" | "inline")}
            options={[
              { value: "top-right", label: "Top Right" },
              { value: "top-left", label: "Top Left" },
              { value: "inline", label: "Inline" },
            ]}
          />
        )}

        {s.content.showFeatures && (
          <SelectInput
            label="Max Features"
            value={s.content.maxFeatures.toString()}
            onChange={(v) => updateContent("maxFeatures", parseInt(v) as 2 | 3 | 4)}
            options={[
              { value: "2", label: "2 Features" },
              { value: "3", label: "3 Features" },
              { value: "4", label: "4 Features" },
            ]}
          />
        )}
      </AccordionSection>

      {/* Container Style */}
      <ContainerStyleSection
        container={s.container || DEFAULT_WIDGET_CONTAINER}
        onChange={(container) => onChange({ ...s, container })}
      />

      {/* Hover Effects Accordion */}
      <AccordionSection title="Hover Effects">
        <SelectInput
          label="Card Hover Effect"
          value={s.hover.effect}
          onChange={(v) => updateHover("effect", v as ServiceCardHoverEffect)}
          options={[
            { value: "none", label: "None" },
            { value: "lift", label: "Lift Up" },
            { value: "glow", label: "Glow" },
            { value: "border-glow", label: "Border Glow" },
            { value: "scale", label: "Scale" },
            { value: "spotlight", label: "Spotlight" },
          ]}
        />

        <SelectInput
          label="Icon Hover Effect"
          value={s.hover.iconEffect}
          onChange={(v) => updateHover("iconEffect", v as "none" | "invert" | "scale" | "bounce")}
          options={[
            { value: "none", label: "None" },
            { value: "scale", label: "Scale" },
            { value: "invert", label: "Invert Colors" },
            { value: "bounce", label: "Bounce" },
          ]}
        />

        {s.icon.show && (
          <SelectInput
            label="Icon Animation"
            value={s.icon.hoverAnimation}
            onChange={(v) => updateIcon("hoverAnimation", v as ServiceCardIconAnimation)}
            options={[
              { value: "none", label: "None" },
              { value: "scale", label: "Scale" },
              { value: "rotate", label: "Rotate" },
              { value: "bounce", label: "Bounce" },
              { value: "pulse", label: "Pulse" },
            ]}
          />
        )}

        <NumberInput
          label="Transition Duration"
          value={s.hover.transitionDuration}
          onChange={(v) => updateHover("transitionDuration", v)}
          min={100}
          max={500}
          step={50}
          unit="ms"
        />

        {s.cardStyle === "neon-glow" && (
          <ColorInput
            label="Glow Color"
            value={s.hover.glowColor || "#f97316"}
            onChange={(v) => updateHover("glowColor", v)}
          />
        )}
      </AccordionSection>
    </div>
  );

  // Advanced Tab - Technical & Responsive settings
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      {/* Responsive Settings Accordion */}
      <AccordionSection title="Responsive Columns">
        <SelectInput
          label="Tablet Columns"
          value={s.responsive.tablet.columns.toString()}
          onChange={(v) =>
            onChange({
              ...s,
              responsive: {
                ...s.responsive,
                tablet: { columns: parseInt(v) as 1 | 2 | 3 },
              },
            })
          }
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
          ]}
        />

        <SelectInput
          label="Mobile Columns"
          value={s.responsive.mobile.columns.toString()}
          onChange={(v) =>
            onChange({
              ...s,
              responsive: {
                ...s.responsive,
                mobile: { columns: parseInt(v) as 1 | 2 },
              },
            })
          }
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
