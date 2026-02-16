"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  RotateCcw,
  ArrowLeft,
  Palette,
  Type,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import type {
  ThemeColorPalette,
  ThemeColorValues,
  ThemeFontConfig,
} from "@/lib/theme/theme-types";
import { DEFAULT_FONT_CONFIG } from "@/lib/theme/theme-types";

// ---- Color Groups ----

interface ColorGroup {
  title: string;
  description: string;
  keys: (keyof ThemeColorValues)[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    title: "Base",
    description: "Page background and main text color",
    keys: ["background", "foreground"],
  },
  {
    title: "Primary",
    description: "Primary buttons, links, and accents",
    keys: ["primary", "primary-foreground"],
  },
  {
    title: "Secondary",
    description: "Secondary buttons and UI elements",
    keys: ["secondary", "secondary-foreground"],
  },
  {
    title: "Muted",
    description: "Subtle backgrounds and secondary text",
    keys: ["muted", "muted-foreground"],
  },
  {
    title: "Accent",
    description: "Highlighted interactive elements",
    keys: ["accent", "accent-foreground"],
  },
  {
    title: "Card & Popover",
    description: "Cards, dropdowns, and overlay panels",
    keys: ["card", "card-foreground", "popover", "popover-foreground"],
  },
  {
    title: "Destructive",
    description: "Error states, delete actions, warnings",
    keys: ["destructive", "destructive-foreground"],
  },
  {
    title: "Borders & Input",
    description: "Form inputs, borders, and focus rings",
    keys: ["border", "input", "ring"],
  },
];

// ---- Human-readable labels ----

const COLOR_LABELS: Record<string, string> = {
  background: "Background",
  foreground: "Foreground",
  primary: "Primary",
  "primary-foreground": "Primary Text",
  secondary: "Secondary",
  "secondary-foreground": "Secondary Text",
  muted: "Muted",
  "muted-foreground": "Muted Text",
  accent: "Accent",
  "accent-foreground": "Accent Text",
  card: "Card",
  "card-foreground": "Card Text",
  popover: "Popover",
  "popover-foreground": "Popover Text",
  destructive: "Destructive",
  "destructive-foreground": "Destructive Text",
  border: "Border",
  input: "Input Border",
  ring: "Focus Ring",
};

// ---- Google Fonts list ----

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Raleway",
  "Ubuntu",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "PT Sans",
  "Oswald",
  "Noto Sans",
  "Rubik",
  "Work Sans",
  "DM Sans",
  "Outfit",
  "Plus Jakarta Sans",
  "Manrope",
  "Space Grotesk",
  "Sora",
  "Lexend",
  "Figtree",
];

// ---- Default empty palette ----

const EMPTY_PALETTE: ThemeColorPalette = {
  light: {
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    "card-foreground": "#0f172a",
    popover: "#ffffff",
    "popover-foreground": "#0f172a",
    primary: "#F97316",
    "primary-foreground": "#ffffff",
    secondary: "#0A0F1E",
    "secondary-foreground": "#ffffff",
    muted: "#F1F5F9",
    "muted-foreground": "#64748B",
    accent: "#F97316",
    "accent-foreground": "#ffffff",
    destructive: "#EF4444",
    "destructive-foreground": "#ffffff",
    border: "#E2E8F0",
    input: "#E2E8F0",
    ring: "#F97316",
  },
  dark: {
    background: "#0f172a",
    foreground: "#f8fafc",
    card: "#0f172a",
    "card-foreground": "#f8fafc",
    popover: "#0f172a",
    "popover-foreground": "#f8fafc",
    primary: "#F97316",
    "primary-foreground": "#ffffff",
    secondary: "#1e293b",
    "secondary-foreground": "#f8fafc",
    muted: "#1e293b",
    "muted-foreground": "#94a3b8",
    accent: "#1e293b",
    "accent-foreground": "#f8fafc",
    destructive: "#7f1d1d",
    "destructive-foreground": "#ffffff",
    border: "#1e293b",
    input: "#1e293b",
    ring: "#F97316",
  },
};

// ---- Color Section Component ----

