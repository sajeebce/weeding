"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Building2,
  Loader2,
  Save,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface BusinessSettings {
  // General
  "business.name": string;
  "business.tagline": string;
  "business.description": string;
  // Display settings
  "business.display.logo": string;
  "business.display.name": string;
  // Logo
  "business.logo.url": string;
  "business.logo.darkUrl": string;
  "business.logo.text": string;
  "business.favicon.url": string;
  // Contact
  "business.contact.email": string;
  "business.contact.phone": string;
  "business.support.email": string;
  // Address
  "business.address.line1": string;
  "business.address.line2": string;
  "business.address.city": string;
  "business.address.state": string;
  "business.address.zip": string;
  "business.address.country": string;
  // Social Media
  "business.social.facebook": string;
  "business.social.twitter": string;
  "business.social.linkedin": string;
  "business.social.instagram": string;
  "business.social.youtube": string;
  "business.social.tiktok": string;
}

const defaultSettings: BusinessSettings = {
  "business.name": "LLCPad",
  "business.tagline": "Your Business Formation Partner",
  "business.description": "Empowering global entrepreneurs to launch legitimate US businesses and Amazon stores with zero complexity.",
  "business.display.logo": "true",
  "business.display.name": "true",
  "business.logo.url": "",
  "business.logo.darkUrl": "",
  "business.logo.text": "L",
  "business.favicon.url": "",
  "business.contact.email": "",
  "business.contact.phone": "",
  "business.support.email": "",
  "business.address.line1": "",
  "business.address.line2": "",
  "business.address.city": "",
  "business.address.state": "",
  "business.address.zip": "",
  "business.address.country": "USA",
  "business.social.facebook": "",
  "business.social.twitter": "",
  "business.social.linkedin": "",
  "business.social.instagram": "",
  "business.social.youtube": "",
  "business.social.tiktok": "",
};

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

