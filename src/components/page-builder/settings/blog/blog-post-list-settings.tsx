"use client";

import type {
  BlogPostListWidgetSettings,
  BlogSectionHeader,
  BlogDataSource,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_LIST_SETTINGS } from "@/lib/page-builder/defaults";
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

interface BlogPostListSettingsProps {
  settings: BlogPostListWidgetSettings;
  onChange: (settings: BlogPostListWidgetSettings) => void;
}

export function BlogPostListSettingsPanel({
  settings,
  onChange,
}: BlogPostListSettingsProps) {
  // Deep merge with defaults
  const s = {
    ...DEFAULT_BLOG_POST_LIST_SETTINGS,
    ...settings,
    header: {
      ...DEFAULT_BLOG_POST_LIST_SETTINGS.header,
      ...settings?.header,
      badge: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.header.badge,
        ...settings?.header?.badge,
      },
      heading: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.header.heading,
        ...settings?.header?.heading,
      },
      subheading: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.header.subheading,
        ...settings?.header?.subheading,
      },
      viewAllLink: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.header.viewAllLink,
        ...settings?.header?.viewAllLink,
      },
    },
    dataSource: {
      ...DEFAULT_BLOG_POST_LIST_SETTINGS.dataSource,
      ...settings?.dataSource,
    },
    layout: {
      ...DEFAULT_BLOG_POST_LIST_SETTINGS.layout,
      ...settings?.layout,
      divider: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.layout.divider,
        ...settings?.layout?.divider,
      },
    },
    item: {
      ...DEFAULT_BLOG_POST_LIST_SETTINGS.item,
      ...settings?.item,
      image: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.item.image,
        ...settings?.item?.image,
      },
      categoryBadge: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.item.categoryBadge,
        ...settings?.item?.categoryBadge,
      },
      title: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.item.title,
        ...settings?.item?.title,
      },
      excerpt: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.item.excerpt,
        ...settings?.item?.excerpt,
      },
      meta: {
        ...DEFAULT_BLOG_POST_LIST_SETTINGS.item.meta,
        ...settings?.item?.meta,
      },
    },
    pagination: {
      ...DEFAULT_BLOG_POST_LIST_SETTINGS.pagination,
      ...settings?.pagination,
    },
  } as BlogPostListWidgetSettings;

  // Helper update functions
  const updateDataSource = (key: keyof BlogDataSource, value: unknown) => {
    onChange({ ...s, dataSource: { ...s.dataSource, [key]: value } });
  };

  const updateLayout = (key: keyof BlogPostListWidgetSettings["layout"], value: unknown) => {
    onChange({ ...s, layout: { ...s.layout, [key]: value } });
  };

  const updateLayoutDivider = (key: keyof BlogPostListWidgetSettings["layout"]["divider"], value: unknown) => {
    onChange({
      ...s,
      layout: { ...s.layout, divider: { ...s.layout.divider, [key]: value } },
    });
  };

  const updateItem = (key: keyof BlogPostListWidgetSettings["item"], value: unknown) => {
    onChange({ ...s, item: { ...s.item, [key]: value } });
  };

  const updateItemImage = (key: keyof BlogPostListWidgetSettings["item"]["image"], value: unknown) => {
    onChange({
      ...s,
      item: { ...s.item, image: { ...s.item.image, [key]: value } },
    });
  };

  const updateItemTitle = (key: keyof BlogPostListWidgetSettings["item"]["title"], value: unknown) => {
    onChange({
      ...s,
      item: { ...s.item, title: { ...s.item.title, [key]: value } },
    });
  };

  const updateItemExcerpt = (key: keyof BlogPostListWidgetSettings["item"]["excerpt"], value: unknown) => {
    onChange({
      ...s,
      item: { ...s.item, excerpt: { ...s.item.excerpt, [key]: value } },
    });
  };

  const updateItemMeta = (key: keyof BlogPostListWidgetSettings["item"]["meta"], value: unknown) => {
    onChange({
      ...s,
      item: { ...s.item, meta: { ...s.item.meta, [key]: value } },
    });
  };

  const updateItemCategoryBadge = (key: keyof BlogPostListWidgetSettings["item"]["categoryBadge"], value: unknown) => {
    onChange({
      ...s,
      item: { ...s.item, categoryBadge: { ...s.item.categoryBadge, [key]: value } },
    });
  };

  const updatePagination = (key: keyof BlogPostListWidgetSettings["pagination"], value: unknown) => {
    onChange({ ...s, pagination: { ...s.pagination, [key]: value } });
  };

  const updateHeader = (updates: Partial<BlogSectionHeader>) => {
    onChange({ ...s, header: { ...s.header, ...updates } });
  };

  const updateHeaderHeading = (updates: Partial<BlogSectionHeader["heading"]>) => {
    onChange({
      ...s,
      header: { ...s.header, heading: { ...s.header.heading, ...updates } },
    });
  };

  const updateHeaderSubheading = (updates: Partial<NonNullable<BlogSectionHeader["subheading"]>>) => {
    onChange({
      ...s,
      header: {
        ...s.header,
        subheading: { ...s.header.subheading!, ...updates },
      },
    });
  };

  const updateHeaderViewAllLink = (updates: Partial<BlogSectionHeader["viewAllLink"]>) => {
    onChange({
      ...s,
      header: {
        ...s.header,
        viewAllLink: { ...s.header.viewAllLink, ...updates },
      },
    });
  };

  const toggleMetaItem = (item: "date" | "category" | "readingTime") => {
    const currentItems = s.item.meta.items;
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    updateItemMeta("items", newItems);
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
            { value: "all", label: "All Posts" },
            { value: "category", label: "By Category" },
            { value: "tag", label: "By Tag" },
            { value: "recent", label: "Recent" },
            { value: "manual", label: "Manual Selection" },
          ]}
        />

        <NumberInput
          label="Post Count"
          value={s.dataSource.postCount}
          onChange={(v) => updateDataSource("postCount", v)}
          min={1}
          max={24}
          step={1}
        />

        <SelectInput
          label="Order By"
          value={s.dataSource.orderBy}
          onChange={(v) => updateDataSource("orderBy", v)}
          options={[
            { value: "date", label: "Date" },
            { value: "title", label: "Title" },
            { value: "modified", label: "Last Modified" },
            { value: "random", label: "Random" },
          ]}
        />

        <SelectInput
          label="Order Direction"
          value={s.dataSource.orderDirection}
          onChange={(v) => updateDataSource("orderDirection", v)}
          options={[
            { value: "desc", label: "Descending" },
            { value: "asc", label: "Ascending" },
          ]}
        />
      </AccordionSection>

      {/* Layout */}
      <AccordionSection title="Layout">
        <SelectInput
          label="Image Position"
          value={s.layout.imagePosition}
          onChange={(v) => updateLayout("imagePosition", v)}
          options={[
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
            { value: "alternating", label: "Alternating" },
            { value: "none", label: "No Image" },
          ]}
        />

        {s.layout.imagePosition !== "none" && (
          <SelectInput
            label="Image Width"
            value={s.layout.imageWidth}
            onChange={(v) => updateLayout("imageWidth", v)}
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
          />
        )}

        <NumberInput
          label="Gap"
          value={s.layout.gap}
          onChange={(v) => updateLayout("gap", v)}
          min={8}
          max={48}
          step={4}
          unit="px"
        />

        <ToggleSwitch
          label="Show Divider"
          checked={s.layout.divider.show}
          onChange={(checked) => updateLayoutDivider("show", checked)}
        />

        {s.layout.divider.show && (
          <>
            <SelectInput
              label="Divider Style"
              value={s.layout.divider.style}
              onChange={(v) => updateLayoutDivider("style", v)}
              options={[
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dashed" },
              ]}
            />

            {s.layout.divider.color && (
              <ColorInput
                label="Divider Color"
                value={s.layout.divider.color}
                onChange={(v) => updateLayoutDivider("color", v)}
              />
            )}
          </>
        )}
      </AccordionSection>

      {/* Item Design */}
      <AccordionSection title="Item Design">
        {/* Image */}
        {s.layout.imagePosition !== "none" && (
          <>
            <SelectInput
              label="Image Aspect Ratio"
              value={s.item.image.aspectRatio}
              onChange={(v) => updateItemImage("aspectRatio", v)}
              options={[
                { value: "1:1", label: "1:1 Square" },
                { value: "4:3", label: "4:3" },
                { value: "16:9", label: "16:9" },
              ]}
            />

            <NumberInput
              label="Image Border Radius"
              value={s.item.image.borderRadius}
              onChange={(v) => updateItemImage("borderRadius", v)}
              min={0}
              max={24}
              step={2}
              unit="px"
            />

            <SelectInput
              label="Image Hover Effect"
              value={s.item.image.hoverEffect}
              onChange={(v) => updateItemImage("hoverEffect", v)}
              options={[
                { value: "none", label: "None" },
                { value: "zoom", label: "Zoom" },
              ]}
            />
          </>
        )}

        {/* Title */}
        <SelectInput
          label="Title Font Size"
          value={s.item.title.fontSize}
          onChange={(v) => updateItemTitle("fontSize", v)}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />

        <NumberInput
          label="Title Max Lines"
          value={s.item.title.maxLines}
          onChange={(v) => updateItemTitle("maxLines", v)}
          min={1}
          max={5}
          step={1}
        />

        {/* Excerpt */}
        <ToggleSwitch
          label="Show Excerpt"
          checked={s.item.excerpt.show}
          onChange={(checked) => updateItemExcerpt("show", checked)}
        />

        {s.item.excerpt.show && (
          <NumberInput
            label="Max Excerpt Length"
            value={s.item.excerpt.maxLength}
            onChange={(v) => updateItemExcerpt("maxLength", v)}
            min={50}
            max={300}
            step={10}
          />
        )}

        {/* Meta Items */}
        <ToggleSwitch
          label="Show Meta"
          checked={s.item.meta.show}
          onChange={(checked) => updateItemMeta("show", checked)}
        />

        {s.item.meta.show && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Meta Items
            </Label>
            <div className="space-y-2 rounded-md border p-2">
              {(["date", "category", "readingTime"] as const).map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox
                    id={`list-meta-${item}`}
                    checked={s.item.meta.items.includes(item)}
                    onCheckedChange={() => toggleMetaItem(item)}
                  />
                  <label htmlFor={`list-meta-${item}`} className="text-sm cursor-pointer flex-1">
                    {item === "readingTime" ? "Reading Time" : item.charAt(0).toUpperCase() + item.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hover Effect */}
        <SelectInput
          label="Hover Effect"
          value={s.item.hoverEffect}
          onChange={(v) => updateItem("hoverEffect", v)}
          options={[
            { value: "none", label: "None" },
            { value: "highlight", label: "Highlight" },
            { value: "shift-right", label: "Shift Right" },
          ]}
        />
      </AccordionSection>

      {/* Category Badge */}
      <AccordionSection title="Category Badge">
        <ToggleSwitch
          label="Show Category Badge"
          checked={s.item.categoryBadge.show}
          onChange={(checked) => updateItemCategoryBadge("show", checked)}
        />

        {s.item.categoryBadge.show && (
          <SelectInput
            label="Style"
            value={s.item.categoryBadge.style}
            onChange={(v) => updateItemCategoryBadge("style", v)}
            options={[
              { value: "pill", label: "Pill" },
              { value: "text-only", label: "Text Only" },
            ]}
          />
        )}
      </AccordionSection>

      {/* Pagination */}
      <AccordionSection title="Pagination">
        <SelectInput
          label="Type"
          value={s.pagination.type}
          onChange={(v) => updatePagination("type", v)}
          options={[
            { value: "none", label: "None" },
            { value: "load-more", label: "Load More" },
            { value: "numbered", label: "Numbered" },
          ]}
        />

        {s.pagination.type === "load-more" && (
          <TextInput
            label="Load More Text"
            value={s.pagination.loadMoreText}
            onChange={(v) => updatePagination("loadMoreText", v)}
            placeholder="Load More"
          />
        )}
      </AccordionSection>

      {/* Header */}
      <AccordionSection title="Header">
        <ToggleSwitch
          label="Show Header"
          checked={s.header.show}
          onChange={(checked) => updateHeader({ show: checked })}
        />

        {s.header.show && (
          <>
            <TextInput
              label="Heading"
              value={s.header.heading.text}
              onChange={(v) => updateHeaderHeading({ text: v })}
              placeholder="Latest Articles"
            />

            <ToggleSwitch
              label="Show Subheading"
              checked={s.header.subheading?.show ?? false}
              onChange={(checked) => updateHeaderSubheading({ show: checked })}
            />

            {s.header.subheading?.show && (
              <TextInput
                label="Subheading Text"
                value={s.header.subheading?.text ?? ""}
                onChange={(v) => updateHeaderSubheading({ text: v })}
                placeholder="Insights and guides"
              />
            )}

            <ToggleSwitch
              label="Show View All Link"
              checked={s.header.viewAllLink.show}
              onChange={(checked) => updateHeaderViewAllLink({ show: checked })}
            />

            {s.header.viewAllLink.show && (
              <>
                <TextInput
                  label="View All Text"
                  value={s.header.viewAllLink.text}
                  onChange={(v) => updateHeaderViewAllLink({ text: v })}
                  placeholder="View All Articles"
                />

                <TextInput
                  label="View All URL"
                  value={s.header.viewAllLink.url}
                  onChange={(v) => updateHeaderViewAllLink({ url: v })}
                  placeholder="/blog"
                />
              </>
            )}

            <SelectInput
              label="Alignment"
              value={s.header.alignment}
              onChange={(v) => updateHeader({ alignment: v as BlogSectionHeader["alignment"] })}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "space-between", label: "Space Between" },
              ]}
            />
          </>
        )}
      </AccordionSection>
    </div>
  );
}