function ColorSection({
  group,
  values,
  onChange,
}: {
  group: ColorGroup;
  values: ThemeColorValues;
  onChange: (key: keyof ThemeColorValues, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{group.title}</CardTitle>
        <CardDescription className="text-sm">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {group.keys.map((key) => (
            <ColorPicker
              key={key}
              label={COLOR_LABELS[key] || key}
              value={values[key] || "#000000"}
              onChange={(val) => onChange(key, val)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Font Preview Component ----

function FontPreview({ fontFamily }: { fontFamily: string }) {
  return (
    <div className="rounded-lg border p-4 bg-background">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700&display=swap`}
      />
      <p
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
        className="text-2xl font-bold mb-2"
      >
        The quick brown fox
      </p>
      <p
        style={{ fontFamily: `"${fontFamily}", sans-serif` }}
        className="text-base"
      >
        jumps over the lazy dog. 0123456789
      </p>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ThemeCustomizePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [colorPalette, setColorPalette] =
    useState<ThemeColorPalette>(EMPTY_PALETTE);
  const [originalColorPalette, setOriginalColorPalette] =
    useState<ThemeColorPalette | null>(null);
  const [fontConfig, setFontConfig] =
    useState<ThemeFontConfig>(DEFAULT_FONT_CONFIG);
  const [initialState, setInitialState] = useState<{
    colorPalette: ThemeColorPalette;
    fontConfig: ThemeFontConfig;
  } | null>(null);
  const [noTheme, setNoTheme] = useState(false);

  // Track if there are unsaved changes
  const hasChanges =
    initialState !== null &&
    JSON.stringify({ colorPalette, fontConfig }) !==
      JSON.stringify(initialState);

  // Fetch current theme customization
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/themes/customize");
        if (res.status === 404) {
          setNoTheme(true);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const palette = data.colorPalette || EMPTY_PALETTE;
        const fonts = data.fontConfig || DEFAULT_FONT_CONFIG;

        setThemeName(data.themeName || "");
        setColorPalette(palette);
        setOriginalColorPalette(data.originalColorPalette || palette);
        setFontConfig(fonts);
        setInitialState({ colorPalette: palette, fontConfig: fonts });
      } catch (error) {
        console.error("Error fetching theme data:", error);
        toast.error("Failed to load theme customization");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update a single color value
  const updateColor = useCallback(
    (mode: "light" | "dark", key: keyof ThemeColorValues, value: string) => {
      setColorPalette((prev) => ({
        ...prev,
        [mode]: { ...prev[mode], [key]: value },
      }));
    },
    []
  );

  // Save customization
  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/themes/customize", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorPalette, fontConfig }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      setInitialState({ colorPalette, fontConfig });
      toast.success("Theme customization saved! Refresh the site to see changes.");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save customization"
      );
    } finally {
      setSaving(false);
    }
  }

  // Reset colors to original theme palette
  function handleResetColors() {
    if (!originalColorPalette) return;
    setColorPalette(originalColorPalette);
    toast.info("Colors reset to original theme defaults. Click Save to apply.");
  }

  // Reset fonts to defaults
  function handleResetFonts() {
    setFontConfig(DEFAULT_FONT_CONFIG);
    toast.info("Fonts reset to defaults. Click Save to apply.");
  }

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Theme Customizer</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // ---- No Active Theme ----
  if (noTheme) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Theme Customizer</h1>
          <p className="text-muted-foreground">
            No active theme found. Please activate a theme first.
          </p>
        </div>
        <div className="text-center py-16">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground mb-4">
            No Active Theme
          </p>
          <Button asChild>
            <Link href="/admin/appearance/themes">Go to Theme Gallery</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/appearance/themes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Theme Customizer</h1>
            <p className="text-muted-foreground text-sm">
              Customize colors and fonts for &ldquo;{themeName}&rdquo;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetColors}
            disabled={saving || !originalColorPalette}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Colors
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Tabs: Colors / Fonts */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="fonts" className="gap-2">
            <Type className="h-4 w-4" />
            Fonts
          </TabsTrigger>
        </TabsList>

        {/* ---- Colors Tab ---- */}
        <TabsContent value="colors" className="space-y-6">
          {/* Light / Dark mode sub-tabs */}
          <Tabs defaultValue="light" className="space-y-4">
            <TabsList>
              <TabsTrigger value="light" className="gap-2">
                <Sun className="h-4 w-4" />
                Light Mode
              </TabsTrigger>
              <TabsTrigger value="dark" className="gap-2">
                <Moon className="h-4 w-4" />
                Dark Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-4">
              {COLOR_GROUPS.map((group) => (
                <ColorSection
                  key={group.title}
                  group={group}
                  values={colorPalette.light}
                  onChange={(key, value) => updateColor("light", key, value)}
                />
              ))}
            </TabsContent>

            <TabsContent value="dark" className="space-y-4">
              {COLOR_GROUPS.map((group) => (
                <ColorSection
                  key={group.title}
                  group={group}
                  values={colorPalette.dark}
                  onChange={(key, value) => updateColor("dark", key, value)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ---- Fonts Tab ---- */}
        <TabsContent value="fonts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription>
                Choose fonts for headings and body text. Fonts are loaded from
                Google Fonts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Heading Font */}
                <div className="space-y-3">
                  <Label>Heading Font</Label>
                  <Select
                    value={fontConfig.headingFont}
                    onValueChange={(val) =>
                      setFontConfig((prev) => ({ ...prev, headingFont: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select heading font" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FontPreview fontFamily={fontConfig.headingFont} />
                </div>

                {/* Body Font */}
                <div className="space-y-3">
                  <Label>Body Font</Label>
                  <Select
                    value={fontConfig.bodyFont}
                    onValueChange={(val) =>
                      setFontConfig((prev) => ({ ...prev, bodyFont: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body font" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FontPreview fontFamily={fontConfig.bodyFont} />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFonts}
                  disabled={saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Fonts to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