export default function BusinessSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [darkLogoPreview, setDarkLogoPreview] = useState<string>("");
  const [faviconPreview, setFaviconPreview] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings["business.logo.url"]) {
      setLogoPreview(settings["business.logo.url"]);
    }
    if (settings["business.logo.darkUrl"]) {
      setDarkLogoPreview(settings["business.logo.darkUrl"]);
    }
    if (settings["business.favicon.url"]) {
      setFaviconPreview(settings["business.favicon.url"]);
    }
  }, [settings["business.logo.url"], settings["business.logo.darkUrl"], settings["business.favicon.url"]]);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings?prefix=business.");
      const data = await res.json();

      if (data.settings) {
        const newSettings = { ...defaultSettings };
        Object.entries(data.settings).forEach(([key, val]) => {
          const settingVal = val as { value: string };
          if (key in newSettings) {
            (newSettings as Record<string, string>)[key] = settingVal.value;
          }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load business settings");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        type: "string",
      }));

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Business settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save business settings");
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: keyof BusinessSettings, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just show preview. In production, upload to R2/S3
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setLogoPreview(dataUrl);
        updateSetting("business.logo.url", dataUrl);
      };
      reader.readAsDataURL(file);
      toast.info("Logo preview updated. Save to apply changes.");
    }
  }

  function handleDarkLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setDarkLogoPreview(dataUrl);
        updateSetting("business.logo.darkUrl", dataUrl);
      };
      reader.readAsDataURL(file);
      toast.info("Dark logo preview updated. Save to apply changes.");
    }
  }

  function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFaviconPreview(dataUrl);
        updateSetting("business.favicon.url", dataUrl);
      };
      reader.readAsDataURL(file);
      toast.info("Favicon preview updated. Save to apply changes.");
    }
  }

  function removeLogo() {
    setLogoPreview("");
    updateSetting("business.logo.url", "");
  }

  function removeDarkLogo() {
    setDarkLogoPreview("");
    updateSetting("business.logo.darkUrl", "");
  }

  function removeFavicon() {
    setFaviconPreview("");
    updateSetting("business.favicon.url", "");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="text-muted-foreground">
            Configure your business information displayed across the website
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Basic business information and branding
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={settings["business.name"]}
                onChange={(e) => updateSetting("business.name", e.target.value)}
                placeholder="LLCPad"
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={settings["business.tagline"]}
                onChange={(e) => updateSetting("business.tagline", e.target.value)}
                placeholder="Your Business Formation Partner"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={settings["business.description"]}
              onChange={(e) => updateSetting("business.description", e.target.value)}
              placeholder="A short description of your business..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This appears in the footer and may be used for SEO meta descriptions.
            </p>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Header Display Settings</h4>
            <p className="text-sm text-muted-foreground">
              Choose what to display in the header. At least one option should be enabled.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="display-logo">Show Logo</Label>
                  <p className="text-xs text-muted-foreground">
                    Display the logo image or fallback text
                  </p>
                </div>
                <Switch
                  id="display-logo"
                  checked={settings["business.display.logo"] !== "false"}
                  onCheckedChange={(checked) =>
                    updateSetting("business.display.logo", checked ? "true" : "false")
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="display-name">Show Business Name</Label>
                  <p className="text-xs text-muted-foreground">
                    Display the business name text
                  </p>
                </div>
                <Switch
                  id="display-name"
                  checked={settings["business.display.name"] !== "false"}
                  onCheckedChange={(checked) =>
                    updateSetting("business.display.name", checked ? "true" : "false")
                  }
                />
              </div>
            </div>
            {settings["business.display.logo"] === "false" &&
              settings["business.display.name"] === "false" && (
                <p className="text-sm text-amber-600">
                  ⚠️ Warning: Both logo and name are disabled. At least one should be visible in the header.
                </p>
              )}
          </div>

          <Separator />

          {/* Logo, Dark Logo & Favicon */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Light Logo Upload */}
            <div className="space-y-4">
              <Label>Logo (Light Background)</Label>
              <p className="text-xs text-muted-foreground -mt-2">
                Used on light backgrounds and headers
              </p>
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-white overflow-hidden">
                  {logoPreview ? (
                    <>
                      <Image
                        src={logoPreview}
                        alt="Logo"
                        fill
                        className="object-contain p-2"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                      <span className="text-xl font-bold text-primary-foreground">
                        {settings["business.logo.text"] || "L"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
              {!logoPreview && !darkLogoPreview && (
                <div className="space-y-2">
                  <Label className="text-sm">Logo Text (Fallback)</Label>
                  <Input
                    value={settings["business.logo.text"]}
                    onChange={(e) => updateSetting("business.logo.text", e.target.value)}
                    placeholder="L"
                    maxLength={2}
                    className="w-20"
                  />
                </div>
              )}
            </div>

            {/* Dark Logo Upload */}
            <div className="space-y-4">
              <Label>Logo (Dark Background)</Label>
              <p className="text-xs text-muted-foreground -mt-2">
                Used on dark backgrounds like footer
              </p>
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-slate-800 overflow-hidden">
                  {darkLogoPreview ? (
                    <>
                      <Image
                        src={darkLogoPreview}
                        alt="Dark Logo"
                        fill
                        className="object-contain p-2"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeDarkLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : logoPreview ? (
                    <>
                      <Image
                        src={logoPreview}
                        alt="Logo fallback"
                        fill
                        className="object-contain p-2 opacity-50"
                      />
                      <span className="absolute text-[8px] text-white/60 bottom-1">fallback</span>
                    </>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                      <span className="text-xl font-bold text-white">
                        {settings["business.logo.text"] || "L"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={darkLogoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleDarkLogoUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => darkLogoInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Light colored or white logo
                  </p>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-4">
              <Label>Favicon</Label>
              <p className="text-xs text-muted-foreground -mt-2">
                Browser tab icon (32x32px)
              </p>
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
                  {faviconPreview ? (
                    <>
                      <Image
                        src={faviconPreview}
                        alt="Favicon"
                        fill
                        className="object-contain p-1"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={removeFavicon}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <Globe className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    className="hidden"
                    accept="image/*,.ico"
                    onChange={handleFaviconUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => faviconInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Favicon
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    32x32px, ICO or PNG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Contact details displayed on the website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Contact Email
              </Label>
              <Input
                type="email"
                value={settings["business.contact.email"]}
                onChange={(e) => updateSetting("business.contact.email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Support Email
              </Label>
              <Input
                type="email"
                value={settings["business.support.email"]}
                onChange={(e) => updateSetting("business.support.email", e.target.value)}
                placeholder="support@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              value={settings["business.contact.phone"]}
              onChange={(e) => updateSetting("business.contact.phone", e.target.value)}
              placeholder="+1 (234) 567-890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle>Business Address</CardTitle>
              <CardDescription>
                Physical address displayed in the footer
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Address Line 1</Label>
            <Input
              value={settings["business.address.line1"]}
              onChange={(e) => updateSetting("business.address.line1", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>
          <div className="space-y-2">
            <Label>Address Line 2 (Optional)</Label>
            <Input
              value={settings["business.address.line2"]}
              onChange={(e) => updateSetting("business.address.line2", e.target.value)}
              placeholder="Suite 100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={settings["business.address.city"]}
                onChange={(e) => updateSetting("business.address.city", e.target.value)}
                placeholder="Sheridan"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={settings["business.address.state"]}
                onChange={(e) => updateSetting("business.address.state", e.target.value)}
                placeholder="WY"
              />
            </div>
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                value={settings["business.address.zip"]}
                onChange={(e) => updateSetting("business.address.zip", e.target.value)}
                placeholder="82801"
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={settings["business.address.country"]}
                onChange={(e) => updateSetting("business.address.country", e.target.value)}
                placeholder="USA"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Links to your social media profiles (leave empty to hide)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-[#1877F2]" />
                Facebook
              </Label>
              <Input
                value={settings["business.social.facebook"]}
                onChange={(e) => updateSetting("business.social.facebook", e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                Twitter / X
              </Label>
              <Input
                value={settings["business.social.twitter"]}
                onChange={(e) => updateSetting("business.social.twitter", e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                LinkedIn
              </Label>
              <Input
                value={settings["business.social.linkedin"]}
                onChange={(e) => updateSetting("business.social.linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-[#E4405F]" />
                Instagram
              </Label>
              <Input
                value={settings["business.social.instagram"]}
                onChange={(e) => updateSetting("business.social.instagram", e.target.value)}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-[#FF0000]" />
                YouTube
              </Label>
              <Input
                value={settings["business.social.youtube"]}
                onChange={(e) => updateSetting("business.social.youtube", e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TikTokIcon className="h-4 w-4" />
                TikTok
              </Label>
              <Input
                value={settings["business.social.tiktok"]}
                onChange={(e) => updateSetting("business.social.tiktok", e.target.value)}
                placeholder="https://tiktok.com/@yourhandle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-blue-900">
                Changes Apply Site-Wide
              </p>
              <p className="text-sm text-blue-700">
                The information you enter here will automatically update the
                header, footer, and all pages across your website. Logo and
                business name will also appear in the admin dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
