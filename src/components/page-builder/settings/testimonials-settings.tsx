"use client";

import { useCallback, useEffect, useState } from "react";
import type { TestimonialsWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_TESTIMONIALS_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
import { ContainerStyleSection } from "@/components/page-builder/shared/container-style-section";
import {
  SelectInput,
  ColorInput,
  ToggleSwitch,
  NumberInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialTag {
  value: string;
  label: string;
}

interface TestimonialsWidgetSettingsPanelProps {
  settings: TestimonialsWidgetSettings;
  onChange: (settings: TestimonialsWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function TestimonialsWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: TestimonialsWidgetSettingsPanelProps) {
  // Dynamic tags from API
  const [availableTags, setAvailableTags] = useState<TestimonialTag[]>([]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/admin/testimonial-tags");
        if (res.ok) {
          const data = await res.json();
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error("Failed to load testimonial tags:", error);
      }
    }
    fetchTags();
  }, []);

  // Deep merge helper for nested objects
  function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Partial<T> | undefined): T {
    if (!overrides) return defaults;
    const result = { ...defaults };
    for (const key in overrides) {
      if (overrides[key] !== undefined) {
        if (
          typeof defaults[key] === "object" &&
          defaults[key] !== null &&
          !Array.isArray(defaults[key]) &&
          typeof overrides[key] === "object" &&
          overrides[key] !== null &&
          !Array.isArray(overrides[key])
        ) {
          result[key] = deepMerge(defaults[key], overrides[key] as any);
        } else {
          result[key] = overrides[key] as any;
        }
      }
    }
    return result;
  }

  // Deep merge with defaults to ensure all nested properties exist
  const s: TestimonialsWidgetSettings = {
    ...deepMerge(DEFAULT_TESTIMONIALS_SETTINGS, settings),
    container: { ...DEFAULT_WIDGET_CONTAINER, ...settings?.container },
  };
  const updateSettings = useCallback(
    (updates: Partial<TestimonialsWidgetSettings>) => {
      onChange({ ...s, ...updates });
    },
    [s, onChange]
  );

  const updateHeader = useCallback(
    (updates: Partial<TestimonialsWidgetSettings["header"]>) => {
      onChange({
        ...s,
        header: { ...s.header, ...updates },
      });
    },
    [s, onChange]
  );

  const updateGridView = useCallback(
    (updates: Partial<TestimonialsWidgetSettings["gridView"]>) => {
      onChange({
        ...s,
        gridView: { ...s.gridView, ...updates },
      });
    },
    [s, onChange]
  );

  const updateCarouselView = useCallback(
    (updates: Partial<TestimonialsWidgetSettings["carouselView"]>) => {
      onChange({
        ...s,
        carouselView: { ...s.carouselView, ...updates },
      });
    },
    [s, onChange]
  );

  const updateCardStyle = useCallback(
    (updates: Partial<TestimonialsWidgetSettings["cardStyle"]>) => {
      onChange({
        ...s,
        cardStyle: { ...s.cardStyle, ...updates },
      });
    },
    [s, onChange]
  );

  const updateContent = useCallback(
    (updates: Partial<TestimonialsWidgetSettings["content"]>) => {
      onChange({
        ...s,
        content: { ...s.content, ...updates },
      });
    },
    [s, onChange]
  );

  const updateTrustFooter = useCallback(
    (updates: Partial<TestimonialsWidgetSettings["trustFooter"]>) => {
      onChange({
        ...s,
        trustFooter: { ...s.trustFooter, ...updates },
      });
    },
    [s, onChange]
  );

  return (
    <div className="space-y-4">
      {/* Content Tab */}
      {activeTab === "content" && (
        <>
          {/* View Mode */}
          <SelectInput
            label="View Mode"
            value={s.viewMode}
            onChange={(value) =>
              updateSettings({
                viewMode: value as TestimonialsWidgetSettings["viewMode"],
              })
            }
            options={[
              { label: "Grid", value: "grid" },
              { label: "Carousel", value: "carousel" },
              { label: "Video Grid", value: "video-grid" },
            ]}
          />

          <NumberInput
            label="Number of Testimonials"
            value={s.dataSource.limit}
            onChange={(value) =>
              updateSettings({
                dataSource: { ...s.dataSource, limit: value },
              })
            }
            min={1}
            max={12}
          />

          {/* Filter by Type */}
          <SelectInput
            label="Filter by Type"
            value={s.dataSource.testimonialType || "all"}
            onChange={(value) =>
              updateSettings({
                dataSource: {
                  ...s.dataSource,
                  testimonialType: value as "all" | "photo" | "video",
                },
              })
            }
            options={[
              { label: "All Types", value: "all" },
              { label: "Photo Only", value: "photo" },
              { label: "Video Only", value: "video" },
            ]}
          />

          {/* Filter by Tags - Multi-select Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Filter by Tags (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {s.dataSource.filterByTags && s.dataSource.filterByTags.length > 0
                    ? `${s.dataSource.filterByTags.length} tag${s.dataSource.filterByTags.length > 1 ? "s" : ""} selected`
                    : "All testimonials"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {availableTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No tags available
                    </p>
                  ) : (
                    availableTags.map((tag) => {
                      const isSelected = s.dataSource.filterByTags?.includes(tag.value);
                      return (
                        <div
                          key={tag.value}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                          onClick={() => {
                            const currentTags = s.dataSource.filterByTags || [];
                            const newTags = isSelected
                              ? currentTags.filter((t) => t !== tag.value)
                              : [...currentTags, tag.value];
                            updateSettings({
                              dataSource: {
                                ...s.dataSource,
                                filterByTags: newTags.length > 0 ? newTags : undefined,
                              },
                            });
                          }}
                        >
                          <Checkbox checked={isSelected} />
                          <span className="text-sm">{tag.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                {s.dataSource.filterByTags && s.dataSource.filterByTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() =>
                      updateSettings({
                        dataSource: { ...s.dataSource, filterByTags: undefined },
                      })
                    }
                  >
                    Clear all
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Header Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
              Header Section
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <ToggleSwitch
                label="Show Header"
                checked={s.header.show}
                onChange={(checked: boolean) => updateHeader({ show: checked })}
              />

              {s.header.show && (
                <>
                  <ToggleSwitch
                    label="Show Badge"
                    checked={s.header.badge.show}
                    onChange={(checked: boolean) =>
                      updateHeader({
                        badge: { ...s.header.badge, show: checked },
                      })
                    }
                  />

                  {s.header.badge.show && (
                    <div className="space-y-2">
                      <Label>Badge Text</Label>
                      <Input
                        value={s.header.badge.text}
                        onChange={(e) =>
                          updateHeader({
                            badge: { ...s.header.badge, text: e.target.value },
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input
                      value={s.header.heading.text}
                      onChange={(e) =>
                        updateHeader({
                          heading: { ...s.header.heading, text: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Highlight Words</Label>
                    <Input
                      value={s.header.heading.highlightWords || ""}
                      onChange={(e) =>
                        updateHeader({
                          heading: {
                            ...s.header.heading,
                            highlightWords: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., 10,000+"
                    />
                  </div>

                  <ColorInput
                    label="Highlight Color"
                    value={s.header.heading.highlightColor || "#f97316"}
                    onChange={(value) =>
                      updateHeader({
                        heading: { ...s.header.heading, highlightColor: value },
                      })
                    }
                  />

                  <ToggleSwitch
                    label="Show Description"
                    checked={s.header.description.show}
                    onChange={(checked: boolean) =>
                      updateHeader({
                        description: { ...s.header.description, show: checked },
                      })
                    }
                  />

                  {s.header.description.show && (
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={s.header.description.text}
                        onChange={(e) =>
                          updateHeader({
                            description: {
                              ...s.header.description,
                              text: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}

                  <SelectInput
                    label="Alignment"
                    value={s.header.alignment}
                    onChange={(value) =>
                      updateHeader({
                        alignment: value as "left" | "center" | "right",
                      })
                    }
                    options={[
                      { label: "Left", value: "left" },
                      { label: "Center", value: "center" },
                      { label: "Right", value: "right" },
                    ]}
                  />
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Trust Footer */}
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
              Trust Footer
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <ToggleSwitch
                label="Show Trust Footer"
                checked={s.trustFooter.show}
                onChange={(checked: boolean) => updateTrustFooter({ show: checked })}
              />

              {s.trustFooter.show && (
                <>
                  <ToggleSwitch
                    label="Show Avatar Stack"
                    checked={s.trustFooter.showAvatarStack}
                    onChange={(checked: boolean) =>
                      updateTrustFooter({ showAvatarStack: checked })
                    }
                  />

                  <div className="space-y-2">
                    <Label>Customer Count Text</Label>
                    <Input
                      value={s.trustFooter.customerCountText}
                      onChange={(e) =>
                        updateTrustFooter({ customerCountText: e.target.value })
                      }
                    />
                  </div>

                  <ToggleSwitch
                    label="Show Average Rating"
                    checked={s.trustFooter.showAverageRating}
                    onChange={(checked: boolean) =>
                      updateTrustFooter({ showAverageRating: checked })
                    }
                  />

                  <div className="space-y-2">
                    <Label>Total Reviews Text</Label>
                    <Input
                      value={s.trustFooter.totalReviews}
                      onChange={(e) =>
                        updateTrustFooter({ totalReviews: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {/* Style Tab */}
      {activeTab === "style" && (
        <>
          {/* Card Style */}
          <SelectInput
            label="Card Style"
            value={s.cardStyle.style}
            onChange={(value) =>
              updateCardStyle({
                style: value as TestimonialsWidgetSettings["cardStyle"]["style"],
              })
            }
            options={[
              { label: "Minimal", value: "minimal" },
              { label: "Elevated", value: "elevated" },
              { label: "Glassmorphism", value: "glassmorphism" },
              { label: "Bordered", value: "bordered" },
              { label: "Gradient Border", value: "gradient-border" },
            ]}
          />

          <NumberInput
            label="Border Radius"
            value={s.cardStyle.borderRadius}
            onChange={(value) => updateCardStyle({ borderRadius: value })}
            min={0}
            max={32}
          />

          <NumberInput
            label="Padding"
            value={s.cardStyle.padding}
            onChange={(value) => updateCardStyle({ padding: value })}
            min={8}
            max={48}
          />

          <SelectInput
            label="Shadow"
            value={s.cardStyle.shadow}
            onChange={(value) =>
              updateCardStyle({
                shadow: value as TestimonialsWidgetSettings["cardStyle"]["shadow"],
              })
            }
            options={[
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ]}
          />

          <SelectInput
            label="Hover Effect"
            value={s.cardStyle.hoverEffect}
            onChange={(value) =>
              updateCardStyle({
                hoverEffect: value as TestimonialsWidgetSettings["cardStyle"]["hoverEffect"],
              })
            }
            options={[
              { label: "None", value: "none" },
              { label: "Lift", value: "lift" },
              { label: "Glow", value: "glow" },
              { label: "Scale", value: "scale" },
              { label: "Border Color", value: "border-color" },
            ]}
          />

          <ColorInput
            label="Background Color"
            value={s.cardStyle.backgroundColor || "#1e293b"}
            onChange={(value) => updateCardStyle({ backgroundColor: value })}
          />

          {/* Bordered style options */}
          {s.cardStyle.style === "bordered" && (
            <>
              <NumberInput
                label="Border Width"
                value={s.cardStyle.borderWidth}
                onChange={(value) => updateCardStyle({ borderWidth: value })}
                min={1}
                max={4}
              />
              <ColorInput
                label="Border Color"
                value={s.cardStyle.borderColor || "#334155"}
                onChange={(value) => updateCardStyle({ borderColor: value })}
              />
            </>
          )}

          {/* Glassmorphism style options */}
          {s.cardStyle.style === "glassmorphism" && (
            <>
              <NumberInput
                label="Blur Amount"
                value={s.cardStyle.glassEffect?.blur || 12}
                onChange={(value) =>
                  updateCardStyle({
                    glassEffect: { ...s.cardStyle.glassEffect, enabled: true, blur: value, opacity: s.cardStyle.glassEffect?.opacity || 0.6 },
                  })
                }
                min={0}
                max={30}
              />
              <NumberInput
                label="Opacity"
                value={Math.round((s.cardStyle.glassEffect?.opacity || 0.6) * 100)}
                onChange={(value) =>
                  updateCardStyle({
                    glassEffect: { ...s.cardStyle.glassEffect, enabled: true, blur: s.cardStyle.glassEffect?.blur || 12, opacity: value / 100 },
                  })
                }
                min={10}
                max={90}
              />
            </>
          )}

          {/* Gradient border style options */}
          {s.cardStyle.style === "gradient-border" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gradient Colors</Label>
                <div className="flex gap-2">
                  <ColorInput
                    label=""
                    value={s.cardStyle.gradientBorder?.colors?.[0] || "#f97316"}
                    onChange={(value) =>
                      updateCardStyle({
                        gradientBorder: {
                          ...s.cardStyle.gradientBorder,
                          enabled: true,
                          colors: [value, s.cardStyle.gradientBorder?.colors?.[1] || "#3b82f6"],
                          angle: s.cardStyle.gradientBorder?.angle || 135,
                        },
                      })
                    }
                  />
                  <ColorInput
                    label=""
                    value={s.cardStyle.gradientBorder?.colors?.[1] || "#3b82f6"}
                    onChange={(value) =>
                      updateCardStyle({
                        gradientBorder: {
                          ...s.cardStyle.gradientBorder,
                          enabled: true,
                          colors: [s.cardStyle.gradientBorder?.colors?.[0] || "#f97316", value],
                          angle: s.cardStyle.gradientBorder?.angle || 135,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <NumberInput
                label="Gradient Angle"
                value={s.cardStyle.gradientBorder?.angle || 135}
                onChange={(value) =>
                  updateCardStyle({
                    gradientBorder: {
                      ...s.cardStyle.gradientBorder,
                      enabled: true,
                      colors: s.cardStyle.gradientBorder?.colors || ["#f97316", "#3b82f6"],
                      angle: value,
                    },
                  })
                }
                min={0}
                max={360}
              />
            </>
          )}

          {/* Content Display */}
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium">
              Content Display
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <ToggleSwitch
                label="Show Rating"
                checked={s.content.showRating}
                onChange={(checked: boolean) =>
                  updateContent({ showRating: checked })
                }
              />

              <SelectInput
                label="Rating Style"
                value={s.content.ratingStyle}
                onChange={(value) =>
                  updateContent({
                    ratingStyle: value as "stars" | "number" | "both",
                  })
                }
                options={[
                  { label: "Stars", value: "stars" },
                  { label: "Number", value: "number" },
                  { label: "Both", value: "both" },
                ]}
              />

              <ColorInput
                label="Rating Color"
                value={s.content.ratingColor || "#facc15"}
                onChange={(value) => updateContent({ ratingColor: value })}
              />

              <ToggleSwitch
                label="Show Company"
                checked={s.content.showCompany}
                onChange={(checked: boolean) =>
                  updateContent({ showCompany: checked })
                }
              />

              <ToggleSwitch
                label="Show Country"
                checked={s.content.showCountry}
                onChange={(checked: boolean) =>
                  updateContent({ showCountry: checked })
                }
              />

              <SelectInput
                label="Quote Font Size"
                value={s.content.quoteFontSize}
                onChange={(value) =>
                  updateContent({ quoteFontSize: value as "sm" | "md" | "lg" })
                }
                options={[
                  { label: "Small", value: "sm" },
                  { label: "Medium", value: "md" },
                  { label: "Large", value: "lg" },
                ]}
              />

              <ColorInput
                label="Quote Color"
                value={s.content.quoteColor || "#94a3b8"}
                onChange={(value) => updateContent({ quoteColor: value })}
              />

              <ColorInput
                label="Name Color"
                value={s.content.nameColor || "#f8fafc"}
                onChange={(value) => updateContent({ nameColor: value })}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Container Style */}
          <ContainerStyleSection
            container={s.container || DEFAULT_WIDGET_CONTAINER}
            onChange={(container) => onChange({ ...s, container })}
          />
        </>
      )}

      {/* Advanced Tab - Layout Settings */}
      {activeTab === "advanced" && (
        <>
          {/* Grid View Settings */}
          {s.viewMode === "grid" && (
            <>
              <SelectInput
                label="Columns"
                value={s.gridView.columns.toString()}
                onChange={(value) =>
                  updateGridView({ columns: parseInt(value) as 2 | 3 | 4 })
                }
                options={[
                  { label: "2 Columns", value: "2" },
                  { label: "3 Columns", value: "3" },
                  { label: "4 Columns", value: "4" },
                ]}
              />

              <NumberInput
                label="Gap (px)"
                value={s.gridView.gap}
                onChange={(value) => updateGridView({ gap: value })}
                min={8}
                max={48}
              />

              <ToggleSwitch
                label="Show Quote Icon"
                checked={s.gridView.showQuoteIcon}
                onChange={(checked: boolean) =>
                  updateGridView({ showQuoteIcon: checked })
                }
              />

              {s.gridView.showQuoteIcon && (
                <>
                  <SelectInput
                    label="Quote Icon Position"
                    value={s.gridView.quoteIconPosition}
                    onChange={(value) =>
                      updateGridView({
                        quoteIconPosition: value as "top-left" | "top-right" | "background",
                      })
                    }
                    options={[
                      { label: "Top Left", value: "top-left" },
                      { label: "Top Right", value: "top-right" },
                      { label: "Background", value: "background" },
                    ]}
                  />

                  <ColorInput
                    label="Quote Icon Color"
                    value={s.gridView.quoteIconColor || "#f9731620"}
                    onChange={(value) => updateGridView({ quoteIconColor: value })}
                  />
                </>
              )}
            </>
          )}

          {/* Carousel View Settings */}
          {s.viewMode === "carousel" && (
            <>
              <SelectInput
                label="Layout"
                value={s.carouselView.layout}
                onChange={(value) =>
                  updateCarouselView({
                    layout: value as "standard" | "split" | "centered",
                  })
                }
                options={[
                  { label: "Standard", value: "standard" },
                  { label: "Split (Large Photo)", value: "split" },
                  { label: "Centered", value: "centered" },
                ]}
              />

              <ToggleSwitch
                label="Autoplay"
                checked={s.carouselView.autoplay}
                onChange={(checked: boolean) =>
                  updateCarouselView({ autoplay: checked })
                }
              />

              {s.carouselView.autoplay && (
                <NumberInput
                  label="Autoplay Delay (ms)"
                  value={s.carouselView.autoplayDelay}
                  onChange={(value) => updateCarouselView({ autoplayDelay: value })}
                  min={1000}
                  max={10000}
                  step={500}
                />
              )}

              <ToggleSwitch
                label="Loop"
                checked={s.carouselView.loop}
                onChange={(checked: boolean) => updateCarouselView({ loop: checked })}
              />

              <ToggleSwitch
                label="Show Arrows"
                checked={s.carouselView.navigation.arrows.enabled}
                onChange={(checked: boolean) =>
                  updateCarouselView({
                    navigation: {
                      ...s.carouselView.navigation,
                      arrows: {
                        ...s.carouselView.navigation.arrows,
                        enabled: checked,
                      },
                    },
                  })
                }
              />

              <ToggleSwitch
                label="Show Pagination"
                checked={s.carouselView.navigation.pagination.enabled}
                onChange={(checked: boolean) =>
                  updateCarouselView({
                    navigation: {
                      ...s.carouselView.navigation,
                      pagination: {
                        ...s.carouselView.navigation.pagination,
                        enabled: checked,
                      },
                    },
                  })
                }
              />

              {s.carouselView.navigation.pagination.enabled && (
                <SelectInput
                  label="Pagination Type"
                  value={s.carouselView.navigation.pagination.type}
                  onChange={(value) =>
                    updateCarouselView({
                      navigation: {
                        ...s.carouselView.navigation,
                        pagination: {
                          ...s.carouselView.navigation.pagination,
                          type: value as "dots" | "fraction" | "progressbar",
                        },
                      },
                    })
                  }
                  options={[
                    { label: "Dots", value: "dots" },
                    { label: "Fraction", value: "fraction" },
                    { label: "Progress Bar", value: "progressbar" },
                  ]}
                />
              )}
            </>
          )}

          {/* Video View Settings */}
          {s.viewMode === "video-grid" && (
            <>
              <SelectInput
                label="Columns"
                value={s.videoView.columns.toString()}
                onChange={(value) =>
                  updateSettings({
                    videoView: {
                      ...s.videoView,
                      columns: parseInt(value) as 2 | 3 | 4,
                    },
                  })
                }
                options={[
                  { label: "2 Columns", value: "2" },
                  { label: "3 Columns", value: "3" },
                  { label: "4 Columns", value: "4" },
                ]}
              />

              <SelectInput
                label="Thumbnail Aspect Ratio"
                value={s.videoView.thumbnailAspectRatio}
                onChange={(value) =>
                  updateSettings({
                    videoView: {
                      ...s.videoView,
                      thumbnailAspectRatio: value as "9:16" | "16:9" | "1:1" | "4:5",
                    },
                  })
                }
                options={[
                  { label: "9:16 (Vertical)", value: "9:16" },
                  { label: "16:9 (Horizontal)", value: "16:9" },
                  { label: "1:1 (Square)", value: "1:1" },
                  { label: "4:5 (Portrait)", value: "4:5" },
                ]}
              />

              <ToggleSwitch
                label="Dark Theme"
                checked={s.videoView.darkTheme}
                onChange={(checked: boolean) =>
                  updateSettings({
                    videoView: { ...s.videoView, darkTheme: checked },
                  })
                }
              />

              <ToggleSwitch
                label="Show Customer Info"
                checked={s.videoView.showCustomerInfo}
                onChange={(checked: boolean) =>
                  updateSettings({
                    videoView: { ...s.videoView, showCustomerInfo: checked },
                  })
                }
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
