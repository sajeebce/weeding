"use client";

import type {
  BlogFeaturedPostWidgetSettings,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_FEATURED_POST_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface BlogFeaturedPostSettingsProps {
  settings: BlogFeaturedPostWidgetSettings;
  onChange: (settings: BlogFeaturedPostWidgetSettings) => void;
}

export function BlogFeaturedPostSettingsPanel({
  settings,
  onChange,
}: BlogFeaturedPostSettingsProps) {
  // Deep merge with defaults
  const s = {
    ...DEFAULT_BLOG_FEATURED_POST_SETTINGS,
    ...settings,
    dataSource: {
      ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.dataSource,
      ...settings?.dataSource,
    },
    image: {
      ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.image,
      ...settings?.image,
      overlay: {
        ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.image.overlay,
        ...settings?.image?.overlay,
      },
    },
    content: {
      ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.content,
      ...settings?.content,
      categoryBadge: {
        ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.content.categoryBadge,
        ...settings?.content?.categoryBadge,
      },
      title: {
        ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.content.title,
        ...settings?.content?.title,
      },
      excerpt: {
        ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.content.excerpt,
        ...settings?.content?.excerpt,
      },
      meta: {
        ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.content.meta,
        ...settings?.content?.meta,
      },
      readMore: {
        ...DEFAULT_BLOG_FEATURED_POST_SETTINGS.content.readMore,
        ...settings?.content?.readMore,
      },
    },
  } as BlogFeaturedPostWidgetSettings;

  // Helper update functions
  const updateDataSource = (key: keyof BlogFeaturedPostWidgetSettings["dataSource"], value: unknown) => {
    onChange({ ...s, dataSource: { ...s.dataSource, [key]: value } });
  };

  const updateImage = (key: keyof BlogFeaturedPostWidgetSettings["image"], value: unknown) => {
    onChange({ ...s, image: { ...s.image, [key]: value } });
  };

  const updateImageOverlay = (key: keyof BlogFeaturedPostWidgetSettings["image"]["overlay"], value: unknown) => {
    onChange({
      ...s,
      image: { ...s.image, overlay: { ...s.image.overlay, [key]: value } },
    });
  };

  const updateContent = (key: keyof BlogFeaturedPostWidgetSettings["content"], value: unknown) => {
    onChange({ ...s, content: { ...s.content, [key]: value } });
  };

  const updateContentCategoryBadge = (key: keyof BlogFeaturedPostWidgetSettings["content"]["categoryBadge"], value: unknown) => {
    onChange({
      ...s,
      content: {
        ...s.content,
        categoryBadge: { ...s.content.categoryBadge, [key]: value },
      },
    });
  };

  const updateContentTitle = (key: keyof BlogFeaturedPostWidgetSettings["content"]["title"], value: unknown) => {
    onChange({
      ...s,
      content: { ...s.content, title: { ...s.content.title, [key]: value } },
    });
  };

  const updateContentExcerpt = (key: keyof BlogFeaturedPostWidgetSettings["content"]["excerpt"], value: unknown) => {
    onChange({
      ...s,
      content: { ...s.content, excerpt: { ...s.content.excerpt, [key]: value } },
    });
  };

  const updateContentMeta = (key: keyof BlogFeaturedPostWidgetSettings["content"]["meta"], value: unknown) => {
    onChange({
      ...s,
      content: { ...s.content, meta: { ...s.content.meta, [key]: value } },
    });
  };

  const updateContentReadMore = (key: keyof BlogFeaturedPostWidgetSettings["content"]["readMore"], value: unknown) => {
    onChange({
      ...s,
      content: { ...s.content, readMore: { ...s.content.readMore, [key]: value } },
    });
  };

  const toggleMetaItem = (item: "date" | "readingTime" | "category") => {
    const currentItems = s.content.meta.items;
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    updateContentMeta("items", newItems);
  };

  return (
    <div className="space-y-3">
      {/* Data Source */}
      <AccordionSection title="Data Source">
        <SelectInput
          label="Source"
          value={s.dataSource.source}
          onChange={(v) => updateDataSource("source", v)}
          options={[
            { value: "latest", label: "Latest Post" },
            { value: "specific", label: "Specific Post" },
            { value: "category-latest", label: "Latest in Category" },
          ]}
        />

        {s.dataSource.source === "specific" && (
          <TextInput
            label="Post ID"
            value={s.dataSource.postId ?? ""}
            onChange={(v) => updateDataSource("postId", v)}
            placeholder="Enter post ID"
          />
        )}

        {s.dataSource.source === "category-latest" && (
          <TextInput
            label="Category Slug"
            value={s.dataSource.categorySlug ?? ""}
            onChange={(v) => updateDataSource("categorySlug", v)}
            placeholder="e.g. business-tips"
          />
        )}
      </AccordionSection>

      {/* Layout */}
      <AccordionSection title="Layout">
        <SelectInput
          label="Layout"
          value={s.layout}
          onChange={(v) => onChange({ ...s, layout: v as BlogFeaturedPostWidgetSettings["layout"] })}
          options={[
            { value: "overlay", label: "Overlay" },
            { value: "split-left", label: "Split Left" },
            { value: "split-right", label: "Split Right" },
            { value: "stacked", label: "Stacked" },
          ]}
        />

        <SelectInput
          label="Height"
          value={s.height}
          onChange={(v) => onChange({ ...s, height: v as BlogFeaturedPostWidgetSettings["height"] })}
          options={[
            { value: "auto", label: "Auto" },
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra Large" },
          ]}
        />
      </AccordionSection>

      {/* Image */}
      <AccordionSection title="Image">
        <SelectInput
          label="Aspect Ratio"
          value={s.image.aspectRatio}
          onChange={(v) => updateImage("aspectRatio", v)}
          options={[
            { value: "16:9", label: "16:9" },
            { value: "21:9", label: "21:9" },
            { value: "4:3", label: "4:3" },
          ]}
        />

        <NumberInput
          label="Border Radius"
          value={s.image.borderRadius}
          onChange={(v) => updateImage("borderRadius", v)}
          min={0}
          max={32}
          step={2}
          unit="px"
        />

        <ToggleSwitch
          label="Enable Overlay"
          checked={s.image.overlay.enabled}
          onChange={(checked) => updateImageOverlay("enabled", checked)}
        />

        {s.image.overlay.enabled && (
          <>
            <ColorInput
              label="Overlay Color"
              value={s.image.overlay.color}
              onChange={(v) => updateImageOverlay("color", v)}
            />

            <NumberInput
              label="Overlay Opacity"
              value={s.image.overlay.opacity * 100}
              onChange={(v) => updateImageOverlay("opacity", v / 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
            />
          </>
        )}

        <SelectInput
          label="Hover Effect"
          value={s.image.hoverEffect}
          onChange={(v) => updateImage("hoverEffect", v)}
          options={[
            { value: "none", label: "None" },
            { value: "zoom", label: "Zoom" },
            { value: "ken-burns", label: "Ken Burns" },
          ]}
        />
      </AccordionSection>

      {/* Content */}
      <AccordionSection title="Content">
        {/* Category Badge */}
        <ToggleSwitch
          label="Show Category Badge"
          checked={s.content.categoryBadge.show}
          onChange={(checked) => updateContentCategoryBadge("show", checked)}
        />

        {s.content.categoryBadge.show && (
          <SelectInput
            label="Badge Style"
            value={s.content.categoryBadge.style}
            onChange={(v) => updateContentCategoryBadge("style", v)}
            options={[
              { value: "pill", label: "Pill" },
              { value: "solid", label: "Solid" },
            ]}
          />
        )}

        {/* Title */}
        <SelectInput
          label="Title Size"
          value={s.content.title.size}
          onChange={(v) => updateContentTitle("size", v)}
          options={[
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra Large" },
            { value: "2xl", label: "2X Large" },
            { value: "3xl", label: "3X Large" },
          ]}
        />

        <SelectInput
          label="Title Weight"
          value={s.content.title.fontWeight.toString()}
          onChange={(v) => updateContentTitle("fontWeight", parseInt(v))}
          options={[
            { value: "600", label: "Semibold" },
            { value: "700", label: "Bold" },
            { value: "800", label: "Extra Bold" },
          ]}
        />

        <NumberInput
          label="Title Max Lines"
          value={s.content.title.maxLines}
          onChange={(v) => updateContentTitle("maxLines", v)}
          min={1}
          max={5}
          step={1}
        />

        {/* Excerpt */}
        <ToggleSwitch
          label="Show Excerpt"
          checked={s.content.excerpt.show}
          onChange={(checked) => updateContentExcerpt("show", checked)}
        />

        {s.content.excerpt.show && (
          <>
            <NumberInput
              label="Max Excerpt Length"
              value={s.content.excerpt.maxLength}
              onChange={(v) => updateContentExcerpt("maxLength", v)}
              min={50}
              max={400}
              step={10}
            />

            <SelectInput
              label="Excerpt Font Size"
              value={s.content.excerpt.fontSize}
              onChange={(v) => updateContentExcerpt("fontSize", v)}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
          </>
        )}

        {/* Meta Items */}
        <ToggleSwitch
          label="Show Meta"
          checked={s.content.meta.show}
          onChange={(checked) => updateContentMeta("show", checked)}
        />

        {s.content.meta.show && (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Meta Items
              </Label>
              <div className="space-y-2 rounded-md border p-2">
                {(["date", "readingTime", "category"] as const).map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Checkbox
                      id={`featured-meta-${item}`}
                      checked={s.content.meta.items.includes(item)}
                      onCheckedChange={() => toggleMetaItem(item)}
                    />
                    <label htmlFor={`featured-meta-${item}`} className="text-sm cursor-pointer flex-1">
                      {item === "readingTime" ? "Reading Time" : item.charAt(0).toUpperCase() + item.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <SelectInput
              label="Date Format"
              value={s.content.meta.dateFormat}
              onChange={(v) => updateContentMeta("dateFormat", v)}
              options={[
                { value: "relative", label: "Relative (2 days ago)" },
                { value: "short", label: "Short (Jan 15)" },
                { value: "long", label: "Long (January 15, 2025)" },
              ]}
            />
          </>
        )}

        {/* Read More */}
        <ToggleSwitch
          label="Show Read More"
          checked={s.content.readMore.show}
          onChange={(checked) => updateContentReadMore("show", checked)}
        />

        {s.content.readMore.show && (
          <>
            <TextInput
              label="Read More Text"
              value={s.content.readMore.text}
              onChange={(v) => updateContentReadMore("text", v)}
              placeholder="Read Article"
            />

            <SelectInput
              label="Read More Style"
              value={s.content.readMore.style}
              onChange={(v) => updateContentReadMore("style", v)}
              options={[
                { value: "button-primary", label: "Primary Button" },
                { value: "button-outline", label: "Outline Button" },
                { value: "link", label: "Link" },
                { value: "arrow", label: "Arrow" },
              ]}
            />
          </>
        )}

        {/* Alignment */}
        <SelectInput
          label="Content Alignment"
          value={s.content.alignment}
          onChange={(v) => updateContent("alignment", v)}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
          ]}
        />

        <SelectInput
          label="Vertical Position"
          value={s.content.verticalPosition}
          onChange={(v) => updateContent("verticalPosition", v)}
          options={[
            { value: "top", label: "Top" },
            { value: "center", label: "Center" },
            { value: "bottom", label: "Bottom" },
          ]}
        />
      </AccordionSection>
    </div>
  );
}
