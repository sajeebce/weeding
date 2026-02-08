"use client";

import type {
  BlogPostCarouselWidgetSettings,
  BlogSectionHeader,
  BlogDataSource,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_CAROUSEL_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface BlogPostCarouselSettingsProps {
  settings: BlogPostCarouselWidgetSettings;
  onChange: (settings: BlogPostCarouselWidgetSettings) => void;
}

export function BlogPostCarouselSettingsPanel({
  settings,
  onChange,
}: BlogPostCarouselSettingsProps) {
  // Deep merge with defaults - defaults guarantee all required fields exist
  const d = DEFAULT_BLOG_POST_CAROUSEL_SETTINGS;
  const s = {
    ...d,
    ...settings,
    header: {
      ...d.header,
      ...settings?.header,
      badge: { ...d.header.badge, ...settings?.header?.badge },
      heading: { ...d.header.heading, ...settings?.header?.heading },
      subheading: { ...d.header.subheading, ...settings?.header?.subheading },
      viewAllLink: { ...d.header.viewAllLink, ...settings?.header?.viewAllLink },
    },
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    carousel: {
      ...d.carousel,
      ...settings?.carousel,
      slidesPerView: { ...d.carousel.slidesPerView, ...settings?.carousel?.slidesPerView },
      autoplay: { ...d.carousel.autoplay, ...settings?.carousel?.autoplay },
      navigation: {
        ...d.carousel.navigation,
        ...settings?.carousel?.navigation,
        arrows: { ...d.carousel.navigation.arrows, ...settings?.carousel?.navigation?.arrows },
        dots: { ...d.carousel.navigation.dots, ...settings?.carousel?.navigation?.dots },
      },
    },
    card: {
      ...d.card,
      ...settings?.card,
      image: { ...d.card.image, ...settings?.card?.image },
      categoryBadge: { ...d.card.categoryBadge, ...settings?.card?.categoryBadge },
      title: { ...d.card.title, ...settings?.card?.title },
      excerpt: { ...d.card.excerpt, ...settings?.card?.excerpt },
      meta: { ...d.card.meta, ...settings?.card?.meta },
      readMore: { ...d.card.readMore, ...settings?.card?.readMore },
    },
  } as BlogPostCarouselWidgetSettings;

  // Helper update functions
  const updateDataSource = (key: keyof BlogDataSource, value: unknown) => {
    onChange({ ...s, dataSource: { ...s.dataSource, [key]: value } });
  };

  const updateCarousel = (key: keyof BlogPostCarouselWidgetSettings["carousel"], value: unknown) => {
    onChange({ ...s, carousel: { ...s.carousel, [key]: value } });
  };

  const updateCarouselSlidesPerView = (key: keyof BlogPostCarouselWidgetSettings["carousel"]["slidesPerView"], value: unknown) => {
    onChange({
      ...s,
      carousel: {
        ...s.carousel,
        slidesPerView: { ...s.carousel.slidesPerView, [key]: value },
      },
    });
  };

  const updateCarouselAutoplay = (key: keyof BlogPostCarouselWidgetSettings["carousel"]["autoplay"], value: unknown) => {
    onChange({
      ...s,
      carousel: {
        ...s.carousel,
        autoplay: { ...s.carousel.autoplay, [key]: value },
      },
    });
  };

  const updateCarouselArrows = (key: keyof BlogPostCarouselWidgetSettings["carousel"]["navigation"]["arrows"], value: unknown) => {
    onChange({
      ...s,
      carousel: {
        ...s.carousel,
        navigation: {
          ...s.carousel.navigation,
          arrows: { ...s.carousel.navigation.arrows, [key]: value },
        },
      },
    });
  };

  const updateCarouselDots = (key: keyof BlogPostCarouselWidgetSettings["carousel"]["navigation"]["dots"], value: unknown) => {
    onChange({
      ...s,
      carousel: {
        ...s.carousel,
        navigation: {
          ...s.carousel.navigation,
          dots: { ...s.carousel.navigation.dots, [key]: value },
        },
      },
    });
  };

  const updateCard = (key: keyof BlogPostCarouselWidgetSettings["card"], value: unknown) => {
    onChange({ ...s, card: { ...s.card, [key]: value } });
  };

  const updateCardImage = (key: keyof BlogPostCarouselWidgetSettings["card"]["image"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, image: { ...s.card.image, [key]: value } },
    });
  };

  const updateCardTitle = (key: keyof BlogPostCarouselWidgetSettings["card"]["title"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, title: { ...s.card.title, [key]: value } },
    });
  };

  const updateCardExcerpt = (key: keyof BlogPostCarouselWidgetSettings["card"]["excerpt"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, excerpt: { ...s.card.excerpt, [key]: value } },
    });
  };

  const updateCardMeta = (key: keyof BlogPostCarouselWidgetSettings["card"]["meta"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, meta: { ...s.card.meta, [key]: value } },
    });
  };

  const updateCardReadMore = (key: keyof BlogPostCarouselWidgetSettings["card"]["readMore"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, readMore: { ...s.card.readMore, [key]: value } },
    });
  };

  const updateCardCategoryBadge = (key: keyof BlogPostCarouselWidgetSettings["card"]["categoryBadge"], value: unknown) => {
    onChange({
      ...s,
      card: { ...s.card, categoryBadge: { ...s.card.categoryBadge, [key]: value } },
    });
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

      {/* Carousel Settings */}
      <AccordionSection title="Carousel">
        <SelectInput
          label="Slides Per View (Desktop)"
          value={s.carousel.slidesPerView.desktop.toString()}
          onChange={(v) => updateCarouselSlidesPerView("desktop", parseInt(v))}
          options={[
            { value: "1", label: "1 Slide" },
            { value: "2", label: "2 Slides" },
            { value: "3", label: "3 Slides" },
            { value: "4", label: "4 Slides" },
          ]}
        />

        <SelectInput
          label="Slides Per View (Tablet)"
          value={s.carousel.slidesPerView.tablet.toString()}
          onChange={(v) => updateCarouselSlidesPerView("tablet", parseInt(v))}
          options={[
            { value: "1", label: "1 Slide" },
            { value: "2", label: "2 Slides" },
            { value: "3", label: "3 Slides" },
          ]}
        />

        <NumberInput
          label="Space Between"
          value={s.carousel.spaceBetween}
          onChange={(v) => updateCarousel("spaceBetween", v)}
          min={0}
          max={48}
          step={4}
          unit="px"
        />

        <ToggleSwitch
          label="Autoplay"
          checked={s.carousel.autoplay.enabled}
          onChange={(checked) => updateCarouselAutoplay("enabled", checked)}
        />

        {s.carousel.autoplay.enabled && (
          <>
            <NumberInput
              label="Autoplay Delay"
              value={s.carousel.autoplay.delay}
              onChange={(v) => updateCarouselAutoplay("delay", v)}
              min={1000}
              max={10000}
              step={500}
              unit="ms"
            />

            <ToggleSwitch
              label="Pause on Hover"
              checked={s.carousel.autoplay.pauseOnHover}
              onChange={(checked) => updateCarouselAutoplay("pauseOnHover", checked)}
            />
          </>
        )}

        <ToggleSwitch
          label="Loop"
          checked={s.carousel.loop}
          onChange={(checked) => updateCarousel("loop", checked)}
        />

        <NumberInput
          label="Speed"
          value={s.carousel.speed}
          onChange={(v) => updateCarousel("speed", v)}
          min={200}
          max={1500}
          step={100}
          unit="ms"
        />

        {/* Navigation Arrows */}
        <ToggleSwitch
          label="Show Arrows"
          checked={s.carousel.navigation.arrows.enabled}
          onChange={(checked) => updateCarouselArrows("enabled", checked)}
        />

        {s.carousel.navigation.arrows.enabled && (
          <>
            <SelectInput
              label="Arrow Style"
              value={s.carousel.navigation.arrows.style}
              onChange={(v) => updateCarouselArrows("style", v)}
              options={[
                { value: "default", label: "Default" },
                { value: "minimal", label: "Minimal" },
                { value: "rounded", label: "Rounded" },
              ]}
            />

            <ToggleSwitch
              label="Show on Hover Only"
              checked={s.carousel.navigation.arrows.showOnHover}
              onChange={(checked) => updateCarouselArrows("showOnHover", checked)}
            />
          </>
        )}

        {/* Navigation Dots */}
        <ToggleSwitch
          label="Show Dots"
          checked={s.carousel.navigation.dots.enabled}
          onChange={(checked) => updateCarouselDots("enabled", checked)}
        />

        {s.carousel.navigation.dots.enabled && (
          <SelectInput
            label="Dots Style"
            value={s.carousel.navigation.dots.style}
            onChange={(v) => updateCarouselDots("style", v)}
            options={[
              { value: "dots", label: "Dots" },
              { value: "lines", label: "Lines" },
            ]}
          />
        )}
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
                    id={`carousel-meta-${item}`}
                    checked={s.card.meta.items.includes(item)}
                    onCheckedChange={() => toggleMetaItem(item)}
                  />
                  <label htmlFor={`carousel-meta-${item}`} className="text-sm cursor-pointer flex-1">
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

        {/* Category Badge */}
        <ToggleSwitch
          label="Show Category Badge"
          checked={s.card.categoryBadge.show}
          onChange={(checked) => updateCardCategoryBadge("show", checked)}
        />

        {s.card.categoryBadge.show && (
          <>
            <SelectInput
              label="Badge Position"
              value={s.card.categoryBadge.position}
              onChange={(v) => updateCardCategoryBadge("position", v)}
              options={[
                { value: "overlay-top-left", label: "Overlay Top Left" },
                { value: "above-title", label: "Above Title" },
                { value: "below-title", label: "Below Title" },
              ]}
            />

            <SelectInput
              label="Badge Style"
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
