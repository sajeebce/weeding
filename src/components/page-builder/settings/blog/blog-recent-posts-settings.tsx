"use client";

import type {
  BlogRecentPostsWidgetSettings,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_RECENT_POSTS_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

interface BlogRecentPostsSettingsProps {
  settings: BlogRecentPostsWidgetSettings;
  onChange: (settings: BlogRecentPostsWidgetSettings) => void;
}

export function BlogRecentPostsSettingsPanel({
  settings,
  onChange,
}: BlogRecentPostsSettingsProps) {
  // Deep merge with defaults
  const s = {
    ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS,
    ...settings,
    header: {
      ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS.header,
      ...settings?.header,
    },
    dataSource: {
      ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS.dataSource,
      ...settings?.dataSource,
    },
    display: {
      ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS.display,
      ...settings?.display,
      thumbnail: {
        ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS.display.thumbnail,
        ...settings?.display?.thumbnail,
      },
      divider: {
        ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS.display.divider,
        ...settings?.display?.divider,
      },
    },
    viewAllLink: {
      ...DEFAULT_BLOG_RECENT_POSTS_SETTINGS.viewAllLink,
      ...settings?.viewAllLink,
    },
  } as BlogRecentPostsWidgetSettings;

  // Helper update functions
  const updateHeader = (key: keyof BlogRecentPostsWidgetSettings["header"], value: unknown) => {
    onChange({ ...s, header: { ...s.header, [key]: value } });
  };

  const updateDataSource = (key: keyof BlogRecentPostsWidgetSettings["dataSource"], value: unknown) => {
    onChange({ ...s, dataSource: { ...s.dataSource, [key]: value } });
  };

  const updateDisplay = (key: keyof BlogRecentPostsWidgetSettings["display"], value: unknown) => {
    onChange({ ...s, display: { ...s.display, [key]: value } });
  };

  const updateDisplayThumbnail = (key: keyof BlogRecentPostsWidgetSettings["display"]["thumbnail"], value: unknown) => {
    onChange({
      ...s,
      display: {
        ...s.display,
        thumbnail: { ...s.display.thumbnail, [key]: value },
      },
    });
  };

  const updateDisplayDivider = (key: keyof BlogRecentPostsWidgetSettings["display"]["divider"], value: unknown) => {
    onChange({
      ...s,
      display: {
        ...s.display,
        divider: { ...s.display.divider, [key]: value },
      },
    });
  };

  const updateViewAllLink = (key: keyof BlogRecentPostsWidgetSettings["viewAllLink"], value: unknown) => {
    onChange({ ...s, viewAllLink: { ...s.viewAllLink, [key]: value } });
  };

  const showThumbnail = s.display.style === "thumbnail";

  return (
    <div className="space-y-3">
      {/* Header */}
      <AccordionSection title="Header">
        <ToggleSwitch
          label="Show Header"
          checked={s.header.show}
          onChange={(checked) => updateHeader("show", checked)}
        />

        {s.header.show && (
          <>
            <TextInput
              label="Header Text"
              value={s.header.text}
              onChange={(v) => updateHeader("text", v)}
              placeholder="Recent Posts"
            />

            <SelectInput
              label="Header Size"
              value={s.header.size}
              onChange={(v) => updateHeader("size", v)}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />

            {s.header.color && (
              <ColorInput
                label="Header Color"
                value={s.header.color}
                onChange={(v) => updateHeader("color", v)}
              />
            )}
          </>
        )}
      </AccordionSection>

      {/* Data Source */}
      <AccordionSection title="Data Source">
        <NumberInput
          label="Post Count"
          value={s.dataSource.postCount}
          onChange={(v) => updateDataSource("postCount", v)}
          min={1}
          max={10}
          step={1}
        />

        <SelectInput
          label="Order By"
          value={s.dataSource.orderBy}
          onChange={(v) => updateDataSource("orderBy", v)}
          options={[
            { value: "date", label: "Date" },
            { value: "random", label: "Random" },
          ]}
        />
      </AccordionSection>

      {/* Display */}
      <AccordionSection title="Display">
        <SelectInput
          label="Style"
          value={s.display.style}
          onChange={(v) => updateDisplay("style", v)}
          options={[
            { value: "title-only", label: "Title Only" },
            { value: "title-date", label: "Title + Date" },
            { value: "title-meta", label: "Title + Meta" },
            { value: "thumbnail", label: "Thumbnail" },
            { value: "numbered", label: "Numbered" },
          ]}
        />

        {/* Thumbnail settings (when thumbnail style) */}
        {showThumbnail && (
          <>
            <NumberInput
              label="Thumbnail Size"
              value={s.display.thumbnail.size}
              onChange={(v) => updateDisplayThumbnail("size", v)}
              min={40}
              max={120}
              step={4}
              unit="px"
            />

            <NumberInput
              label="Thumbnail Border Radius"
              value={s.display.thumbnail.borderRadius}
              onChange={(v) => updateDisplayThumbnail("borderRadius", v)}
              min={0}
              max={24}
              step={2}
              unit="px"
            />

            <SelectInput
              label="Thumbnail Aspect Ratio"
              value={s.display.thumbnail.aspectRatio}
              onChange={(v) => updateDisplayThumbnail("aspectRatio", v)}
              options={[
                { value: "1:1", label: "1:1 Square" },
                { value: "4:3", label: "4:3" },
              ]}
            />
          </>
        )}

        <SelectInput
          label="Title Font Size"
          value={s.display.titleFontSize}
          onChange={(v) => updateDisplay("titleFontSize", v)}
          options={[
            { value: "xs", label: "Extra Small" },
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
          ]}
        />

        <NumberInput
          label="Title Max Lines"
          value={s.display.titleMaxLines}
          onChange={(v) => updateDisplay("titleMaxLines", v)}
          min={1}
          max={4}
          step={1}
        />

        <SelectInput
          label="Date Format"
          value={s.display.dateFormat}
          onChange={(v) => updateDisplay("dateFormat", v)}
          options={[
            { value: "relative", label: "Relative (2 days ago)" },
            { value: "short", label: "Short (Jan 15)" },
          ]}
        />

        <NumberInput
          label="Item Gap"
          value={s.display.itemGap}
          onChange={(v) => updateDisplay("itemGap", v)}
          min={4}
          max={24}
          step={2}
          unit="px"
        />

        <ToggleSwitch
          label="Show Divider"
          checked={s.display.divider.show}
          onChange={(checked) => updateDisplayDivider("show", checked)}
        />

        {s.display.divider.show && s.display.divider.color && (
          <ColorInput
            label="Divider Color"
            value={s.display.divider.color}
            onChange={(v) => updateDisplayDivider("color", v)}
          />
        )}
      </AccordionSection>

      {/* View All Link */}
      <AccordionSection title="View All Link">
        <ToggleSwitch
          label="Show View All"
          checked={s.viewAllLink.show}
          onChange={(checked) => updateViewAllLink("show", checked)}
        />

        {s.viewAllLink.show && (
          <>
            <TextInput
              label="Link Text"
              value={s.viewAllLink.text}
              onChange={(v) => updateViewAllLink("text", v)}
              placeholder="View All Posts"
            />

            <TextInput
              label="Link URL"
              value={s.viewAllLink.url}
              onChange={(v) => updateViewAllLink("url", v)}
              placeholder="/blog"
            />

            {s.viewAllLink.color && (
              <ColorInput
                label="Link Color"
                value={s.viewAllLink.color}
                onChange={(v) => updateViewAllLink("color", v)}
              />
            )}
          </>
        )}
      </AccordionSection>
    </div>
  );
}
