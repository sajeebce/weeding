"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  Smartphone,
  Monitor,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  Section,
  SectionLayout,
  WidgetType,
  BuilderSelection,
} from "@/lib/page-builder/types";
import { createSection, createWidget } from "@/lib/page-builder/widget-registry";

// New Components
import { WidgetBuilderPanel } from "./components/widget-builder-panel";
import { WidgetPageBuilder } from "./components/widget-page-builder";

// Import widget registration
import "@/lib/page-builder/register-widgets";

export default function WidgetBasedLandingPageBuilder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selection, setSelection] = useState<BuilderSelection>({ type: null });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Scroll detection for auto-hide scrollbar
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide scrollbar after 1 second of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Load saved data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/admin/page-builder");
        if (response.ok) {
          const data = await response.json();
          if (data.sections && Array.isArray(data.sections)) {
            setSections(data.sections);
          }
        }
      } catch (error) {
        console.error("Failed to load page data:", error);
        toast.error("Failed to load page data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Widget browser state (left panel)
  const [pendingWidgetColumn, setPendingWidgetColumn] = useState<{
    sectionId: string;
    columnId: string;
  } | null>(null);

  // Add a new section
  const handleAddSection = useCallback((layout: SectionLayout) => {
    const newSection = createSection(layout);
    newSection.order = sections.length;
    setSections((prev) => [...prev, newSection]);
    setIsDirty(true);
    setSelection({
      type: "section",
      sectionId: newSection.id,
    });
  }, [sections.length]);

  // Request to add widget (shows widget browser in left panel)
  const handleRequestAddWidget = useCallback((sectionId: string, columnId: string) => {
    setPendingWidgetColumn({ sectionId, columnId });
    // Don't open modal - widget browser shows in left panel when pendingWidgetColumn is set
  }, []);

  // Add a widget to a column
  const handleAddWidget = useCallback((sectionId: string, columnId: string, widgetType: WidgetType) => {
    const newWidget = createWidget(widgetType);

    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              widgets: [...column.widgets, newWidget],
            };
          }),
        };
      })
    );

    setIsDirty(true);
    setPendingWidgetColumn(null);

    // Select the new widget
    setSelection({
      type: "widget",
      sectionId,
      columnId,
      widgetId: newWidget.id,
    });
  }, []);

  // Update section settings
  const handleUpdateSection = useCallback((sectionId: string, settings: Section["settings"]) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, settings } : section
      )
    );
    setIsDirty(true);
  }, []);

  // Update section layout
  const handleUpdateSectionLayout = useCallback((sectionId: string, layout: SectionLayout) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        // Create new columns if needed
        const currentColumns = section.columns.length;
        const neededColumns = getColumnCount(layout);

        let columns = [...section.columns];
        if (neededColumns > currentColumns) {
          // Add more columns
          for (let i = currentColumns; i < neededColumns; i++) {
            columns.push({
              id: `col_${Date.now()}_${i}`,
              widgets: [],
              settings: { verticalAlign: "top", padding: 0 },
            });
          }
        } else if (neededColumns < currentColumns) {
          // Remove extra columns (move widgets to first column)
          const extraWidgets = columns
            .slice(neededColumns)
            .flatMap((c) => c.widgets);
          columns = columns.slice(0, neededColumns);
          if (extraWidgets.length > 0) {
            columns[0].widgets = [...columns[0].widgets, ...extraWidgets];
          }
        }

        return { ...section, layout, columns };
      })
    );
    setIsDirty(true);
  }, []);

  // Update widget settings
  const handleUpdateWidget = useCallback((
    sectionId: string,
    columnId: string,
    widgetId: string,
    settings: unknown
  ) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              widgets: column.widgets.map((widget) =>
                widget.id === widgetId ? { ...widget, settings } : widget
              ),
            };
          }),
        };
      })
    );
    setIsDirty(true);
  }, []);

  // Update widget spacing
  const handleUpdateWidgetSpacing = useCallback((
    sectionId: string,
    columnId: string,
    widgetId: string,
    spacing: { marginTop: number; marginBottom: number }
  ) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;
            return {
              ...column,
              widgets: column.widgets.map((widget) =>
                widget.id === widgetId ? { ...widget, spacing } : widget
              ),
            };
          }),
        };
      })
    );
    setIsDirty(true);
  }, []);

  // Selection handlers
  const handleSelectSection = useCallback((sectionId: string) => {
    setSelection({ type: "section", sectionId });
  }, []);

  const handleSelectWidget = useCallback((sectionId: string, columnId: string, widgetId: string) => {
    setSelection({ type: "widget", sectionId, columnId, widgetId });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelection({ type: null });
  }, []);

  // Selection change handler - clears pendingWidgetColumn when selecting elements
  const handleSelectionChange = useCallback((newSelection: BuilderSelection) => {
    setSelection(newSelection);
    // Clear pending widget column when user selects a widget or section
    // This allows the panel to switch to edit mode
    if (newSelection.type === "widget" || newSelection.type === "section") {
      setPendingWidgetColumn(null);
    }
  }, []);

  // Delete section handler
  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setIsDirty(true);
    // Clear selection if the deleted section was selected
    setSelection((prev) =>
      prev.sectionId === sectionId ? { type: null } : prev
    );
  }, []);

  // Duplicate section handler
  const handleDuplicateSection = useCallback((sectionId: string) => {
    setSections((prev) => {
      const sectionIndex = prev.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) return prev;

      const section = prev[sectionIndex];
      const duplicated: Section = {
        ...section,
        id: `section_${Date.now()}`,
        columns: section.columns.map((col) => ({
          ...col,
          id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          widgets: col.widgets.map((w) => ({
            ...w,
            id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })),
        })),
      };

      const updated = [
        ...prev.slice(0, sectionIndex + 1),
        duplicated,
        ...prev.slice(sectionIndex + 1),
      ];
      return updated.map((s, i) => ({ ...s, order: i }));
    });
    setIsDirty(true);
  }, []);

  // Delete widget handler
  const handleDeleteWidget = useCallback((sectionId: string, columnId: string, widgetId: string) => {
    setSections((prev) =>
      prev.map((section) => {
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
      })
    );
    setIsDirty(true);
    // Clear selection if the deleted widget was selected
    setSelection((prev) =>
      prev.widgetId === widgetId ? { type: null } : prev
    );
  }, []);

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/page-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setIsDirty(false);
      toast.success("Page saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Landing Page Builder</span>
            <span className="text-sm text-muted-foreground">— Homepage</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center rounded-md border p-1">
            <Button
              variant={previewDevice === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setPreviewDevice("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setPreviewDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Widget Builder Panel */}
        <WidgetBuilderPanel
          sections={sections}
          selection={selection}
          onAddSection={handleAddSection}
          onAddWidget={handleAddWidget}
          onUpdateSection={handleUpdateSection}
          onUpdateSectionLayout={handleUpdateSectionLayout}
          onUpdateWidget={handleUpdateWidget}
          onUpdateWidgetSpacing={handleUpdateWidgetSpacing}
          onSelectSection={handleSelectSection}
          onSelectWidget={handleSelectWidget}
          onClearSelection={handleClearSelection}
          pendingWidgetColumn={pendingWidgetColumn}
          onClearPendingColumn={() => setPendingWidgetColumn(null)}
          className="w-[320px] shrink-0"
        />

        {/* Right Panel - Page Builder Canvas */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex-1 overflow-auto bg-muted/30 scrollbar-on-scroll",
            isScrolling && "is-scrolling"
          )}
        >
          <div className="p-4">
            {/* Device Frame */}
            <div className="text-center text-xs text-muted-foreground mb-2">
              {previewDevice === "desktop" ? "Desktop (1440px)" : "Mobile (375px)"}
            </div>
            <div
              className={cn(
                "mx-auto bg-background rounded-lg border overflow-hidden transition-all duration-300",
                previewDevice === "desktop" ? "max-w-full" : "max-w-[375px]"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <WidgetPageBuilder
                  sections={sections}
                  onChange={setSections}
                  selection={selection}
                  onSelectionChange={handleSelectionChange}
                  onRequestAddWidget={handleRequestAddWidget}
                  onDeleteSection={handleDeleteSection}
                  onDuplicateSection={handleDuplicateSection}
                  onDeleteWidget={handleDeleteWidget}
                  device={previewDevice}
                />
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Helper to get column count from layout
function getColumnCount(layout: SectionLayout): number {
  switch (layout) {
    case "1": return 1;
    case "1-1":
    case "1-2":
    case "2-1": return 2;
    case "1-1-1":
    case "1-2-1": return 3;
    case "1-1-1-1": return 4;
    default: return 1;
  }
}
