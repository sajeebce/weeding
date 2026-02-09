"use client";

import { useState, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Trash2, GripVertical, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Section,
  SectionLayout,
  WidgetType,
  BuilderSelection,
  SectionBackground,
} from "@/lib/page-builder/types";
import { DEFAULT_SECTION_BACKGROUND } from "@/lib/page-builder/defaults";
import {
  createSection,
  createWidget,
  generateId,
} from "@/lib/page-builder/widget-registry";
import { getLayoutGridClass, getColumnSpanClasses, getMaxWidthClass } from "@/lib/page-builder/section-layouts";
import { getPatternCSS, getPatternBackgroundSize } from "@/lib/page-builder/pattern-utils";
import { WidgetWrapper } from "@/components/page-builder/core/widget-wrapper";
import { LayoutSelector, WidgetBrowser } from "@/components/page-builder/ui";

// Import widget registration
import "@/lib/page-builder/register-widgets";

interface WidgetPageBuilderProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  selection: BuilderSelection;
  onSelectionChange: (selection: BuilderSelection) => void;
  onRequestAddWidget: (sectionId: string, columnId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onDeleteWidget?: (sectionId: string, columnId: string, widgetId: string) => void;
  onDuplicateWidget?: (sectionId: string, columnId: string, widgetId: string) => void;
  isPreviewMode?: boolean;
  device?: "desktop" | "mobile";
  isDraggingWidget?: boolean;
  className?: string;
}

// ============================================
// DROPPABLE WIDGET ZONE
// ============================================

interface DroppableWidgetZoneProps {
  sectionId: string;
  columnId: string;
  isEmpty: boolean;
  isDraggingWidget: boolean;
  onRequestAddWidget: () => void;
}

