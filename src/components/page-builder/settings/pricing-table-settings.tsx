"use client";

import { useEffect, useState } from "react";
import type {
  PricingTableWidgetSettings,
  BadgeStyle,
  PricingTableLayoutStyle,
  PricingCardLayoutStyle,
  StateFeePosition,
  OrderSummaryPosition,
  PricingCTAStyle,
} from "@/lib/page-builder/types";
import { DEFAULT_PRICING_TABLE_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Label } from "@/components/ui/label";

// Service type
interface Service {
  id: string;
  name: string;
  slug: string;
}

interface PricingTableWidgetSettingsProps {
  settings: PricingTableWidgetSettings;
  onChange: (settings: PricingTableWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function PricingTableWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: PricingTableWidgetSettingsProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Merge with defaults
  const s: PricingTableWidgetSettings = {
    ...DEFAULT_PRICING_TABLE_SETTINGS,
    ...settings,
    header: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.header,
      ...settings?.header,
      badge: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.header.badge,
        ...settings?.header?.badge,
      },
      heading: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.header.heading,
        ...settings?.header?.heading,
      },
      description: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.header.description,
        ...settings?.header?.description,
      },
    },
    dataSource: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.dataSource,
      ...settings?.dataSource,
    },
    stateFee: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.stateFee,
      ...settings?.stateFee,
    },
    orderSummary: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.orderSummary,
      ...settings?.orderSummary,
      ctaButton: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.orderSummary.ctaButton,
        ...settings?.orderSummary?.ctaButton,
      },
    },
    tableStyle: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.tableStyle,
      ...settings?.tableStyle,
    },
    tableHeader: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.tableHeader,
      ...settings?.tableHeader,
    },
    featureRows: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.featureRows,
      ...settings?.featureRows,
      booleanStyle: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.featureRows.booleanStyle,
        ...settings?.featureRows?.booleanStyle,
      },
      addonStyle: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.featureRows.addonStyle,
        ...settings?.featureRows?.addonStyle,
      },
    },
    ctaButtons: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.ctaButtons,
      ...settings?.ctaButtons,
    },
    featureGroups: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.featureGroups,
      ...settings?.featureGroups,
    },
    responsive: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.responsive,
      ...settings?.responsive,
      mobileCard: {
        ...DEFAULT_PRICING_TABLE_SETTINGS.responsive.mobileCard,
        ...settings?.responsive?.mobileCard,
      },
    },
    animation: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.animation,
      ...settings?.animation,
    },
    currency: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.currency,
      ...settings?.currency,
    },
    colors: {
      ...DEFAULT_PRICING_TABLE_SETTINGS.colors,
      ...settings?.colors,
    },
  };

  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/services/public?limit=50");
        if (response.ok) {
          const data = await response.json();
          setServices(
            data.services?.map((svc: { id: string; name: string; slug: string }) => ({
              id: svc.id,
              name: svc.name,
              slug: svc.slug,
            })) || []
          );
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // Update helpers
  const updateHeader = (
    updates: Partial<PricingTableWidgetSettings["header"]>
  ) => {
    onChange({
      ...s,
      header: { ...s.header, ...updates },
    });
  };

  const updateHeaderBadge = (
    updates: Partial<PricingTableWidgetSettings["header"]["badge"]>
  ) => {
    onChange({
      ...s,
      header: { ...s.header, badge: { ...s.header.badge, ...updates } },
    });
  };

  const updateHeaderHeading = (
    updates: Partial<PricingTableWidgetSettings["header"]["heading"]>
  ) => {
    onChange({
      ...s,
      header: { ...s.header, heading: { ...s.header.heading, ...updates } },
    });
  };

  const updateHeaderDescription = (
    updates: Partial<PricingTableWidgetSettings["header"]["description"]>
  ) => {
    onChange({
      ...s,
      header: {
        ...s.header,
        description: { ...s.header.description, ...updates },
      },
    });
  };

  const updateDataSource = (
    updates: Partial<PricingTableWidgetSettings["dataSource"]>
  ) => {
    onChange({
      ...s,
      dataSource: { ...s.dataSource, ...updates },
    });
  };

  const updateStateFee = (
    updates: Partial<PricingTableWidgetSettings["stateFee"]>
  ) => {
    onChange({
      ...s,
      stateFee: { ...s.stateFee, ...updates },
    });
  };

  const updateOrderSummary = (
    updates: Partial<PricingTableWidgetSettings["orderSummary"]>
  ) => {
    onChange({
      ...s,
      orderSummary: { ...s.orderSummary, ...updates },
    });
  };

  const updateOrderSummaryCtaButton = (
    updates: Partial<PricingTableWidgetSettings["orderSummary"]["ctaButton"]>
  ) => {
    onChange({
      ...s,
      orderSummary: {
        ...s.orderSummary,
        ctaButton: { ...s.orderSummary.ctaButton, ...updates },
      },
    });
  };

  const updateTableStyle = (
    updates: Partial<PricingTableWidgetSettings["tableStyle"]>
  ) => {
    onChange({
      ...s,
      tableStyle: { ...s.tableStyle, ...updates },
    });
  };

  const updateTableHeader = (
    updates: Partial<PricingTableWidgetSettings["tableHeader"]>
  ) => {
    onChange({
      ...s,
      tableHeader: { ...s.tableHeader, ...updates },
    });
  };

  const updateFeatureRows = (
    updates: Partial<PricingTableWidgetSettings["featureRows"]>
  ) => {
    onChange({
      ...s,
      featureRows: { ...s.featureRows, ...updates },
    });
  };

  const updateCtaButtons = (
    updates: Partial<PricingTableWidgetSettings["ctaButtons"]>
  ) => {
    onChange({
      ...s,
      ctaButtons: { ...s.ctaButtons, ...updates },
    });
  };

  const updateResponsive = (
    updates: Partial<PricingTableWidgetSettings["responsive"]>
  ) => {
    onChange({
      ...s,
      responsive: { ...s.responsive, ...updates },
    });
  };

  const updateAnimation = (
    updates: Partial<PricingTableWidgetSettings["animation"]>
  ) => {
    onChange({
      ...s,
      animation: { ...s.animation, ...updates },
    });
  };

  const updateColors = (
    updates: Partial<PricingTableWidgetSettings["colors"]>
  ) => {
    onChange({
      ...s,
      colors: { ...s.colors, ...updates },
    });
  };

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-3">
      {/* Data Source */}
      <AccordionSection title="Data Source" defaultOpen>
        <div className="space-y-4">
          <SelectInput
            label="Select Service"
            value={s.dataSource.serviceSlug || "_none"}
            onChange={(v) => updateDataSource({ serviceSlug: v === "_none" ? undefined : v })}
            options={[
              { value: "_none", label: loadingServices ? "Loading..." : "Select a service" },
              ...services.map((svc) => ({
                value: svc.slug,
                label: svc.name,
              })),
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Packages and features will be loaded from the selected service.
          </p>
        </div>
      </AccordionSection>

      {/* Section Header */}
      <AccordionSection title="Section Header">
        <ToggleSwitch
          label="Show Header"
          checked={s.header.show}
          onChange={(checked) => updateHeader({ show: checked })}
        />
      </AccordionSection>

      {/* Badge */}
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
                placeholder="Pricing"
              />
            </div>
          )}
        </AccordionSection>
      )}

      {/* Heading */}
      {s.header.show && (
        <AccordionSection title="Heading">
          <div className="space-y-4">
            <TextInput
              label="Heading Text"
              value={s.header.heading.text}
              onChange={(v) => updateHeaderHeading({ text: v })}
              placeholder="Choose Your Package"
            />
            <TextInput
              label="Highlight Words"
              value={s.header.heading.highlightWords || ""}
              onChange={(v) =>
                updateHeaderHeading({ highlightWords: v || undefined })
              }
              placeholder="Package"
            />
          </div>
        </AccordionSection>
      )}

      {/* Description */}
      {s.header.show && (
        <AccordionSection title="Description">
          <ToggleSwitch
            label="Show Description"
            checked={s.header.description.show}
            onChange={(checked) => updateHeaderDescription({ show: checked })}
          />

          {s.header.description.show && (
            <div className="mt-4">
              <TextInput
                label="Description Text"
                value={s.header.description.text}
                onChange={(v) => updateHeaderDescription({ text: v })}
                placeholder="Select the perfect plan..."
              />
            </div>
          )}
        </AccordionSection>
      )}

      {/* State Fee */}
      <AccordionSection title="State Fee">
        <ToggleSwitch
          label="Enable State Fee"
          checked={s.stateFee.enabled}
          onChange={(checked) => updateStateFee({ enabled: checked })}
        />

        {s.stateFee.enabled && (
          <div className="mt-4 space-y-4">
            <TextInput
              label="Label"
              value={s.stateFee.label}
              onChange={(v) => updateStateFee({ label: v })}
              placeholder="Select your state"
            />
            <SelectInput
              label="Position"
              value={s.stateFee.position}
              onChange={(v) =>
                updateStateFee({ position: v as StateFeePosition })
              }
              options={[
                { value: "above-table", label: "Above Table" },
                { value: "below-header", label: "Below Header" },
                { value: "in-summary", label: "In Summary Only" },
              ]}
            />
            <ToggleSwitch
              label="Show Fee Breakdown"
              checked={s.stateFee.showFeeBreakdown}
              onChange={(checked) =>
                updateStateFee({ showFeeBreakdown: checked })
              }
            />
            <ToggleSwitch
              label="Highlight Savings"
              checked={s.stateFee.highlightSavings}
              onChange={(checked) =>
                updateStateFee({ highlightSavings: checked })
              }
            />
          </div>
        )}
      </AccordionSection>

      {/* Order Summary */}
      <AccordionSection title="Order Summary">
        <ToggleSwitch
          label="Enable Order Summary"
          checked={s.orderSummary.enabled}
          onChange={(checked) => updateOrderSummary({ enabled: checked })}
        />

        {s.orderSummary.enabled && (
          <div className="mt-4 space-y-4">
            <TextInput
              label="Title"
              value={s.orderSummary.title}
              onChange={(v) => updateOrderSummary({ title: v })}
              placeholder="Order Summary"
            />
            <SelectInput
              label="Position"
              value={s.orderSummary.position}
              onChange={(v) =>
                updateOrderSummary({ position: v as OrderSummaryPosition })
              }
              options={[
                { value: "right", label: "Right Sidebar" },
                { value: "left", label: "Left Sidebar" },
                { value: "bottom", label: "Bottom" },
                { value: "floating", label: "Floating" },
              ]}
            />
            <ToggleSwitch
              label="Show Package Details"
              checked={s.orderSummary.showPackageDetails}
              onChange={(checked) =>
                updateOrderSummary({ showPackageDetails: checked })
              }
            />
            <ToggleSwitch
              label="Show State Fee"
              checked={s.orderSummary.showStateFee}
              onChange={(checked) =>
                updateOrderSummary({ showStateFee: checked })
              }
            />
            <ToggleSwitch
              label="Show Addons"
              checked={s.orderSummary.showAddons}
              onChange={(checked) =>
                updateOrderSummary({ showAddons: checked })
              }
            />
            <ToggleSwitch
              label="Show Total"
              checked={s.orderSummary.showTotal}
              onChange={(checked) => updateOrderSummary({ showTotal: checked })}
            />
            <ToggleSwitch
              label="Sticky on Scroll"
              checked={s.orderSummary.stickyOnScroll}
              onChange={(checked) =>
                updateOrderSummary({ stickyOnScroll: checked })
              }
            />
            <TextInput
              label="CTA Button Text"
              value={s.orderSummary.ctaButton.text}
              onChange={(v) => updateOrderSummaryCtaButton({ text: v })}
              placeholder="Proceed to Checkout"
            />
          </div>
        )}
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-3">
      {/* Table Style */}
      <AccordionSection title="Table Style" defaultOpen>
        <div className="space-y-4">
          <SelectInput
            label="Layout Style"
            value={s.tableStyle.layout}
            onChange={(v) =>
              updateTableStyle({ layout: v as PricingTableLayoutStyle })
            }
            options={[
              { value: "classic", label: "Classic" },
              { value: "modern", label: "Modern" },
              { value: "minimal", label: "Minimal" },
              { value: "bordered", label: "Bordered" },
            ]}
          />
          <NumberInput
            label="Border Radius"
            value={s.tableStyle.borderRadius}
            onChange={(v) => updateTableStyle({ borderRadius: v })}
            min={0}
            max={32}
          />
          <NumberInput
            label="Border Width"
            value={s.tableStyle.borderWidth}
            onChange={(v) => updateTableStyle({ borderWidth: v })}
            min={0}
            max={4}
          />
          <ColorInput
            label="Border Color"
            value={s.tableStyle.borderColor || "#e2e8f0"}
            onChange={(v) => updateTableStyle({ borderColor: v })}
          />
          <ColorInput
            label="Background Color"
            value={s.tableStyle.backgroundColor || "#ffffff"}
            onChange={(v) => updateTableStyle({ backgroundColor: v })}
          />
          <SelectInput
            label="Shadow"
            value={s.tableStyle.shadow}
            onChange={(v) =>
              updateTableStyle({
                shadow: v as "none" | "sm" | "md" | "lg" | "xl",
              })
            }
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
            ]}
          />
        </div>
      </AccordionSection>

      {/* Header Style */}
      {s.header.show && (
        <AccordionSection title="Header Style">
          <div className="space-y-4">
            <SelectInput
              label="Badge Style"
              value={s.header.badge.style}
              onChange={(v) => updateHeaderBadge({ style: v as BadgeStyle })}
              options={[
                { value: "pill", label: "Pill" },
                { value: "solid", label: "Solid" },
                { value: "outline", label: "Outline" },
              ]}
            />
            {s.header.badge.show && (
              <>
                <ColorInput
                  label="Badge Background"
                  value={s.header.badge.bgColor || "#f9731933"}
                  onChange={(v) => updateHeaderBadge({ bgColor: v })}
                />
                <ColorInput
                  label="Badge Text Color"
                  value={s.header.badge.textColor || "#fb923c"}
                  onChange={(v) => updateHeaderBadge({ textColor: v })}
                />
              </>
            )}
            <SelectInput
              label="Heading Size"
              value={s.header.heading.size}
              onChange={(v) =>
                updateHeaderHeading({
                  size: v as "sm" | "md" | "lg" | "xl" | "2xl",
                })
              }
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
              value={s.header.heading.color || "#0f172a"}
              onChange={(v) => updateHeaderHeading({ color: v })}
            />
            <ColorInput
              label="Highlight Color"
              value={s.header.heading.highlightColor || "#f97316"}
              onChange={(v) => updateHeaderHeading({ highlightColor: v })}
            />
            <SelectInput
              label="Alignment"
              value={s.header.alignment}
              onChange={(v) =>
                updateHeader({ alignment: v as "left" | "center" | "right" })
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
              onChange={(v) => updateHeader({ marginBottom: v })}
              min={0}
              max={128}
            />
          </div>
        </AccordionSection>
      )}

      {/* Table Header Style */}
      <AccordionSection title="Table Header">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Package Names"
            checked={s.tableHeader.showPackageNames}
            onChange={(checked) =>
              updateTableHeader({ showPackageNames: checked })
            }
          />
          <ToggleSwitch
            label="Show Package Prices"
            checked={s.tableHeader.showPackagePrices}
            onChange={(checked) =>
              updateTableHeader({ showPackagePrices: checked })
            }
          />
          <ToggleSwitch
            label="Show Popular Badge"
            checked={s.tableHeader.showPopularBadge}
            onChange={(checked) =>
              updateTableHeader({ showPopularBadge: checked })
            }
          />
          {s.tableHeader.showPopularBadge && (
            <>
              <TextInput
                label="Popular Badge Text"
                value={s.tableHeader.popularBadgeText}
                onChange={(v) => updateTableHeader({ popularBadgeText: v })}
                placeholder="Most Popular"
              />
              <ColorInput
                label="Popular Badge Color"
                value={s.tableHeader.popularBadgeColor || "#f97316"}
                onChange={(v) => updateTableHeader({ popularBadgeColor: v })}
              />
            </>
          )}
          <ToggleSwitch
            label="Sticky Header"
            checked={s.tableHeader.stickyHeader}
            onChange={(checked) =>
              updateTableHeader({ stickyHeader: checked })
            }
          />
          <NumberInput
            label="Highlight Column (0-indexed)"
            value={s.tableHeader.highlightColumn ?? -1}
            onChange={(v) =>
              updateTableHeader({
                highlightColumn: v >= 0 ? v : undefined,
              })
            }
            min={-1}
            max={10}
          />
          <ColorInput
            label="Highlight Color"
            value={s.tableHeader.highlightColor || "#fff7ed"}
            onChange={(v) => updateTableHeader({ highlightColor: v })}
          />
        </div>
      </AccordionSection>

      {/* Feature Row Style */}
      <AccordionSection title="Feature Rows">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Tooltips"
            checked={s.featureRows.showTooltips}
            onChange={(checked) => updateFeatureRows({ showTooltips: checked })}
          />
          <ToggleSwitch
            label="Alternate Row Colors"
            checked={s.featureRows.alternateRowColors}
            onChange={(checked) =>
              updateFeatureRows({ alternateRowColors: checked })
            }
          />
          <ToggleSwitch
            label="Row Hover Effect"
            checked={s.featureRows.rowHoverEffect}
            onChange={(checked) =>
              updateFeatureRows({ rowHoverEffect: checked })
            }
          />
          <ColorInput
            label="Checkmark Color (True)"
            value={s.featureRows.booleanStyle.trueColor || "#22c55e"}
            onChange={(v) =>
              updateFeatureRows({
                booleanStyle: { ...s.featureRows.booleanStyle, trueColor: v },
              })
            }
          />
          <ColorInput
            label="X Mark Color (False)"
            value={s.featureRows.booleanStyle.falseColor || "#94a3b8"}
            onChange={(v) =>
              updateFeatureRows({
                booleanStyle: { ...s.featureRows.booleanStyle, falseColor: v },
              })
            }
          />
          <ColorInput
            label="Addon Selected Color"
            value={s.featureRows.addonStyle.selectedColor || "#f97316"}
            onChange={(v) =>
              updateFeatureRows({
                addonStyle: { ...s.featureRows.addonStyle, selectedColor: v },
              })
            }
          />
        </div>
      </AccordionSection>

      {/* CTA Buttons */}
      <AccordionSection title="CTA Buttons">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show CTA Buttons"
            checked={s.ctaButtons.show}
            onChange={(checked) => updateCtaButtons({ show: checked })}
          />
          {s.ctaButtons.show && (
            <>
              <TextInput
                label="Button Text"
                value={s.ctaButtons.buttonText}
                onChange={(v) => updateCtaButtons({ buttonText: v })}
                placeholder="Get Started"
              />
              <SelectInput
                label="Button Style"
                value={s.ctaButtons.buttonStyle}
                onChange={(v) =>
                  updateCtaButtons({ buttonStyle: v as PricingCTAStyle })
                }
                options={[
                  { value: "solid", label: "Solid" },
                  { value: "outline", label: "Outline" },
                  { value: "gradient", label: "Gradient" },
                  { value: "glow", label: "Glow" },
                ]}
              />
              <SelectInput
                label="Button Size"
                value={s.ctaButtons.buttonSize}
                onChange={(v) =>
                  updateCtaButtons({ buttonSize: v as "sm" | "md" | "lg" })
                }
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
              <ColorInput
                label="Button Background"
                value={s.ctaButtons.defaultBgColor || "#f97316"}
                onChange={(v) => updateCtaButtons({ defaultBgColor: v })}
              />
              <ColorInput
                label="Button Text Color"
                value={s.ctaButtons.defaultTextColor || "#ffffff"}
                onChange={(v) => updateCtaButtons({ defaultTextColor: v })}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Order Summary CTA */}
      {s.orderSummary.enabled && (
        <AccordionSection title="Order Summary CTA">
          <div className="space-y-4">
            <SelectInput
              label="Button Style"
              value={s.orderSummary.ctaButton.style}
              onChange={(v) =>
                updateOrderSummaryCtaButton({ style: v as PricingCTAStyle })
              }
              options={[
                { value: "solid", label: "Solid" },
                { value: "outline", label: "Outline" },
                { value: "gradient", label: "Gradient" },
                { value: "glow", label: "Glow" },
              ]}
            />
            <ColorInput
              label="Button Background"
              value={s.orderSummary.ctaButton.bgColor || "#f97316"}
              onChange={(v) => updateOrderSummaryCtaButton({ bgColor: v })}
            />
            <ColorInput
              label="Button Text Color"
              value={s.orderSummary.ctaButton.textColor || "#ffffff"}
              onChange={(v) => updateOrderSummaryCtaButton({ textColor: v })}
            />
          </div>
        </AccordionSection>
      )}
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      {/* Responsive */}
      <AccordionSection title="Responsive Settings" defaultOpen>
        <div className="space-y-4">
          <NumberInput
            label="Breakpoint (px)"
            value={s.responsive.breakpoint}
            onChange={(v) => updateResponsive({ breakpoint: v })}
            min={320}
            max={1920}
          />
          <SelectInput
            label="Mobile Layout"
            value={s.responsive.mobileLayout}
            onChange={(v) =>
              updateResponsive({ mobileLayout: v as PricingCardLayoutStyle })
            }
            options={[
              { value: "stacked", label: "Stacked Cards" },
              { value: "swipeable", label: "Swipeable Cards" },
              { value: "accordion", label: "Accordion" },
            ]}
          />
          <ToggleSwitch
            label="Show All Features on Mobile"
            checked={s.responsive.mobileCard.showAllFeatures}
            onChange={(checked) =>
              updateResponsive({
                mobileCard: {
                  ...s.responsive.mobileCard,
                  showAllFeatures: checked,
                },
              })
            }
          />
          {!s.responsive.mobileCard.showAllFeatures && (
            <NumberInput
              label="Key Features Count"
              value={s.responsive.mobileCard.keyFeaturesCount}
              onChange={(v) =>
                updateResponsive({
                  mobileCard: {
                    ...s.responsive.mobileCard,
                    keyFeaturesCount: v,
                  },
                })
              }
              min={1}
              max={20}
            />
          )}
          <TextInput
            label="Expand Button Text"
            value={s.responsive.mobileCard.expandButtonText}
            onChange={(v) =>
              updateResponsive({
                mobileCard: {
                  ...s.responsive.mobileCard,
                  expandButtonText: v,
                },
              })
            }
            placeholder="Show all features"
          />
        </div>
      </AccordionSection>

      {/* Animation */}
      <AccordionSection title="Animation">
        <div className="space-y-4">
          <ToggleSwitch
            label="Enable Animation"
            checked={s.animation.enabled}
            onChange={(checked) => updateAnimation({ enabled: checked })}
          />
          {s.animation.enabled && (
            <>
              <SelectInput
                label="Table Entrance"
                value={s.animation.tableEntrance}
                onChange={(v) =>
                  updateAnimation({
                    tableEntrance: v as
                      | "none"
                      | "fade"
                      | "slide-up"
                      | "scale",
                  })
                }
                options={[
                  { value: "none", label: "None" },
                  { value: "fade", label: "Fade" },
                  { value: "slide-up", label: "Slide Up" },
                  { value: "scale", label: "Scale" },
                ]}
              />
              <ToggleSwitch
                label="Row Stagger"
                checked={s.animation.rowStagger}
                onChange={(checked) => updateAnimation({ rowStagger: checked })}
              />
              <NumberInput
                label="Stagger Delay (ms)"
                value={s.animation.staggerDelay}
                onChange={(v) => updateAnimation({ staggerDelay: v })}
                min={0}
                max={500}
              />
              <ToggleSwitch
                label="Highlight on Hover"
                checked={s.animation.highlightOnHover}
                onChange={(checked) =>
                  updateAnimation({ highlightOnHover: checked })
                }
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Currency */}
      <AccordionSection title="Currency">
        <div className="space-y-4">
          <SelectInput
            label="Primary Currency"
            value={s.currency.primary}
            onChange={(v) =>
              onChange({
                ...s,
                currency: { ...s.currency, primary: v as "USD" | "BDT" },
              })
            }
            options={[
              { value: "USD", label: "USD ($)" },
              { value: "BDT", label: "BDT (৳)" },
            ]}
          />
          <ToggleSwitch
            label="Show Both Currencies"
            checked={s.currency.showBoth}
            onChange={(checked) =>
              onChange({
                ...s,
                currency: { ...s.currency, showBoth: checked },
              })
            }
          />
          <SelectInput
            label="Format"
            value={s.currency.format}
            onChange={(v) =>
              onChange({
                ...s,
                currency: {
                  ...s.currency,
                  format: v as "symbol" | "code" | "both",
                },
              })
            }
            options={[
              { value: "symbol", label: "Symbol ($100)" },
              { value: "code", label: "Code (USD 100)" },
              { value: "both", label: "Both ($100 USD)" },
            ]}
          />
        </div>
      </AccordionSection>

      {/* Color Overrides */}
      <AccordionSection title="Color Overrides">
        <div className="space-y-4">
          <ToggleSwitch
            label="Use Theme Colors"
            checked={s.colors.useTheme}
            onChange={(checked) => updateColors({ useTheme: checked })}
          />
          {!s.colors.useTheme && (
            <>
              <ColorInput
                label="Header Background"
                value={s.colors.headerBg || "#ffffff"}
                onChange={(v) => updateColors({ headerBg: v })}
              />
              <ColorInput
                label="Header Text"
                value={s.colors.headerText || "#0f172a"}
                onChange={(v) => updateColors({ headerText: v })}
              />
              <ColorInput
                label="Feature Label Text"
                value={s.colors.featureLabelText || "#0f172a"}
                onChange={(v) => updateColors({ featureLabelText: v })}
              />
              <ColorInput
                label="Highlighted Column Background"
                value={s.colors.highlightedColumnBg || "#fff7ed"}
                onChange={(v) => updateColors({ highlightedColumnBg: v })}
              />
              <ColorInput
                label="Row Border Color"
                value={s.colors.rowBorderColor || "#e2e8f0"}
                onChange={(v) => updateColors({ rowBorderColor: v })}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Feature Groups */}
      <AccordionSection title="Feature Groups">
        <div className="space-y-4">
          <ToggleSwitch
            label="Enable Feature Groups"
            checked={s.featureGroups.enabled}
            onChange={(checked) =>
              onChange({
                ...s,
                featureGroups: { ...s.featureGroups, enabled: checked },
              })
            }
          />
          {s.featureGroups.enabled && (
            <>
              <ToggleSwitch
                label="Default Expanded"
                checked={s.featureGroups.defaultExpanded}
                onChange={(checked) =>
                  onChange({
                    ...s,
                    featureGroups: {
                      ...s.featureGroups,
                      defaultExpanded: checked,
                    },
                  })
                }
              />
              <ToggleSwitch
                label="Show Group Icons"
                checked={s.featureGroups.showGroupIcons}
                onChange={(checked) =>
                  onChange({
                    ...s,
                    featureGroups: {
                      ...s.featureGroups,
                      showGroupIcons: checked,
                    },
                  })
                }
              />
            </>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Render based on active tab
  if (activeTab === "content") {
    return renderContentTab();
  } else if (activeTab === "style") {
    return renderStyleTab();
  } else {
    return renderAdvancedTab();
  }
}
