"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Standard preset colors used across the entire application
export const PRESET_COLORS = [
  "#22c55e", // green
  "#f97316", // orange
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#ef4444", // red
  "#eab308", // yellow
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#ffffff", // white
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  presets?: string[];
  showPresets?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
  presets = PRESET_COLORS as unknown as string[],
  showPresets = true,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-md border bg-background px-3 py-2 hover:bg-muted/50 transition-colors">
            <div
              className="h-6 w-6 rounded border shadow-sm shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left text-sm font-mono truncate">
              {value}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start" side="right">
          <div className="space-y-3">
            {/* Preset Colors Grid */}
            {showPresets && (
              <div className="grid grid-cols-5 gap-2">
                {presets.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onChange(color);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "h-8 w-8 rounded-md border-2 transition-transform hover:scale-110",
                      value.toLowerCase() === color.toLowerCase()
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}

            {/* Custom Color Input */}
            <div className={cn(showPresets && "border-t pt-2")}>
              <label className="text-xs text-muted-foreground">
                Custom color
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={value.startsWith("#") ? value : "#000000"}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border bg-transparent"
                />
                <Input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#000000"
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Simple inline version without popover (for tight spaces)
interface InlineColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function InlineColorPicker({
  value,
  onChange,
  className,
}: InlineColorPickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-9 w-12 shrink-0">
        <div
          className="h-full w-full rounded border cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value.startsWith("#") ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="font-mono text-sm"
      />
    </div>
  );
}
