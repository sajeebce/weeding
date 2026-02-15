"use client";

import { useState } from "react";
import type {
  ImageSliderWidgetSettings,
  SlideItem,
  LayerAnimation,
} from "@/lib/page-builder/types";
import { DEFAULT_IMAGE_SLIDER_SETTINGS, DEFAULT_LAYER_ANIMATION, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import {
  TextInput,
  SelectInput,
  NumberInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ColorPicker } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown, Copy, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageSliderSettingsProps {
  settings: ImageSliderWidgetSettings;
  onChange: (settings: ImageSliderWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

// Generate unique ID
function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default slide
const createDefaultSlide = (): SlideItem => ({
  id: generateId("slide"),
  image: {
    src: "",
    alt: "New Slide",
    objectFit: "cover",
    objectPosition: "center",
  },
  overlay: {
    enabled: true,
    type: "gradient",
    gradient: {
      type: "linear",
      angle: 180,
      colors: [
        { color: "#00000000", position: 0 },
        { color: "#000000aa", position: 100 },
      ],
    },
    opacity: 0.6,
  },
  content: {
    enabled: true,
    position: "center-left",
    maxWidth: "lg",
    padding: 48,
    textAlign: "left",
    headline: {
      show: true,
      text: "Slide Headline",
      size: "2xl",
      color: "#ffffff",
      animation: { in: { type: "slide-up", duration: 600, delay: 0, easing: "ease-out" } },
    },
    subheadline: {
      show: true,
      text: "Add your subheadline here",
      size: "lg",
      color: "#e2e8f0",
      animation: { in: { type: "slide-up", duration: 600, delay: 100, easing: "ease-out" } },
    },
  },
});

export function ImageSliderSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: ImageSliderSettingsProps) {
  const [expandedSlide, setExpandedSlide] = useState<string | null>(
    settings.slides[0]?.id || null
  );

  // Deep merge with defaults
  const s: ImageSliderWidgetSettings = {
    ...DEFAULT_IMAGE_SLIDER_SETTINGS,
    ...settings,
    autoplay: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.autoplay, ...settings.autoplay },
    navigation: {
      ...DEFAULT_IMAGE_SLIDER_SETTINGS.navigation,
      ...settings.navigation,
      arrows: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.navigation.arrows, ...settings.navigation?.arrows },
      pagination: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.navigation.pagination, ...settings.navigation?.pagination },
      thumbnails: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.navigation.thumbnails, ...settings.navigation?.thumbnails },
    },
    touch: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.touch, ...settings.touch },
    kenBurns: {
      ...DEFAULT_IMAGE_SLIDER_SETTINGS.kenBurns,
      ...settings.kenBurns,
      scale: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.kenBurns.scale, ...settings.kenBurns?.scale },
    },
    parallax: { ...DEFAULT_IMAGE_SLIDER_SETTINGS.parallax, ...settings.parallax },
    container: { ...DEFAULT_WIDGET_CONTAINER, ...settings?.container },
  };

  const updateField = <K extends keyof ImageSliderWidgetSettings>(
    key: K,
    value: ImageSliderWidgetSettings[K]
  ) => {
    onChange({ ...s, [key]: value });
  };

  const updateNestedField = <K extends keyof ImageSliderWidgetSettings>(
    key: K,
    nestedKey: string,
    value: unknown
  ) => {
    onChange({
      ...s,
      [key]: {
        ...(s[key] as Record<string, unknown>),
        [nestedKey]: value,
      },
    });
  };

  const updateDeepNestedField = <K extends keyof ImageSliderWidgetSettings>(
    key: K,
    level1: string,
    level2: string,
    value: unknown
  ) => {
    const current = s[key] as Record<string, Record<string, unknown>>;
    onChange({
      ...s,
      [key]: {
        ...current,
        [level1]: {
          ...current[level1],
          [level2]: value,
        },
      },
    });
  };

  // Slide management
  const addSlide = () => {
    const newSlide = createDefaultSlide();
    updateField("slides", [...s.slides, newSlide]);
    setExpandedSlide(newSlide.id);
  };

  const removeSlide = (slideId: string) => {
    updateField("slides", s.slides.filter((slide) => slide.id !== slideId));
  };

  const duplicateSlide = (slideId: string) => {
    const slideIndex = s.slides.findIndex((slide) => slide.id === slideId);
    if (slideIndex === -1) return;
    const newSlide = { ...s.slides[slideIndex], id: generateId("slide") };
    const newSlides = [...s.slides];
    newSlides.splice(slideIndex + 1, 0, newSlide);
    updateField("slides", newSlides);
    setExpandedSlide(newSlide.id);
  };

  const moveSlide = (slideId: string, direction: "up" | "down") => {
    const slideIndex = s.slides.findIndex((slide) => slide.id === slideId);
    if (slideIndex === -1) return;
    if (direction === "up" && slideIndex === 0) return;
    if (direction === "down" && slideIndex === s.slides.length - 1) return;

    const newSlides = [...s.slides];
    const targetIndex = direction === "up" ? slideIndex - 1 : slideIndex + 1;
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];
    updateField("slides", newSlides);
  };

  const updateSlide = (slideId: string, updates: Partial<SlideItem>) => {
    updateField(
      "slides",
      s.slides.map((slide) =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    );
  };

  const updateSlideNested = (
    slideId: string,
    key: keyof SlideItem,
    nestedKey: string,
    value: unknown
  ) => {
    updateField(
      "slides",
      s.slides.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              [key]: {
                ...(slide[key] as Record<string, unknown>),
                [nestedKey]: value,
              },
            }
          : slide
      )
    );
  };

  const updateSlideContent = (
    slideId: string,
    contentKey: string,
    nestedKey: string,
    value: unknown
  ) => {
    updateField(
      "slides",
      s.slides.map((slide) => {
        if (slide.id !== slideId) return slide;
        const content = slide.content || createDefaultSlide().content!;
        return {
          ...slide,
          content: {
            ...content,
            [contentKey]: {
              ...(content[contentKey as keyof typeof content] as Record<string, unknown>),
              [nestedKey]: value,
            },
          },
        };
      })
    );
  };

  // Content Tab - Slides
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Slides List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Slides ({s.slides.length})</span>
          <Button
            size="sm"
            variant="outline"
            onClick={addSlide}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Slide
          </Button>
        </div>

        {s.slides.map((slide, index) => (
          <div
            key={slide.id}
            className="border border-border rounded-lg"
          >
            {/* Slide Header */}
            <div
              className={cn(
                "flex items-center gap-2 p-2 bg-muted/50 cursor-pointer rounded-t-lg",
                expandedSlide === slide.id && "border-b border-border",
                expandedSlide !== slide.id && "rounded-b-lg"
              )}
              onClick={() => setExpandedSlide(expandedSlide === slide.id ? null : slide.id)}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
              <div
                className="w-8 h-8 rounded bg-muted bg-cover bg-center shrink-0"
                style={{ backgroundImage: slide.image.src ? `url(${slide.image.src})` : undefined }}
              />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-medium text-foreground truncate">
                  Slide {index + 1}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {slide.content?.headline?.text || "No headline"}
                </p>
              </div>
              <div className="flex items-center shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "up"); }}
                  disabled={index === 0}
                  className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveSlide(slide.id, "down"); }}
                  disabled={index === s.slides.length - 1}
                  className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
                  className="p-0.5 hover:bg-muted rounded"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                  disabled={s.slides.length <= 1}
                  className="p-0.5 hover:bg-destructive/20 rounded text-destructive disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Slide Content (Expanded) */}
            {expandedSlide === slide.id && (
              <div className="p-3 space-y-4 rounded-b-lg">
                {/* Image */}
                <AccordionSection title="Image" defaultOpen>
                  <div className="space-y-3">
                    <ImageUpload
                      label="Slide Image"
                      value={slide.image.src}
                      onChange={(url) => updateSlideNested(slide.id, "image", "src", url)}
                    />
                    <TextInput
                      label="Alt Text"
                      value={slide.image.alt}
                      onChange={(v) => updateSlideNested(slide.id, "image", "alt", v)}
                      placeholder="Describe the image"
                    />
                    <SelectInput
                      label="Object Fit"
                      value={slide.image.objectFit}
                      onChange={(v) => updateSlideNested(slide.id, "image", "objectFit", v)}
                      options={[
                        { value: "cover", label: "Cover" },
                        { value: "contain", label: "Contain" },
                        { value: "fill", label: "Fill" },
                      ]}
                    />
                    <SelectInput
                      label="Position"
                      value={slide.image.objectPosition}
                      onChange={(v) => updateSlideNested(slide.id, "image", "objectPosition", v)}
                      options={[
                        { value: "center", label: "Center" },
                        { value: "top", label: "Top" },
                        { value: "bottom", label: "Bottom" },
                        { value: "left", label: "Left" },
                        { value: "right", label: "Right" },
                      ]}
                    />
                  </div>
                </AccordionSection>

                {/* Overlay */}
                <AccordionSection title="Overlay">
                  <div className="space-y-3">
                    <ToggleSwitch
                      label="Enable Overlay"
                      checked={slide.overlay?.enabled || false}
                      onChange={(v) => updateSlideNested(slide.id, "overlay", "enabled", v)}
                    />
                    {slide.overlay?.enabled && (
                      <>
                        <SelectInput
                          label="Type"
                          value={slide.overlay?.type || "solid"}
                          onChange={(v) => updateSlideNested(slide.id, "overlay", "type", v)}
                          options={[
                            { value: "solid", label: "Solid Color" },
                            { value: "gradient", label: "Gradient" },
                          ]}
                        />
                        {slide.overlay?.type === "solid" && (
                          <ColorPicker
                            label="Color"
                            value={slide.overlay?.color || "#000000"}
                            onChange={(v) => updateSlideNested(slide.id, "overlay", "color", v)}
                          />
                        )}
                        <NumberInput
                          label="Opacity"
                          value={(slide.overlay?.opacity || 0.5) * 100}
                          onChange={(v) => updateSlideNested(slide.id, "overlay", "opacity", v / 100)}
                          min={0}
                          max={100}
                          step={5}
                          unit="%"
                        />
                      </>
                    )}
                  </div>
                </AccordionSection>

                {/* Content */}
                <AccordionSection title="Content">
                  <div className="space-y-3">
                    <ToggleSwitch
                      label="Show Content"
                      checked={slide.content?.enabled || false}
                      onChange={(v) => updateSlideNested(slide.id, "content", "enabled", v)}
                    />
                    {slide.content?.enabled && (
                      <>
                        <SelectInput
                          label="Position"
                          value={slide.content?.position || "center-left"}
                          onChange={(v) => updateSlideNested(slide.id, "content", "position", v)}
                          options={[
                            { value: "center", label: "Center" },
                            { value: "top-left", label: "Top Left" },
                            { value: "top-center", label: "Top Center" },
                            { value: "top-right", label: "Top Right" },
                            { value: "center-left", label: "Center Left" },
                            { value: "center-right", label: "Center Right" },
                            { value: "bottom-left", label: "Bottom Left" },
                            { value: "bottom-center", label: "Bottom Center" },
                            { value: "bottom-right", label: "Bottom Right" },
                          ]}
                        />
                        <SelectInput
                          label="Text Align"
                          value={slide.content?.textAlign || "left"}
                          onChange={(v) => updateSlideNested(slide.id, "content", "textAlign", v)}
                          options={[
                            { value: "left", label: "Left" },
                            { value: "center", label: "Center" },
                            { value: "right", label: "Right" },
                          ]}
                        />
                        <SelectInput
                          label="Max Width"
                          value={slide.content?.maxWidth || "lg"}
                          onChange={(v) => updateSlideNested(slide.id, "content", "maxWidth", v)}
                          options={[
                            { value: "sm", label: "Small" },
                            { value: "md", label: "Medium" },
                            { value: "lg", label: "Large" },
                            { value: "xl", label: "Extra Large" },
                            { value: "full", label: "Full Width" },
                          ]}
                        />

                        {/* Headline */}
                        <div className="pt-2 border-t border-border">
                          <ToggleSwitch
                            label="Show Headline"
                            checked={slide.content?.headline?.show || false}
                            onChange={(v) => updateSlideContent(slide.id, "headline", "show", v)}
                          />
                          {slide.content?.headline?.show && (
                            <div className="mt-2 space-y-2">
                              <TextInput
                                label="Headline Text"
                                value={slide.content?.headline?.text || ""}
                                onChange={(v) => updateSlideContent(slide.id, "headline", "text", v)}
                              />
                              <SelectInput
                                label="Size"
                                value={slide.content?.headline?.size || "2xl"}
                                onChange={(v) => updateSlideContent(slide.id, "headline", "size", v)}
                                options={[
                                  { value: "sm", label: "Small" },
                                  { value: "md", label: "Medium" },
                                  { value: "lg", label: "Large" },
                                  { value: "xl", label: "XL" },
                                  { value: "2xl", label: "2XL" },
                                  { value: "3xl", label: "3XL" },
                                ]}
                              />
                              <ColorPicker
                                label="Color"
                                value={slide.content?.headline?.color || "#ffffff"}
                                onChange={(v) => updateSlideContent(slide.id, "headline", "color", v)}
                              />
                              <TextInput
                                label="Highlight Words"
                                value={slide.content?.headline?.highlightWords || ""}
                                onChange={(v) => updateSlideContent(slide.id, "headline", "highlightWords", v)}
                                placeholder="word1, word2"
                                description="Comma separated"
                              />
                              {slide.content?.headline?.highlightWords && (
                                <ColorPicker
                                  label="Highlight Color"
                                  value={slide.content?.headline?.highlightColor || "#f97316"}
                                  onChange={(v) => updateSlideContent(slide.id, "headline", "highlightColor", v)}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Subheadline */}
                        <div className="pt-2 border-t border-border">
                          <ToggleSwitch
                            label="Show Subheadline"
                            checked={slide.content?.subheadline?.show || false}
                            onChange={(v) => updateSlideContent(slide.id, "subheadline", "show", v)}
                          />
                          {slide.content?.subheadline?.show && (
                            <div className="mt-2 space-y-2">
                              <TextInput
                                label="Subheadline Text"
                                value={slide.content?.subheadline?.text || ""}
                                onChange={(v) => updateSlideContent(slide.id, "subheadline", "text", v)}
                              />
                              <ColorPicker
                                label="Color"
                                value={slide.content?.subheadline?.color || "#e2e8f0"}
                                onChange={(v) => updateSlideContent(slide.id, "subheadline", "color", v)}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </AccordionSection>

                {/* Link */}
                <AccordionSection title="Slide Link">
                  <div className="space-y-3">
                    <TextInput
                      label="Link URL"
                      value={slide.link?.url || ""}
                      onChange={(v) =>
                        updateSlide(slide.id, {
                          link: v ? { url: v, openInNewTab: false, ariaLabel: "" } : undefined,
                        })
                      }
                      placeholder="https://..."
                    />
                    {slide.link?.url && (
                      <ToggleSwitch
                        label="Open in New Tab"
                        checked={slide.link?.openInNewTab || false}
                        onChange={(v) => updateSlideNested(slide.id, "link", "openInNewTab", v)}
                      />
                    )}
                  </div>
                </AccordionSection>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-4">
      {/* Slider Type & Effect */}
      <AccordionSection title="Slider Type" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Type"
            value={s.sliderType}
            onChange={(v) => updateField("sliderType", v as ImageSliderWidgetSettings["sliderType"])}
            options={[
              { value: "standard", label: "Standard" },
              { value: "hero", label: "Hero (Full Width)" },
              { value: "carousel", label: "Carousel (Multi-Slide)" },
              { value: "gallery", label: "Gallery (Thumbnails)" },
              { value: "vertical", label: "Vertical" },
            ]}
          />
          <SelectInput
            label="Transition Effect"
            value={s.effect}
            onChange={(v) => updateField("effect", v as ImageSliderWidgetSettings["effect"])}
            options={[
              { value: "slide", label: "Slide" },
              { value: "fade", label: "Fade" },
              { value: "cube", label: "Cube 3D" },
              { value: "coverflow", label: "Coverflow 3D" },
              { value: "flip", label: "Flip 3D" },
              { value: "cards", label: "Cards" },
              { value: "creative", label: "Creative" },
            ]}
          />
          <NumberInput
            label="Transition Speed"
            value={s.speed}
            onChange={(v) => updateField("speed", v)}
            min={100}
            max={2000}
            step={100}
            unit="ms"
          />
        </div>
      </AccordionSection>

      {/* Layout & Sizing */}
      <AccordionSection title="Layout">
        <div className="space-y-3">
          <SelectInput
            label="Height"
            value={typeof s.height === "number" ? "custom" : s.height}
            onChange={(v) => updateField("height", v === "custom" ? 500 : v as ImageSliderWidgetSettings["height"])}
            options={[
              { value: "viewport", label: "Full Viewport (100vh)" },
              { value: "large", label: "Large (80vh)" },
              { value: "medium", label: "Medium (60vh)" },
              { value: "small", label: "Small (40vh)" },
              { value: "auto", label: "Auto" },
              { value: "custom", label: "Custom" },
            ]}
          />
          {typeof s.height === "number" && (
            <NumberInput
              label="Custom Height"
              value={s.height}
              onChange={(v) => updateField("height", v)}
              min={200}
              max={1200}
              step={50}
              unit="px"
            />
          )}
          <NumberInput
            label="Border Radius"
            value={s.borderRadius}
            onChange={(v) => updateField("borderRadius", v)}
            min={0}
            max={50}
            step={2}
            unit="px"
          />
          <SelectInput
            label="Shadow"
            value={s.shadow}
            onChange={(v) => updateField("shadow", v as ImageSliderWidgetSettings["shadow"])}
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
              { value: "2xl", label: "2X Large" },
            ]}
          />
          {s.sliderType === "carousel" && (
            <>
              <NumberInput
                label="Slides Per View"
                value={typeof s.slidesPerView === "number" ? s.slidesPerView : 1}
                onChange={(v) => updateField("slidesPerView", v)}
                min={1}
                max={5}
                step={1}
              />
              <NumberInput
                label="Space Between"
                value={s.spaceBetween}
                onChange={(v) => updateField("spaceBetween", v)}
                min={0}
                max={100}
                step={4}
                unit="px"
              />
              <ToggleSwitch
                label="Centered Slides"
                checked={s.centeredSlides}
                onChange={(v) => updateField("centeredSlides", v)}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Container Style */}
      <ContainerStyleSection
        container={s.container || DEFAULT_WIDGET_CONTAINER}
        onChange={(container) => onChange({ ...s, container })}
      />

      {/* Navigation */}
      <AccordionSection title="Navigation">
        <div className="space-y-3">
          {/* Arrows */}
          <ToggleSwitch
            label="Show Arrows"
            checked={s.navigation.arrows.enabled}
            onChange={(v) => updateDeepNestedField("navigation", "arrows", "enabled", v)}
          />
          {s.navigation.arrows.enabled && (
            <>
              <SelectInput
                label="Arrow Style"
                value={s.navigation.arrows.style}
                onChange={(v) => updateDeepNestedField("navigation", "arrows", "style", v)}
                options={[
                  { value: "default", label: "Default" },
                  { value: "minimal", label: "Minimal" },
                  { value: "rounded", label: "Rounded" },
                  { value: "square", label: "Square" },
                  { value: "floating", label: "Floating" },
                ]}
              />
              <SelectInput
                label="Arrow Position"
                value={s.navigation.arrows.position}
                onChange={(v) => updateDeepNestedField("navigation", "arrows", "position", v)}
                options={[
                  { value: "sides", label: "Sides" },
                  { value: "bottom", label: "Bottom Center" },
                  { value: "bottom-right", label: "Bottom Right" },
                ]}
              />
              <ColorPicker
                label="Arrow Color"
                value={s.navigation.arrows.color}
                onChange={(v) => updateDeepNestedField("navigation", "arrows", "color", v)}
              />
              <ToggleSwitch
                label="Show on Hover Only"
                checked={s.navigation.arrows.showOnHover}
                onChange={(v) => updateDeepNestedField("navigation", "arrows", "showOnHover", v)}
              />
            </>
          )}

          {/* Pagination */}
          <div className="pt-2 border-t border-border">
            <ToggleSwitch
              label="Show Pagination"
              checked={s.navigation.pagination.enabled}
              onChange={(v) => updateDeepNestedField("navigation", "pagination", "enabled", v)}
            />
            {s.navigation.pagination.enabled && (
              <>
                <SelectInput
                  label="Pagination Type"
                  value={s.navigation.pagination.type}
                  onChange={(v) => updateDeepNestedField("navigation", "pagination", "type", v)}
                  options={[
                    { value: "dots", label: "Dots" },
                    { value: "fraction", label: "Fraction (1/5)" },
                    { value: "progressbar", label: "Progress Bar" },
                    { value: "bullets-dynamic", label: "Dynamic Bullets" },
                  ]}
                />
                <ColorPicker
                  label="Active Color"
                  value={s.navigation.pagination.activeColor}
                  onChange={(v) => updateDeepNestedField("navigation", "pagination", "activeColor", v)}
                />
              </>
            )}
          </div>

          {/* Thumbnails */}
          {s.sliderType === "gallery" && (
            <div className="pt-2 border-t border-border">
              <ToggleSwitch
                label="Show Thumbnails"
                checked={s.navigation.thumbnails.enabled}
                onChange={(v) => updateDeepNestedField("navigation", "thumbnails", "enabled", v)}
              />
              {s.navigation.thumbnails.enabled && (
                <>
                  <SelectInput
                    label="Position"
                    value={s.navigation.thumbnails.position}
                    onChange={(v) => updateDeepNestedField("navigation", "thumbnails", "position", v)}
                    options={[
                      { value: "bottom", label: "Bottom" },
                      { value: "left", label: "Left" },
                      { value: "right", label: "Right" },
                    ]}
                  />
                  <NumberInput
                    label="Size"
                    value={s.navigation.thumbnails.size}
                    onChange={(v) => updateDeepNestedField("navigation", "thumbnails", "size", v)}
                    min={40}
                    max={150}
                    step={10}
                    unit="px"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      {/* Autoplay */}
      <AccordionSection title="Autoplay" defaultOpen>
        <div className="space-y-3">
          <ToggleSwitch
            label="Enable Autoplay"
            checked={s.autoplay.enabled}
            onChange={(v) => updateNestedField("autoplay", "enabled", v)}
          />
          {s.autoplay.enabled && (
            <>
              <NumberInput
                label="Delay"
                value={s.autoplay.delay}
                onChange={(v) => updateNestedField("autoplay", "delay", v)}
                min={1000}
                max={15000}
                step={500}
                unit="ms"
              />
              <ToggleSwitch
                label="Pause on Hover"
                checked={s.autoplay.pauseOnHover}
                onChange={(v) => updateNestedField("autoplay", "pauseOnHover", v)}
              />
              <ToggleSwitch
                label="Show Pause Button"
                checked={s.autoplay.showPauseButton}
                onChange={(v) => updateNestedField("autoplay", "showPauseButton", v)}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Ken Burns Effect */}
      <AccordionSection title="Ken Burns Effect">
        <div className="space-y-3">
          <ToggleSwitch
            label="Enable Ken Burns"
            checked={s.kenBurns.enabled}
            onChange={(v) => updateNestedField("kenBurns", "enabled", v)}
            description="Slow zoom/pan effect on images"
          />
          {s.kenBurns.enabled && (
            <>
              <NumberInput
                label="Duration"
                value={s.kenBurns.duration}
                onChange={(v) => updateNestedField("kenBurns", "duration", v)}
                min={3000}
                max={20000}
                step={1000}
                unit="ms"
              />
              <SelectInput
                label="Direction"
                value={s.kenBurns.direction}
                onChange={(v) => updateNestedField("kenBurns", "direction", v)}
                options={[
                  { value: "random", label: "Random" },
                  { value: "in", label: "Zoom In" },
                  { value: "out", label: "Zoom Out" },
                ]}
              />
              <SelectInput
                label="Position"
                value={s.kenBurns.position}
                onChange={(v) => updateNestedField("kenBurns", "position", v)}
                options={[
                  { value: "random", label: "Random" },
                  { value: "center", label: "Center" },
                  { value: "top", label: "Top" },
                  { value: "bottom", label: "Bottom" },
                  { value: "left", label: "Left" },
                  { value: "right", label: "Right" },
                ]}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Loop & Interaction */}
      <AccordionSection title="Behavior">
        <div className="space-y-3">
          <ToggleSwitch
            label="Infinite Loop"
            checked={s.loop}
            onChange={(v) => updateField("loop", v)}
          />
          <ToggleSwitch
            label="Keyboard Navigation"
            checked={s.navigation.keyboard}
            onChange={(v) => updateNestedField("navigation", "keyboard", v)}
          />
          <ToggleSwitch
            label="Grab Cursor"
            checked={s.navigation.grabCursor}
            onChange={(v) => updateNestedField("navigation", "grabCursor", v)}
          />
        </div>
      </AccordionSection>

      {/* Touch */}
      <AccordionSection title="Touch & Swipe">
        <div className="space-y-3">
          <ToggleSwitch
            label="Enable Touch"
            checked={s.touch.enabled}
            onChange={(v) => updateNestedField("touch", "enabled", v)}
          />
          {s.touch.enabled && (
            <NumberInput
              label="Swipe Threshold"
              value={s.touch.threshold}
              onChange={(v) => updateNestedField("touch", "threshold", v)}
              min={10}
              max={100}
              step={5}
              unit="px"
            />
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Render based on active tab
  switch (activeTab) {
    case "content":
      return renderContentTab();
    case "style":
      return renderStyleTab();
    case "advanced":
      return renderAdvancedTab();
    default:
      return renderContentTab();
  }
}
