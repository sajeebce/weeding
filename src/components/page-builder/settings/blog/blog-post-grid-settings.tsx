"use client";

import type {
  BlogPostGridWidgetSettings,
  BlogSectionHeader,
  BlogDataSource,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_GRID_SETTINGS } from "@/lib/page-builder/defaults";
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

interface BlogPostGridSettingsProps {
  settings: BlogPostGridWidgetSettings;
  onChange: (settings: BlogPostGridWidgetSettings) => void;
}

export function BlogPostGridSettingsPanel({
  settings,
  onChange,
}: BlogPostGridSettingsProps) {
  // Deep merge with defaults
  const s = {
    ...DEFAULT_BLOG_POST_GRID_SETTINGS,
    ...settings,
    header: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.header,
      ...settings?.header,
      badge: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.header.badge,
        ...settings?.header?.badge,
      },
      heading: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.header.heading,
        ...settings?.header?.heading,
      },
      subheading: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.header.subheading,
        ...settings?.header?.subheading,
      },
      viewAllLink: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.header.viewAllLink,
        ...settings?.header?.viewAllLink,
      },
    },
    dataSource: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.dataSource,
      ...settings?.dataSource,
    },
    layout: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.layout,
      ...settings?.layout,
      columns: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.layout.columns,
        ...settings?.layout?.columns,
      },
    },
    card: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.card,
      ...settings?.card,
      image: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.card.image,
        ...settings?.card?.image,
      },
      categoryBadge: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.card.categoryBadge,
        ...settings?.card?.categoryBadge,
      },
      title: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.card.title,
        ...settings?.card?.title,
      },
      excerpt: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.card.excerpt,
        ...settings?.card?.excerpt,
      },
      meta: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.card.meta,
        ...settings?.card?.meta,
      },
      readMore: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.card.readMore,
        ...settings?.card?.readMore,
      },
    },
    filterTabs: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.filterTabs,
      ...settings?.filterTabs,
    },
    pagination: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.pagination,
      ...settings?.pagination,
    },
    emptyState: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.emptyState,
      ...settings?.emptyState,
    },
    animation: {
      ...DEFAULT_BLOG_POST_GRID_SETTINGS.animation,
      ...settings?.animation,
      entrance: {
        ...DEFAULT_BLOG_POST_GRID_SETTINGS.animation.entrance,
        ...settings?.animation?.entrance,
      },
    },
  } as BlogPostGridWidgetSettings;

  // Helper update functions
  const updateDataSource = (key: keyof BlogDataSource, value: unknown) => {
    onChange({ ...s, dataSource: { ...s.dataSource, [key]: value } });
  };

  const updateLayout = (key: keyof BlogPostGridWidgetSettings["layout"], value: unknown) => {
    onChange({ ...s, layout: { ...s.layout, [key]: value } });
  };

  const updateLayoutColumns = (key: keyof BlogPostGridWidgetSettings["layout"]["columns"], value: unknown) => {
    onChange({
      ...s,
      layout: { ...s.layout, columns: { ...s.layout.columns, [key]: value } },
    });
  };

  const updateCard = (key: keyof BlogPostGridWidgetSettings["card"], value: unknown) => {
    onChange({ ...s, card: { ...s.card, [key]: value } });
  };

  const updateCardImage = (key: keyof BlogPostGridWidgetSettings["card"]["image"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, image: { ...s.card.image, [key]: value } },
    });
  };

  const updateCardTitle = (key: keyof BlogPostGridWidgetSettings["card"]["title"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, title: { ...s.card.title, [key]: value } },
    });
  };

  const updateCardExcerpt = (key: keyof BlogPostGridWidgetSettings["card"]["excerpt"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, excerpt: { ...s.card.excerpt, [key]: value } },
    });
  };

  const updateCardMeta = (key: keyof BlogPostGridWidgetSettings["card"]["meta"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, meta: { ...s.card.meta, [key]: value } },
    });
  };

  const updateCardReadMore = (key: keyof BlogPostGridWidgetSettings["card"]["readMore"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, readMore: { ...s.card.readMore, [key]: value } },
    });
  };

  const updateCardCategoryBadge = (key: keyof BlogPostGridWidgetSettings["card"]["categoryBadge"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, categoryBadge: { ...s.card.categoryBadge, [key]: value } },
    });
  };

  const updateFilterTabs = (key: keyof BlogPostGridWidgetSettings["filterTabs"], value: unknown) => {
    onChange({ ...s, filterTabs: { ...s.filterTabs, [key]: value } });
  };

  const updatePagination = (key: keyof BlogPostGridWidgetSettings["pagination"], value: unknown) => {
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

  const updateAnimation = (updates: Partial<BlogPostGridWidgetSettings["animation"]["entrance"]>) => {
    onChange({
      ...s,
      animation: {
        ...s.animation,
        entrance: { ...s.animation.entrance, ...updates },
      },
    });
  };

  const toggleMetaItem = (item: "date" | "category" | "readingTime") => {
    const currentItems = s.card.meta.items;
    const newItems = currentItems.includes(item)
      ? currentItems.filter((i) => i !== item)
      : [...currentItems, item];
    updateCardMeta("items", newItems);
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
          label="Type"
          value={s.layout.type}
          onChange={(v) => updateLayout("type", v)}
          options={[
            { value: "grid", label: "Grid" },
            { value: "masonry", label: "Masonry" },
          ]}
        />

        <SelectInput
          label="Desktop Columns"
          value={s.layout.columns.desktop.toString()}
          onChange={(v) => updateLayoutColumns("desktop", parseInt(v))}
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
            { value: "4", label: "4 Columns" },
          ]}
        />

        <SelectInput
          label="Tablet Columns"
          value={s.layout.columns.tablet.toString()}
          onChange={(v) => updateLayoutColumns("tablet", parseInt(v))}
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
          ]}
        />

        <SelectInput
          label="Mobile Columns"
          value={s.layout.columns.mobile.toString()}
          onChange={(v) => updateLayoutColumns("mobile", parseInt(v))}
          options={[
            { value: "1", label: "1 Column" },
            { value: "2", label: "2 Columns" },
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

        <ToggleSwitch
          label="Equal Height"
          checked={s.layout.equalHeight}
          onChange={(checked) => updateLayout("equalHeight", checked)}
        />
      </AccordionSection>

      {/* Card Design */}
      <AccordionSection title="Card Design">
        <SelectInput
          label="Style"
          value={s.card.style}
          onChange={(v) => updateCard("style", v)}
          options={[
            { value: "default", label: "Default" },
            { value: "bordered", label: "Bordered" },
            { value: "elevated", label: "Elevated" },
            { value: "minimal", label: "Minimal" },
          ]}
        />

        <NumberInput
          label="Border Radius"
          value={s.card.borderRadius}
          onChange={(v) => updateCard("borderRadius", v)}
          min={0}
          max={32}
          step={2}
          unit="px"
        />

        <SelectInput
          label="Shadow"
          value={s.card.shadow}
          onChange={(v) => updateCard("shadow", v)}
          options={[
            { value: "none", label: "None" },
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />

        <SelectInput
          label="Hover Effect"
          value={s.card.hoverEffect}
          onChange={(v) => updateCard("hoverEffect", v)}
          options={[
            { value: "none", label: "None" },
            { value: "lift", label: "Lift" },
            { value: "shadow", label: "Shadow" },
            { value: "scale", label: "Scale" },
          ]}
        />

        {/* Image */}
        <ToggleSwitch
          label="Show Image"
          checked={s.card.image.show}
          onChange={(checked) => updateCardImage("show", checked)}
        />

        {s.card.image.show && (
          <>
            <SelectInput
              label="Image Aspect Ratio"
              value={s.card.image.aspectRatio}
              onChange={(v) => updateCardImage("aspectRatio", v)}
              options={[
                { value: "16:9", label: "16:9" },
                { value: "4:3", label: "4:3" },
                { value: "3:2", label: "3:2" },
                { value: "1:1", label: "1:1" },
              ]}
            />

            <SelectInput
              label="Image Hover Effect"
              value={s.card.image.hoverEffect}
              onChange={(v) => updateCardImage("hoverEffect", v)}
              options={[
                { value: "none", label: "None" },
                { value: "zoom", label: "Zoom" },
                { value: "brighten", label: "Brighten" },
              ]}
            />
          </>
        )}

        {/* Title */}
        <SelectInput
          label="Title Font Size"
          value={s.card.title.fontSize}
          onChange={(v) => updateCardTitle("fontSize", v)}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra Large" },
          ]}
        />

        <NumberInput
          label="Title Max Lines"
          value={s.card.title.maxLines}
          onChange={(v) => updateCardTitle("maxLines", v)}
          min={1}
          max={5}
          step={1}
        />

        {/* Excerpt */}
        <ToggleSwitch
          label="Show Excerpt"
          checked={s.card.excerpt.show}
          onChange={(checked) => updateCardExcerpt("show", checked)}
        />

        {s.card.excerpt.show && (
          <NumberInput
            label="Max Excerpt Length"
            value={s.card.excerpt.maxLength}
            onChange={(v) => updateCardExcerpt("maxLength", v)}
            min={50}
            max={300}
            step={10}
          />
        )}

        {/* Meta Items */}
        <ToggleSwitch
          label="Show Meta"
          checked={s.card.meta.show}
          onChange={(checked) => updateCardMeta("show", checked)}
        />

        {s.card.meta.show && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Meta Items
            </Label>
            <div className="space-y-2 rounded-md border p-2">
              {(["date", "category", "readingTime"] as const).map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox
                    id={`meta-${item}`}
                    checked={s.card.meta.items.includes(item)}
                    onCheckedChange={() => toggleMetaItem(item)}
                  />
                  <label htmlFor={`meta-${item}`} className="text-sm cursor-pointer flex-1">
                    {item === "readingTime" ? "Reading Time" : item.charAt(0).toUpperCase() + item.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read More */}
        <ToggleSwitch
          label="Show Read More"
          checked={s.card.readMore.show}
          onChange={(checked) => updateCardReadMore("show", checked)}
        />

        {s.card.readMore.show && (
          <>
            <TextInput
              label="Read More Text"
              value={s.card.readMore.text}
              onChange={(v) => updateCardReadMore("text", v)}
              placeholder="Read More"
            />

            <SelectInput
              label="Read More Style"
              value={s.card.readMore.style}
              onChange={(v) => updateCardReadMore("style", v)}
              options={[
                { value: "link", label: "Link" },
                { value: "button-sm", label: "Small Button" },
                { value: "arrow-only", label: "Arrow Only" },
              ]}
            />
          </>
        )}
      </AccordionSection>

      {/* Category Badge */}
      <AccordionSection title="Category Badge">
        <ToggleSwitch
          label="Show Category Badge"
          checked={s.card.categoryBadge.show}
          onChange={(checked) => updateCardCategoryBadge("show", checked)}
        />

        {s.card.categoryBadge.show && (
          <>
            <SelectInput
              label="Position"
              value={s.card.categoryBadge.position}
              onChange={(v) => updateCardCategoryBadge("position", v)}
              options={[
                { value: "overlay-top-left", label: "Overlay Top Left" },
                { value: "above-title", label: "Above Title" },
                { value: "below-title", label: "Below Title" },
              ]}
            />

            <SelectInput
              label="Style"
              value={s.card.categoryBadge.style}
              onChange={(v) => updateCardCategoryBadge("style", v)}
              options={[
                { value: "pill", label: "Pill" },
                { value: "solid", label: "Solid" },
                { value: "minimal", label: "Minimal" },
              ]}
            />
          </>
        )}
      </AccordionSection>

      {/* Filter Tabs */}
      <AccordionSection title="Filter Tabs">
        <ToggleSwitch
          label="Show Filter Tabs"
          checked={s.filterTabs.show}
          onChange={(checked) => updateFilterTabs("show", checked)}
        />

        {s.filterTabs.show && (
          <>
            <SelectInput
              label="Style"
              value={s.filterTabs.style}
              onChange={(v) => updateFilterTabs("style", v)}
              options={[
                { value: "pills", label: "Pills" },
                { value: "underline", label: "Underline" },
                { value: "buttons", label: "Buttons" },
              ]}
            />

            <ToggleSwitch
              label='Show "All" Tab'
              checked={s.filterTabs.showAll}
              onChange={(checked) => updateFilterTabs("showAll", checked)}
            />

            {s.filterTabs.showAll && (
              <TextInput
                label="All Tab Text"
                value={s.filterTabs.allText}
                onChange={(v) => updateFilterTabs("allText", v)}
                placeholder="All"
              />
            )}
          </>
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
          <>
            <NumberInput
              label="Posts Per Load"
              value={s.pagination.postsPerLoad}
              onChange={(v) => updatePagination("postsPerLoad", v)}
              min={1}
              max={12}
              step={1}
            />

            <TextInput
              label="Load More Text"
              value={s.pagination.loadMoreText}
              onChange={(v) => updatePagination("loadMoreText", v)}
              placeholder="Load More Articles"
            />
          </>
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

      {/* Animation */}
      <AccordionSection title="Animation">
        <ToggleSwitch
          label="Enable Animation"
          checked={s.animation.entrance.enabled}
          onChange={(checked) => updateAnimation({ enabled: checked })}
        />

        {s.animation.entrance.enabled && (
          <>
            <SelectInput
              label="Type"
              value={s.animation.entrance.type}
              onChange={(v) => updateAnimation({ type: v as "none" | "fade" | "fade-up" })}
              options={[
                { value: "none", label: "None" },
                { value: "fade", label: "Fade" },
                { value: "fade-up", label: "Fade Up" },
              ]}
            />

            <ToggleSwitch
              label="Stagger"
              checked={s.animation.entrance.stagger}
              onChange={(checked) => updateAnimation({ stagger: checked })}
            />

            {s.animation.entrance.stagger && (
              <NumberInput
                label="Stagger Delay"
                value={s.animation.entrance.staggerDelay}
                onChange={(v) => updateAnimation({ staggerDelay: v })}
                min={50}
                max={300}
                step={25}
                unit="ms"
              />
            )}
          </>
        )}
      </AccordionSection>
    </div>
  );
}
