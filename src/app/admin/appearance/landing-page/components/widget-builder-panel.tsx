"use client";

import { useState, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Search,
  ArrowLeft,
  Layers,
  LayoutTemplate,
  MoreVertical,
  Pencil,
  Contrast,
  Settings2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GripVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  Section,
  Widget,
  WidgetType,
  WidgetSpacing,
  SectionLayout,
  BuilderSelection,
} from "@/lib/page-builder/types";
import { DEFAULT_WIDGET_SPACING } from "@/lib/page-builder/types";
import { WidgetRegistry, WIDGET_CATEGORIES } from "@/lib/page-builder/widget-registry";
import * as LucideIcons from "lucide-react";

// Settings panels
import {
  HeroContentWidgetSettingsPanel,
  HeadingWidgetSettingsPanel,
  TextBlockWidgetSettingsPanel,
  ImageWidgetSettingsPanel,
  ImageSliderSettingsPanel,
  TrustBadgesWidgetSettingsPanel,
  StatsSectionWidgetSettingsPanel,
  SectionSettingsPanel,
  DividerWidgetSettingsPanel,
  ServiceCardWidgetSettingsPanel,
  ServiceListWidgetSettingsPanel,
  ProcessStepsWidgetSettingsPanel,
  PricingTableWidgetSettingsPanel,
  TestimonialsWidgetSettingsPanel,
  LeadFormWidgetSettingsPanel,
  ServiceHeroWidgetSettingsPanel,
  FaqAccordionWidgetSettingsPanel,
  BlogPostGridSettingsPanel,
  BlogPostCarouselSettingsPanel,
  BlogFeaturedPostSettingsPanel,
  BlogPostListSettingsPanel,
  BlogRecentPostsSettingsPanel,
} from "@/components/page-builder/settings";
import { NumberInput } from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";

// Import widget registration
import "@/lib/page-builder/register-widgets";

// ============================================
// TYPES
// ============================================

type PanelMode = "browse" | "edit" | "section" | "layers";
type SettingsTab = "content" | "style" | "advanced";

interface WidgetBuilderPanelProps {
  sections: Section[];
  selection: BuilderSelection;
  onAddSection: (layout: SectionLayout) => void;
  onAddWidget: (sectionId: string, columnId: string, widgetType: WidgetType) => void;
  onUpdateSection: (sectionId: string, settings: Section["settings"]) => void;
  onUpdateSectionLayout: (sectionId: string, layout: SectionLayout) => void;
  onUpdateWidget: (sectionId: string, columnId: string, widgetId: string, settings: unknown) => void;
  onUpdateWidgetSpacing: (sectionId: string, columnId: string, widgetId: string, spacing: WidgetSpacing) => void;
  onSelectSection: (sectionId: string) => void;
  onSelectWidget: (sectionId: string, columnId: string, widgetId: string) => void;
  onClearSelection: () => void;
  pendingWidgetColumn?: { sectionId: string; columnId: string } | null;
  onClearPendingColumn?: () => void;
  className?: string;
}

// Get Lucide icon component by name
function getLucideIcon(
  name: string
): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  return icons[name] || LucideIcons.Box;
}

// ============================================
// DRAGGABLE WIDGET ITEM
// ============================================

interface DraggableWidgetItemProps {
  widgetType: WidgetType;
  name: string;
  icon: string;
  onClick: () => void;
}

function DraggableWidgetItem({ widgetType, name, icon, onClick }: DraggableWidgetItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `widget-${widgetType}`,
    data: {
      widgetType,
    },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const WidgetIcon = getLucideIcon(icon);

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-lg border bg-card p-3 transition-all",
        "hover:border-primary hover:bg-muted/50 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
        <WidgetIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      </div>
      <span className="text-center text-xs font-medium leading-tight text-foreground/70 group-hover:text-foreground">
        {name}
      </span>
    </button>
  );
}

// ============================================
// BROWSE MODE - Widget Browser
// ============================================

