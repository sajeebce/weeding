"use client";

import type { WidgetContainerStyle } from "@/lib/page-builder/types";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Label } from "@/components/ui/label";

interface ContainerStyleSectionProps {
  container: WidgetContainerStyle;
  onChange: (container: WidgetContainerStyle) => void;
}

export function ContainerStyleSection({ container, onChange }: ContainerStyleSectionProps) {
  const update = (updates: Partial<WidgetContainerStyle>) => {
    onChange({ ...container, ...updates });
  };

  return (
    <AccordionSection title="Container Style">
      <div className="space-y-4">
        {/* Background Type */}
        <SelectInput
          label="Background Type"
          value={container.backgroundType || "solid"}
          onChange={(v) => {
            const newType = v as "solid" | "gradient";
            update({
              backgroundType: newType,
              ...(newType === "gradient" && !container.gradientBackground
                ? {
                    gradientBackground: {
                      colors: ["#1e1b4b", "#0f172a"],
                      angle: 135,
                    },
                  }
                : {}),
            });
          }}
          options={[
            { value: "solid", label: "Solid" },
            { value: "gradient", label: "Gradient" },
          ]}
        />
        {/* Solid background color */}
        {(container.backgroundType || "solid") === "solid" && (
          <ColorInput
            label="Background Color"
            value={container.backgroundColor || "transparent"}
            onChange={(v) => update({ backgroundColor: v === "transparent" ? undefined : v })}
          />
        )}
        {/* Gradient background colors */}
        {container.backgroundType === "gradient" && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Gradient Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                <ColorInput
                  label="From"
                  value={container.gradientBackground?.colors?.[0] || "#1e1b4b"}
                  onChange={(v) =>
                    update({
                      gradientBackground: {
                        colors: [v, container.gradientBackground?.colors?.[1] || "#0f172a"],
                        angle: container.gradientBackground?.angle || 135,
                      },
                    })
                  }
                />
                <ColorInput
                  label="To"
                  value={container.gradientBackground?.colors?.[1] || "#0f172a"}
                  onChange={(v) =>
                    update({
                      gradientBackground: {
                        colors: [container.gradientBackground?.colors?.[0] || "#1e1b4b", v],
                        angle: container.gradientBackground?.angle || 135,
                      },
                    })
                  }
                />
              </div>
            </div>
            <NumberInput
              label="Gradient Angle"
              value={container.gradientBackground?.angle || 135}
              onChange={(v) =>
                update({
                  gradientBackground: {
                    colors: container.gradientBackground?.colors || ["#1e1b4b", "#0f172a"],
                    angle: v,
                  },
                })
              }
              min={0}
              max={360}
              step={15}
            />
          </>
        )}
        <NumberInput
          label="Padding"
          value={container.padding}
          onChange={(v) => update({ padding: v })}
          min={0}
          max={64}
          step={4}
        />
        <NumberInput
          label="Border Radius"
          value={container.borderRadius}
          onChange={(v) => update({ borderRadius: v })}
          min={0}
          max={48}
          step={2}
        />
        {/* Gradient Border */}
        <ToggleSwitch
          label="Gradient Border"
          checked={container.gradientBorder?.enabled || false}
          onChange={(v: boolean) =>
            update({
              gradientBorder: {
                enabled: v,
                colors: container.gradientBorder?.colors || ["#ec4899", "#8b5cf6"],
                angle: container.gradientBorder?.angle || 135,
              },
              ...(v && !container.borderWidth ? { borderWidth: 2 } : {}),
            })
          }
        />
        {container.gradientBorder?.enabled && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Border Gradient Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                <ColorInput
                  label="From"
                  value={container.gradientBorder?.colors?.[0] || "#ec4899"}
                  onChange={(v) =>
                    update({
                      gradientBorder: {
                        enabled: true,
                        colors: [v, container.gradientBorder?.colors?.[1] || "#8b5cf6"],
                        angle: container.gradientBorder?.angle || 135,
                      },
                    })
                  }
                />
                <ColorInput
                  label="To"
                  value={container.gradientBorder?.colors?.[1] || "#8b5cf6"}
                  onChange={(v) =>
                    update({
                      gradientBorder: {
                        enabled: true,
                        colors: [container.gradientBorder?.colors?.[0] || "#ec4899", v],
                        angle: container.gradientBorder?.angle || 135,
                      },
                    })
                  }
                />
              </div>
            </div>
            <NumberInput
              label="Border Gradient Angle"
              value={container.gradientBorder?.angle || 135}
              onChange={(v) =>
                update({
                  gradientBorder: {
                    enabled: true,
                    colors: container.gradientBorder?.colors || ["#ec4899", "#8b5cf6"],
                    angle: v,
                  },
                })
              }
              min={0}
              max={360}
              step={15}
            />
            <NumberInput
              label="Border Width"
              value={container.borderWidth || 2}
              onChange={(v) => update({ borderWidth: v })}
              min={1}
              max={6}
            />
          </>
        )}
        <SelectInput
          label="Shadow"
          value={container.shadow || "none"}
          onChange={(v) => update({ shadow: v as "none" | "sm" | "md" | "lg" })}
          options={[
            { value: "none", label: "None" },
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
        <NumberInput
          label="Max Width"
          value={container.maxWidth || 0}
          onChange={(v) => update({ maxWidth: v > 0 ? v : undefined })}
          min={0}
          max={1400}
          step={50}
        />
        {/* Glow Effect */}
        <ToggleSwitch
          label="Glow Effect"
          checked={container.glow?.enabled || false}
          onChange={(v: boolean) =>
            update({
              glow: {
                enabled: v,
                color: container.glow?.color || "#8b5cf6",
                blur: container.glow?.blur ?? 20,
                spread: container.glow?.spread ?? 5,
                opacity: container.glow?.opacity ?? 0.4,
              },
            })
          }
        />
        {container.glow?.enabled && (
          <>
            <ColorInput
              label="Glow Color"
              value={container.glow?.color || "#8b5cf6"}
              onChange={(v) =>
                update({
                  glow: { ...container.glow!, color: v },
                })
              }
            />
            <NumberInput
              label="Blur"
              value={container.glow?.blur ?? 20}
              onChange={(v) =>
                update({
                  glow: { ...container.glow!, blur: v },
                })
              }
              min={0}
              max={80}
              step={2}
              unit="px"
            />
            <NumberInput
              label="Spread"
              value={container.glow?.spread ?? 5}
              onChange={(v) =>
                update({
                  glow: { ...container.glow!, spread: v },
                })
              }
              min={0}
              max={40}
              step={1}
              unit="px"
            />
            <NumberInput
              label="Opacity"
              value={Math.round((container.glow?.opacity ?? 0.4) * 100)}
              onChange={(v) =>
                update({
                  glow: { ...container.glow!, opacity: v / 100 },
                })
              }
              min={5}
              max={100}
              step={5}
              unit="%"
            />
          </>
        )}
      </div>
    </AccordionSection>
  );
}
