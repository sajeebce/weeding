"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  Eye,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Loader2,
  ExternalLink,
  Columns3,
  Type,
  LinkIcon,
  Mail,
  Share2,
  Phone,
  Code,
  FileText,
  MapPin,
  Building2,
  Monitor,
  Smartphone,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FooterConfig, FooterWidget, FooterWidgetType, FooterLayout, BottomLink, TrustBadge, FooterWidgetLink } from "@/lib/header-footer/types";

const layoutOptions: { value: FooterLayout; label: string; description: string }[] = [
  { value: "MULTI_COLUMN", label: "Multi-Column", description: "Traditional multi-column layout" },
  { value: "CENTERED", label: "Centered", description: "Centered stacked layout" },
  { value: "MINIMAL", label: "Minimal", description: "Just copyright and links" },
  { value: "MEGA", label: "Mega", description: "Full sitemap style" },
];

const widgetTypes: { value: FooterWidgetType; label: string; icon: React.ReactNode }[] = [
  { value: "BRAND", label: "Brand", icon: <Building2 className="h-4 w-4" /> },
  { value: "LINKS", label: "Links", icon: <LinkIcon className="h-4 w-4" /> },
  { value: "CONTACT", label: "Contact", icon: <Phone className="h-4 w-4" /> },
  { value: "NEWSLETTER", label: "Newsletter", icon: <Mail className="h-4 w-4" /> },
  { value: "SOCIAL", label: "Social", icon: <Share2 className="h-4 w-4" /> },
  { value: "TEXT", label: "Text", icon: <Type className="h-4 w-4" /> },
  { value: "RECENT_POSTS", label: "Recent Posts", icon: <FileText className="h-4 w-4" /> },
  { value: "SERVICES", label: "Services (Auto)", icon: <Columns3 className="h-4 w-4" /> },
  { value: "STATES", label: "States (Auto)", icon: <MapPin className="h-4 w-4" /> },
  { value: "CUSTOM_HTML", label: "Custom HTML", icon: <Code className="h-4 w-4" /> },
];

interface WidgetLink {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
}

const defaultWidgetFormData = {
  type: "LINKS" as FooterWidgetType,
  title: "",
  showTitle: true,
  column: 1,
  content: {} as Record<string, unknown>,
  links: [] as WidgetLink[],
};

