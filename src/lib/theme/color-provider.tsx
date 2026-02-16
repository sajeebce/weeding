import prisma from "@/lib/db";
import type { ThemeColorPalette, ThemeFontConfig } from "./theme-types";

interface ActiveThemeData {
  colorPalette: ThemeColorPalette | null;
  fontConfig: ThemeFontConfig | null;
}

/**
 * Reads the active theme's color palette and font config from the database.
 */
async function getActiveThemeData(): Promise<ActiveThemeData> {
  try {
    const activeTheme = await prisma.activeTheme.findFirst();
    if (!activeTheme) return { colorPalette: null, fontConfig: null };
    return {
      colorPalette: activeTheme.colorPalette as unknown as ThemeColorPalette | null,
      fontConfig: activeTheme.fontConfig as unknown as ThemeFontConfig | null,
    };
  } catch {
    // Table may not exist yet during initial setup
    return { colorPalette: null, fontConfig: null };
  }
}

/**
 * Generates CSS variable overrides from a color palette.
 * These override the Tailwind v4 @theme variables defined in globals.css.
 */
function generateColorCSS(palette: ThemeColorPalette): string {
  const lightVars = Object.entries(palette.light)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n");

  const darkVars = Object.entries(palette.dark)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n");

  return `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}`;
}

/**
 * Generates CSS for custom font overrides.
 */
function generateFontCSS(fontConfig: ThemeFontConfig): string {
  const bodyFallback = "ui-sans-serif, system-ui, sans-serif";
  const headingFallback = "ui-sans-serif, system-ui, sans-serif";

  return `:root {\n  --font-sans: "${fontConfig.bodyFont}", ${bodyFallback};\n  --font-heading: "${fontConfig.headingFont}", ${headingFallback};\n}`;
}

/**
 * Builds a Google Fonts CSS URL for the given font config.
 */
function getGoogleFontsUrl(fontConfig: ThemeFontConfig): string {
  const families = new Set([fontConfig.bodyFont, fontConfig.headingFont]);
  const params = Array.from(families)
    .map(
      (f) =>
        `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/**
 * Server component that injects theme color and font CSS into the page.
 * Place this in the root layout, inside <head> or at the top of <body>.
 *
 * If no active theme is set, renders nothing (falls back to globals.css defaults).
 */
export async function ThemeColorProvider() {
  const { colorPalette, fontConfig } = await getActiveThemeData();

  if (!colorPalette && !fontConfig) return null;

  const colorCSS = colorPalette ? generateColorCSS(colorPalette) : "";
  const fontCSS = fontConfig ? generateFontCSS(fontConfig) : "";
  const combinedCSS = [colorCSS, fontCSS].filter(Boolean).join("\n\n");

  return (
    <>
      {fontConfig && (
        <link
          rel="stylesheet"
          href={getGoogleFontsUrl(fontConfig)}
          data-theme-fonts=""
        />
      )}
      {combinedCSS && (
        <style
          dangerouslySetInnerHTML={{ __html: combinedCSS }}
          data-theme-colors=""
        />
      )}
    </>
  );
}
