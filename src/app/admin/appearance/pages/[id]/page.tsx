"use client";

import { useState, useCallback, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  Smartphone,
  Monitor,
  LayoutGrid,
  ExternalLink,
  Settings2,
  LayoutTemplate,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  Section,
  SectionLayout,
  WidgetType,
  BuilderSelection,
} from "@/lib/page-builder/types";
import { createSection, createWidget, WidgetRegistry } from "@/lib/page-builder/widget-registry";

// Reuse existing components from landing-page builder
import { WidgetBuilderPanel } from "../../landing-page/components/widget-builder-panel";
import { WidgetPageBuilder } from "../../landing-page/components/widget-page-builder";

// Import widget registration
import "@/lib/page-builder/register-widgets";

interface PageData {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  templateType: string | null;
  isTemplateActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  sections: Section[];
}

interface TemplateInfo {
  type: string;
  label: string;
  description: string;
  isAssigned: boolean;
  assignedPage: { id: string; name: string } | null;
}

const TEMPLATE_LABELS: Record<string, string> = {
  HOME: "Homepage",
  SERVICE_DETAILS: "Service Details",
  SERVICES_LIST: "Services List",
  BLOG_POST: "Blog Post",
  BLOG_LIST: "Blog List",
  ABOUT: "About Page",
  CONTACT: "Contact Page",
  CHECKOUT: "Checkout",
  CUSTOM: "Custom Page",
};

