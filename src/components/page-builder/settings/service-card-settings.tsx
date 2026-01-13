"use client";

import { useEffect, useState } from "react";
import type {
  ServiceCardWidgetSettings,
  ServiceCardStyle,
  ServiceCardHoverEffect,
  ServiceCardIconStyle,
  ServiceCardIconAnimation,
  ServiceCardSortBy,
} from "@/lib/page-builder/types";
import { DEFAULT_SERVICE_CARD_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
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
    filters: { ...DEFAULT_SERVICE_CARD_SETTINGS.filters, ...settings?.filters },
    layout: { ...DEFAULT_SERVICE_CARD_SETTINGS.layout, ...settings?.layout },
    icon: { ...DEFAULT_SERVICE_CARD_SETTINGS.icon, ...settings?.icon },
    content: { ...DEFAULT_SERVICE_CARD_SETTINGS.content, ...settings?.content },
    hover: { ...DEFAULT_SERVICE_CARD_SETTINGS.hover, ...settings?.hover },
    colors: { ...DEFAULT_SERVICE_CARD_SETTINGS.colors, ...settings?.colors },
    responsive: { ...DEFAULT_SERVICE_CARD_SETTINGS.responsive, ...settings?.responsive },
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

  // Content Tab - Data & Display Options
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Data Filters */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Data Filters
        </h4>

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
      </div>

      {/* Display Options */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Display Options
        </h4>

        <ToggleSwitch
          label="Show Description"
          checked={s.content.showDescription}
          onChange={(checked) => updateContent("showDescription", checked)}
        />

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

        <ToggleSwitch
          label="Show Price"
          checked={s.content.showPrice}
          onChange={(checked) => updateContent("showPrice", checked)}
        />

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

        <ToggleSwitch
          label="Show Popular Badge"
          checked={s.content.showBadge}
          onChange={(checked) => updateContent("showBadge", checked)}
        />

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
      </div>
    </div>
  );

  // Style Tab - Card Style & Layout
  const renderStyleTab = () => (
    <div className="space-y-4">
      {/* Card Style Variant */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Card Style
        </h4>

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
      </div>

      {/* Layout */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layout
        </h4>

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
      </div>

      {/* Hover Effects */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Hover Effects
        </h4>

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
      </div>
    </div>
  );

  // Advanced Tab - Icon & Responsive
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      {/* Icon Settings */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Icon Settings
        </h4>

        <ToggleSwitch
          label="Show Icon"
          checked={s.icon.show}
          onChange={(checked) => updateIcon("show", checked)}
        />

        {s.icon.show && (
          <>
            <SelectInput
              label="Icon Style"
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
              label="Icon Size"
              value={s.icon.size}
              onChange={(v) => updateIcon("size", v as "sm" | "md" | "lg")}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />

            <SelectInput
              label="Icon Position"
              value={s.icon.position}
              onChange={(v) => updateIcon("position", v as "top-left" | "top-center" | "inline")}
              options={[
                { value: "top-left", label: "Top Left" },
                { value: "top-center", label: "Top Center" },
                { value: "inline", label: "Inline with Title" },
              ]}
            />

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

            <ColorInput
              label="Icon Background"
              value={s.icon.backgroundColor || "rgb(249 115 22 / 0.1)"}
              onChange={(v) => updateIcon("backgroundColor", v)}
            />

            <ColorInput
              label="Icon Color"
              value={s.icon.iconColor || "#f97316"}
              onChange={(v) => updateIcon("iconColor", v)}
            />
          </>
        )}
      </div>

      {/* Responsive Settings */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Responsive Columns
        </h4>

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
      </div>
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