// Sortable Widget Component
function SortableWidget({
  widget,
  onEdit,
  onDelete,
}: {
  widget: FooterWidget;
  onEdit: (widget: FooterWidget) => void;
  onDelete: (widget: FooterWidget) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-3 transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {widgetTypes.find((t) => t.value === widget.type)?.icon}
          <span className="text-sm font-medium truncate">
            {widget.title || widgetTypes.find((t) => t.value === widget.type)?.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {widget.type}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onEdit(widget)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive"
        onClick={() => onDelete(widget)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  widgets,
  isOver,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
}: {
  column: number;
  widgets: FooterWidget[];
  isOver: boolean;
  onAddWidget: (column: number) => void;
  onEditWidget: (widget: FooterWidget) => void;
  onDeleteWidget: (widget: FooterWidget) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: `column-${column}`,
  });

  return (
    <div className="space-y-2">
      <Label>Column {column}</Label>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-50 space-y-2 rounded-lg border-2 border-dashed p-2 transition-colors",
          isOver && "border-primary bg-primary/5"
        )}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          {widgets.length === 0 ? (
            <button
              onClick={() => onAddWidget(column)}
              className="flex h-full min-h-45 w-full flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
            >
              <Plus className="mb-2 h-6 w-6" />
              <span className="text-sm">Add Widget</span>
            </button>
          ) : (
            <>
              {widgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onEdit={onEditWidget}
                  onDelete={onDeleteWidget}
                />
              ))}
              <button
                onClick={() => onAddWidget(column)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-sm text-muted-foreground hover:bg-muted/50"
              >
                <Plus className="h-4 w-4" />
                <span>Add Widget</span>
              </button>
            </>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function FooterBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footer, setFooter] = useState<FooterConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Widget dialog
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [deleteWidgetDialogOpen, setDeleteWidgetDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<FooterWidget | null>(null);
  const [widgetFormData, setWidgetFormData] = useState(defaultWidgetFormData);

  // Widget drag and drop with @dnd-kit
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<number | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "Default Footer",
    layout: "MULTI_COLUMN" as FooterLayout,
    columns: 4,
    newsletterEnabled: true,
    newsletterTitle: "Subscribe to our newsletter",
    newsletterSubtitle: "",
    newsletterProvider: "",
    newsletterFormAction: "",
    showSocialLinks: true,
    socialPosition: "brand",
    showContactInfo: true,
    contactPosition: "brand",
    bottomBarEnabled: true,
    copyrightText: "",
    showDisclaimer: true,
    disclaimerText: "",
    bottomLinks: [] as BottomLink[],
    showTrustBadges: false,
    trustBadges: [] as TrustBadge[],
    bgColor: "",
    textColor: "",
    accentColor: "",
    borderColor: "",
    paddingTop: 48,
    paddingBottom: 32,
  });

  useEffect(() => {
    fetchFooter();
  }, []);

  async function fetchFooter() {
    try {
      const res = await fetch("/api/admin/footer");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.footers && data.footers.length > 0) {
        const activeFooter = data.footers.find((f: FooterConfig) => f.isActive) || data.footers[0];
        setFooter(activeFooter);
        setFormData({
          name: activeFooter.name,
          layout: activeFooter.layout,
          columns: activeFooter.columns,
          newsletterEnabled: activeFooter.newsletterEnabled,
          newsletterTitle: activeFooter.newsletterTitle,
          newsletterSubtitle: activeFooter.newsletterSubtitle || "",
          newsletterProvider: activeFooter.newsletterProvider || "",
          newsletterFormAction: activeFooter.newsletterFormAction || "",
          showSocialLinks: activeFooter.showSocialLinks,
          socialPosition: activeFooter.socialPosition,
          showContactInfo: activeFooter.showContactInfo,
          contactPosition: activeFooter.contactPosition,
          bottomBarEnabled: activeFooter.bottomBarEnabled,
          copyrightText: activeFooter.copyrightText || "",
          showDisclaimer: activeFooter.showDisclaimer,
          disclaimerText: activeFooter.disclaimerText || "",
          bottomLinks: activeFooter.bottomLinks || [],
          showTrustBadges: activeFooter.showTrustBadges,
          trustBadges: activeFooter.trustBadges || [],
          bgColor: activeFooter.bgColor || "",
          textColor: activeFooter.textColor || "",
          accentColor: activeFooter.accentColor || "",
          borderColor: activeFooter.borderColor || "",
          paddingTop: activeFooter.paddingTop,
          paddingBottom: activeFooter.paddingBottom,
        });
      }
    } catch (error) {
      toast.error("Failed to load footer configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!footer) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: footer.id,
          ...formData,
          bgColor: formData.bgColor || null,
          textColor: formData.textColor || null,
          accentColor: formData.accentColor || null,
          borderColor: formData.borderColor || null,
          copyrightText: formData.copyrightText || null,
          newsletterSubtitle: formData.newsletterSubtitle || null,
          newsletterProvider: formData.newsletterProvider || null,
          newsletterFormAction: formData.newsletterFormAction || null,
          disclaimerText: formData.disclaimerText || null,
          trustBadges: formData.trustBadges.length > 0 ? formData.trustBadges : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Footer save error:", errorData);
        throw new Error(errorData?.error || "Failed to save");
      }

      toast.success("Footer configuration saved");
      fetchFooter();
    } catch (error) {
      console.error("Footer save failed:", error);
      toast.error("Failed to save footer configuration");
    } finally {
      setSaving(false);
    }
  }

  // Widget functions
  function openWidgetDialog(column: number) {
    setSelectedWidget(null);
    setWidgetFormData({ ...defaultWidgetFormData, column });
    setWidgetDialogOpen(true);
  }

  function openEditWidgetDialog(widget: FooterWidget) {
    setSelectedWidget(widget);
    // Convert menuItems to links format
    const links: WidgetLink[] = widget.menuItems?.map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url || "",
      target: item.target,
    })) || [];

    setWidgetFormData({
      type: widget.type,
      title: widget.title || "",
      showTitle: widget.showTitle,
      column: widget.column,
      content: widget.content || {},
      links,
    });
    setWidgetDialogOpen(true);
  }

  function openDeleteWidgetDialog(widget: FooterWidget) {
    setSelectedWidget(widget);
    setDeleteWidgetDialogOpen(true);
  }

  async function handleWidgetSave() {
    if (!footer) return;

    setSaving(true);
    try {
      const url = "/api/admin/footer/widgets";
      const method = selectedWidget ? "PUT" : "POST";

      // Convert links to menuItems format for LINKS widget type
      const menuItems = widgetFormData.type === "LINKS" && widgetFormData.links.length > 0
        ? widgetFormData.links.map((link, index) => ({
            id: link.id.startsWith("temp-") ? undefined : link.id,
            label: link.label,
            url: link.url,
            target: link.target,
            sortOrder: index,
            isVisible: true,
          }))
        : undefined;

      const payload = {
        ...(selectedWidget && { id: selectedWidget.id }),
        footerId: footer.id,
        type: widgetFormData.type,
        title: widgetFormData.title || null,
        showTitle: widgetFormData.showTitle,
        column: widgetFormData.column,
        content: widgetFormData.content,
        menuItems,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedWidget ? "Widget updated" : "Widget created");
      setWidgetDialogOpen(false);
      fetchFooter();
    } catch (error) {
      toast.error("Failed to save widget");
    } finally {
      setSaving(false);
    }
  }

  async function handleWidgetDelete() {
    if (!selectedWidget) return;

    try {
      const res = await fetch(`/api/admin/footer/widgets?id=${selectedWidget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Widget deleted");
      setDeleteWidgetDialogOpen(false);
      fetchFooter();
    } catch (error) {
      toast.error("Failed to delete widget");
    }
  }

  // Bottom links functions
  function addBottomLink() {
    setFormData({
      ...formData,
      bottomLinks: [...formData.bottomLinks, { label: "New Link", url: "/" }],
    });
  }

  function updateBottomLink(index: number, updates: Partial<BottomLink>) {
    const newLinks = [...formData.bottomLinks];
    newLinks[index] = { ...newLinks[index], ...updates };
    setFormData({ ...formData, bottomLinks: newLinks });
  }

  function removeBottomLink(index: number) {
    const newLinks = formData.bottomLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, bottomLinks: newLinks });
  }

  // Trust badges functions
  function addTrustBadge() {
    setFormData({
      ...formData,
      trustBadges: [...formData.trustBadges, { image: "", alt: "Trust Badge", url: "" }],
    });
  }

  function updateTrustBadge(index: number, updates: Partial<TrustBadge>) {
    const newBadges = [...formData.trustBadges];
    newBadges[index] = { ...newBadges[index], ...updates };
    setFormData({ ...formData, trustBadges: newBadges });
  }

  function removeTrustBadge(index: number) {
    const newBadges = formData.trustBadges.filter((_, i) => i !== index);
    setFormData({ ...formData, trustBadges: newBadges });
  }

  // Widget link functions
  function addWidgetLink() {
    const newLink: WidgetLink = {
      id: `temp-${Date.now()}`,
      label: "New Link",
      url: "/",
      target: "_self",
    };
    setWidgetFormData({
      ...widgetFormData,
      links: [...widgetFormData.links, newLink],
    });
  }

  function updateWidgetLink(index: number, updates: Partial<WidgetLink>) {
    const newLinks = [...widgetFormData.links];
    newLinks[index] = { ...newLinks[index], ...updates };
    setWidgetFormData({ ...widgetFormData, links: newLinks });
  }

  function removeWidgetLink(index: number) {
    const newLinks = widgetFormData.links.filter((_, i) => i !== index);
    setWidgetFormData({ ...widgetFormData, links: newLinks });
  }

  // @dnd-kit drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over && typeof over.id === "string" && over.id.startsWith("column-")) {
      const columnNum = parseInt(over.id.replace("column-", ""));
      setOverColumn(columnNum);
    } else {
      setOverColumn(null);
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over || !footer) return;

    const activeWidget = footer.widgets?.find((w) => w.id === active.id);
    if (!activeWidget) return;

    // Check if dropping on a column
    if (typeof over.id === "string" && over.id.startsWith("column-")) {
      const targetColumn = parseInt(over.id.replace("column-", ""));

      if (activeWidget.column !== targetColumn) {
        // Move to different column
        try {
          const res = await fetch("/api/admin/footer/widgets", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: activeWidget.id,
              footerId: footer.id,
              column: targetColumn,
              sortOrder: 0,
            }),
          });

          if (!res.ok) throw new Error("Failed to move widget");
          toast.success(`Widget moved to column ${targetColumn}`);
          fetchFooter();
        } catch {
          toast.error("Failed to move widget");
        }
      }
      return;
    }

    // Check if reordering within same column
    const overWidget = footer.widgets?.find((w) => w.id === over.id);
    if (!overWidget) return;

    if (activeWidget.column === overWidget.column && active.id !== over.id) {
      // Reorder within same column
      const columnWidgets = footer.widgets
        ?.filter((w) => w.column === activeWidget.column)
        .sort((a, b) => a.sortOrder - b.sortOrder) || [];

      const oldIndex = columnWidgets.findIndex((w) => w.id === active.id);
      const newIndex = columnWidgets.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnWidgets, oldIndex, newIndex);

        // Update sort orders via API
        try {
          await Promise.all(
            reordered.map((widget, index) =>
              fetch("/api/admin/footer/widgets", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: widget.id,
                  footerId: footer.id,
                  sortOrder: index,
                }),
              })
            )
          );
          toast.success("Widget order updated");
          fetchFooter();
        } catch {
          toast.error("Failed to reorder widgets");
        }
      }
    } else if (activeWidget.column !== overWidget.column) {
      // Move to different column (dropped on a widget)
      try {
        const res = await fetch("/api/admin/footer/widgets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: activeWidget.id,
            footerId: footer.id,
            column: overWidget.column,
            sortOrder: overWidget.sortOrder,
          }),
        });

        if (!res.ok) throw new Error("Failed to move widget");
        toast.success(`Widget moved to column ${overWidget.column}`);
        fetchFooter();
      } catch {
        toast.error("Failed to move widget");
      }
    }
  }, [footer]);

  // Get the active widget for drag overlay
  const activeWidget = activeId ? footer?.widgets?.find((w) => w.id === activeId) : null;

  // Group widgets by column
  function getWidgetsByColumn(column: number): FooterWidget[] {
    if (!footer?.widgets) return [];
    return footer.widgets.filter((w) => w.column === column);
  }

  // Get orphan widgets (widgets in columns beyond current column count)
  function getOrphanWidgets(): FooterWidget[] {
    if (!footer?.widgets) return [];
    return footer.widgets.filter((w) => w.column > formData.columns);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Footer Builder</h1>
          <p className="text-muted-foreground">
            Customize your website footer layout and widgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Live Preview</CardTitle>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <Button
                variant={previewMode === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "mx-auto overflow-hidden rounded-lg border transition-all",
              previewMode === "mobile" ? "max-w-[375px]" : "w-full"
            )}
            style={{
              backgroundColor: formData.bgColor || "#f9fafb",
              color: formData.textColor || undefined,
            }}
          >
            {/* Footer Preview Content */}
            <div
              className="px-4"
              style={{
                paddingTop: `${formData.paddingTop}px`,
                paddingBottom: `${formData.paddingBottom}px`,
              }}
            >
              {/* MULTI_COLUMN Layout */}
              {formData.layout === "MULTI_COLUMN" && (
                <div>
                  <div
                    className={cn(
                      "grid gap-4",
                      previewMode === "mobile" ? "grid-cols-2" : ""
                    )}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column} className="space-y-2">
                          {widgets.length === 0 ? (
                            <div className="rounded border border-dashed border-gray-300 p-3 text-center">
                              <span className="text-xs text-muted-foreground">Column {column}</span>
                            </div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id} className="space-y-1">
                                {widget.showTitle && widget.title && (
                                  <h4 className="text-xs font-semibold">{widget.title}</h4>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {widget.type === "BRAND" && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">LP</div>
                                      <span className="font-semibold text-foreground">LLCPad</span>
                                    </div>
                                  )}
                                  {widget.type === "LINKS" && (
                                    <ul className="space-y-0.5">
                                      {widget.menuItems && widget.menuItems.length > 0 ? (
                                        widget.menuItems.slice(0, 4).map((item, idx) => (
                                          <li key={idx} className="hover:text-foreground cursor-pointer">{item.label}</li>
                                        ))
                                      ) : (
                                        <>
                                          <li className="hover:text-foreground cursor-pointer">Link 1</li>
                                          <li className="hover:text-foreground cursor-pointer">Link 2</li>
                                          <li className="hover:text-foreground cursor-pointer">Link 3</li>
                                        </>
                                      )}
                                    </ul>
                                  )}
                                  {widget.type === "CONTACT" && (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> email@example.com</div>
                                      <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> +1 234 567 890</div>
                                    </div>
                                  )}
                                  {widget.type === "SOCIAL" && (
                                    <div className="flex gap-2">
                                      <div className="h-5 w-5 rounded bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                                      <div className="h-5 w-5 rounded bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                                      <div className="h-5 w-5 rounded bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                                    </div>
                                  )}
                                  {widget.type === "TEXT" && <p>Custom text content...</p>}
                                  {widget.type === "NEWSLETTER" && (
                                    <div className="flex gap-1">
                                      <div className="flex-1 h-6 rounded border bg-background"></div>
                                      <div className="h-6 px-2 rounded bg-primary text-[10px] text-primary-foreground flex items-center">Subscribe</div>
                                    </div>
                                  )}
                                  {widget.type === "SERVICES" && <span className="italic">Auto: Services</span>}
                                  {widget.type === "STATES" && <span className="italic">Auto: States</span>}
                                  {widget.type === "RECENT_POSTS" && <span className="italic">Recent Posts</span>}
                                  {widget.type === "CUSTOM_HTML" && <span className="italic">Custom HTML</span>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CENTERED Layout */}
              {formData.layout === "CENTERED" && (
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">LP</div>
                    <span className="mt-2 font-semibold">LLCPad</span>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">Your trusted partner for LLC formation and business services.</p>
                    {formData.showSocialLinks && (
                      <div className="mt-3 flex gap-2">
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                      </div>
                    )}
                  </div>
                  {/* Link sections */}
                  <div className="mt-6 flex flex-wrap justify-center gap-6">
                    {getWidgetsByColumn(1).concat(getWidgetsByColumn(2)).concat(getWidgetsByColumn(3)).filter(w => w.type === "LINKS").slice(0, 3).map((widget) => (
                      <div key={widget.id}>
                        {widget.showTitle && widget.title && (
                          <h4 className="text-xs font-semibold">{widget.title}</h4>
                        )}
                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {widget.menuItems && widget.menuItems.length > 0 ? (
                            widget.menuItems.slice(0, 3).map((item, idx) => (
                              <li key={idx}>{item.label}</li>
                            ))
                          ) : (
                            <>
                              <li>Link 1</li>
                              <li>Link 2</li>
                            </>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MINIMAL Layout */}
              {formData.layout === "MINIMAL" && (
                <div className={cn(
                  "flex items-center justify-between gap-4",
                  previewMode === "mobile" ? "flex-col text-center" : ""
                )}>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">LP</div>
                    <span className="text-sm font-semibold">LLCPad</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                    {formData.bottomLinks.length > 0 ? (
                      formData.bottomLinks.slice(0, 4).map((link, idx) => (
                        <span key={idx} className="hover:text-foreground cursor-pointer">{link.label}</span>
                      ))
                    ) : (
                      <>
                        <span className="hover:text-foreground cursor-pointer">Privacy</span>
                        <span className="hover:text-foreground cursor-pointer">Terms</span>
                        <span className="hover:text-foreground cursor-pointer">Contact</span>
                      </>
                    )}
                  </div>
                  {formData.showSocialLinks && (
                    <div className="flex gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              {/* MEGA Layout */}
              {formData.layout === "MEGA" && (
                <div>
                  {/* Top section */}
                  <div className={cn(
                    "flex items-center justify-between gap-4 border-b pb-4",
                    previewMode === "mobile" ? "flex-col" : ""
                  )}>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">LP</div>
                      <div>
                        <span className="font-semibold">LLCPad</span>
                        <p className="text-xs text-muted-foreground">Your trusted partner</p>
                      </div>
                    </div>
                    {formData.showSocialLinks && (
                      <div className="flex gap-2">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center"><Share2 className="h-3 w-3" /></div>
                      </div>
                    )}
                  </div>
                  {/* Mega grid */}
                  <div className={cn(
                    "mt-4 grid gap-4",
                    previewMode === "mobile" ? "grid-cols-2" : "grid-cols-6"
                  )}>
                    {Array.from({ length: Math.min(formData.columns, 6) }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column}>
                          {widgets.length === 0 ? (
                            <div className="text-xs text-muted-foreground">Col {column}</div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id}>
                                {widget.showTitle && widget.title && (
                                  <h4 className="text-xs font-semibold uppercase tracking-wider">{widget.title}</h4>
                                )}
                                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                                  {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                    <li key={idx}>{item.label}</li>
                                  )) || (
                                    <>
                                      <li>Item 1</li>
                                      <li>Item 2</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Bar (all layouts) */}
              {formData.bottomBarEnabled && (
                <div className={cn(
                  "mt-4 border-t pt-4",
                  formData.layout === "CENTERED" ? "text-center" : ""
                )}
                  style={{ borderColor: formData.borderColor || undefined }}
                >
                  <div className={cn(
                    "flex items-center justify-between gap-2 text-xs text-muted-foreground",
                    formData.layout === "CENTERED" || previewMode === "mobile" ? "flex-col" : ""
                  )}>
                    <p>{formData.copyrightText || `© ${new Date().getFullYear()} LLCPad. All rights reserved.`}</p>
                    {formData.showDisclaimer && (
                      <p className="max-w-md text-[10px]">
                        <strong>Disclaimer:</strong> {formData.disclaimerText || "LLCPad is not a law firm..."}
                      </p>
                    )}
                  </div>
                  {formData.bottomLinks.length > 0 && (
                    <div className={cn(
                      "mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground",
                      formData.layout === "CENTERED" ? "justify-center" : ""
                    )}>
                      {formData.bottomLinks.map((link, idx) => (
                        <span key={idx} className="hover:text-foreground cursor-pointer">{link.label}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="layout">Layout & Widgets</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="bottombar">Bottom Bar</TabsTrigger>
          <TabsTrigger value="style">Styling</TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Layout</CardTitle>
              <CardDescription>Choose the overall layout structure for your footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Layout Options */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {layoutOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, layout: option.value })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:border-primary/50",
                      formData.layout === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    )}
                  >
                    <div className="flex h-12 w-full items-center justify-center rounded bg-muted">
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{option.description}</span>
                  </button>
                ))}
              </div>

              <Separator />

              {/* Columns */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Number of Columns</Label>
                  <span className="text-sm text-muted-foreground">{formData.columns} columns</span>
                </div>
                <Slider
                  value={[formData.columns]}
                  onValueChange={(value) => setFormData({ ...formData, columns: value[0] })}
                  min={2}
                  max={6}
                  step={1}
                />
              </div>

              <Separator />

              {/* Feature Toggles */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Show Social Links</Label>
                    <p className="text-sm text-muted-foreground">
                      Display social media icons
                    </p>
                  </div>
                  <Switch
                    checked={formData.showSocialLinks}
                    onCheckedChange={(checked) => setFormData({ ...formData, showSocialLinks: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Show Contact Info</Label>
                    <p className="text-sm text-muted-foreground">
                      Display contact information
                    </p>
                  </div>
                  <Switch
                    checked={formData.showContactInfo}
                    onCheckedChange={(checked) => setFormData({ ...formData, showContactInfo: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Show Trust Badges</Label>
                    <p className="text-sm text-muted-foreground">
                      Display trust/security badges
                    </p>
                  </div>
                  <Switch
                    checked={formData.showTrustBadges}
                    onCheckedChange={(checked) => setFormData({ ...formData, showTrustBadges: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Show Disclaimer</Label>
                    <p className="text-sm text-muted-foreground">
                      Display legal disclaimer
                    </p>
                  </div>
                  <Switch
                    checked={formData.showDisclaimer}
                    onCheckedChange={(checked) => setFormData({ ...formData, showDisclaimer: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget Areas - Same page as layout */}
          <Card>
            <CardHeader>
              <CardTitle>Widget Areas</CardTitle>
              <CardDescription>
                Manage footer widgets in each column. Click + to add widgets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning for orphan widgets */}
              {getOrphanWidgets().length > 0 && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ {getOrphanWidgets().length} widget(s) are in columns beyond the current {formData.columns}-column layout.
                  </p>
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    These widgets won&apos;t be visible. Increase columns or reassign them.
                  </p>
                </div>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${formData.columns}, 1fr)` }}>
                  {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => (
                    <DroppableColumn
                      key={column}
                      column={column}
                      widgets={getWidgetsByColumn(column)}
                      isOver={overColumn === column}
                      onAddWidget={openWidgetDialog}
                      onEditWidget={openEditWidgetDialog}
                      onDeleteWidget={openDeleteWidgetDialog}
                    />
                  ))}
                </div>
                <DragOverlay>
                  {activeWidget ? (
                    <div className="flex items-center gap-2 rounded-lg border bg-card p-3 shadow-lg ring-2 ring-primary">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {widgetTypes.find((t) => t.value === activeWidget.type)?.icon}
                          <span className="text-sm font-medium truncate">
                            {activeWidget.title || widgetTypes.find((t) => t.value === activeWidget.type)?.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {activeWidget.type}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Settings</CardTitle>
              <CardDescription>Configure newsletter subscription form</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Enable Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Show email subscription form in footer
                  </p>
                </div>
                <Switch
                  checked={formData.newsletterEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, newsletterEnabled: checked })}
                />
              </div>

              {formData.newsletterEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsletterTitle">Title</Label>
                    <Input
                      id="newsletterTitle"
                      value={formData.newsletterTitle}
                      onChange={(e) => setFormData({ ...formData, newsletterTitle: e.target.value })}
                      placeholder="Subscribe to our newsletter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newsletterSubtitle">Subtitle</Label>
                    <Input
                      id="newsletterSubtitle"
                      value={formData.newsletterSubtitle}
                      onChange={(e) => setFormData({ ...formData, newsletterSubtitle: e.target.value })}
                      placeholder="Get updates on new services and offers"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottom Bar Tab */}
        <TabsContent value="bottombar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bottom Bar Settings</CardTitle>
              <CardDescription>Configure copyright and bottom links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Enable Bottom Bar</Label>
                  <p className="text-sm text-muted-foreground">
                    Show copyright and links section
                  </p>
                </div>
                <Switch
                  checked={formData.bottomBarEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, bottomBarEnabled: checked })}
                />
              </div>

              {formData.bottomBarEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="copyrightText">Copyright Text</Label>
                    <Input
                      id="copyrightText"
                      value={formData.copyrightText}
                      onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                      placeholder="© 2025 Your Company. All rights reserved."
                    />
                  </div>

                  {formData.showDisclaimer && (
                    <div className="space-y-2">
                      <Label htmlFor="disclaimerText">Disclaimer Text</Label>
                      <Textarea
                        id="disclaimerText"
                        value={formData.disclaimerText}
                        onChange={(e) => setFormData({ ...formData, disclaimerText: e.target.value })}
                        placeholder="Legal disclaimer text..."
                        rows={3}
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Bottom Links */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Bottom Links</Label>
                      <Button variant="outline" size="sm" onClick={addBottomLink}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Link
                      </Button>
                    </div>
                    {formData.bottomLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No bottom links configured</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.bottomLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={link.label}
                              onChange={(e) => updateBottomLink(index, { label: e.target.value })}
                              placeholder="Link label"
                              className="flex-1"
                            />
                            <Input
                              value={link.url}
                              onChange={(e) => updateBottomLink(index, { url: e.target.value })}
                              placeholder="URL"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => removeBottomLink(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trust Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Trust Badges
              </CardTitle>
              <CardDescription>Add security and trust badges to your footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Show Trust Badges</Label>
                  <p className="text-sm text-muted-foreground">
                    Display trust/security badges in footer
                  </p>
                </div>
                <Switch
                  checked={formData.showTrustBadges}
                  onCheckedChange={(checked) => setFormData({ ...formData, showTrustBadges: checked })}
                />
              </div>

              {formData.showTrustBadges && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Trust Badges</Label>
                    <Button variant="outline" size="sm" onClick={addTrustBadge}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add Badge
                    </Button>
                  </div>
                  {formData.trustBadges.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed p-8 text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No trust badges configured</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={addTrustBadge}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Your First Badge
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.trustBadges.map((badge, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
                            {badge.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={badge.image}
                                alt={badge.alt}
                                className="h-10 w-10 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <Shield className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              value={badge.image}
                              onChange={(e) => updateTrustBadge(index, { image: e.target.value })}
                              placeholder="Image URL (e.g., /images/badges/ssl.png)"
                            />
                            <div className="flex gap-2">
                              <Input
                                value={badge.alt}
                                onChange={(e) => updateTrustBadge(index, { alt: e.target.value })}
                                placeholder="Alt text"
                                className="flex-1"
                              />
                              <Input
                                value={badge.url || ""}
                                onChange={(e) => updateTrustBadge(index, { url: e.target.value })}
                                placeholder="Link URL (optional)"
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-destructive"
                            onClick={() => removeTrustBadge(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> Common trust badges include SSL certificates, payment provider logos (Stripe, PayPal),
                      BBB accreditation, or security seals. Use image URLs from your public assets.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Styling Tab */}
        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Styling</CardTitle>
              <CardDescription>Customize colors and spacing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={formData.bgColor || "#f9fafb"}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      placeholder="#f9fafb"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={formData.textColor || "#6b7280"}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#6b7280"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor || "#2563eb"}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={formData.borderColor || "#e5e7eb"}
                      onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.borderColor}
                      onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                      placeholder="#e5e7eb"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Spacing */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Padding Top</Label>
                    <span className="text-sm text-muted-foreground">{formData.paddingTop}px</span>
                  </div>
                  <Slider
                    value={[formData.paddingTop]}
                    onValueChange={(value) => setFormData({ ...formData, paddingTop: value[0] })}
                    min={16}
                    max={96}
                    step={8}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Padding Bottom</Label>
                    <span className="text-sm text-muted-foreground">{formData.paddingBottom}px</span>
                  </div>
                  <Slider
                    value={[formData.paddingBottom]}
                    onValueChange={(value) => setFormData({ ...formData, paddingBottom: value[0] })}
                    min={16}
                    max={96}
                    step={8}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Leave colors empty to use the default theme colors.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Widget Dialog */}
      <Dialog open={widgetDialogOpen} onOpenChange={setWidgetDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedWidget ? "Edit Widget" : "Add Widget"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Widget Type</Label>
              <Select
                value={widgetFormData.type}
                onValueChange={(value: FooterWidgetType) =>
                  setWidgetFormData({ ...widgetFormData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {widgetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widgetTitle">Title</Label>
              <Input
                id="widgetTitle"
                value={widgetFormData.title}
                onChange={(e) => setWidgetFormData({ ...widgetFormData, title: e.target.value })}
                placeholder="Widget title"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Show Title</Label>
                <p className="text-xs text-muted-foreground">Display the title above widget</p>
              </div>
              <Switch
                checked={widgetFormData.showTitle}
                onCheckedChange={(checked) => setWidgetFormData({ ...widgetFormData, showTitle: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Column</Label>
              <Select
                value={String(widgetFormData.column)}
                onValueChange={(value) =>
                  setWidgetFormData({ ...widgetFormData, column: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: formData.columns }, (_, i) => i + 1).map((col) => (
                    <SelectItem key={col} value={String(col)}>
                      Column {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Links Editor for LINKS widget type */}
            {widgetFormData.type === "LINKS" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Links</Label>
                  <Button variant="outline" size="sm" onClick={addWidgetLink}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Link
                  </Button>
                </div>
                {widgetFormData.links.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">No links added yet</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={addWidgetLink}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add Your First Link
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-50 space-y-2 overflow-y-auto">
                    {widgetFormData.links.map((link, index) => (
                      <div key={link.id} className="flex items-center gap-2 rounded-lg border p-2">
                        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                          value={link.label}
                          onChange={(e) => updateWidgetLink(index, { label: e.target.value })}
                          placeholder="Label"
                          className="flex-1"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => updateWidgetLink(index, { url: e.target.value })}
                          placeholder="URL"
                          className="flex-1"
                        />
                        <Select
                          value={link.target}
                          onValueChange={(value: "_self" | "_blank") => updateWidgetLink(index, { target: value })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_self">Same tab</SelectItem>
                            <SelectItem value="_blank">New tab</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive"
                          onClick={() => removeWidgetLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TEXT widget content */}
            {widgetFormData.type === "TEXT" && (
              <div className="space-y-2">
                <Label htmlFor="textContent">Text Content</Label>
                <Textarea
                  id="textContent"
                  value={(widgetFormData.content as { text?: string })?.text || ""}
                  onChange={(e) => setWidgetFormData({
                    ...widgetFormData,
                    content: { ...widgetFormData.content, text: e.target.value },
                  })}
                  placeholder="Enter your text content..."
                  rows={4}
                />
              </div>
            )}

            {/* CUSTOM_HTML widget content */}
            {widgetFormData.type === "CUSTOM_HTML" && (
              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Content</Label>
                <Textarea
                  id="htmlContent"
                  value={(widgetFormData.content as { html?: string })?.html || ""}
                  onChange={(e) => setWidgetFormData({
                    ...widgetFormData,
                    content: { ...widgetFormData.content, html: e.target.value },
                  })}
                  placeholder="<div>Your HTML here...</div>"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Be careful with custom HTML. Ensure it&apos;s valid and doesn&apos;t break the page layout.
                </p>
              </div>
            )}

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                {widgetFormData.type === "LINKS" && "Add links above. They will be displayed as a list in the footer."}
                {widgetFormData.type === "BRAND" && "Shows logo, description, and contact info from settings."}
                {widgetFormData.type === "SERVICES" && "Auto-populated from your active services."}
                {widgetFormData.type === "STATES" && "Auto-populated list of popular LLC states."}
                {widgetFormData.type === "NEWSLETTER" && "Email subscription form."}
                {widgetFormData.type === "SOCIAL" && "Social media links from settings."}
                {widgetFormData.type === "CONTACT" && "Contact information from settings."}
                {widgetFormData.type === "TEXT" && "Enter your custom text above."}
                {widgetFormData.type === "RECENT_POSTS" && "Latest blog posts."}
                {widgetFormData.type === "CUSTOM_HTML" && "Enter raw HTML above. Use with caution."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWidgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWidgetSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {selectedWidget ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Widget Confirmation */}
      <AlertDialog open={deleteWidgetDialogOpen} onOpenChange={setDeleteWidgetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this widget and all its content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWidgetDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