export default function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [page, setPage] = useState<PageData | null>(null);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [themeWidgetDefaults, setThemeWidgetDefaults] = useState<Record<string, unknown>>({});
  const sectionsRef = useRef<Section[]>([]);
  // Keep ref in sync with state to avoid stale closures in save handler
  sectionsRef.current = sections;
  const [selection, setSelection] = useState<BuilderSelection>({ type: null });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Settings state
  const [pageName, setPageName] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>("");

  // Scroll detection for auto-hide scrollbar
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Warn user about unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Drag-and-drop state
  const [activeDragWidget, setActiveDragWidget] = useState<WidgetType | null>(null);

  // DnD sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
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

  // Load page data
  useEffect(() => {
    async function loadData() {
      try {
        const [pageRes, templatesRes, widgetDefaultsRes] = await Promise.all([
          fetch(`/api/admin/pages/${id}`),
          fetch("/api/admin/pages/templates"),
          fetch("/api/admin/themes/widget-defaults"),
        ]);

        if (!pageRes.ok) {
          toast.error("Page not found");
          router.push("/admin/appearance/pages");
          return;
        }

        const pageData = await pageRes.json();
        setPage(pageData);
        setSections(pageData.sections || []);
        setPageName(pageData.name);
        setPageSlug(pageData.slug);
        setMetaTitle(pageData.metaTitle || "");
        setMetaDescription(pageData.metaDescription || "");
        setSelectedTemplateType(pageData.templateType || "");

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData.templates || []);
        }

        if (widgetDefaultsRes.ok) {
          const defaults = await widgetDefaultsRes.json();
          setThemeWidgetDefaults(defaults.widgetDefaults || {});
        }
      } catch (error) {
        console.error("Failed to load page data:", error);
        toast.error("Failed to load page data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, router]);

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

  // Request to add widget
  const handleRequestAddWidget = useCallback((sectionId: string, columnId: string) => {
    setPendingWidgetColumn({ sectionId, columnId });
  }, []);

  // Add a widget to a column
  const handleAddWidget = useCallback((sectionId: string, columnId: string, widgetType: WidgetType) => {
    // Use theme's widget defaults if available, falling back to hardcoded defaults
    const themeDefaults = themeWidgetDefaults[widgetType] as Record<string, unknown> | undefined;
    const newWidget = createWidget(widgetType, themeDefaults);

    // Widgets that should have zero section padding by default
    const zeroPaddingWidgets: WidgetType[] = ["top-utility-bar"];
    const needsZeroPadding = zeroPaddingWidgets.includes(widgetType);

    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          // Auto-zero section padding for utility/nav widgets
          settings: needsZeroPadding
            ? { ...section.settings, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0 }
            : section.settings,
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
    setSelection({
      type: "widget",
      sectionId,
      columnId,
      widgetId: newWidget.id,
    });
  }, [themeWidgetDefaults]);

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

        const currentColumns = section.columns.length;
        const neededColumns = getColumnCount(layout);

        let columns = [...section.columns];
        if (neededColumns > currentColumns) {
          for (let i = currentColumns; i < neededColumns; i++) {
            columns.push({
              id: `col_${Date.now()}_${i}`,
              widgets: [],
              settings: { verticalAlign: "top", padding: 0 },
            });
          }
        } else if (neededColumns < currentColumns) {
          const extraWidgets = columns.slice(neededColumns).flatMap((c) => c.widgets);
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

  const handleSelectionChange = useCallback((newSelection: BuilderSelection) => {
    setSelection(newSelection);
    if (newSelection.type === "widget" || newSelection.type === "section") {
      setPendingWidgetColumn(null);
    }
  }, []);

  // Delete section handler
  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    setIsDirty(true);
    setSelection((prev) => (prev.sectionId === sectionId ? { type: null } : prev));
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
    setSelection((prev) => (prev.widgetId === widgetId ? { type: null } : prev));
  }, []);

  // Duplicate widget handler
  const handleDuplicateWidget = useCallback((sectionId: string, columnId: string, widgetId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          columns: section.columns.map((column) => {
            if (column.id !== columnId) return column;
            const widgetIndex = column.widgets.findIndex((w) => w.id === widgetId);
            if (widgetIndex === -1) return column;

            const widget = column.widgets[widgetIndex];
            const duplicated = {
              ...widget,
              id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              settings: JSON.parse(JSON.stringify(widget.settings)), // Deep clone settings
            };

            return {
              ...column,
              widgets: [
                ...column.widgets.slice(0, widgetIndex + 1),
                duplicated,
                ...column.widgets.slice(widgetIndex + 1),
              ],
            };
          }),
        };
      })
    );
    setIsDirty(true);
  }, []);

  // Drag-and-drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const widgetType = event.active.data.current?.widgetType as WidgetType;
    if (widgetType) {
      setActiveDragWidget(widgetType);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragWidget(null);

    if (!over) return;

    const widgetType = active.data.current?.widgetType as WidgetType;
    const dropData = over.data.current as { sectionId: string; columnId: string } | undefined;

    if (widgetType && dropData?.sectionId && dropData?.columnId) {
      handleAddWidget(dropData.sectionId, dropData.columnId, widgetType);
    }
  }, [handleAddWidget]);

  const handleDragCancel = useCallback(() => {
    setActiveDragWidget(null);
  }, []);

  // Save handler - uses sectionsRef to avoid stale closure issues
  const handleSave = async () => {
    setSaving(true);
    try {
      // Use ref to get the absolute latest sections value
      const currentSections = sectionsRef.current;

      // Debug: Log what we're saving
      const totalWidgets = currentSections.reduce(
        (sum, s) => sum + s.columns.reduce((cs, c) => cs + c.widgets.length, 0),
        0
      );
      console.log("[PageBuilder Save] Saving sections:", {
        sectionCount: currentSections.length,
        totalWidgets,
        widgetTypes: currentSections.flatMap((s) =>
          s.columns.flatMap((c) => c.widgets.map((w) => w.type))
        ),
      });

      // Save sections
      const sectionsPayload = JSON.stringify({ sections: currentSections });
      const sectionsRes = await fetch(`/api/admin/pages/${id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: sectionsPayload,
      });

      if (!sectionsRes.ok) {
        const errorText = await sectionsRes.text();
        console.error("[PageBuilder Save] Sections save failed:", errorText);
        throw new Error("Failed to save sections");
      }

      const sectionsResult = await sectionsRes.json();
      console.log("[PageBuilder Save] Sections saved:", sectionsResult);

      // Save page settings
      const settingsRes = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pageName,
          slug: pageSlug,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        }),
      });

      if (!settingsRes.ok) {
        throw new Error("Failed to save page settings");
      }

      // Save template assignment if changed
      if (page && selectedTemplateType !== (page.templateType || "")) {
        const templateRes = await fetch(`/api/admin/pages/${id}/template`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateType: selectedTemplateType || null,
          }),
        });

        if (!templateRes.ok) {
          throw new Error("Failed to save template assignment");
        }
      }

      setIsDirty(false);
      toast.success(`Page saved (${currentSections.length} sections, ${totalWidgets} widgets)`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/appearance/pages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{pageName}</span>
            {page?.isTemplateActive && page.templateType && (
              <Badge variant="secondary" className="ml-2">
                {TEMPLATE_LABELS[page.templateType]}
              </Badge>
            )}
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

          {/* Settings Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Page Settings</SheetTitle>
                <SheetDescription>
                  Configure page details and template assignment
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Basic Info</h4>
                  <div className="space-y-2">
                    <Label htmlFor="pageName">Page Name</Label>
                    <Input
                      id="pageName"
                      value={pageName}
                      onChange={(e) => {
                        setPageName(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pageSlug">Slug</Label>
                    <Input
                      id="pageSlug"
                      value={pageSlug}
                      onChange={(e) => {
                        setPageSlug(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                </div>

                {/* Template Assignment */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    <LayoutTemplate className="h-4 w-4" />
                    Template Assignment
                  </h4>
                  <div className="space-y-2">
                    <Label>Use as template for</Label>
                    <Select
                      value={selectedTemplateType}
                      onValueChange={(value) => {
                        setSelectedTemplateType(value);
                        setIsDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select page type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (Custom Page)</SelectItem>
                        {Object.entries(TEMPLATE_LABELS).map(([value, label]) => {
                          const template = templates.find((t) => t.type === value);
                          const isOtherAssigned =
                            template?.isAssigned && template.assignedPage?.id !== id;
                          return (
                            <SelectItem key={value} value={value}>
                              {label}
                              {isOtherAssigned && ` (Currently: ${template.assignedPage?.name})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedTemplateType && (
                      <p className="text-xs text-muted-foreground">
                        {templates.find((t) => t.type === selectedTemplateType)?.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">SEO</h4>
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => {
                        setMetaTitle(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Page title for search engines"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => {
                        setMetaDescription(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Page description for search engines"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {isDirty && (
            <span className="text-xs text-amber-500 font-medium">
              Unsaved changes
            </span>
          )}

          <Button variant="outline" size="sm" asChild>
            <a href={`/${pageSlug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            variant={isDirty ? "default" : "outline"}
            className={cn(isDirty && "animate-pulse")}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isDirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Main Content - Two Panel Layout with DnD */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
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
                <WidgetPageBuilder
                  sections={sections}
                  onChange={setSections}
                  selection={selection}
                  onSelectionChange={handleSelectionChange}
                  onRequestAddWidget={handleRequestAddWidget}
                  onDeleteSection={handleDeleteSection}
                  onDuplicateSection={handleDuplicateSection}
                  onDeleteWidget={handleDeleteWidget}
                  onDuplicateWidget={handleDuplicateWidget}
                  device={previewDevice}
                  isDraggingWidget={activeDragWidget !== null}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay - Shows widget preview while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeDragWidget && (
            <DragOverlayContent widgetType={activeDragWidget} />
          )}
        </DragOverlay>
      </DndContext>
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

// Get Lucide icon component by name
function getLucideIcon(name: string): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[name] || LucideIcons.Box;
}

// Drag Overlay Content - Shows widget preview while dragging
function DragOverlayContent({ widgetType }: { widgetType: WidgetType }) {
  const widgetDef = WidgetRegistry.get(widgetType);
  if (!widgetDef) return null;

  const WidgetIcon = getLucideIcon(widgetDef.icon);

  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-background px-4 py-3 shadow-xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <WidgetIcon className="h-5 w-5 text-primary" />
      </div>
      <span className="text-sm font-medium">{widgetDef.name}</span>
    </div>
  );
}
