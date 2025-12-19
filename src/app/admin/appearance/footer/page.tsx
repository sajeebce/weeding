"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import type { FooterConfig, FooterWidget, FooterWidgetType, FooterLayout, BottomLink } from "@/lib/header-footer/types";

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

const defaultWidgetFormData = {
  type: "LINKS" as FooterWidgetType,
  title: "",
  showTitle: true,
  column: 1,
  content: {} as Record<string, unknown>,
};

export default function FooterBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footer, setFooter] = useState<FooterConfig | null>(null);

  // Widget dialog
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [deleteWidgetDialogOpen, setDeleteWidgetDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<FooterWidget | null>(null);
  const [widgetFormData, setWidgetFormData] = useState(defaultWidgetFormData);

  // Form state
  const [formData, setFormData] = useState({
    name: "Default Footer",
    layout: "MULTI_COLUMN" as FooterLayout,
    columns: 4,
    newsletterEnabled: true,
    newsletterTitle: "Subscribe to our newsletter",
    newsletterSubtitle: "",
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
          disclaimerText: formData.disclaimerText || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Footer configuration saved");
      fetchFooter();
    } catch (error) {
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
    setWidgetFormData({
      type: widget.type,
      title: widget.title || "",
      showTitle: widget.showTitle,
      column: widget.column,
      content: widget.content || {},
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

      const payload = {
        ...(selectedWidget && { id: selectedWidget.id }),
        footerId: footer.id,
        ...widgetFormData,
        title: widgetFormData.title || null,
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
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${formData.columns}, 1fr)` }}>
                {Array.from({ length: formData.columns }, (_, i) => i + 1).map((column) => (
                  <div key={column} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Column {column}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openWidgetDialog(column)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="min-h-[200px] space-y-2 rounded-lg border-2 border-dashed p-2">
                      {getWidgetsByColumn(column).length === 0 ? (
                        <button
                          onClick={() => openWidgetDialog(column)}
                          className="flex h-full min-h-[180px] w-full flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
                        >
                          <Plus className="mb-2 h-6 w-6" />
                          <span className="text-sm">Add Widget</span>
                        </button>
                      ) : (
                        getWidgetsByColumn(column).map((widget) => (
                          <div
                            key={widget.id}
                            className="flex items-center gap-2 rounded-lg border bg-card p-3"
                          >
                            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {widgetTypes.find((t) => t.value === widget.type)?.icon}
                                <span className="text-sm font-medium">
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
                              className="h-7 w-7"
                              onClick={() => openEditWidgetDialog(widget)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => openDeleteWidgetDialog(widget)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
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

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                {widgetFormData.type === "LINKS" && "After creating, edit the widget to add links."}
                {widgetFormData.type === "BRAND" && "Shows logo, description, and contact info from settings."}
                {widgetFormData.type === "SERVICES" && "Auto-populated from your active services."}
                {widgetFormData.type === "STATES" && "Auto-populated list of popular LLC states."}
                {widgetFormData.type === "NEWSLETTER" && "Email subscription form."}
                {widgetFormData.type === "SOCIAL" && "Social media links from settings."}
                {widgetFormData.type === "CONTACT" && "Contact information from settings."}
                {widgetFormData.type === "TEXT" && "Custom text content."}
                {widgetFormData.type === "RECENT_POSTS" && "Latest blog posts."}
                {widgetFormData.type === "CUSTOM_HTML" && "Custom HTML content."}
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
