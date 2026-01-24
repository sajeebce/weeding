"use client";

import { useState } from "react";
import { Monitor, Link as LinkIcon, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker as BaseColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";

// ============================================
// FORM FIELD WRAPPER
// ============================================

interface FormFieldProps {
  label: string;
  description?: string;
  responsive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  description,
  responsive,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {responsive && (
          <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ============================================
// TEXT INPUT
// ============================================

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  icon?: React.ElementType;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  description,
  icon: Icon,
}: TextInputProps) {
  return (
    <FormField label={label} description={description}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(Icon && "pl-9")}
        />
      </div>
    </FormField>
  );
}

// ============================================
// LINK INPUT
// ============================================

interface LinkInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  openInNewTab?: boolean;
  onOpenInNewTabChange?: (value: boolean) => void;
}

export function LinkInput({
  label,
  value,
  onChange,
  placeholder,
  openInNewTab,
  onOpenInNewTabChange,
}: LinkInputProps) {
  return (
    <FormField label={label}>
      <div className="space-y-2">
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "/page-url or https://..."}
            className="pr-9"
          />
          <LinkIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {onOpenInNewTabChange && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Open in new tab</span>
            <Switch
              checked={openInNewTab ?? false}
              onCheckedChange={onOpenInNewTabChange}
              className="scale-75"
            />
          </div>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// TEXT AREA INPUT
// ============================================

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  action?: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
  };
}

export function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  action,
}: TextAreaInputProps) {
  return (
    <FormField label={label}>
      {action && (
        <div className="flex justify-end -mb-1">
          <button
            onClick={action.onClick}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {action.icon && <action.icon className="h-3 w-3" />}
            {action.label}
          </button>
        </div>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </FormField>
  );
}

// ============================================
// TOGGLE SWITCH
// ============================================

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ============================================
// SELECT DROPDOWN
// ============================================

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  description?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  description,
}: SelectInputProps) {
  return (
    <FormField label={label} description={description}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

// ============================================
// COLOR PICKER (with preset colors)
// ============================================

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <FormField label={label}>
      <BaseColorPicker value={value} onChange={onChange} />
    </FormField>
  );
}

// Alias for ColorPicker
export const ColorInput = ColorPicker;

// ============================================
// NUMBER INPUT
// ============================================

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  description,
}: NumberInputProps) {
  return (
    <FormField label={label} description={description}>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        {unit && (
          <span className="text-sm text-muted-foreground shrink-0">{unit}</span>
        )}
      </div>
    </FormField>
  );
}

// ============================================
// SLIDER INPUT
// ============================================

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  responsive?: boolean;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  responsive,
}: SliderInputProps) {
  return (
    <FormField label={label} responsive={responsive}>
      <div className="flex items-center gap-4">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <span className="w-16 text-right text-sm text-muted-foreground">
          {value}{unit}
        </span>
      </div>
    </FormField>
  );
}

// ============================================
// ICON BUTTON GROUP
// ============================================

interface IconButtonGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    icon: React.ElementType;
    tooltip?: string;
  }>;
  responsive?: boolean;
}

export function IconButtonGroup({
  label,
  value,
  onChange,
  options,
  responsive,
}: IconButtonGroupProps) {
  return (
    <FormField label={label} responsive={responsive}>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded border transition-colors",
              value === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-accent"
            )}
            title={option.tooltip}
          >
            <option.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </FormField>
  );
}

// ============================================
// SPACING CONTROL
// ============================================

interface SpacingControlProps {
  label: string;
  value: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  onChange: (value: { top: number; right: number; bottom: number; left: number }) => void;
  linked?: boolean;
  onLinkedChange?: (linked: boolean) => void;
}

export function SpacingControl({
  label,
  value,
  onChange,
  linked = true,
  onLinkedChange,
}: SpacingControlProps) {
  const [isLinked, setIsLinked] = useState(linked);

  const handleChange = (side: "top" | "right" | "bottom" | "left", newValue: number) => {
    if (isLinked) {
      onChange({ top: newValue, right: newValue, bottom: newValue, left: newValue });
    } else {
      onChange({ ...value, [side]: newValue });
    }
  };

  return (
    <FormField label={label} responsive>
      <div className="relative rounded-lg border p-4">
        {/* Top */}
        <div className="flex justify-center">
          <Input
            type="number"
            value={value.top}
            onChange={(e) => handleChange("top", parseInt(e.target.value) || 0)}
            className="h-7 w-16 text-center text-xs"
          />
        </div>

        {/* Middle Row */}
        <div className="my-2 flex items-center justify-between">
          <Input
            type="number"
            value={value.left}
            onChange={(e) => handleChange("left", parseInt(e.target.value) || 0)}
            className="h-7 w-16 text-center text-xs"
          />
          <button
            onClick={() => {
              setIsLinked(!isLinked);
              onLinkedChange?.(!isLinked);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded",
              isLinked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <Input
            type="number"
            value={value.right}
            onChange={(e) => handleChange("right", parseInt(e.target.value) || 0)}
            className="h-7 w-16 text-center text-xs"
          />
        </div>

        {/* Bottom */}
        <div className="flex justify-center">
          <Input
            type="number"
            value={value.bottom}
            onChange={(e) => handleChange("bottom", parseInt(e.target.value) || 0)}
            className="h-7 w-16 text-center text-xs"
          />
        </div>

        {/* Labels */}
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] text-muted-foreground">
          Top
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
          Bottom
        </span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          Left
        </span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          Right
        </span>
      </div>
    </FormField>
  );
}
