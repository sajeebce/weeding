"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Sparkles,
  Palette,
  CircleDot,
  SquareStack,
  Maximize2,
  Wand2,
  Download,
  Upload,
  RefreshCw,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
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
import { useBusinessConfig } from "@/hooks/use-business-config";
import type { FooterConfig, FooterWidget, FooterWidgetType, FooterLayout, BottomLink, TrustBadge, FooterWidgetLink } from "@/lib/header-footer/types";
import { PresetGallery } from "./components/PresetGallery";

const layoutOptions: { value: FooterLayout; label: string; description: string }[] = [
  { value: "MULTI_COLUMN", label: "Multi-Column", description: "Traditional multi-column layout" },
  { value: "CENTERED", label: "Centered", description: "Centered stacked layout" },
  { value: "MINIMAL", label: "Minimal", description: "Just copyright and links" },
  { value: "MEGA", label: "Mega", description: "Full sitemap style" },
  // New layouts (Phase 2)
  { value: "STACKED", label: "Stacked", description: "Full-width vertical sections" },
  { value: "ASYMMETRIC", label: "Asymmetric", description: "2:1 ratio split layout" },
  { value: "MEGA_PLUS", label: "Mega Plus", description: "Mega with featured CTA" },
  { value: "APP_FOCUSED", label: "App Focused", description: "Prominent app download" },
  { value: "NEWSLETTER_HERO", label: "Newsletter Hero", description: "Large newsletter signup" },
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
  const { config: businessConfig } = useBusinessConfig();
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

  // Logo preview component for live preview
  const LogoPreview = ({ size = "md", logoMode = "auto" }: { size?: "xs" | "sm" | "md" | "lg" | "xl"; logoMode?: "auto" | "light" | "dark" }) => {
    const sizeClasses = {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-7 w-7 text-[10px]",
      md: "h-8 w-8 text-xs",
      lg: "h-10 w-10 text-sm",
      xl: "h-12 w-12 text-base",
    };
    const imgSizes = {
      xs: 24,
      sm: 28,
      md: 32,
      lg: 40,
      xl: 48,
    };

    // Determine which logo to use based on logoMode
    const getLogoUrl = () => {
      if (logoMode === "light") {
        return businessConfig.logo.url;
      }
      if (logoMode === "dark") {
        return businessConfig.logo.darkUrl || businessConfig.logo.url;
      }
      // Auto: use dark logo if available (since footer is typically dark)
      return businessConfig.logo.darkUrl || businessConfig.logo.url;
    };

    const logoUrl = getLogoUrl();

    if (logoUrl) {
      return (
        <Image
          src={logoUrl}
          alt={businessConfig.name}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className={cn(sizeClasses[size], "rounded-lg object-contain")}
        />
      );
    }

    return (
      <div className={cn(
        sizeClasses[size],
        "rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary"
      )}>
        {businessConfig.logo.text || businessConfig.name.charAt(0)}
      </div>
    );
  };

  // Form state
  const [formData, setFormData] = useState({
    id: "",
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
    bottomBarLayout: "split",
    copyrightText: "",
    showDisclaimer: true,
    disclaimerText: "",
    bottomLinks: [] as BottomLink[],
    showTrustBadges: false,
    trustBadges: [] as TrustBadge[],
    // Background styling
    bgType: "solid",
    bgColor: "",
    bgGradient: null as { type: string; colors: { color: string; position: number }[]; angle?: number } | null,
    bgPattern: "",
    bgPatternColor: "",
    bgPatternOpacity: 10,
    bgImage: "",
    bgImageOverlay: "rgba(0,0,0,0.5)",
    // Text colors
    textColor: "",
    headingColor: "",
    linkColor: "",
    linkHoverColor: "",
    accentColor: "",
    borderColor: "",
    // Typography
    headingSize: "sm",
    headingWeight: "semibold",
    headingStyle: "normal",
    // Social icon styling
    socialShape: "circle",
    socialSize: "md",
    socialColorMode: "brand",
    socialHoverEffect: "scale",
    socialBgStyle: "subtle",
    // Divider
    dividerStyle: "solid",
    dividerColor: "",
    // Effects & Animation
    enableAnimations: false,
    entranceAnimation: "",
    animationDuration: 300,
    linkHoverEffect: "color",
    topBorderStyle: "none",
    topBorderHeight: 1,
    topBorderColor: "",
    // Shadow & Border radius
    shadow: "none",
    borderRadius: 0,
    // Container
    containerWidth: "full",
    containerStyle: "sharp",
    cornerRadiusTL: 0,
    cornerRadiusTR: 0,
    cornerRadiusBL: 0,
    cornerRadiusBR: 0,
    // Spacing
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
          id: activeFooter.id,
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
          bottomBarLayout: activeFooter.bottomBarLayout || "split",
          copyrightText: activeFooter.copyrightText || "",
          showDisclaimer: activeFooter.showDisclaimer,
          disclaimerText: activeFooter.disclaimerText || "",
          bottomLinks: activeFooter.bottomLinks || [],
          showTrustBadges: activeFooter.showTrustBadges,
          trustBadges: activeFooter.trustBadges || [],
          // Background styling
          bgType: activeFooter.bgType || "solid",
          bgColor: activeFooter.bgColor || "",
          bgGradient: activeFooter.bgGradient || null,
          bgPattern: activeFooter.bgPattern || "",
          bgPatternColor: activeFooter.bgPatternColor || "",
          bgPatternOpacity: activeFooter.bgPatternOpacity || 10,
          bgImage: activeFooter.bgImage || "",
          bgImageOverlay: activeFooter.bgImageOverlay || "rgba(0,0,0,0.5)",
          // Text colors
          textColor: activeFooter.textColor || "",
          headingColor: activeFooter.headingColor || "",
          linkColor: activeFooter.linkColor || "",
          linkHoverColor: activeFooter.linkHoverColor || "",
          accentColor: activeFooter.accentColor || "",
          borderColor: activeFooter.borderColor || "",
          // Typography
          headingSize: activeFooter.headingSize || "sm",
          headingWeight: activeFooter.headingWeight || "semibold",
          headingStyle: activeFooter.headingStyle || "normal",
          // Social icon styling
          socialShape: activeFooter.socialShape || "circle",
          socialSize: activeFooter.socialSize || "md",
          socialColorMode: activeFooter.socialColorMode || "brand",
          socialHoverEffect: activeFooter.socialHoverEffect || "scale",
          socialBgStyle: activeFooter.socialBgStyle || "subtle",
          // Divider
          dividerStyle: activeFooter.dividerStyle || "solid",
          dividerColor: activeFooter.dividerColor || "",
          // Effects & Animation
          enableAnimations: activeFooter.enableAnimations || false,
          entranceAnimation: activeFooter.entranceAnimation || "",
          animationDuration: activeFooter.animationDuration || 300,
          linkHoverEffect: activeFooter.linkHoverEffect || "color",
          topBorderStyle: activeFooter.topBorderStyle || "none",
          topBorderHeight: activeFooter.topBorderHeight || 1,
          topBorderColor: activeFooter.topBorderColor || "",
          // Shadow & Border radius
          shadow: activeFooter.shadow || "none",
          borderRadius: activeFooter.borderRadius || 0,
          // Container
          containerWidth: activeFooter.containerWidth || "full",
          containerStyle: activeFooter.containerStyle || "sharp",
          cornerRadiusTL: activeFooter.cornerRadiusTL || 0,
          cornerRadiusTR: activeFooter.cornerRadiusTR || 0,
          cornerRadiusBL: activeFooter.cornerRadiusBL || 0,
          cornerRadiusBR: activeFooter.cornerRadiusBR || 0,
          // Spacing
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
          name: formData.name,
          layout: formData.layout,
          columns: formData.columns,
          // Newsletter
          newsletterEnabled: formData.newsletterEnabled,
          newsletterTitle: formData.newsletterTitle,
          newsletterSubtitle: formData.newsletterSubtitle || null,
          newsletterProvider: formData.newsletterProvider || null,
          newsletterFormAction: formData.newsletterFormAction || null,
          // Social & Contact
          showSocialLinks: formData.showSocialLinks,
          socialPosition: formData.socialPosition,
          showContactInfo: formData.showContactInfo,
          contactPosition: formData.contactPosition,
          // Bottom Bar
          bottomBarEnabled: formData.bottomBarEnabled,
          bottomBarLayout: formData.bottomBarLayout,
          copyrightText: formData.copyrightText || null,
          showDisclaimer: formData.showDisclaimer,
          disclaimerText: formData.disclaimerText || null,
          bottomLinks: formData.bottomLinks,
          // Trust Badges
          showTrustBadges: formData.showTrustBadges,
          trustBadges: formData.trustBadges.length > 0 ? formData.trustBadges : null,
          // Background styling
          bgType: formData.bgType,
          bgColor: formData.bgColor || null,
          bgGradient: formData.bgGradient,
          bgPattern: formData.bgPattern || null,
          bgPatternColor: formData.bgPatternColor || null,
          bgPatternOpacity: formData.bgPatternOpacity,
          bgImage: formData.bgImage || null,
          bgImageOverlay: formData.bgImageOverlay || null,
          // Text colors
          textColor: formData.textColor || null,
          headingColor: formData.headingColor || null,
          linkColor: formData.linkColor || null,
          linkHoverColor: formData.linkHoverColor || null,
          accentColor: formData.accentColor || null,
          borderColor: formData.borderColor || null,
          // Typography
          headingSize: formData.headingSize,
          headingWeight: formData.headingWeight,
          headingStyle: formData.headingStyle,
          // Social icon styling
          socialShape: formData.socialShape,
          socialSize: formData.socialSize,
          socialColorMode: formData.socialColorMode,
          socialHoverEffect: formData.socialHoverEffect,
          socialBgStyle: formData.socialBgStyle,
          // Divider
          dividerStyle: formData.dividerStyle,
          dividerColor: formData.dividerColor || null,
          // Effects & Animation
          enableAnimations: formData.enableAnimations,
          entranceAnimation: formData.entranceAnimation || null,
          animationDuration: formData.animationDuration,
          linkHoverEffect: formData.linkHoverEffect,
          topBorderStyle: formData.topBorderStyle,
          topBorderHeight: formData.topBorderHeight,
          topBorderColor: formData.topBorderColor || null,
          // Shadow & Border radius
          shadow: formData.shadow,
          borderRadius: formData.borderRadius,
          // Container
          containerWidth: formData.containerWidth,
          containerStyle: formData.containerStyle,
          cornerRadiusTL: formData.cornerRadiusTL,
          cornerRadiusTR: formData.cornerRadiusTR,
          cornerRadiusBL: formData.cornerRadiusBL,
          cornerRadiusBR: formData.cornerRadiusBR,
          // Spacing
          paddingTop: formData.paddingTop,
          paddingBottom: formData.paddingBottom,
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

  // Social media icons preview component
  const SocialIconsPreview = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "h-5 w-5 text-[8px]",
      md: "h-6 w-6 text-[10px]",
      lg: "h-8 w-8 text-xs",
    };
    const socialPlatforms = [
      { name: "f", color: "#1877F2" }, // Facebook
      { name: "𝕏", color: "#000000" }, // X/Twitter
      { name: "in", color: "#0A66C2" }, // LinkedIn
      { name: "ig", color: "#E4405F" }, // Instagram
    ];
    return (
      <div className="flex gap-1.5">
        {socialPlatforms.map((platform, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full flex items-center justify-center font-bold text-white",
              sizeClasses[size]
            )}
            style={{ backgroundColor: platform.color }}
          >
            {platform.name}
          </div>
        ))}
      </div>
    );
  };

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

      {/* Live Preview - Sticky */}
      <Card className="sticky top-4 z-10 shadow-lg">
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
              "mx-auto overflow-hidden rounded-lg border transition-all footer-preview relative",
              previewMode === "mobile" ? "max-w-[375px]" : "w-full"
            )}
            style={{
              // Dynamic background based on bgType
              ...(formData.bgType === "solid" && { backgroundColor: formData.bgColor || "#f9fafb" }),
              ...(formData.bgType === "gradient" && formData.bgGradient?.colors && {
                background: `linear-gradient(${formData.bgGradient.angle || 135}deg, ${formData.bgGradient.colors[0]?.color || "#4338ca"} ${formData.bgGradient.colors[0]?.position || 0}%, ${formData.bgGradient.colors[1]?.color || "#6366f1"} ${formData.bgGradient.colors[1]?.position || 100}%)`,
              }),
              ...(formData.bgType === "pattern" && { backgroundColor: formData.bgColor || "#0f172a" }),
              ...(formData.bgType === "image" && formData.bgImage && {
                backgroundImage: `linear-gradient(${formData.bgImageOverlay || "rgba(0,0,0,0.5)"}, ${formData.bgImageOverlay || "rgba(0,0,0,0.5)"}), url(${formData.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }),
              color: formData.textColor || undefined,
              // CSS custom properties for dynamic hover effects
              "--link-color": formData.linkColor || "#64748b",
              "--link-hover-color": formData.linkHoverColor || "#2563eb",
              "--heading-color": formData.headingColor || "#1e293b",
              "--accent-color": formData.accentColor || "#2563eb",
              "--divider-color": formData.dividerColor || "#1e293b",
            } as React.CSSProperties}
          >
            {/* Dynamic styles for preview hover effects */}
            <style>{`
              .footer-preview .preview-link {
                color: var(--link-color);
                transition: color 0.2s;
              }
              .footer-preview .preview-link:hover {
                color: var(--link-hover-color);
              }
              .footer-preview .preview-heading {
                color: var(--heading-color);
              }
            `}</style>
            {/* Pattern Overlay for Preview */}
            {formData.bgType === "pattern" && formData.bgPattern && (() => {
              const color = formData.bgPatternColor || "#000";
              const patterns: Record<string, string> = {
                dots: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
                grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                diagonal: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 11px)`,
                waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
                noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              };
              const patternSizes: Record<string, string> = {
                dots: "20px 20px",
                grid: "20px 20px, 20px 20px",
                diagonal: "auto",
                waves: "100px 20px",
                noise: "200px 200px",
              };
              return (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: patterns[formData.bgPattern] || patterns.dots,
                    backgroundSize: patternSizes[formData.bgPattern] || "20px 20px",
                    opacity: (formData.bgPatternOpacity || 10) / 100,
                  }}
                />
              );
            })()}
            {/* Footer Preview Content */}
            <div
              className="px-4 relative z-10"
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
                                  <h4 className="text-xs font-semibold preview-heading">{widget.title}</h4>
                                )}
                                <div className="text-xs">
                                  {widget.type === "BRAND" && (() => {
                                    const brandContent = widget.content as { tagline?: string; showContact?: boolean; logoMode?: "auto" | "light" | "dark" } | null;
                                    const showContact = brandContent?.showContact !== false;
                                    const logoMode = brandContent?.logoMode || "auto";
                                    return (
                                      <div className="space-y-1.5">
                                        <LogoPreview size="md" logoMode={logoMode} />
                                        <span className="font-semibold preview-heading block">{businessConfig.name}</span>
                                        {brandContent?.tagline && (
                                          <p className="text-[10px] opacity-70 max-w-[140px] leading-tight">
                                            {brandContent.tagline}
                                          </p>
                                        )}
                                        {showContact && businessConfig.contact.supportEmail && (
                                          <div className="flex items-center gap-1 text-[10px] preview-link mt-1">
                                            <Mail className="h-2.5 w-2.5" />
                                            {businessConfig.contact.supportEmail}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {widget.type === "LINKS" && (
                                    <ul className="space-y-0.5">
                                      {widget.menuItems && widget.menuItems.length > 0 ? (
                                        widget.menuItems.slice(0, 4).map((item, idx) => (
                                          <li key={idx} className="preview-link cursor-pointer">{item.label}</li>
                                        ))
                                      ) : (
                                        <>
                                          <li className="preview-link cursor-pointer">Link 1</li>
                                          <li className="preview-link cursor-pointer">Link 2</li>
                                          <li className="preview-link cursor-pointer">Link 3</li>
                                        </>
                                      )}
                                    </ul>
                                  )}
                                  {widget.type === "CONTACT" && (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 preview-link"><Mail className="h-3 w-3" /> email@example.com</div>
                                      <div className="flex items-center gap-1 preview-link"><Phone className="h-3 w-3" /> +1 234 567 890</div>
                                    </div>
                                  )}
                                  {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                  {widget.type === "TEXT" && <p>Custom text content...</p>}
                                  {widget.type === "NEWSLETTER" && (
                                    <div className="mt-2 max-w-sm">
                                      <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                                        <input
                                          type="email"
                                          placeholder="Enter your email"
                                          className="flex-1 min-w-0 h-9 px-3 border-0 text-xs"
                                          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                          readOnly
                                        />
                                        <button
                                          className="h-9 px-4 text-xs font-semibold shrink-0 flex items-center"
                                          style={{ backgroundColor: "var(--accent-color)", color: "#0f172a" }}
                                        >
                                          {(widget.content as { buttonText?: string })?.buttonText || "Subscribe"}
                                        </button>
                                      </div>
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
                  {/* All widgets merged from all columns */}
                  <div className="flex flex-col items-center space-y-6">
                    {(() => {
                      // Merge all widgets from all columns, sorted by column then sortOrder
                      const allWidgets = Array.from({ length: formData.columns }, (_, i) => i + 1)
                        .flatMap(col => getWidgetsByColumn(col));

                      if (allWidgets.length === 0) {
                        return (
                          <div className="rounded border border-dashed border-gray-300 p-6">
                            <span className="text-xs text-muted-foreground">No widgets configured</span>
                          </div>
                        );
                      }

                      return allWidgets.map((widget) => (
                        <div key={widget.id} className="w-full max-w-md space-y-1">
                          {widget.showTitle && widget.title && (
                            <h4 className="text-xs font-semibold preview-heading">{widget.title}</h4>
                          )}
                          <div className="text-xs">
                            {widget.type === "BRAND" && (() => {
                              const brandContent = widget.content as { tagline?: string; subtitle?: string; showContact?: boolean; logoMode?: "auto" | "light" | "dark" } | null;
                              const showContact = brandContent?.showContact !== false;
                              const logoMode = brandContent?.logoMode || "auto";
                              return (
                                <div className="flex flex-col items-center gap-2">
                                  <LogoPreview size="lg" logoMode={logoMode} />
                                  <span className="font-semibold preview-heading">{businessConfig.name}</span>
                                  <p className="max-w-xs text-center" style={{ color: "var(--link-color)" }}>
                                    {brandContent?.tagline || "Your trusted partner for LLC formation and business services."}
                                  </p>
                                  {brandContent?.subtitle && (
                                    <p className="max-w-md text-[10px] opacity-60 text-center">
                                      {brandContent.subtitle}
                                    </p>
                                  )}
                                  {showContact && businessConfig.contact.supportEmail && (
                                    <div className="flex items-center gap-1 text-[10px] preview-link">
                                      <Mail className="h-2.5 w-2.5" />
                                      {businessConfig.contact.supportEmail}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            {widget.type === "LINKS" && (
                              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                                {widget.menuItems && widget.menuItems.length > 0 ? (
                                  widget.menuItems.map((item, idx) => (
                                    <span key={idx} className="preview-link cursor-pointer">{item.label}</span>
                                  ))
                                ) : (
                                  <>
                                    <span className="preview-link cursor-pointer">Link 1</span>
                                    <span className="preview-link cursor-pointer">Link 2</span>
                                    <span className="preview-link cursor-pointer">Link 3</span>
                                  </>
                                )}
                              </div>
                            )}
                            {widget.type === "CONTACT" && (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1 preview-link"><Mail className="h-3 w-3" /> email@example.com</div>
                                <div className="flex items-center gap-1 preview-link"><Phone className="h-3 w-3" /> +1 234 567 890</div>
                              </div>
                            )}
                            {widget.type === "SOCIAL" && (
                              <div className="flex justify-center">
                                <SocialIconsPreview size="md" />
                              </div>
                            )}
                            {widget.type === "TEXT" && <p>Custom text content...</p>}
                            {widget.type === "NEWSLETTER" && (
                              <div className="mt-2 max-w-sm mx-auto">
                                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                                  <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 min-w-0 h-9 px-3 border-0 text-xs"
                                    style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                    readOnly
                                  />
                                  <button
                                    className="h-9 px-4 text-xs font-semibold shrink-0 flex items-center"
                                    style={{ backgroundColor: "var(--accent-color)", color: "#0f172a" }}
                                  >
                                    {(widget.content as { buttonText?: string })?.buttonText || "Subscribe"}
                                  </button>
                                </div>
                              </div>
                            )}
                            {widget.type === "SERVICES" && <span className="italic">Auto: Services</span>}
                            {widget.type === "STATES" && <span className="italic">Auto: States</span>}
                            {widget.type === "RECENT_POSTS" && <span className="italic">Recent Posts</span>}
                            {widget.type === "CUSTOM_HTML" && <span className="italic">Custom HTML</span>}
                          </div>
                        </div>
                      ));
                    })()}
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
                    <LogoPreview size="xs" />
                    <span className="text-sm font-semibold preview-heading">{businessConfig.name}</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-xs">
                    {formData.bottomLinks.length > 0 ? (
                      formData.bottomLinks.slice(0, 4).map((link, idx) => (
                        <span key={idx} className="preview-link cursor-pointer">{link.label}</span>
                      ))
                    ) : (
                      <>
                        <span className="preview-link cursor-pointer">Privacy</span>
                        <span className="preview-link cursor-pointer">Terms</span>
                        <span className="preview-link cursor-pointer">Contact</span>
                      </>
                    )}
                  </div>
                  {formData.showSocialLinks && <SocialIconsPreview size="sm" />}
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
                      <LogoPreview size="md" />
                      <div>
                        <span className="font-semibold">{businessConfig.name}</span>
                        <p className="text-xs text-muted-foreground">{businessConfig.tagline}</p>
                      </div>
                    </div>
                    {formData.showSocialLinks && <SocialIconsPreview size="md" />}
                  </div>
                  {/* Mega grid */}
                  <div
                    className={cn(
                      "mt-4 grid gap-4",
                      previewMode === "mobile" && "grid-cols-2"
                    )}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
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

              {/* STACKED Layout */}
              {formData.layout === "STACKED" && (
                <div className="space-y-6">
                  {/* Brand Section */}
                  <div className="text-center py-4 border-b" style={{ borderColor: formData.borderColor || undefined }}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <LogoPreview size="md" />
                      <span className="font-semibold">{businessConfig.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">Your trusted partner for LLC formation</p>
                  </div>
                  {/* Widget Grid */}
                  <div
                    className={cn("grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "")}
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
                                  <h4 className="text-xs font-semibold" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {widget.type === "LINKS" && (
                                    <ul className="space-y-0.5">
                                      {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                        <li key={idx} className="preview-link cursor-pointer">{item.label}</li>
                                      )) || <li className="preview-link">Link 1</li>}
                                    </ul>
                                  )}
                                  {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                  {widget.type === "NEWSLETTER" && (
                                    <div className="mt-1 max-w-[200px]">
                                      <div className="flex rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                                        <input
                                          type="email"
                                          placeholder="Email"
                                          className="flex-1 min-w-0 h-6 px-2 border-0 text-[10px]"
                                          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                          readOnly
                                        />
                                        <button
                                          className="h-6 px-2 text-[10px] font-semibold shrink-0"
                                          style={{ backgroundColor: "var(--accent-color)", color: "#0f172a" }}
                                        >
                                          {(widget.content as { buttonText?: string })?.buttonText || "Subscribe"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {widget.type !== "LINKS" && widget.type !== "SOCIAL" && widget.type !== "NEWSLETTER" && widget.type !== "BRAND" && <span className="italic">{widget.type}</span>}
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

              {/* APP_FOCUSED Layout */}
              {formData.layout === "APP_FOCUSED" && (
                <div className="space-y-6">
                  <div className={cn("flex gap-8", previewMode === "mobile" ? "flex-col" : "")}>
                    {/* Left: App promo */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <LogoPreview size="lg" />
                        <span className="text-lg font-bold">{businessConfig.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Start your business journey today</p>
                      <div className="flex gap-2">
                        <div className="h-8 px-3 rounded bg-black text-white text-xs flex items-center gap-1">App Store</div>
                        <div className="h-8 px-3 rounded bg-black text-white text-xs flex items-center gap-1">Play Store</div>
                      </div>
                    </div>
                    {/* Right: Links */}
                    <div className={cn("grid gap-6", previewMode === "mobile" ? "grid-cols-2" : `grid-cols-${Math.min(formData.columns - 1, 3)}`)}>
                      {Array.from({ length: Math.min(formData.columns - 1, 3) }, (_, i) => i + 2).map((column) => {
                        const widgets = getWidgetsByColumn(column);
                        return (
                          <div key={column} className="space-y-2">
                            {widgets.map((widget) => (
                              <div key={widget.id}>
                                {widget.showTitle && widget.title && <h4 className="text-xs font-semibold mb-1" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>}
                                {widget.type === "LINKS" && (
                                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                                    {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                      <li key={idx} className="hover:text-foreground cursor-pointer">{item.label}</li>
                                    )) || <li>Link</li>}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* NEWSLETTER_HERO Layout */}
              {formData.layout === "NEWSLETTER_HERO" && (
                <div className="space-y-6">
                  {/* Large Newsletter Section - uses NEWSLETTER widget content if available */}
                  {(() => {
                    // Find NEWSLETTER widget to get title/subtitle for hero section
                    const allWidgets = footer?.widgets || [];
                    const newsletterWidget = allWidgets.find(w => w.type === "NEWSLETTER");
                    const nlContent = newsletterWidget?.content as { subtitle?: string; buttonText?: string } | null;
                    const heroTitle = newsletterWidget?.title || formData.newsletterTitle || "Stay in the loop";
                    const heroSubtitle = nlContent?.subtitle || formData.newsletterSubtitle || "Get the latest updates delivered to your inbox.";
                    const buttonText = nlContent?.buttonText || "Subscribe";

                    return (
                      <div className="text-center py-6 border-b" style={{ borderColor: formData.borderColor || undefined }}>
                        <h3 className="text-lg font-bold mb-2" style={{ color: formData.headingColor || undefined }}>
                          {heroTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                          {heroSubtitle}
                        </p>
                        <div className="flex gap-2 justify-center max-w-sm mx-auto">
                          <div className="flex-1 h-10 rounded border bg-background"></div>
                          <div className="h-10 px-4 rounded bg-primary text-primary-foreground flex items-center text-sm">{buttonText}</div>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Widget Grid - Only show columns that have non-NEWSLETTER widgets */}
                  {(() => {
                    // Get columns that have visible widgets (excluding NEWSLETTER which is shown in hero)
                    const visibleColumns = Array.from({ length: formData.columns }, (_, i) => i + 1)
                      .filter(column => {
                        const widgets = getWidgetsByColumn(column);
                        return widgets.some(w => w.type !== "NEWSLETTER");
                      });

                    if (visibleColumns.length === 0) return null;

                    return (
                      <div
                        className={cn("grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "")}
                        style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` } : undefined}
                      >
                        {visibleColumns.map((column) => {
                          const widgets = getWidgetsByColumn(column).filter(w => w.type !== "NEWSLETTER");
                          return (
                            <div key={column} className="space-y-2">
                              {widgets.map((widget) => (
                                <div key={widget.id} className="space-y-1">
                                  {widget.showTitle && widget.title && <h4 className="text-xs font-semibold" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>}
                                  {widget.type === "LINKS" && (
                                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                                      {widget.menuItems?.slice(0, 4).map((item, idx) => (
                                        <li key={idx} className="hover:text-foreground cursor-pointer">{item.label}</li>
                                      )) || <li>Link</li>}
                                    </ul>
                                  )}
                                  {widget.type === "BRAND" && (() => {
                                    const brandContent = widget.content as { logoMode?: "auto" | "light" | "dark" } | null;
                                    return <div className="space-y-1"><LogoPreview size="sm" logoMode={brandContent?.logoMode || "auto"} /><span className="font-semibold text-sm block">{businessConfig.name}</span></div>;
                                  })()}
                                  {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ASYMMETRIC Layout */}
              {formData.layout === "ASYMMETRIC" && (
                <div className={cn("flex gap-8", previewMode === "mobile" ? "flex-col" : "")}>
                  {/* Large left section (2/3) */}
                  <div className={cn(previewMode === "desktop" ? "w-2/3" : "w-full", "space-y-4")}>
                    <div className="flex items-center gap-3">
                      <LogoPreview size="xl" />
                      <div>
                        <span className="font-bold text-lg">{businessConfig.name}</span>
                        <p className="text-xs text-muted-foreground">{businessConfig.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Professional LLC formation services for entrepreneurs worldwide.</p>
                    {formData.showSocialLinks && <SocialIconsPreview size="lg" />}
                  </div>
                  {/* Right section (1/3) - Links */}
                  <div className={cn(previewMode === "desktop" ? "w-1/3" : "w-full", "grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "grid-cols-1")}>
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column).filter(w => w.type === "LINKS");
                      return widgets.map((widget) => (
                        <div key={widget.id}>
                          {widget.showTitle && widget.title && <h4 className="text-xs font-semibold mb-2" style={{ color: formData.headingColor || undefined }}>{widget.title}</h4>}
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {widget.menuItems?.slice(0, 5).map((item, idx) => (
                              <li key={idx} className="hover:text-foreground cursor-pointer">{item.label}</li>
                            )) || <li>Link</li>}
                          </ul>
                        </div>
                      ));
                    })}
                  </div>
                </div>
              )}

              {/* MEGA_PLUS Layout */}
              {formData.layout === "MEGA_PLUS" && (
                <div className="space-y-6">
                  {/* Featured CTA Banner */}
                  <div className="rounded-lg p-4 text-center" style={{ backgroundColor: formData.accentColor || "#3b82f6", color: "#fff" }}>
                    <p className="font-semibold">Start Your LLC Today - Special Offer!</p>
                    <p className="text-xs opacity-90">Use code SAVE20 for 20% off</p>
                  </div>
                  {/* Widget Grid */}
                  <div
                    className={cn("grid gap-4", previewMode === "mobile" ? "grid-cols-2" : "")}
                    style={previewMode === "desktop" ? { gridTemplateColumns: `repeat(${formData.columns}, 1fr)` } : undefined}
                  >
                    {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => {
                      const widgets = getWidgetsByColumn(column);
                      return (
                        <div key={column} className="space-y-2">
                          {widgets.length === 0 ? (
                            <div className="text-xs text-muted-foreground">Col {column}</div>
                          ) : (
                            widgets.map((widget) => (
                              <div key={widget.id}>
                                {widget.showTitle && widget.title && <h4 className="text-xs font-semibold preview-heading">{widget.title}</h4>}
                                {widget.type === "BRAND" && (() => {
                                  const brandContent = widget.content as { logoMode?: "auto" | "light" | "dark" } | null;
                                  return <div className="space-y-1"><LogoPreview size="sm" logoMode={brandContent?.logoMode || "auto"} /><span className="font-semibold text-sm preview-heading block">{businessConfig.name}</span></div>;
                                })()}
                                {widget.type === "LINKS" && <ul className="space-y-0.5 text-xs">{widget.menuItems?.slice(0,4).map((item,i) => <li key={i} className="preview-link cursor-pointer">{item.label}</li>) || <li className="preview-link">Link</li>}</ul>}
                                {widget.type === "SOCIAL" && <SocialIconsPreview size="sm" />}
                                {widget.type === "NEWSLETTER" && (
                                  <div className="mt-1 max-w-[200px]">
                                    <div className="flex rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                                      <input type="email" placeholder="Email" className="flex-1 min-w-0 h-6 px-2 border-0 text-[10px]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} readOnly />
                                      <button className="h-6 px-2 text-[10px] font-semibold shrink-0" style={{ backgroundColor: "var(--accent-color)", color: "#0f172a" }}>{(widget.content as { buttonText?: string })?.buttonText || "Subscribe"}</button>
                                    </div>
                                  </div>
                                )}
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
                  style={{ borderColor: "var(--divider-color)" }}
                >
                  <div className={cn(
                    "flex items-center justify-between gap-2 text-xs",
                    formData.layout === "CENTERED" || previewMode === "mobile" ? "flex-col" : ""
                  )}
                    style={{ color: formData.textColor || undefined }}
                  >
                    <p>{formData.copyrightText || `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}</p>
                    {formData.showDisclaimer && (
                      <p className="max-w-md text-[10px]">
                        <strong>Disclaimer:</strong> {formData.disclaimerText || `${businessConfig.name} is not a law firm and does not provide legal advice.`}
                      </p>
                    )}
                  </div>
                  {formData.bottomLinks.length > 0 && (
                    <div className={cn(
                      "mt-2 flex flex-wrap gap-2 text-xs",
                      formData.layout === "CENTERED" ? "justify-center" : ""
                    )}>
                      {formData.bottomLinks.map((link, idx) => (
                        <span key={idx} className="preview-link cursor-pointer">{link.label}</span>
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

        {/* Layout & Widgets Tab */}
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
                  <Label className={formData.layout === 'CENTERED' || formData.layout === 'MINIMAL' ? 'text-muted-foreground' : ''}>
                    Number of Columns
                  </Label>
                  <span className="text-sm text-muted-foreground">{formData.columns} columns</span>
                </div>
                <Slider
                  value={[formData.columns]}
                  onValueChange={(value) => setFormData({ ...formData, columns: value[0] })}
                  min={2}
                  max={6}
                  step={1}
                  disabled={formData.layout === 'CENTERED' || formData.layout === 'MINIMAL'}
                />
                {(formData.layout === 'CENTERED' || formData.layout === 'MINIMAL') && (
                  <p className="text-xs text-muted-foreground italic">
                    Not applicable for {formData.layout.toLowerCase()} layout
                  </p>
                )}
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
              {/* Warning for orphan widgets - only relevant for MULTI_COLUMN and MEGA layouts */}
              {getOrphanWidgets().length > 0 && (formData.layout === 'MULTI_COLUMN' || formData.layout === 'MEGA') && (
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

          {/* Presets Section - Quick Start Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Start with Presets
              </CardTitle>
              <CardDescription>
                Select a preset to instantly apply a professional design, or customize your own above
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.id ? (
                <PresetGallery
                  footerId={formData.id}
                  onPresetApplied={fetchFooter}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Save the footer first to use presets
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import/Export & Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Import / Export
              </CardTitle>
              <CardDescription>Backup or restore your footer configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Export */}
                <div className="space-y-3">
                  <h4 className="font-medium">Export Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Download your current footer settings as a JSON file.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!footer}
                    onClick={() => {
                      if (!footer) return;
                      const exportData = {
                        ...formData,
                        widgets: footer.widgets?.map(w => ({
                          type: w.type,
                          title: w.title,
                          showTitle: w.showTitle,
                          column: w.column,
                          sortOrder: w.sortOrder,
                          content: w.content,
                        })),
                        exportedAt: new Date().toISOString(),
                        version: "1.0",
                      };
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `footer-config-${new Date().toISOString().split("T")[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("Footer configuration exported");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Configuration
                  </Button>
                </div>

                {/* Import */}
                <div className="space-y-3">
                  <h4 className="font-medium">Import Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Load a previously exported footer configuration.
                  </p>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const text = await file.text();
                          const importData = JSON.parse(text);
                          if (!importData.layout || !importData.version) {
                            throw new Error("Invalid configuration file");
                          }
                          setFormData(prev => ({
                            ...prev,
                            ...importData,
                            id: prev.id,
                          }));
                          toast.success("Configuration imported. Click Save to apply changes.");
                        } catch (error) {
                          console.error("Import error:", error);
                          toast.error("Failed to import configuration.");
                        }
                        e.target.value = "";
                      }}
                    />
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Configuration
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seed Presets Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Seed Built-in Presets</h4>
                  <p className="text-sm text-muted-foreground">
                    Initialize the 12 built-in footer presets (only needed once)
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/admin/footer/presets/seed", { method: "POST" });
                      if (!res.ok) throw new Error("Failed to seed presets");
                      const data = await res.json();
                      toast.success(data.message);
                    } catch (error) {
                      console.error("Seed error:", error);
                      toast.error("Failed to seed presets");
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Seed Presets
                </Button>
              </div>
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
          {/* Background Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Background
              </CardTitle>
              <CardDescription>Configure footer background style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background Type */}
              <div className="space-y-2">
                <Label>Background Type</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "solid", label: "Solid" },
                    { value: "gradient", label: "Gradient" },
                    { value: "pattern", label: "Pattern" },
                    { value: "image", label: "Image" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, bgType: type.value })}
                      className={cn(
                        "rounded-lg border-2 p-3 text-sm font-medium transition-colors",
                        formData.bgType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid Color */}
              {formData.bgType === "solid" && (
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
              )}

              {/* Gradient */}
              {formData.bgType === "gradient" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Gradient Start</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgGradient?.colors?.[0]?.color || "#4338ca"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: e.target.value, position: 0 },
                                { color: formData.bgGradient?.colors?.[1]?.color || "#6366f1", position: 100 },
                              ],
                            },
                          })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgGradient?.colors?.[0]?.color || "#4338ca"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: e.target.value, position: 0 },
                                { color: formData.bgGradient?.colors?.[1]?.color || "#6366f1", position: 100 },
                              ],
                            },
                          })}
                          placeholder="#4338ca"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gradient End</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgGradient?.colors?.[1]?.color || "#6366f1"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: formData.bgGradient?.colors?.[0]?.color || "#4338ca", position: 0 },
                                { color: e.target.value, position: 100 },
                              ],
                            },
                          })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgGradient?.colors?.[1]?.color || "#6366f1"}
                          onChange={(e) => setFormData({
                            ...formData,
                            bgGradient: {
                              type: "linear",
                              angle: formData.bgGradient?.angle || 135,
                              colors: [
                                { color: formData.bgGradient?.colors?.[0]?.color || "#4338ca", position: 0 },
                                { color: e.target.value, position: 100 },
                              ],
                            },
                          })}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Gradient Angle</Label>
                      <span className="text-sm text-muted-foreground">{formData.bgGradient?.angle || 135}°</span>
                    </div>
                    <Slider
                      value={[formData.bgGradient?.angle || 135]}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        bgGradient: {
                          ...formData.bgGradient,
                          type: "linear",
                          angle: value[0],
                          colors: formData.bgGradient?.colors || [
                            { color: "#4338ca", position: 0 },
                            { color: "#6366f1", position: 100 },
                          ],
                        },
                      })}
                      min={0}
                      max={360}
                      step={15}
                    />
                  </div>
                </div>
              )}

              {/* Pattern */}
              {formData.bgType === "pattern" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pattern Style</Label>
                    <Select
                      value={formData.bgPattern || "dots"}
                      onValueChange={(value) => setFormData({ ...formData, bgPattern: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="diagonal">Diagonal Lines</SelectItem>
                        <SelectItem value="waves">Waves</SelectItem>
                        <SelectItem value="noise">Noise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Base Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgColor || "#fef3c7"}
                          onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgColor || ""}
                          onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                          placeholder="#fef3c7"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Pattern Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.bgPatternColor || "#f59e0b"}
                          onChange={(e) => setFormData({ ...formData, bgPatternColor: e.target.value })}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={formData.bgPatternColor || ""}
                          onChange={(e) => setFormData({ ...formData, bgPatternColor: e.target.value })}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Pattern Opacity</Label>
                      <span className="text-sm text-muted-foreground">{formData.bgPatternOpacity}%</span>
                    </div>
                    <Slider
                      value={[formData.bgPatternOpacity]}
                      onValueChange={(value) => setFormData({ ...formData, bgPatternOpacity: value[0] })}
                      min={5}
                      max={50}
                      step={5}
                    />
                  </div>
                </div>
              )}

              {/* Image Background */}
              {formData.bgType === "image" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bgImage">Background Image URL</Label>
                    <Input
                      id="bgImage"
                      value={formData.bgImage}
                      onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">Enter the URL of the background image</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bgImageOverlay">Overlay Color</Label>
                    <Input
                      id="bgImageOverlay"
                      value={formData.bgImageOverlay}
                      onChange={(e) => setFormData({ ...formData, bgImageOverlay: e.target.value })}
                      placeholder="rgba(0,0,0,0.5)"
                    />
                    <p className="text-xs text-muted-foreground">Dark overlay to improve text readability (e.g., rgba(0,0,0,0.5))</p>
                  </div>
                  {formData.bgImage && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div
                        className="h-32 rounded-lg bg-cover bg-center flex items-center justify-center text-white"
                        style={{
                          backgroundImage: `linear-gradient(${formData.bgImageOverlay}, ${formData.bgImageOverlay}), url(${formData.bgImage})`,
                        }}
                      >
                        <span className="text-sm font-medium">Sample Text</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDot className="h-5 w-5" />
                Colors
              </CardTitle>
              <CardDescription>Text, link, and accent colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
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
                  <Label htmlFor="headingColor">Heading Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="headingColor"
                      type="color"
                      value={formData.headingColor || "#111827"}
                      onChange={(e) => setFormData({ ...formData, headingColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.headingColor}
                      onChange={(e) => setFormData({ ...formData, headingColor: e.target.value })}
                      placeholder="#111827"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkColor">Link Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="linkColor"
                      type="color"
                      value={formData.linkColor || "#374151"}
                      onChange={(e) => setFormData({ ...formData, linkColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.linkColor}
                      onChange={(e) => setFormData({ ...formData, linkColor: e.target.value })}
                      placeholder="#374151"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkHoverColor">Link Hover Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="linkHoverColor"
                      type="color"
                      value={formData.linkHoverColor || "#2563eb"}
                      onChange={(e) => setFormData({ ...formData, linkHoverColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.linkHoverColor}
                      onChange={(e) => setFormData({ ...formData, linkHoverColor: e.target.value })}
                      placeholder="#2563eb"
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

                <div className="space-y-2">
                  <Label htmlFor="dividerColor">Divider Color</Label>
                  <p className="text-xs text-muted-foreground">Color for the line between main content and bottom bar</p>
                  <div className="flex gap-2">
                    <Input
                      id="dividerColor"
                      type="color"
                      value={formData.dividerColor || "#1e293b"}
                      onChange={(e) => setFormData({ ...formData, dividerColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.dividerColor}
                      onChange={(e) => setFormData({ ...formData, dividerColor: e.target.value })}
                      placeholder="#1e293b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription>Heading and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Heading Size</Label>
                  <Select
                    value={formData.headingSize}
                    onValueChange={(value) => setFormData({ ...formData, headingSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heading Weight</Label>
                  <Select
                    value={formData.headingWeight}
                    onValueChange={(value) => setFormData({ ...formData, headingWeight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="semibold">Semibold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heading Style</Label>
                  <Select
                    value={formData.headingStyle}
                    onValueChange={(value) => setFormData({ ...formData, headingStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="uppercase">UPPERCASE</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <h4
                  className={cn(
                    formData.headingSize === "sm" && "text-sm",
                    formData.headingSize === "base" && "text-base",
                    formData.headingSize === "lg" && "text-lg",
                    formData.headingSize === "xl" && "text-xl",
                    formData.headingWeight === "medium" && "font-medium",
                    formData.headingWeight === "semibold" && "font-semibold",
                    formData.headingWeight === "bold" && "font-bold",
                    formData.headingStyle === "uppercase" && "uppercase",
                    formData.headingStyle === "capitalize" && "capitalize"
                  )}
                  style={{ color: formData.headingColor || undefined }}
                >
                  Sample Heading
                </h4>
              </div>
            </CardContent>
          </Card>

          {/* Social Icon Styling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Social Icons
              </CardTitle>
              <CardDescription>Style for social media icons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Icon Shape</Label>
                  <Select
                    value={formData.socialShape}
                    onValueChange={(value) => setFormData({ ...formData, socialShape: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Icon Size</Label>
                  <Select
                    value={formData.socialSize}
                    onValueChange={(value) => setFormData({ ...formData, socialSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Mode</Label>
                  <Select
                    value={formData.socialColorMode}
                    onValueChange={(value) => setFormData({ ...formData, socialColorMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand Colors</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="accent">Accent Color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hover Effect</Label>
                  <Select
                    value={formData.socialHoverEffect}
                    onValueChange={(value) => setFormData({ ...formData, socialHoverEffect: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scale">Scale Up</SelectItem>
                      <SelectItem value="lift">Lift</SelectItem>
                      <SelectItem value="glow">Glow</SelectItem>
                      <SelectItem value="rotate">Rotate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Background Style</Label>
                  <Select
                    value={formData.socialBgStyle}
                    onValueChange={(value) => setFormData({ ...formData, socialBgStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="subtle">Subtle Glass</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-lg border p-4" style={{ backgroundColor: formData.bgColor || '#1a1a2e' }}>
                <p className="text-xs text-white/60 mb-3">Preview (on dark background):</p>
                <div className={cn(
                  "flex",
                  formData.socialSize === "sm" && "gap-2",
                  formData.socialSize === "md" && "gap-3",
                  formData.socialSize === "lg" && "gap-3",
                  formData.socialSize === "xl" && "gap-4"
                )}>
                  {[
                    { icon: Facebook, color: "#1877F2", name: "Facebook" },
                    { icon: Twitter, color: "#1DA1F2", name: "Twitter" },
                    { icon: Instagram, color: "#E4405F", name: "Instagram" },
                    { icon: Linkedin, color: "#0A66C2", name: "LinkedIn" },
                  ].map((social) => {
                    const IconComponent = social.icon;
                    const iconColor = formData.socialColorMode === "monochrome"
                      ? "#ffffff"
                      : formData.socialColorMode === "accent"
                        ? (formData.accentColor || social.color)
                        : social.color;
                    return (
                      <div
                        key={social.name}
                        className={cn(
                          "flex items-center justify-center transition-all",
                          // Shape
                          formData.socialShape === "circle" && "rounded-full",
                          formData.socialShape === "square" && "rounded-none",
                          formData.socialShape === "rounded" && "rounded-lg",
                          formData.socialShape === "pill" && "rounded-full",
                          // Size - pill uses different width (explicit style below)
                          formData.socialShape !== "pill" && formData.socialSize === "sm" && "h-7 w-7 p-1.5",
                          formData.socialShape !== "pill" && formData.socialSize === "md" && "h-9 w-9 p-2",
                          formData.socialShape !== "pill" && formData.socialSize === "lg" && "h-11 w-11 p-2.5",
                          formData.socialShape !== "pill" && formData.socialSize === "xl" && "h-13 w-13 p-3",
                          // Hover effect
                          formData.socialHoverEffect === "scale" && "hover:scale-110",
                          formData.socialHoverEffect === "lift" && "hover:-translate-y-1 hover:shadow-lg",
                          formData.socialHoverEffect === "glow" && "hover:shadow-lg hover:shadow-current/30",
                          formData.socialHoverEffect === "rotate" && "hover:rotate-12",
                          // Background style
                          formData.socialBgStyle === "none" && "",
                          formData.socialBgStyle === "subtle" && "bg-white/10 hover:bg-white/20",
                          formData.socialBgStyle === "solid" && "bg-white/20 hover:bg-white/30",
                          formData.socialBgStyle === "outline" && "border border-white/30 hover:border-white/50"
                        )}
                        style={{
                          color: iconColor,
                          // Pill shape uses explicit wider dimensions
                          ...(formData.socialShape === "pill" && {
                            width: formData.socialSize === "sm" ? "45px" : formData.socialSize === "lg" ? "77px" : formData.socialSize === "xl" ? "90px" : "64px",
                            height: formData.socialSize === "sm" ? "28px" : formData.socialSize === "lg" ? "48px" : formData.socialSize === "xl" ? "56px" : "40px",
                          }),
                        }}
                      >
                        <IconComponent className={cn(
                          formData.socialSize === "sm" && "h-4 w-4",
                          formData.socialSize === "md" && "h-5 w-5",
                          formData.socialSize === "lg" && "h-6 w-6",
                          formData.socialSize === "xl" && "h-7 w-7"
                        )} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effects & Animation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Effects & Animation
              </CardTitle>
              <CardDescription>Visual effects and animations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Animation Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Add entrance animations and hover effects
                  </p>
                </div>
                <Switch
                  checked={formData.enableAnimations}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableAnimations: checked })}
                />
              </div>

              {formData.enableAnimations && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Entrance Animation</Label>
                    <Select
                      value={formData.entranceAnimation || "none"}
                      onValueChange={(value) => setFormData({ ...formData, entranceAnimation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fade-in">Fade In</SelectItem>
                        <SelectItem value="fade-up">Fade Up</SelectItem>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Animation Duration</Label>
                      <span className="text-sm text-muted-foreground">{formData.animationDuration}ms</span>
                    </div>
                    <Slider
                      value={[formData.animationDuration]}
                      onValueChange={(value) => setFormData({ ...formData, animationDuration: value[0] })}
                      min={100}
                      max={800}
                      step={50}
                    />
                  </div>
                </div>
              )}

              <Separator />

              {/* Shadow */}
              <div className="space-y-2">
                <Label>Shadow</Label>
                <Select
                  value={formData.shadow}
                  onValueChange={(value) => setFormData({ ...formData, shadow: value })}
                >
                  <SelectTrigger className="w-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Divider Style */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Divider Style</Label>
                  <Select
                    value={formData.dividerStyle}
                    onValueChange={(value) => setFormData({ ...formData, dividerStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Link Hover Effect</Label>
                  <Select
                    value={formData.linkHoverEffect}
                    onValueChange={(value) => setFormData({ ...formData, linkHoverEffect: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color">Color Change</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                      <SelectItem value="slide">Slide Underline</SelectItem>
                      <SelectItem value="highlight">Highlight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Container Width & Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                Container
              </CardTitle>
              <CardDescription>Footer container width and corner style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Container Width</Label>
                  <Select
                    value={formData.containerWidth}
                    onValueChange={(value) => setFormData({ ...formData, containerWidth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width</SelectItem>
                      <SelectItem value="boxed">Boxed (Content Width)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Boxed: Aligns footer with main content sections
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Corner Style</Label>
                  <Select
                    value={formData.containerStyle}
                    onValueChange={(value) => {
                      if (value === "sharp") {
                        setFormData({ ...formData, containerStyle: value, cornerRadiusTL: 0, cornerRadiusTR: 0, cornerRadiusBL: 0, cornerRadiusBR: 0 });
                      } else {
                        setFormData({ ...formData, containerStyle: value, cornerRadiusTL: 16, cornerRadiusTR: 16, cornerRadiusBL: 16, cornerRadiusBR: 16 });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sharp">Sharp</SelectItem>
                      <SelectItem value="round">Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.containerStyle === "round" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Corner Radius (px)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Top Left</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusTL}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusTL]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusTL: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Top Right</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusTR}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusTR]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusTR: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Bottom Left</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusBL}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusBL]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusBL: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Bottom Right</Label>
                          <span className="text-xs text-muted-foreground">{formData.cornerRadiusBR}px</span>
                        </div>
                        <Slider
                          value={[formData.cornerRadiusBR]}
                          onValueChange={(value) => setFormData({ ...formData, cornerRadiusBR: value[0] })}
                          min={0}
                          max={48}
                          step={4}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Spacing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SquareStack className="h-5 w-5" />
                Spacing
              </CardTitle>
              <CardDescription>Padding and margins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Padding Top</Label>
                  <span className="text-sm text-muted-foreground">{formData.paddingTop}px</span>
                </div>
                <Slider
                  value={[formData.paddingTop]}
                  onValueChange={(value) => setFormData({ ...formData, paddingTop: value[0] })}
                  min={16}
                  max={120}
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
                  max={120}
                  step={8}
                />
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

            {/* BRAND widget options */}
            {widgetFormData.type === "BRAND" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo Version</Label>
                  <Select
                    value={(widgetFormData.content as { logoMode?: string })?.logoMode || "auto"}
                    onValueChange={(value) => setWidgetFormData({
                      ...widgetFormData,
                      content: { ...widgetFormData.content, logoMode: value },
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Dark logo if available)</SelectItem>
                      <SelectItem value="light">Light Mode Logo</SelectItem>
                      <SelectItem value="dark">Dark Mode Logo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose which logo to display. &quot;Auto&quot; uses dark mode logo for dark backgrounds.
                  </p>
                </div>
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
