"use client";

import type { ImageWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_IMAGE_SETTINGS } from "@/lib/page-builder/defaults";
import {
  TextInput,
  SelectInput,
  NumberInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { ImageUpload } from "@/app/admin/appearance/landing-page/components/ui/image-upload";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { ColorPicker } from "@/components/ui/color-picker";

interface ImageWidgetSettingsProps {
  settings: ImageWidgetSettings;
  onChange: (settings: ImageWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function ImageWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: ImageWidgetSettingsProps) {
  // Deep merge with defaults - use explicit typing to handle optional fields
  const s = {
    ...DEFAULT_IMAGE_SETTINGS,
    ...settings,
    border: { ...DEFAULT_IMAGE_SETTINGS.border, ...(settings.border || {}) },
    caption: { ...DEFAULT_IMAGE_SETTINGS.caption, ...(settings.caption || {}) },
    overlay: { ...DEFAULT_IMAGE_SETTINGS.overlay, ...(settings.overlay || {}) },
    parallax: { ...DEFAULT_IMAGE_SETTINGS.parallax, ...(settings.parallax || {}) },
    filters: { ...DEFAULT_IMAGE_SETTINGS.filters, ...(settings.filters || {}) },
  } as ImageWidgetSettings;

  const updateField = <K extends keyof ImageWidgetSettings>(
    key: K,
    value: ImageWidgetSettings[K]
  ) => {
    onChange({ ...s, [key]: value });
  };

  const updateNestedField = <K extends keyof ImageWidgetSettings>(
    key: K,
    nestedKey: string,
    value: unknown
  ) => {
    onChange({
      ...s,
      [key]: {
        ...(s[key] as Record<string, unknown>),
        [nestedKey]: value,
      },
    });
  };

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Image Upload */}
      <AccordionSection title="Image" defaultOpen>
        <div className="space-y-3">
          <ImageUpload
            label="Image Source"
            description="Recommended: WebP or optimized images"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            value={s.src}
            onChange={(url) => updateField("src", url)}
          />
          <TextInput
            label="Alt Text"
            value={s.alt}
            onChange={(v) => updateField("alt", v)}
            placeholder="Describe the image"
            description="Important for SEO and accessibility"
          />
          <TextInput
            label="Title (Tooltip)"
            value={s.title || ""}
            onChange={(v) => updateField("title", v)}
            placeholder="Optional tooltip text"
          />
          <ToggleSwitch
            label="Open in Lightbox"
            checked={s.lightbox}
            onChange={(v) => updateField("lightbox", v)}
            description="Click anywhere on image to view fullscreen"
          />
        </div>
      </AccordionSection>

      {/* Link Options */}
      <AccordionSection title="Link">
        <div className="space-y-3">
          <TextInput
            label="Link URL"
            value={s.link?.url || ""}
            onChange={(v) =>
              updateField("link", v ? { ...s.link, url: v, openInNewTab: s.link?.openInNewTab || false } : undefined)
            }
            placeholder="https://..."
          />
          {s.link?.url && (
            <ToggleSwitch
              label="Open in New Tab"
              checked={s.link?.openInNewTab || false}
              onChange={(v) => updateNestedField("link", "openInNewTab", v)}
            />
          )}
        </div>
      </AccordionSection>

      {/* Caption */}
      <AccordionSection title="Caption">
        <div className="space-y-3">
          <ToggleSwitch
            label="Show Caption"
            checked={s.caption?.enabled || false}
            onChange={(v) => updateNestedField("caption", "enabled", v)}
          />
          {s.caption?.enabled && (
            <>
              <TextInput
                label="Caption Text"
                value={s.caption?.text || ""}
                onChange={(v) => updateNestedField("caption", "text", v)}
                placeholder="Enter caption"
              />
              <SelectInput
                label="Position"
                value={s.caption?.position || "below"}
                onChange={(v) => updateNestedField("caption", "position", v)}
                options={[
                  { value: "below", label: "Below Image" },
                  { value: "overlay-bottom", label: "Overlay - Bottom" },
                  { value: "overlay-top", label: "Overlay - Top" },
                  { value: "overlay-center", label: "Overlay - Center" },
                ]}
              />
              <SelectInput
                label="Font Size"
                value={s.caption?.fontSize || "sm"}
                onChange={(v) => updateNestedField("caption", "fontSize", v)}
                options={[
                  { value: "xs", label: "Extra Small" },
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
              <ColorPicker
                label="Text Color"
                value={s.caption?.textColor || "#ffffff"}
                onChange={(v) => updateNestedField("caption", "textColor", v)}
              />
              {s.caption?.position !== "below" && (
                <>
                  <ColorPicker
                    label="Background Color"
                    value={s.caption?.backgroundColor || "#000000"}
                    onChange={(v) => updateNestedField("caption", "backgroundColor", v)}
                  />
                  <NumberInput
                    label="Background Opacity"
                    value={(s.caption?.backgroundOpacity ?? 0.7) * 100}
                    onChange={(v) => updateNestedField("caption", "backgroundOpacity", v / 100)}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                  />
                </>
              )}
            </>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-4">
      {/* Size & Fit */}
      <AccordionSection title="Size & Fit" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Aspect Ratio"
            value={s.aspectRatio}
            onChange={(v) => updateField("aspectRatio", v as ImageWidgetSettings["aspectRatio"])}
            options={[
              { value: "auto", label: "Auto" },
              { value: "1:1", label: "Square (1:1)" },
              { value: "4:3", label: "Standard (4:3)" },
              { value: "16:9", label: "Widescreen (16:9)" },
              { value: "3:2", label: "Photo (3:2)" },
              { value: "2:3", label: "Portrait (2:3)" },
              { value: "9:16", label: "Vertical (9:16)" },
              { value: "21:9", label: "Cinematic (21:9)" },
            ]}
          />
          <SelectInput
            label="Object Fit"
            value={s.objectFit}
            onChange={(v) => updateField("objectFit", v as ImageWidgetSettings["objectFit"])}
            options={[
              { value: "cover", label: "Cover" },
              { value: "contain", label: "Contain" },
              { value: "fill", label: "Fill" },
              { value: "none", label: "None" },
              { value: "scale-down", label: "Scale Down" },
            ]}
          />
          <NumberInput
            label="Max Width"
            value={s.maxWidth || 100}
            onChange={(v) => updateField("maxWidth", v)}
            min={10}
            max={100}
            step={5}
            unit="%"
          />
          <SelectInput
            label="Alignment"
            value={s.alignment}
            onChange={(v) => updateField("alignment", v as ImageWidgetSettings["alignment"])}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </div>
      </AccordionSection>

      {/* Border & Shadow */}
      <AccordionSection title="Border & Shadow">
        <div className="space-y-3">
          <NumberInput
            label="Border Radius"
            value={s.borderRadius}
            onChange={(v) => updateField("borderRadius", v)}
            min={0}
            max={100}
            step={2}
            unit="px"
          />
          <NumberInput
            label="Border Width"
            value={s.border.width}
            onChange={(v) => updateNestedField("border", "width", v)}
            min={0}
            max={10}
            step={1}
            unit="px"
          />
          {s.border.width > 0 && (
            <>
              <ColorPicker
                label="Border Color"
                value={s.border.color}
                onChange={(v) => updateNestedField("border", "color", v)}
              />
              <SelectInput
                label="Border Style"
                value={s.border.style}
                onChange={(v) => updateNestedField("border", "style", v)}
                options={[
                  { value: "solid", label: "Solid" },
                  { value: "dashed", label: "Dashed" },
                  { value: "dotted", label: "Dotted" },
                  { value: "double", label: "Double" },
                ]}
              />
            </>
          )}
          <SelectInput
            label="Shadow"
            value={s.shadow}
            onChange={(v) => updateField("shadow", v as ImageWidgetSettings["shadow"])}
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
              { value: "2xl", label: "2X Large" },
              { value: "inner", label: "Inner" },
              { value: "glow", label: "Glow" },
            ]}
          />
          {s.shadow === "glow" && (
            <ColorPicker
              label="Glow Color"
              value={s.shadowColor || "#f97316"}
              onChange={(v) => updateField("shadowColor", v)}
            />
          )}
        </div>
      </AccordionSection>

      {/* Mask/Shape */}
      <AccordionSection title="Shape / Mask">
        <div className="space-y-3">
          <SelectInput
            label="Image Shape"
            value={s.mask}
            onChange={(v) => updateField("mask", v as ImageWidgetSettings["mask"])}
            options={[
              { value: "none", label: "Default" },
              { value: "circle", label: "Circle" },
              { value: "rounded-lg", label: "Rounded Large" },
              { value: "rounded-xl", label: "Rounded XL" },
              { value: "hexagon", label: "Hexagon" },
              { value: "blob", label: "Blob" },
              { value: "diamond", label: "Diamond" },
              { value: "triangle", label: "Triangle" },
            ]}
          />
        </div>
      </AccordionSection>

      {/* Overlay */}
      <AccordionSection title="Overlay">
        <div className="space-y-3">
          <ToggleSwitch
            label="Enable Overlay"
            checked={s.overlay?.enabled || false}
            onChange={(v) => updateNestedField("overlay", "enabled", v)}
          />
          {s.overlay?.enabled && (
            <>
              <ColorPicker
                label="Overlay Color"
                value={s.overlay?.color || "#000000"}
                onChange={(v) => updateNestedField("overlay", "color", v)}
              />
              <NumberInput
                label="Opacity"
                value={(s.overlay?.opacity || 0.3) * 100}
                onChange={(v) => updateNestedField("overlay", "opacity", v / 100)}
                min={0}
                max={100}
                step={5}
                unit="%"
              />
              <ToggleSwitch
                label="Show on Hover Only"
                checked={s.overlay?.showOnHover || false}
                onChange={(v) => updateNestedField("overlay", "showOnHover", v)}
              />
            </>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      {/* Hover Effects */}
      <AccordionSection title="Hover Effect" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Hover Effect"
            value={s.hoverEffect}
            onChange={(v) => updateField("hoverEffect", v as ImageWidgetSettings["hoverEffect"])}
            options={[
              { value: "none", label: "None" },
              { value: "zoom", label: "Zoom In" },
              { value: "zoom-out", label: "Zoom Out" },
              { value: "brighten", label: "Brighten" },
              { value: "darken", label: "Darken" },
              { value: "grayscale", label: "Grayscale" },
              { value: "blur", label: "Blur" },
              { value: "rotate", label: "Rotate" },
              { value: "tilt-left", label: "Tilt Left" },
              { value: "tilt-right", label: "Tilt Right" },
              { value: "lift", label: "Lift Up" },
              { value: "glow", label: "Glow" },
              { value: "shine", label: "Shine" },
              { value: "overlay-fade", label: "Overlay Fade" },
            ]}
          />
          <NumberInput
            label="Transition Duration"
            value={s.hoverTransitionDuration}
            onChange={(v) => updateField("hoverTransitionDuration", v)}
            min={100}
            max={1000}
            step={50}
            unit="ms"
          />
        </div>
      </AccordionSection>

      {/* Entrance Animation */}
      <AccordionSection title="Entrance Animation">
        <div className="space-y-3">
          <SelectInput
            label="Animation"
            value={s.animation}
            onChange={(v) => updateField("animation", v as ImageWidgetSettings["animation"])}
            options={[
              { value: "none", label: "None" },
              { value: "fade", label: "Fade In" },
              { value: "slide-up", label: "Slide Up" },
              { value: "slide-down", label: "Slide Down" },
              { value: "slide-left", label: "Slide Left" },
              { value: "slide-right", label: "Slide Right" },
              { value: "zoom-in", label: "Zoom In" },
              { value: "zoom-out", label: "Zoom Out" },
              { value: "flip", label: "Flip" },
              { value: "rotate", label: "Rotate" },
            ]}
          />
          {s.animation !== "none" && (
            <>
              <NumberInput
                label="Duration"
                value={s.animationDuration}
                onChange={(v) => updateField("animationDuration", v)}
                min={200}
                max={2000}
                step={100}
                unit="ms"
              />
              <NumberInput
                label="Delay"
                value={s.animationDelay}
                onChange={(v) => updateField("animationDelay", v)}
                min={0}
                max={2000}
                step={100}
                unit="ms"
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Float Animation */}
      <AccordionSection title="Continuous Animation">
        <div className="space-y-3">
          <SelectInput
            label="Float Animation"
            value={s.floatAnimation}
            onChange={(v) => updateField("floatAnimation", v as ImageWidgetSettings["floatAnimation"])}
            options={[
              { value: "none", label: "None" },
              { value: "float", label: "Float" },
              { value: "pulse", label: "Pulse" },
              { value: "bounce", label: "Bounce" },
              { value: "swing", label: "Swing" },
              { value: "wobble", label: "Wobble" },
            ]}
          />
        </div>
      </AccordionSection>

      {/* Parallax */}
      <AccordionSection title="Parallax Effect">
        <div className="space-y-3">
          <ToggleSwitch
            label="Enable Parallax"
            checked={s.parallax?.enabled || false}
            onChange={(v) => updateNestedField("parallax", "enabled", v)}
          />
          {s.parallax?.enabled && (
            <>
              <NumberInput
                label="Speed"
                value={(s.parallax?.speed || 0.5) * 10}
                onChange={(v) => updateNestedField("parallax", "speed", v / 10)}
                min={1}
                max={10}
                step={1}
              />
              <SelectInput
                label="Direction"
                value={s.parallax?.direction || "vertical"}
                onChange={(v) => updateNestedField("parallax", "direction", v)}
                options={[
                  { value: "vertical", label: "Vertical" },
                  { value: "horizontal", label: "Horizontal" },
                ]}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Filters */}
      <AccordionSection title="Image Filters">
        <div className="space-y-3">
          <NumberInput
            label="Brightness"
            value={s.filters?.brightness || 100}
            onChange={(v) => updateNestedField("filters", "brightness", v)}
            min={0}
            max={200}
            step={5}
            unit="%"
          />
          <NumberInput
            label="Contrast"
            value={s.filters?.contrast || 100}
            onChange={(v) => updateNestedField("filters", "contrast", v)}
            min={0}
            max={200}
            step={5}
            unit="%"
          />
          <NumberInput
            label="Saturation"
            value={s.filters?.saturation || 100}
            onChange={(v) => updateNestedField("filters", "saturation", v)}
            min={0}
            max={200}
            step={5}
            unit="%"
          />
          <NumberInput
            label="Blur"
            value={s.filters?.blur || 0}
            onChange={(v) => updateNestedField("filters", "blur", v)}
            min={0}
            max={20}
            step={1}
            unit="px"
          />
          <NumberInput
            label="Grayscale"
            value={s.filters?.grayscale || 0}
            onChange={(v) => updateNestedField("filters", "grayscale", v)}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
          <NumberInput
            label="Sepia"
            value={s.filters?.sepia || 0}
            onChange={(v) => updateNestedField("filters", "sepia", v)}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
          <NumberInput
            label="Hue Rotate"
            value={s.filters?.hueRotate || 0}
            onChange={(v) => updateNestedField("filters", "hueRotate", v)}
            min={0}
            max={360}
            step={10}
            unit="deg"
          />
        </div>
      </AccordionSection>

      {/* Performance */}
      <AccordionSection title="Performance">
        <div className="space-y-3">
          <ToggleSwitch
            label="Lazy Load"
            checked={s.lazyLoad}
            onChange={(v) => updateField("lazyLoad", v)}
            description="Defer loading until visible"
          />
          <ToggleSwitch
            label="Priority (LCP)"
            checked={s.priority}
            onChange={(v) => updateField("priority", v)}
            description="Load immediately for above-fold images"
          />
        </div>
      </AccordionSection>
    </div>
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
