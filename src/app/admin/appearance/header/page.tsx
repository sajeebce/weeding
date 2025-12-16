"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save,
  Eye,
  Menu,
  Smartphone,
  Monitor,
  Loader2,
  ExternalLink,
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { HeaderConfig, HeaderLayout, CTAButton } from "@/lib/header-footer/types";

const layoutOptions: { value: HeaderLayout; label: string; description: string }[] = [
  { value: "DEFAULT", label: "Default", description: "Logo left, Nav center, CTA right" },
  { value: "CENTERED", label: "Centered", description: "Logo center, Nav below" },
  { value: "SPLIT", label: "Split", description: "Logo center, Nav split" },
  { value: "MINIMAL", label: "Minimal", description: "Logo left, Hamburger right" },
  { value: "MEGA", label: "Mega", description: "Full mega menu style" },
];

// Logo position is now determined by layout choice, not a separate setting

export default function HeaderBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [header, setHeader] = useState<HeaderConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Form state
  const [formData, setFormData] = useState({
    name: "Default Header",
    layout: "DEFAULT" as HeaderLayout,
    sticky: true,
    transparent: false,
    topBarEnabled: false,
    logoMaxHeight: 40,
    showAuthButtons: true,
    loginText: "Sign In",
    registerText: "Get Started",
    registerUrl: "/services/llc-formation",
    searchEnabled: false,
    mobileBreakpoint: 1024,
    height: 64,
    bgColor: "",
    textColor: "",
    ctaButtons: [] as CTAButton[],
  });

  useEffect(() => {
    fetchHeader();
  }, []);

  async function fetchHeader() {
    try {
      const res = await fetch("/api/admin/header");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      if (data.headers && data.headers.length > 0) {
        const activeHeader = data.headers.find((h: HeaderConfig) => h.isActive) || data.headers[0];
        setHeader(activeHeader);
        setFormData({
          name: activeHeader.name,
          layout: activeHeader.layout,
          sticky: activeHeader.sticky,
          transparent: activeHeader.transparent,
          topBarEnabled: activeHeader.topBarEnabled,
          logoMaxHeight: activeHeader.logoMaxHeight,
          showAuthButtons: activeHeader.showAuthButtons,
          loginText: activeHeader.loginText,
          registerText: activeHeader.registerText,
          registerUrl: activeHeader.registerUrl,
          searchEnabled: activeHeader.searchEnabled,
          mobileBreakpoint: activeHeader.mobileBreakpoint,
          height: activeHeader.height,
          bgColor: activeHeader.bgColor || "",
          textColor: activeHeader.textColor || "",
          ctaButtons: activeHeader.ctaButtons || [],
        });
      }
    } catch (error) {
      toast.error("Failed to load header configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!header) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: header.id,
          ...formData,
          bgColor: formData.bgColor || null,
          textColor: formData.textColor || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Header configuration saved");
      fetchHeader();
    } catch (error) {
      toast.error("Failed to save header configuration");
    } finally {
      setSaving(false);
    }
  }

  function updateCTAButton(index: number, updates: Partial<CTAButton>) {
    const newButtons = [...formData.ctaButtons];
    newButtons[index] = { ...newButtons[index], ...updates };
    setFormData({ ...formData, ctaButtons: newButtons });
  }

  function addCTAButton() {
    setFormData({
      ...formData,
      ctaButtons: [
        ...formData.ctaButtons,
        { text: "New Button", url: "/", variant: "primary" },
      ],
    });
  }

  function removeCTAButton(index: number) {
    const newButtons = formData.ctaButtons.filter((_, i) => i !== index);
    setFormData({ ...formData, ctaButtons: newButtons });
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
          <h1 className="text-2xl font-bold">Header Builder</h1>
          <p className="text-muted-foreground">
            Customize your website header layout and appearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/appearance/header/menu">
              <Menu className="mr-2 h-4 w-4" />
              Edit Menu
            </Link>
          </Button>
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
              "mx-auto overflow-hidden rounded-lg border bg-background transition-all",
              previewMode === "mobile" ? "max-w-[375px]" : "w-full"
            )}
            style={{
              backgroundColor: formData.bgColor || undefined,
              color: formData.textColor || undefined,
            }}
          >
            {/* Layout-specific Preview */}
            {formData.layout === "DEFAULT" && (
              /* DEFAULT: Logo left, Nav center, CTA right */
              <div
                className="flex items-center justify-between px-4"
                style={{ height: `${formData.height}px` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                </div>
                {previewMode === "desktop" && (
                  <nav className="flex items-center gap-4 text-sm">
                    <span className="cursor-pointer hover:text-primary">Home</span>
                    <span className="cursor-pointer hover:text-primary">Services</span>
                    <span className="cursor-pointer hover:text-primary">Pricing</span>
                    <span className="cursor-pointer hover:text-primary">About</span>
                  </nav>
                )}
                <div className="flex items-center gap-2">
                  {formData.showAuthButtons && previewMode === "desktop" && (
                    <Button variant="ghost" size="sm">{formData.loginText}</Button>
                  )}
                  {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                    <Button key={i} size="sm" variant={btn.variant === "outline" ? "outline" : "default"}>
                      {btn.text}
                    </Button>
                  ))}
                  {formData.ctaButtons.length === 0 && (
                    <Button size="sm">Get Started</Button>
                  )}
                  {previewMode === "mobile" && <Menu className="h-5 w-5" />}
                </div>
              </div>
            )}

            {formData.layout === "CENTERED" && (
              /* CENTERED: Two rows - Logo centered top, Nav centered below */
              <div>
                <div
                  className="relative flex items-center justify-center px-4 border-b border-border/30"
                  style={{ height: `${Math.floor(formData.height * 0.6)}px` }}
                >
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                  {previewMode === "mobile" && (
                    <div className="absolute right-4">
                      <Menu className="h-5 w-5" />
                    </div>
                  )}
                </div>
                {previewMode === "desktop" && (
                  <div
                    className="flex items-center justify-center gap-6 px-4"
                    style={{ height: `${Math.floor(formData.height * 0.5)}px` }}
                  >
                    <nav className="flex items-center gap-6 text-sm">
                      <span className="cursor-pointer hover:text-primary">Home</span>
                      <span className="cursor-pointer hover:text-primary">Services</span>
                      <span className="cursor-pointer hover:text-primary">Pricing</span>
                      <span className="cursor-pointer hover:text-primary">About</span>
                    </nav>
                    <div className="flex items-center gap-2">
                      {formData.showAuthButtons && (
                        <Button variant="ghost" size="sm">{formData.loginText}</Button>
                      )}
                      {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                        <Button key={i} size="sm" variant={btn.variant === "outline" ? "outline" : "default"}>
                          {btn.text}
                        </Button>
                      ))}
                      {formData.ctaButtons.length === 0 && (
                        <Button size="sm">Get Started</Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.layout === "SPLIT" && (
              /* SPLIT: Nav left, Logo center, Nav + CTA right */
              <div
                className="relative flex items-center justify-between px-4"
                style={{ height: `${formData.height}px` }}
              >
                {previewMode === "desktop" && (
                  <nav className="flex items-center gap-4 text-sm">
                    <span className="cursor-pointer hover:text-primary">Home</span>
                    <span className="cursor-pointer hover:text-primary">Services</span>
                  </nav>
                )}
                {previewMode === "mobile" && <div />}
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {previewMode === "desktop" && (
                    <>
                      <nav className="flex items-center gap-4 text-sm">
                        <span className="cursor-pointer hover:text-primary">Pricing</span>
                        <span className="cursor-pointer hover:text-primary">About</span>
                      </nav>
                      <div className="flex items-center gap-2">
                        {formData.showAuthButtons && (
                          <Button variant="ghost" size="sm">{formData.loginText}</Button>
                        )}
                        {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                          <Button key={i} size="sm" variant={btn.variant === "outline" ? "outline" : "default"}>
                            {btn.text}
                          </Button>
                        ))}
                        {formData.ctaButtons.length === 0 && (
                          <Button size="sm">Get Started</Button>
                        )}
                      </div>
                    </>
                  )}
                  {previewMode === "mobile" && <Menu className="h-5 w-5" />}
                </div>
              </div>
            )}

            {formData.layout === "MINIMAL" && (
              /* MINIMAL: Logo left, Hamburger right (always) */
              <div
                className="flex items-center justify-between px-4"
                style={{ height: `${formData.height}px` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                    style={{ height: `${formData.logoMaxHeight}px` }}
                  >
                    LP
                  </div>
                </div>
                <Menu className="h-5 w-5 cursor-pointer" />
              </div>
            )}

            {formData.layout === "MEGA" && (
              /* MEGA: Two rows - Logo+CTA top, full-width nav bar below */
              <div>
                <div
                  className="flex items-center justify-between px-4 border-b border-border/30"
                  style={{ height: `${Math.floor(formData.height * 0.65)}px` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center justify-center rounded bg-primary/20 px-3 font-bold text-primary"
                      style={{ height: `${formData.logoMaxHeight}px` }}
                    >
                      LP
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.showAuthButtons && previewMode === "desktop" && (
                      <Button variant="ghost" size="sm">{formData.loginText}</Button>
                    )}
                    {formData.ctaButtons.slice(0, 1).map((btn, i) => (
                      <Button key={i} size="sm" variant={btn.variant === "outline" ? "outline" : "default"}>
                        {btn.text}
                      </Button>
                    ))}
                    {formData.ctaButtons.length === 0 && previewMode === "desktop" && (
                      <Button size="sm">Get Started</Button>
                    )}
                    {previewMode === "mobile" && <Menu className="h-5 w-5" />}
                  </div>
                </div>
                {previewMode === "desktop" && (
                  <div
                    className="flex items-center px-4 bg-muted/30"
                    style={{ height: `${Math.floor(formData.height * 0.55)}px` }}
                  >
                    <nav className="flex items-center gap-1">
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Home</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Services ▾</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Pricing</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">About</span>
                      <span className="cursor-pointer rounded px-3 py-1.5 text-sm hover:bg-background hover:shadow-sm">Contact</span>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="cta">CTA Buttons</TabsTrigger>
          <TabsTrigger value="auth">Auth Buttons</TabsTrigger>
          <TabsTrigger value="style">Styling</TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header Layout</CardTitle>
              <CardDescription>Choose the overall layout structure for your header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Layout Options */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>

              <Separator />

              {/* Behavior Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Sticky Header</Label>
                    <p className="text-sm text-muted-foreground">
                      Header stays fixed when scrolling
                    </p>
                  </div>
                  <Switch
                    checked={formData.sticky}
                    onCheckedChange={(checked) => setFormData({ ...formData, sticky: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Transparent on Hero</Label>
                    <p className="text-sm text-muted-foreground">
                      Transparent background over hero section
                    </p>
                  </div>
                  <Switch
                    checked={formData.transparent}
                    onCheckedChange={(checked) => setFormData({ ...formData, transparent: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Enable Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Show search icon in header
                    </p>
                  </div>
                  <Switch
                    checked={formData.searchEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, searchEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label className="text-base">Top Announcement Bar</Label>
                    <p className="text-sm text-muted-foreground">
                      Show promotional bar above header
                    </p>
                  </div>
                  <Switch
                    checked={formData.topBarEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, topBarEnabled: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* Size Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Header Height</Label>
                    <span className="text-sm text-muted-foreground">{formData.height}px</span>
                  </div>
                  <Slider
                    value={[formData.height]}
                    onValueChange={(value) => setFormData({ ...formData, height: value[0] })}
                    min={48}
                    max={100}
                    step={4}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Logo Max Height</Label>
                    <span className="text-sm text-muted-foreground">{formData.logoMaxHeight}px</span>
                  </div>
                  <Slider
                    value={[formData.logoMaxHeight]}
                    onValueChange={(value) => setFormData({ ...formData, logoMaxHeight: value[0] })}
                    min={24}
                    max={80}
                    step={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Logo image is configured in{" "}
                    <Link href="/admin/settings" className="text-primary hover:underline">
                      General Settings
                    </Link>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mobile Breakpoint</Label>
                    <span className="text-sm text-muted-foreground">{formData.mobileBreakpoint}px</span>
                  </div>
                  <Slider
                    value={[formData.mobileBreakpoint]}
                    onValueChange={(value) => setFormData({ ...formData, mobileBreakpoint: value[0] })}
                    min={768}
                    max={1280}
                    step={64}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Buttons Tab */}
        <TabsContent value="cta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Buttons</CardTitle>
              <CardDescription>Configure header CTA buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ctaButtons.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                  <p className="mb-4 text-muted-foreground">No CTA buttons configured</p>
                  <Button onClick={addCTAButton}>Add CTA Button</Button>
                </div>
              ) : (
                <>
                  {formData.ctaButtons.map((btn, index) => (
                    <div key={index} className="flex items-end gap-4 rounded-lg border p-4">
                      <div className="flex-1 space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={btn.text}
                          onChange={(e) => updateCTAButton(index, { text: e.target.value })}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={btn.url}
                          onChange={(e) => updateCTAButton(index, { url: e.target.value })}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Variant</Label>
                        <Select
                          value={btn.variant}
                          onValueChange={(value: CTAButton["variant"]) =>
                            updateCTAButton(index, { variant: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="outline">Outline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeCTAButton(index)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCTAButton}>
                    Add Another Button
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auth Buttons Tab */}
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Buttons</CardTitle>
              <CardDescription>Configure sign in and register buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">Show Auth Buttons</Label>
                  <p className="text-sm text-muted-foreground">
                    Display sign in/register buttons for logged out users
                  </p>
                </div>
                <Switch
                  checked={formData.showAuthButtons}
                  onCheckedChange={(checked) => setFormData({ ...formData, showAuthButtons: checked })}
                />
              </div>

              {formData.showAuthButtons && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="loginText">Sign In Button Text</Label>
                    <Input
                      id="loginText"
                      value={formData.loginText}
                      onChange={(e) => setFormData({ ...formData, loginText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerText">Register Button Text</Label>
                    <Input
                      id="registerText"
                      value={formData.registerText}
                      onChange={(e) => setFormData({ ...formData, registerText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerUrl">Register URL</Label>
                    <Input
                      id="registerUrl"
                      value={formData.registerUrl}
                      onChange={(e) => setFormData({ ...formData, registerUrl: e.target.value })}
                    />
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
              <CardTitle>Header Styling</CardTitle>
              <CardDescription>Customize colors and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={formData.bgColor || "#ffffff"}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      placeholder="#ffffff or transparent"
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
                      value={formData.textColor || "#1f2937"}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Leave colors empty to use the default theme colors. Custom colors will override the theme.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Items Info */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Navigation Menu</p>
              <p className="text-sm text-muted-foreground">
                {header?.menuItemsCount || 0} menu items configured
              </p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/appearance/header/menu">
              Edit Menu Items
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