interface BrowseModeProps {
  onAddWidget: (widgetType: WidgetType) => void;
  onSwitchToLayers: () => void;
  pendingColumn?: { sectionId: string; columnId: string } | null;
  onClearPendingColumn?: () => void;
}

function BrowseMode({ onAddWidget, onSwitchToLayers, pendingColumn, onClearPendingColumn }: BrowseModeProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["hero"]);

  const hasPendingColumn = pendingColumn !== null && pendingColumn !== undefined;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Get categorized widgets from registry
  const categorizedWidgets = WidgetRegistry.getCategorizedWidgets();

  // Filter by search
  const filteredCategories = search
    ? categorizedWidgets
        .map((group) => ({
          ...group,
          widgets: group.widgets.filter(
            (widget) =>
              widget.name.toLowerCase().includes(search.toLowerCase()) ||
              widget.description.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((group) => group.widgets.length > 0)
    : categorizedWidgets;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Pending Insert Banner */}
      {hasPendingColumn && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-primary/30 bg-primary/10 px-4 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Select a widget to add
            </span>
          </div>
          <button
            onClick={onClearPendingColumn}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex shrink-0 border-b">
        <button className="flex flex-1 flex-col items-center gap-1 border-b-2 border-primary py-3 text-primary">
          <LayoutTemplate className="h-5 w-5" />
          <span className="text-xs font-medium">Blocks</span>
        </button>
        <button
          onClick={onSwitchToLayers}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground"
        >
          <Layers className="h-5 w-5" />
          <span className="text-xs font-medium">Layers</span>
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search widgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Widget Categories */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-4">
          {filteredCategories.map((group) => {
            const CategoryIcon = getLucideIcon(group.category.icon);
            const isExpanded = expandedCategories.includes(group.category.id);

            if (group.widgets.length === 0) return null;

            return (
              <div
                key={group.category.id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-background transition-all duration-200",
                  isExpanded ? "border-primary/40 shadow-sm" : "hover:border-muted-foreground/30"
                )}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(group.category.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between px-4 py-3.5 transition-colors",
                    isExpanded ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                        isExpanded ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded ? "text-primary" : "-rotate-90 text-muted-foreground"
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isExpanded ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isExpanded ? "text-foreground" : "text-foreground/70"
                        )}
                      >
                        {group.category.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {group.widgets.length}
                  </span>
                </button>

                {/* Widget Grid */}
                {isExpanded && (
                  <div className="border-t border-primary/20 bg-muted/30 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {group.widgets.map((widget) => (
                        <DraggableWidgetItem
                          key={widget.type}
                          widgetType={widget.type}
                          name={widget.name}
                          icon={widget.icon}
                          onClick={() => onAddWidget(widget.type)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// EDIT MODE - Widget Settings with Tabs
// ============================================

interface EditModeProps {
  widget: Widget<unknown>;
  section: Section;
  columnId: string;
  onBack: () => void;
  onUpdateSettings: (settings: unknown) => void;
  onUpdateSpacing: (spacing: WidgetSpacing) => void;
}

function EditMode({ widget, section, columnId, onBack, onUpdateSettings, onUpdateSpacing }: EditModeProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("content");

  const widgetDef = WidgetRegistry.get(widget.type);
  const displayName = widgetDef?.name || widget.type;

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "content", label: "Content", icon: Pencil },
    { id: "style", label: "Style", icon: Contrast },
    { id: "advanced", label: "Advanced", icon: Settings2 },
  ];

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-sm font-semibold text-foreground truncate flex-1 text-center mx-2">{displayName}</span>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Icon Tabs */}
      <div className="flex shrink-0 justify-center border-b py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex flex-col items-center gap-1 px-6 py-2 transition-colors",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <ScrollArea className="min-h-0 flex-1 min-w-0 w-full">
        <div className="p-4 overflow-hidden w-full min-w-0">
          {/* Hero Content Widget */}
          {widget.type === "hero-content" && (
            <HeroContentWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Heading Widget */}
          {widget.type === "heading" && (
            <HeadingWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Text Block Widget */}
          {widget.type === "text-block" && (
            <TextBlockWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Image Widget */}
          {widget.type === "image" && (
            <ImageWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Image Slider Widget */}
          {widget.type === "image-slider" && (
            <ImageSliderSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Trust Badges Widget */}
          {widget.type === "trust-badges" && (
            <TrustBadgesWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Stats Section Widget */}
          {widget.type === "stats-section" && (
            <StatsSectionWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Divider Widget */}
          {widget.type === "divider" && (
            <DividerWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Service Card Widget */}
          {widget.type === "service-card" && (
            <ServiceCardWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Service List Widget */}
          {widget.type === "service-list" && (
            <ServiceListWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Process Steps Widget */}
          {widget.type === "process-steps" && (
            <ProcessStepsWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Pricing Table Widget */}
          {widget.type === "pricing-table" && (
            <PricingTableWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Testimonials Widget */}
          {widget.type === "testimonials-carousel" && (
            <TestimonialsWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Lead Form Widget */}
          {widget.type === "lead-form" && (
            <LeadFormWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Service Hero Widget */}
          {widget.type === "service-hero" && (
            <ServiceHeroWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* FAQ Accordion Widget */}
          {widget.type === "faq" && (
            <FaqAccordionWidgetSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
              activeTab={activeTab}
            />
          )}

          {/* Blog Post Grid Widget */}
          {widget.type === "blog-post-grid" && (
            <BlogPostGridSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
            />
          )}

          {/* Blog Post Carousel Widget */}
          {widget.type === "blog-post-carousel" && (
            <BlogPostCarouselSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
            />
          )}

          {/* Blog Featured Post Widget */}
          {widget.type === "blog-featured-post" && (
            <BlogFeaturedPostSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
            />
          )}

          {/* Blog Post List Widget */}
          {widget.type === "blog-post-list" && (
            <BlogPostListSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
            />
          )}

          {/* Blog Recent Posts Widget */}
          {widget.type === "blog-recent-posts" && (
            <BlogRecentPostsSettingsPanel
              settings={widget.settings as any}
              onChange={onUpdateSettings}
            />
          )}

          {/* Fallback for unknown widget types */}
          {!["hero-content", "heading", "text-block", "image", "image-slider", "trust-badges", "stats-section", "divider", "service-card", "service-list", "process-steps", "pricing-table", "testimonials-carousel", "lead-form", "service-hero", "faq", "service-features", "service-description", "service-breadcrumb", "related-services", "blog-post-grid", "blog-post-carousel", "blog-featured-post", "blog-post-list", "blog-recent-posts"].includes(widget.type) && (
            <p className="text-center text-sm text-muted-foreground">
              Settings for {widget.type} coming soon.
            </p>
          )}

          {/* Common Spacing Settings - Available for all widgets in Advanced tab */}
          {activeTab === "advanced" && (
            <div className="mt-4 border-t pt-4">
              <AccordionSection title="Spacing" defaultOpen>
                <div className="space-y-3">
                  <NumberInput
                    label="Margin Top"
                    value={widget.spacing?.marginTop ?? 0}
                    onChange={(v) => onUpdateSpacing({
                      ...DEFAULT_WIDGET_SPACING,
                      ...widget.spacing,
                      marginTop: v,
                    })}
                    min={0}
                    max={200}
                    step={4}
                    unit="px"
                  />
                  <NumberInput
                    label="Margin Bottom"
                    value={widget.spacing?.marginBottom ?? 0}
                    onChange={(v) => onUpdateSpacing({
                      ...DEFAULT_WIDGET_SPACING,
                      ...widget.spacing,
                      marginBottom: v,
                    })}
                    min={0}
                    max={200}
                    step={4}
                    unit="px"
                  />
                </div>
              </AccordionSection>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// LAYERS MODE
// ============================================

interface LayersModeProps {
  sections: Section[];
  selection: BuilderSelection;
  onSelectSection: (sectionId: string) => void;
  onSelectWidget: (sectionId: string, columnId: string, widgetId: string) => void;
  onSwitchToBrowse: () => void;
}

function LayersMode({
  sections,
  selection,
  onSelectSection,
  onSelectWidget,
  onSwitchToBrowse,
}: LayersModeProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Top Navigation */}
      <div className="flex shrink-0 border-b">
        <button
          onClick={onSwitchToBrowse}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground"
        >
          <LayoutTemplate className="h-5 w-5" />
          <span className="text-xs font-medium">Blocks</span>
        </button>
        <button className="flex flex-1 flex-col items-center gap-1 border-b-2 border-primary py-3 text-primary">
          <Layers className="h-5 w-5" />
          <span className="text-xs font-medium">Layers</span>
        </button>
      </div>

      {/* Layers List */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Page Structure</h3>
          {sections.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No sections added yet
            </p>
          ) : (
            <div className="space-y-2">
              {sections.map((section, sIndex) => (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => onSelectSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 bg-muted/30",
                      "hover:bg-muted/50 transition-colors text-left",
                      selection.sectionId === section.id && selection.type === "section" && "border-l-2 border-l-primary"
                    )}
                  >
                    <span className="text-xs font-medium text-foreground">Section {sIndex + 1}</span>
                    <span className="text-xs text-muted-foreground">{section.columns.length} col</span>
                  </button>
                  <div className="p-2 space-y-1 bg-muted/10">
                    {section.columns.map((column, cIndex) => (
                      <div key={column.id} className="pl-4">
                        <div className="text-xs text-muted-foreground mb-1">Column {cIndex + 1}</div>
                        {column.widgets.map((widget) => (
                          <button
                            key={widget.id}
                            onClick={() => onSelectWidget(section.id, column.id, widget.id)}
                            className={cn(
                              "w-full text-left px-2 py-1 rounded text-xs",
                              "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                              selection.widgetId === widget.id && "bg-muted text-primary"
                            )}
                          >
                            {WidgetRegistry.get(widget.type)?.name || widget.type}
                          </button>
                        ))}
                        {column.widgets.length === 0 && (
                          <span className="text-xs text-muted-foreground/50 italic">Empty</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// SECTION MODE - Section Settings
// ============================================

interface SectionModeProps {
  section: Section;
  onBack: () => void;
  onUpdateSettings: (settings: Section["settings"]) => void;
  onUpdateLayout: (layout: SectionLayout) => void;
}

function SectionMode({ section, onBack, onUpdateSettings, onUpdateLayout }: SectionModeProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-sm font-semibold text-foreground truncate flex-1 text-center mx-2">Section Settings</span>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Settings Content */}
      <ScrollArea className="min-h-0 flex-1 min-w-0 w-full">
        <div className="p-4 overflow-hidden w-full min-w-0">
          <SectionSettingsPanel
            settings={section.settings}
            layout={section.layout}
            onSettingsChange={onUpdateSettings}
            onLayoutChange={onUpdateLayout}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WidgetBuilderPanel({
  sections,
  selection,
  onAddSection,
  onAddWidget,
  onUpdateSection,
  onUpdateSectionLayout,
  onUpdateWidget,
  onUpdateWidgetSpacing,
  onSelectSection,
  onSelectWidget,
  onClearSelection,
  pendingWidgetColumn,
  onClearPendingColumn,
  className,
}: WidgetBuilderPanelProps) {
  const [mode, setMode] = useState<PanelMode>("browse");

  // Get selected section and widget
  const selectedSection = sections.find((s) => s.id === selection.sectionId);
  const selectedColumn = selectedSection?.columns.find((c) => c.id === selection.columnId);
  const selectedWidget = selectedColumn?.widgets.find((w) => w.id === selection.widgetId);

  // Determine effective mode based on selection
  // Priority: pendingWidgetColumn > widget selected > section selected > default mode
  const effectiveMode = pendingWidgetColumn
    ? "browse"
    : selectedWidget
      ? "edit"
      : (selectedSection && selection.type === "section")
        ? "section"
        : mode;

  // Handle widget selection from browser
  const handleAddWidgetFromBrowser = useCallback((widgetType: WidgetType) => {
    if (pendingWidgetColumn) {
      onAddWidget(pendingWidgetColumn.sectionId, pendingWidgetColumn.columnId, widgetType);
      onClearPendingColumn?.();
    }
  }, [pendingWidgetColumn, onAddWidget, onClearPendingColumn]);

  // Handle back from edit mode
  const handleBack = useCallback(() => {
    onClearSelection();
    setMode("browse");
  }, [onClearSelection]);

  // Handle widget settings update
  const handleUpdateWidgetSettings = useCallback((settings: unknown) => {
    if (selectedSection && selectedColumn && selectedWidget) {
      onUpdateWidget(selectedSection.id, selectedColumn.id, selectedWidget.id, settings);
    }
  }, [selectedSection, selectedColumn, selectedWidget, onUpdateWidget]);

  // Handle widget spacing update
  const handleUpdateWidgetSpacing = useCallback((spacing: WidgetSpacing) => {
    if (selectedSection && selectedColumn && selectedWidget) {
      onUpdateWidgetSpacing(selectedSection.id, selectedColumn.id, selectedWidget.id, spacing);
    }
  }, [selectedSection, selectedColumn, selectedWidget, onUpdateWidgetSpacing]);

  // Handle section settings update
  const handleUpdateSectionSettings = useCallback((settings: Section["settings"]) => {
    if (selectedSection) {
      onUpdateSection(selectedSection.id, settings);
    }
  }, [selectedSection, onUpdateSection]);

  // Handle section layout update
  const handleUpdateSectionLayout = useCallback((layout: SectionLayout) => {
    if (selectedSection) {
      onUpdateSectionLayout(selectedSection.id, layout);
    }
  }, [selectedSection, onUpdateSectionLayout]);

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r bg-background", className)}>
      {effectiveMode === "browse" && (
        <BrowseMode
          onAddWidget={handleAddWidgetFromBrowser}
          onSwitchToLayers={() => setMode("layers")}
          pendingColumn={pendingWidgetColumn}
          onClearPendingColumn={onClearPendingColumn}
        />
      )}

      {effectiveMode === "edit" && selectedWidget && selectedSection && selectedColumn && (
        <EditMode
          widget={selectedWidget}
          section={selectedSection}
          columnId={selectedColumn.id}
          onBack={handleBack}
          onUpdateSettings={handleUpdateWidgetSettings}
          onUpdateSpacing={handleUpdateWidgetSpacing}
        />
      )}

      {effectiveMode === "section" && selectedSection && (
        <SectionMode
          section={selectedSection}
          onBack={handleBack}
          onUpdateSettings={handleUpdateSectionSettings}
          onUpdateLayout={handleUpdateSectionLayout}
        />
      )}

      {effectiveMode === "layers" && (
        <LayersMode
          sections={sections}
          selection={selection}
          onSelectSection={onSelectSection}
          onSelectWidget={onSelectWidget}
          onSwitchToBrowse={() => setMode("browse")}
        />
      )}
    </div>
  );
}

// Export helper for opening widget browser for a specific column
export function useWidgetBrowserTrigger() {
  const [pendingColumn, setPendingColumn] = useState<{
    sectionId: string;
    columnId: string;
  } | null>(null);

  return {
    pendingColumn,
    openForColumn: (sectionId: string, columnId: string) => {
      setPendingColumn({ sectionId, columnId });
    },
    clear: () => setPendingColumn(null),
  };
}