function DroppableWidgetZone({
  sectionId,
  columnId,
  isEmpty,
  isDraggingWidget,
  onRequestAddWidget,
}: DroppableWidgetZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${sectionId}-${columnId}`,
    data: {
      sectionId,
      columnId,
    },
  });

  // Empty state - full height drop zone
  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        onClick={(e) => {
          e.stopPropagation();
          onRequestAddWidget();
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 w-full h-full min-h-[100px]",
          "border-2 border-dashed rounded-lg transition-all duration-200",
          isOver
            ? "border-primary bg-primary/10 scale-[1.02]"
            : isDraggingWidget
              ? "border-primary/50 bg-primary/5 animate-pulse"
              : "border-slate-600 hover:border-slate-500",
          "text-slate-500 hover:text-slate-400 cursor-pointer"
        )}
      >
        <Plus className={cn("h-6 w-6", isOver && "text-primary")} />
        <span className={cn("text-sm", isOver && "text-primary font-medium")}>
          {isOver ? "Drop here" : "Add Widget"}
        </span>
      </div>
    );
  }

  // Non-empty state - compact drop zone at bottom
  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onRequestAddWidget();
      }}
      className={cn(
        "flex items-center justify-center gap-1 w-full py-2 mt-2",
        "border-2 border-dashed rounded-md transition-all duration-200",
        isOver
          ? "border-primary bg-primary/10 py-4"
          : isDraggingWidget
            ? "border-primary/50 bg-primary/5 py-3"
            : "border-slate-700 hover:border-slate-500",
        "text-slate-600 hover:text-slate-400 cursor-pointer"
      )}
    >
      <Plus className={cn("h-4 w-4", isOver && "text-primary")} />
      <span className={cn("text-xs", isOver && "text-primary font-medium")}>
        {isOver ? "Drop here" : "Add Widget"}
      </span>
    </div>
  );
}

export function WidgetPageBuilder({
  sections,
  onChange,
  selection,
  onSelectionChange,
  onRequestAddWidget,
  onDeleteSection,
  onDuplicateSection,
  onDeleteWidget,
  onDuplicateWidget,
  isPreviewMode = false,
  device = "desktop",
  isDraggingWidget = false,
  className,
}: WidgetPageBuilderProps) {
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const forceMobileLayout = device === "mobile";

  // Add a new section
  const handleAddSection = useCallback(
    (layout: SectionLayout) => {
      const newSection = createSection(layout);
      newSection.order = insertIndex !== null ? insertIndex : sections.length;

      let updatedSections: Section[];
      if (insertIndex !== null) {
        updatedSections = [
          ...sections.slice(0, insertIndex),
          newSection,
          ...sections.slice(insertIndex),
        ];
        updatedSections = updatedSections.map((s, i) => ({ ...s, order: i }));
      } else {
        updatedSections = [...sections, newSection];
      }

      onChange(updatedSections);
      setInsertIndex(null);
      setShowLayoutSelector(false);

      // Select the new section
      onSelectionChange({
        type: "section",
        sectionId: newSection.id,
      });
    },
    [sections, insertIndex, onChange, onSelectionChange]
  );

  // Open layout selector
  const openLayoutSelector = useCallback((index?: number) => {
    setInsertIndex(index ?? null);
    setShowLayoutSelector(true);
  }, []);

  // Helper: Generate background styles from SectionBackground
  const getBackgroundStyles = (bg: SectionBackground): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    switch (bg.type) {
      case "solid":
        if (bg.color && bg.color !== "transparent") {
          styles.backgroundColor = bg.color;
        }
        break;

      case "gradient":
        if (bg.gradient) {
          const colorStops = bg.gradient.colors
            .map((c) => `${c.color} ${c.position}%`)
            .join(", ");
          if (bg.gradient.type === "linear") {
            styles.background = `linear-gradient(${bg.gradient.angle}deg, ${colorStops})`;
          } else {
            styles.background = `radial-gradient(circle, ${colorStops})`;
          }
        }
        break;

      case "image":
        if (bg.image?.url) {
          styles.backgroundImage = `url(${bg.image.url})`;
          styles.backgroundSize = bg.image.size || "cover";
          // Convert position to CSS
          const positionMap: Record<string, string> = {
            "center": "center",
            "top": "top center",
            "bottom": "bottom center",
            "left": "center left",
            "right": "center right",
            "top-left": "top left",
            "top-right": "top right",
            "bottom-left": "bottom left",
            "bottom-right": "bottom right",
          };
          styles.backgroundPosition = positionMap[bg.image.position || "center"] || "center";
          styles.backgroundRepeat = bg.image.repeat || "no-repeat";
          if (bg.image.fixed) {
            styles.backgroundAttachment = "fixed";
          }
        }
        break;

      case "video":
        // Video is handled separately as a DOM element
        break;
    }

    return styles;
  };

  // Render a single section
  const renderSection = (section: Section, index: number) => {
    const { settings, layout, columns } = section;
    const columnSpanClasses = getColumnSpanClasses(layout);
    const isSelected = selection.sectionId === section.id && selection.type === "section";

    // Get background from new system, fallback to legacy
    const background: SectionBackground = settings.background || {
      ...DEFAULT_SECTION_BACKGROUND,
      type: "solid",
      color: settings.backgroundColor || "transparent",
      image: settings.backgroundImage
        ? { ...DEFAULT_SECTION_BACKGROUND.image!, url: settings.backgroundImage }
        : DEFAULT_SECTION_BACKGROUND.image,
      overlay: settings.backgroundOverlay || DEFAULT_SECTION_BACKGROUND.overlay,
    };

    const backgroundStyles = getBackgroundStyles(background);

    const borderRadius = settings.borderRadius ? `${settings.borderRadius}px` : undefined;
    const patternOverlay = background.patternOverlay;

    // Visibility: hide in preview mode if section is not visible
    if (settings.isVisible === false && isPreviewMode) {
      return null;
    }

    return (
      <div
        key={section.id}
        className={cn(
          "relative w-full",
          !isPreviewMode && "group/section pt-4",
          settings.isVisible === false && !isPreviewMode && "opacity-40",
        )}
        style={{
          marginTop: `${settings.marginTop ?? 0}px`,
          marginBottom: `${settings.marginBottom ?? 0}px`,
        }}
      >
        {/* Section Toolbar - Outside overflow-hidden container */}
        {!isPreviewMode && (
          <div className="absolute top-0 left-4 right-4 flex items-center justify-between opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
            {/* Left: Section label */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-md px-2 py-1 text-xs text-slate-400 shadow-lg border border-slate-700">
              <GripVertical className="h-3 w-3 text-slate-500 cursor-grab" />
              Section {index + 1}{settings.isVisible === false ? " (Hidden)" : ""}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-md px-1 py-1 shadow-lg border border-slate-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateSection?.(section.id);
                }}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                title="Duplicate Section"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSection?.(section.id);
                }}
                className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                title="Delete Section"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Section Content - with optional gradient border wrapper */}
        {(() => {
          const hasGradientBorder = settings.gradientBorder?.enabled && settings.gradientBorder.colors?.length >= 2;
          const innerBorderRadius = hasGradientBorder && settings.borderRadius
            ? Math.max(0, settings.borderRadius - (settings.gradientBorder!.width || 2))
            : settings.borderRadius;

          const sectionContentDiv = (
            <div
              className={cn(
                "relative w-full transition-all duration-200 overflow-hidden",
                isSelected && !isPreviewMode && !hasGradientBorder && "ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900"
              )}
              style={{
                ...(settings.fullWidth ? backgroundStyles : {}),
                paddingTop: `${settings.paddingTop ?? 0}px`,
                paddingBottom: `${settings.paddingBottom ?? 0}px`,
                paddingLeft: `${settings.paddingLeft ?? 0}px`,
                paddingRight: `${settings.paddingRight ?? 0}px`,
                minHeight: settings.minHeight ? `${settings.minHeight}px` : undefined,
                borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isPreviewMode) {
                  onSelectionChange({
                    type: "section",
                    sectionId: section.id,
                  });
                }
              }}
            >
              {/* Video Background */}
              {background.type === "video" && background.video?.url && (
                <video
                  autoPlay
                  muted={background.video.muted}
                  loop={background.video.loop}
                  playsInline
                  poster={background.video.poster}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined }}
                >
                  <source src={background.video.url} type="video/mp4" />
                </video>
              )}

              {/* Background Overlay - works for all types */}
              {background.overlay?.enabled && (
                <div
                  className="absolute inset-0 pointer-events-none z-1"
                  style={{
                    backgroundColor: background.overlay.color,
                    opacity: background.overlay.opacity,
                    borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
                  }}
                />
              )}

              {/* Pattern Overlay */}
              {patternOverlay && patternOverlay.opacity > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none z-1"
                  style={{
                    backgroundImage: getPatternCSS(patternOverlay.type, patternOverlay.color, patternOverlay.opacity),
                    backgroundSize: getPatternBackgroundSize(patternOverlay.type),
                    borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
                  }}
                />
              )}

              {/* Container - above overlay */}
              <div
                className={cn("relative z-2 mx-auto", !settings.fullWidth && getMaxWidthClass(settings.maxWidth))}
                style={!settings.fullWidth ? backgroundStyles : undefined}
              >
                {/* Grid */}
                <div
                  className={cn(
                    "grid",
                    forceMobileLayout ? "grid-cols-1" : getLayoutGridClass(layout)
                  )}
                  style={{ gap: `${settings.gap}px` }}
                >
                  {columns.map((column, colIndex) => {
                    const isColumnSelected = selection.columnId === column.id;
                    const columnSpan = forceMobileLayout ? "col-span-1" : columnSpanClasses[colIndex];

                    return (
                      <div
                        key={column.id}
                        className={cn(
                          "relative flex flex-col min-h-[100px] transition-all duration-200",
                          column.settings.verticalAlign === "center" && "justify-center",
                          column.settings.verticalAlign === "bottom" && "justify-end",
                          !isPreviewMode && "group/column",
                          isColumnSelected && !isPreviewMode && "ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900 rounded-md",
                          columnSpan
                        )}
                        style={{
                          padding: column.settings.padding ? `${column.settings.padding}px` : undefined,
                          backgroundColor: column.settings.backgroundColor,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isPreviewMode) {
                            onSelectionChange({
                              type: "column",
                              sectionId: section.id,
                              columnId: column.id,
                            });
                          }
                        }}
                      >
                        {/* Empty State - Droppable Zone */}
                        {column.widgets.length === 0 && !isPreviewMode && (
                          <DroppableWidgetZone
                            sectionId={section.id}
                            columnId={column.id}
                            isEmpty={true}
                            isDraggingWidget={isDraggingWidget}
                            onRequestAddWidget={() => onRequestAddWidget(section.id, column.id)}
                          />
                        )}

                        {/* Widgets */}
                        {column.widgets.map((widget) => (
                          <WidgetWrapper
                            key={widget.id}
                            widget={widget}
                            isSelected={selection.widgetId === widget.id}
                            onSelect={() =>
                              onSelectionChange({
                                type: "widget",
                                sectionId: section.id,
                                columnId: column.id,
                                widgetId: widget.id,
                              })
                            }
                            onDelete={() => onDeleteWidget?.(section.id, column.id, widget.id)}
                            onDuplicate={() => onDuplicateWidget?.(section.id, column.id, widget.id)}
                            isPreview={isPreviewMode}
                          />
                        ))}

                        {/* Add Widget Button (when column has widgets) - Droppable Zone */}
                        {column.widgets.length > 0 && !isPreviewMode && (
                          <DroppableWidgetZone
                            sectionId={section.id}
                            columnId={column.id}
                            isEmpty={false}
                            isDraggingWidget={isDraggingWidget}
                            onRequestAddWidget={() => onRequestAddWidget(section.id, column.id)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );

          if (hasGradientBorder) {
            const { colors, angle, width } = settings.gradientBorder!;
            return (
              <div
                className={cn(
                  isSelected && !isPreviewMode && "ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900"
                )}
                style={{
                  padding: `${width || 2}px`,
                  background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
                  borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
                }}
              >
                {sectionContentDiv}
              </div>
            );
          }

          return sectionContentDiv;
        })()}
      </div>
    );
  };

  // Render Add Section Button
  const renderAddSectionButton = (index?: number) => (
    <button
      onClick={() => openLayoutSelector(index)}
      className={cn(
        "relative w-full py-4 group flex items-center justify-center",
        !isPreviewMode && "transition-opacity"
      )}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700 group-hover:bg-slate-600 transition-colors" />
      <div
        className={cn(
          "relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-slate-800 border border-slate-700",
          "text-slate-400 hover:text-white hover:border-orange-500 hover:bg-slate-700",
          "transition-all duration-200"
        )}
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Add Section</span>
      </div>
    </button>
  );

  return (
    <div
      className={cn(
        "min-h-[400px] bg-slate-950 transition-all duration-300",
        className
      )}
      onClick={() => {
        if (!isPreviewMode) {
          onSelectionChange({ type: null });
        }
      }}
    >
      {/* Empty State */}
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Start Building Your Page
            </h3>
            <p className="text-slate-400 max-w-md">
              Add your first section to get started. Choose from different column
              layouts and then add widgets to each column.
            </p>
          </div>
          <button
            onClick={() => openLayoutSelector()}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg",
              "bg-orange-500 text-white font-medium",
              "hover:bg-orange-600 transition-colors"
            )}
          >
            <Plus className="h-5 w-5" />
            Add Section
          </button>
        </div>
      ) : (
        <>
          {/* Add Section Button at top */}
          {!isPreviewMode && renderAddSectionButton(0)}

          {/* Render sections */}
          {sections.map((section, index) => (
            <div key={section.id}>
              {renderSection(section, index)}
              {/* Add Section Button between sections */}
              {!isPreviewMode && renderAddSectionButton(index + 1)}
            </div>
          ))}
        </>
      )}

      {/* Layout Selector Modal */}
      <LayoutSelector
        isOpen={showLayoutSelector}
        onClose={() => {
          setShowLayoutSelector(false);
          setInsertIndex(null);
        }}
        onSelect={handleAddSection}
      />
    </div>
  );
}
