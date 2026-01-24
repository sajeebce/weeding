"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type {
  Section as SectionType,
  SectionLayout,
  WidgetType,
  BuilderSelection,
} from "@/lib/page-builder/types";
import { createSection, createWidget, generateId } from "@/lib/page-builder/widget-registry";
import { Section } from "./section";
import {
  LayoutSelector,
  WidgetBrowser,
  AddSectionButton,
} from "../ui";

// Import widget registration
import "@/lib/page-builder/register-widgets";

interface PageCanvasProps {
  sections: SectionType[];
  onChange: (sections: SectionType[]) => void;
  selection: BuilderSelection;
  onSelectionChange: (selection: BuilderSelection) => void;
  isPreviewMode?: boolean;
  previewDevice?: "desktop" | "tablet" | "mobile";
  className?: string;
}

export function PageCanvas({
  sections,
  onChange,
  selection,
  onSelectionChange,
  isPreviewMode = false,
  previewDevice = "desktop",
  className,
}: PageCanvasProps) {
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showWidgetBrowser, setShowWidgetBrowser] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  // Add a new section
  const handleAddSection = useCallback(
    (layout: SectionLayout) => {
      const newSection = createSection(layout);
      newSection.order = insertIndex !== null ? insertIndex : sections.length;

      let updatedSections: SectionType[];
      if (insertIndex !== null) {
        // Insert at specific index
        updatedSections = [
          ...sections.slice(0, insertIndex),
          newSection,
          ...sections.slice(insertIndex),
        ];
        // Update order for all sections
        updatedSections = updatedSections.map((s, i) => ({ ...s, order: i }));
      } else {
        // Add at end
        updatedSections = [...sections, newSection];
      }

      onChange(updatedSections);
      setInsertIndex(null);

      // Select the new section
      onSelectionChange({
        type: "section",
        sectionId: newSection.id,
      });
    },
    [sections, insertIndex, onChange, onSelectionChange]
  );

  // Add a widget to a column
  const handleAddWidget = useCallback(
    (widgetType: WidgetType) => {
      if (!targetColumnId) return;

      // Find the section and column
      const sectionIndex = sections.findIndex((s) =>
        s.columns.some((c) => c.id === targetColumnId)
      );
      if (sectionIndex === -1) return;

      const section = sections[sectionIndex];
      const columnIndex = section.columns.findIndex((c) => c.id === targetColumnId);
      if (columnIndex === -1) return;

      // Create the widget
      const newWidget = createWidget(widgetType);

      // Update the section
      const updatedSection = {
        ...section,
        columns: section.columns.map((col, i) =>
          i === columnIndex
            ? { ...col, widgets: [...col.widgets, newWidget] }
            : col
        ),
      };

      // Update sections
      const updatedSections = sections.map((s, i) =>
        i === sectionIndex ? updatedSection : s
      );

      onChange(updatedSections);
      setTargetColumnId(null);

      // Select the new widget
      onSelectionChange({
        type: "widget",
        sectionId: section.id,
        columnId: targetColumnId,
        widgetId: newWidget.id,
      });
    },
    [sections, targetColumnId, onChange, onSelectionChange]
  );

  // Delete a section
  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      const updatedSections = sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i }));
      onChange(updatedSections);

      // Clear selection if deleted section was selected
      if (selection.sectionId === sectionId) {
        onSelectionChange({ type: null });
      }
    },
    [sections, selection, onChange, onSelectionChange]
  );

  // Delete a widget
  const handleDeleteWidget = useCallback(
    (sectionId: string, columnId: string, widgetId: string) => {
      const updatedSections = sections.map((section) => {
        if (section.id !== sectionId) return section;

        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;

            return {
              ...column,
              widgets: column.widgets.filter((w) => w.id !== widgetId),
            };
          }),
        };
      });

      onChange(updatedSections);

      // Clear selection if deleted widget was selected
      if (selection.widgetId === widgetId) {
        onSelectionChange({
          type: "column",
          sectionId,
          columnId,
        });
      }
    },
    [sections, selection, onChange, onSelectionChange]
  );

  // Handle opening widget browser for a specific column
  const openWidgetBrowser = useCallback((columnId: string) => {
    setTargetColumnId(columnId);
    setShowWidgetBrowser(true);
  }, []);

  // Handle opening layout selector
  const openLayoutSelector = useCallback((index?: number) => {
    setInsertIndex(index ?? null);
    setShowLayoutSelector(true);
  }, []);

  // Get preview width based on device
  const getPreviewWidth = () => {
    switch (previewDevice) {
      case "mobile":
        return "max-w-[375px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "max-w-full";
    }
  };

  return (
    <div
      className={cn(
        "min-h-[600px] bg-slate-950 transition-all duration-300",
        isPreviewMode && "bg-slate-900",
        getPreviewWidth(),
        className
      )}
      onClick={() => {
        if (!isPreviewMode) {
          onSelectionChange({ type: null });
        }
      }}
    >
      {/* Sections */}
      {sections.length === 0 ? (
        // Empty state
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
          <AddSectionButton onClick={() => openLayoutSelector()} />
        </div>
      ) : (
        <>
          {/* Add Section Button at top */}
          {!isPreviewMode && (
            <AddSectionButton
              onClick={() => openLayoutSelector(0)}
              className="opacity-0 hover:opacity-100 transition-opacity"
            />
          )}

          {/* Render sections */}
          {sections.map((section, index) => (
            <div key={section.id}>
              <Section
                section={section}
                isSelected={selection.sectionId === section.id && selection.type === "section"}
                selectedColumnId={selection.columnId}
                selectedWidgetId={selection.widgetId}
                onSelect={() =>
                  onSelectionChange({
                    type: "section",
                    sectionId: section.id,
                  })
                }
                onSelectColumn={(columnId) =>
                  onSelectionChange({
                    type: "column",
                    sectionId: section.id,
                    columnId,
                  })
                }
                onSelectWidget={(columnId, widgetId) =>
                  onSelectionChange({
                    type: "widget",
                    sectionId: section.id,
                    columnId,
                    widgetId,
                  })
                }
                isPreview={isPreviewMode}
                onAddWidget={(columnId) => openWidgetBrowser(columnId)}
              />

              {/* Add Section Button between sections */}
              {!isPreviewMode && (
                <AddSectionButton
                  onClick={() => openLayoutSelector(index + 1)}
                  className="opacity-0 hover:opacity-100 transition-opacity"
                />
              )}
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

      {/* Widget Browser Modal */}
      <WidgetBrowser
        isOpen={showWidgetBrowser}
        onClose={() => {
          setShowWidgetBrowser(false);
          setTargetColumnId(null);
        }}
        onSelect={handleAddWidget}
      />
    </div>
  );
}
