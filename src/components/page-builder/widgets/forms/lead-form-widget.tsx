"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LeadFormWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_LEAD_FORM_SETTINGS } from "@/lib/page-builder/defaults";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Helper function to darken a hex color
function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken each component
  const darken = (value: number) => Math.max(0, Math.floor(value * (1 - percent / 100)));

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
}

interface LeadFormWidgetProps {
  settings: Partial<LeadFormWidgetSettings>;
  isPreview?: boolean;
}

export function LeadFormWidget({
  settings: partialSettings,
  isPreview,
}: LeadFormWidgetProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Merge with defaults
  const settings: LeadFormWidgetSettings = {
    ...DEFAULT_LEAD_FORM_SETTINGS,
    ...partialSettings,
  };

  const {
    title,
    description,
    fields,
    submitButton,
    backgroundColor,
    titleColor,
    descriptionColor,
    labelColor,
    inputTextColor,
    padding,
    borderRadius,
    shadow,
  } = settings;

  // Get button styles
  const buttonStyle = submitButton.style || {};
  const buttonBgColor = buttonStyle.bgColor || "#f97316";
  const buttonHoverBgColor = darkenColor(buttonBgColor, 15);

  return (
    <div
      className={cn(
        "w-full",
        shadow && "shadow-lg"
      )}
      style={{
        backgroundColor: backgroundColor || "transparent",
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Title */}
      {title && (
        <h3
          className="text-xl font-semibold mb-2"
          style={{ color: titleColor || "#ffffff" }}
        >
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p
          className="text-sm mb-6"
          style={{ color: descriptionColor || "#94a3b8" }}
        >
          {description}
        </p>
      )}

      {/* Form Fields */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (isPreview) return;
          // Handle form submission
        }}
      >
        {fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium"
              style={{ color: labelColor || "#e2e8f0" }}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                id={field.id}
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}

            {field.type === "email" && (
              <Input
                id={field.id}
                type="email"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}

            {field.type === "phone" && (
              <Input
                id={field.id}
                type="tel"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}

            {field.type === "select" && (
              <Select disabled={isPreview}>
                <SelectTrigger
                  className="bg-slate-800/50 border-slate-700"
                  style={{ color: inputTextColor || "#ffffff" }}
                >
                  <SelectValue placeholder={field.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, idx) => (
                    <SelectItem key={idx} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                disabled={isPreview}
                rows={4}
                className="bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary resize-none"
                style={{ color: inputTextColor || "#ffffff" }}
              />
            )}
          </div>
        ))}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPreview}
          className={cn(
            "transition-all duration-200 cursor-pointer",
            submitButton.fullWidth && "w-full"
          )}
          style={{
            backgroundColor: isButtonHovered ? buttonHoverBgColor : buttonBgColor,
            color: buttonStyle.textColor || "#ffffff",
            borderRadius: buttonStyle.borderRadius
              ? `${buttonStyle.borderRadius}px`
              : undefined,
            transform: isButtonHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: isButtonHovered
              ? "0 4px 12px rgba(0, 0, 0, 0.15)"
              : "none",
          }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
        >
          {submitButton.text}
        </Button>
      </form>
    </div>
  );
}
