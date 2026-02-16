"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import type {
  LeadFormWidgetSettings,
  LeadFormField,
} from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { DEFAULT_LEAD_FORM_SETTINGS, DEFAULT_WIDGET_CONTAINER } from "@/lib/page-builder/defaults";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StyledButton } from "@/components/ui/styled-button";
import { CheckCircle, Send, Search, ChevronDown, Check } from "lucide-react";
import { trackLeadFormSubmit } from "@/lib/tracking-events";
import { CountrySelector } from "@/components/ui/country-selector";

// Helper: check if a hex color is light
function isLightColor(hex: string): boolean {
  if (!hex || hex === "transparent") return true;
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

// Helper: group consecutive half-width fields into pairs for 2-column layout
function groupFieldsByWidth(
  fields: LeadFormField[]
): (LeadFormField | [LeadFormField, LeadFormField])[] {
  const result: (LeadFormField | [LeadFormField, LeadFormField])[] = [];
  let i = 0;
  while (i < fields.length) {
    if (
      fields[i].width === "half" &&
      i + 1 < fields.length &&
      fields[i + 1].width === "half"
    ) {
      result.push([fields[i], fields[i + 1]]);
      i += 2;
    } else {
      result.push(fields[i]);
      i++;
    }
  }
  return result;
}

// Button icon mapping
const BUTTON_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Send,
};

// --- ServiceSelectField sub-component (virtualized + searchable) ---
interface ServiceOption {
  id: string;
  slug: string;
  name: string;
}

const SERVICE_ITEM_HEIGHT = 40;
const SERVICE_LIST_HEIGHT = 240;

function ServiceSelectField({
  field,
  value,
  onChange,
  disabled,
  inputTextColor,
  inputClasses,
}: {
  field: LeadFormField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputTextColor?: string;
  inputClasses: string;
}) {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services/search?limit=100");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch {
        console.error("Failed to fetch services");
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.slug === value),
    [services, value]
  );

  const filteredServices = useMemo(() => {
    if (!search.trim()) return services;
    const searchLower = search.toLowerCase().trim();
    return services.filter((s) =>
      s.name.toLowerCase().includes(searchLower)
    );
  }, [services, search]);

  const virtualizer = useVirtualizer({
    count: filteredServices.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => SERVICE_ITEM_HEIGHT,
    overscan: 5,
  });

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && value && filteredServices.length > 0) {
      const index = filteredServices.findIndex((s) => s.slug === value);
      if (index > -1) {
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(index, { align: "center" });
        });
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = useCallback(
    (slug: string) => {
      onChange(slug);
      setIsOpen(false);
      setSearch("");
    },
    [onChange]
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={cn(
          inputClasses,
          "flex items-center justify-between text-left",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        style={{ color: inputTextColor || "#ffffff" }}
      >
        <span className={cn("truncate", !selectedService && "opacity-60")}>
          {loading
            ? "Loading services..."
            : selectedService
              ? selectedService.name
              : field.placeholder || "Select a service..."}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 opacity-60 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search */}
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Virtualized service list */}
          {filteredServices.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No services found
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: SERVICE_LIST_HEIGHT }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const svc = filteredServices[virtualItem.index];
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => handleSelect(svc.slug)}
                      className={cn(
                        "absolute left-0 top-0 flex w-full items-center justify-between px-3 text-sm text-foreground transition-colors",
                        "hover:bg-accent",
                        value === svc.slug && "bg-accent"
                      )}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <span className="truncate">{svc.name}</span>
                      {value === svc.slug && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Get UTM parameters from URL
function getUTMParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  if (params.get("utm_source")) utm.utmSource = params.get("utm_source")!;
  if (params.get("utm_medium")) utm.utmMedium = params.get("utm_medium")!;
  if (params.get("utm_campaign"))
    utm.utmCampaign = params.get("utm_campaign")!;
  if (params.get("utm_term")) utm.utmTerm = params.get("utm_term")!;
  if (params.get("utm_content")) utm.utmContent = params.get("utm_content")!;
  return utm;
}

interface LeadFormWidgetProps {
  settings: Partial<LeadFormWidgetSettings>;
  isPreview?: boolean;
}

export function LeadFormWidget({
  settings: partialSettings,
  isPreview,
}: LeadFormWidgetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});
  const [checkboxValues, setCheckboxValues] = useState<
    Record<string, string[]>
  >({});
  const formRef = useRef<HTMLFormElement>(null);

  // Merge with defaults (deep-merge container so gradient border/bg work)
  const settings: LeadFormWidgetSettings = {
    ...DEFAULT_LEAD_FORM_SETTINGS,
    ...partialSettings,
    container: {
      ...DEFAULT_WIDGET_CONTAINER,
      ...partialSettings?.container,
      gradientBorder: {
        ...DEFAULT_WIDGET_CONTAINER.gradientBorder!,
        ...partialSettings?.container?.gradientBorder,
      },
      gradientBackground: partialSettings?.container?.gradientBackground ?? DEFAULT_WIDGET_CONTAINER.gradientBackground,
    },
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
    formMaxWidth,
    formAlignment,
    buttonLayout,
    buttonAlignment,
    buttonGap,
    buttonWidth,
  } = settings;

  // Container gradient background → apply directly to form div
  const containerGradientColors = settings.container?.gradientBackground?.colors;
  const hasContainerGradientBg =
    settings.container?.backgroundType === "gradient" &&
    containerGradientColors &&
    containerGradientColors.length >= 2;

  const formBackground = hasContainerGradientBg
    ? `linear-gradient(${settings.container!.gradientBackground!.angle ?? 135}deg, ${containerGradientColors!.join(", ")})`
    : undefined;

  // Container solid background → also apply to form if set
  const containerSolidBg =
    !hasContainerGradientBg && settings.container?.backgroundType === "solid" && settings.container?.backgroundColor
      ? settings.container.backgroundColor
      : undefined;

  const formBgColor = formBackground
    ? undefined
    : containerSolidBg || backgroundColor || "transparent";

  // Strip background from container passed to WidgetContainer (form handles it)
  const widgetContainerSettings = settings.container
    ? {
        ...settings.container,
        backgroundType: "solid" as const,
        backgroundColor: undefined,
        gradientBackground: undefined,
      }
    : settings.container;

  // Adaptive input styling based on effective background color
  const effectiveBgColor = hasContainerGradientBg
    ? containerGradientColors![0]
    : containerSolidBg || backgroundColor || "#1e293b";
  const lightBg = isLightColor(effectiveBgColor);
  const inputClasses = lightBg
    ? "bg-gray-50/50 border-gray-200 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
    : "bg-slate-800/50 border-slate-700 placeholder:text-slate-500 focus:border-primary focus:ring-primary";
  const selectTriggerClasses = lightBg
    ? "bg-gray-50/50 border-gray-200"
    : "bg-slate-800/50 border-slate-700";
  const radioCheckboxBorder = lightBg ? "border-gray-300" : "border-slate-600";

  // Resolve button icon
  const ButtonIcon = submitButton.icon
    ? BUTTON_ICONS[submitButton.icon]
    : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPreview) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data: Record<string, unknown> = {};

      // Map form fields to lead fields
      fields.forEach((field) => {
        let value: unknown;

        // Get value based on field type
        if (
          field.type === "select" ||
          field.type === "radio" ||
          field.type === "service_select"
        ) {
          value = selectValues[field.name];
        } else if (field.type === "checkbox") {
          value = checkboxValues[field.name] || [];
        } else if (field.type === "country_select") {
          value = selectValues[field.name];
        } else {
          value = formData.get(field.name);
        }

        // Skip empty values
        if (!value || (Array.isArray(value) && value.length === 0)) return;

        // Determine mapped field name (prefer mapToLeadField from template, then fallback mapping)
        const fallbackMapping: Record<string, string> = {
          name: "firstName",
          first_name: "firstName",
          firstName: "firstName",
          last_name: "lastName",
          lastName: "lastName",
          email: "email",
          phone: "phone",
          company: "company",
          country: "country",
          city: "city",
          service: "interestedIn",
          services: "interestedIn",
          interest: "interestedIn",
          interested_in: "interestedIn",
          budget: "budget",
          timeline: "timeline",
          message: "message",
        };

        const mappedField =
          field.mapToLeadField || fallbackMapping[field.name] || field.name;

        // Handle name field (split into first/last)
        if (
          (field.name === "name" || mappedField === "firstName") &&
          typeof value === "string" &&
          !field.mapToLeadField
        ) {
          const parts = value.trim().split(" ");
          data.firstName = parts[0];
          if (parts.length > 1) {
            data.lastName = parts.slice(1).join(" ");
          }
        } else if (mappedField === "interestedIn") {
          // Ensure interestedIn is always an array
          data.interestedIn = Array.isArray(value) ? value : [value];
        } else {
          data[mappedField] = value;
        }
      });

      // Add UTM parameters
      const utmParams = getUTMParams();
      Object.assign(data, utmParams);

      // Add form template ID from widget settings
      if (settings.templateId) data.formTemplateId = settings.templateId;

      // Add source detail (current page URL)
      data.sourceDetail =
        typeof window !== "undefined" ? window.location.pathname : undefined;

      // Submit to API
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      // Fire tracking events (GTM, FB Pixel, Google Ads)
      if (result.trackingData) {
        trackLeadFormSubmit(result.trackingData);
      }

      setIsSubmitted(true);

      // Reset form after showing success
      if (formRef.current) {
        formRef.current.reset();
        setSelectValues({});
        setCheckboxValues({});
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a single field's input element
  const renderFieldInput = (field: LeadFormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            type="text"
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPreview || isSubmitting}
            className={inputClasses}
            style={{ color: inputTextColor || "#ffffff" }}
          />
        );
      case "email":
        return (
          <Input
            id={field.id}
            type="email"
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPreview || isSubmitting}
            className={inputClasses}
            style={{ color: inputTextColor || "#ffffff" }}
          />
        );
      case "phone":
        return (
          <Input
            id={field.id}
            type="tel"
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPreview || isSubmitting}
            className={inputClasses}
            style={{ color: inputTextColor || "#ffffff" }}
          />
        );
      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPreview || isSubmitting}
            className={inputClasses}
            style={{ color: inputTextColor || "#ffffff" }}
          />
        );
      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            name={field.name}
            required={field.required}
            disabled={isPreview || isSubmitting}
            className={inputClasses}
            style={{ color: inputTextColor || "#ffffff" }}
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.id}
            name={field.name}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isPreview || isSubmitting}
            rows={4}
            className={cn(inputClasses, "resize-none")}
            style={{ color: inputTextColor || "#ffffff" }}
          />
        );
      case "select":
        return (
          <Select
            disabled={isPreview || isSubmitting}
            value={selectValues[field.name] || ""}
            onValueChange={(value) =>
              setSelectValues((prev) => ({ ...prev, [field.name]: value }))
            }
          >
            <SelectTrigger
              className={selectTriggerClasses}
              style={{ color: inputTextColor || "#ffffff" }}
            >
              <SelectValue
                placeholder={field.placeholder || "Select..."}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <RadioGroup
            value={selectValues[field.name] || ""}
            onValueChange={(value) =>
              setSelectValues((prev) => ({ ...prev, [field.name]: value }))
            }
            disabled={isPreview || isSubmitting}
            className="space-y-2"
          >
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${field.id}_${idx}`}
                  className={radioCheckboxBorder}
                />
                <Label
                  htmlFor={`${field.id}_${idx}`}
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: inputTextColor || "#ffffff" }}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => {
              const checked = (checkboxValues[field.name] || []).includes(
                option
              );
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${idx}`}
                    checked={checked}
                    disabled={isPreview || isSubmitting}
                    onCheckedChange={(isChecked) => {
                      setCheckboxValues((prev) => {
                        const current = prev[field.name] || [];
                        return {
                          ...prev,
                          [field.name]: isChecked
                            ? [...current, option]
                            : current.filter((v) => v !== option),
                        };
                      });
                    }}
                    className={radioCheckboxBorder}
                  />
                  <Label
                    htmlFor={`${field.id}_${idx}`}
                    className="text-sm font-normal cursor-pointer"
                    style={{ color: inputTextColor || "#ffffff" }}
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      case "country_select":
        return (
          <CountrySelector
            value={selectValues[field.name] || ""}
            onChange={(code) =>
              setSelectValues((prev) => ({ ...prev, [field.name]: code }))
            }
            placeholder={field.placeholder || "Select your country"}
            disabled={isPreview || isSubmitting}
          />
        );
      case "service_select":
        return (
          <ServiceSelectField
            field={field}
            value={selectValues[field.name] || ""}
            onChange={(value) =>
              setSelectValues((prev) => ({ ...prev, [field.name]: value }))
            }
            disabled={isPreview || isSubmitting}
            inputTextColor={inputTextColor}
            inputClasses={selectTriggerClasses}
          />
        );
      default:
        return null;
    }
  };

  // Render a single field with label + input
  const renderField = (field: LeadFormField) => (
    <div key={field.id} className="space-y-1.5">
      <Label
        htmlFor={field.id}
        className="text-sm font-medium"
        style={{ color: labelColor || "#e2e8f0" }}
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderFieldInput(field)}
    </div>
  );

  // Show success message
  if (isSubmitted) {
    return (
      <WidgetContainer container={widgetContainerSettings}>
      <div
        className={cn(
          "w-full",
          shadow && "shadow-lg",
          formAlignment === "center" && "mx-auto",
          formAlignment === "right" && "ml-auto",
        )}
        style={{
          background: formBackground,
          backgroundColor: formBgColor,
          padding: `${padding}px`,
          borderRadius: `${borderRadius}px`,
          ...(formMaxWidth && formMaxWidth > 0 ? { maxWidth: `${formMaxWidth}px` } : {}),
        }}
      >
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: titleColor || "#ffffff" }}
          >
            Thank You!
          </h3>
          <p
            className="text-sm"
            style={{ color: descriptionColor || "#94a3b8" }}
          >
            We&apos;ve received your information and will get back to you
            shortly.
          </p>
          <Button
            variant="link"
            onClick={() => setIsSubmitted(false)}
            className="mt-4"
            style={{ color: submitButton.style?.bgColor || "#f97316" }}
          >
            Submit another response
          </Button>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer container={widgetContainerSettings}>
    <div
      className={cn(
        "w-full",
        shadow && "shadow-lg",
        formAlignment === "center" && "mx-auto",
        formAlignment === "right" && "ml-auto",
      )}
      style={{
        background: formBackground,
        backgroundColor: formBgColor,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        ...(formMaxWidth && formMaxWidth > 0 ? { maxWidth: `${formMaxWidth}px` } : {}),
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        {groupFieldsByWidth(fields).map((item, groupIdx) => {
          if (Array.isArray(item)) {
            // Pair of half-width fields rendered side by side
            return (
              <div
                key={`row_${groupIdx}`}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {item.map((field) => renderField(field))}
              </div>
            );
          }
          // Full-width field
          return renderField(item);
        })}

        {/* Submit Button with layout controls */}
        <div
          className={cn(
            "flex",
            buttonLayout === "horizontal" ? "flex-row flex-wrap" : "flex-col",
            buttonAlignment === "center" && "items-center justify-center",
            buttonAlignment === "right" && "items-end justify-end",
            buttonAlignment === "left" && "items-start justify-start",
          )}
          style={{ gap: `${buttonGap ?? 12}px` }}
        >
          <div style={buttonWidth && buttonWidth > 0 ? { width: `${buttonWidth}px` } : undefined}>
            <StyledButton
              as="button"
              type="submit"
              style={submitButton.style}
              disabled={isPreview || isSubmitting}
              loading={isSubmitting}
              loadingText="Submitting..."
              fullWidth={buttonLayout === "stacked" || submitButton.fullWidth || (buttonWidth !== undefined && buttonWidth > 0)}
              size="md"
              isPreview={isPreview}
            >
              {submitButton.text}
              {ButtonIcon && <ButtonIcon className="ml-2 h-4 w-4" />}
            </StyledButton>
          </div>
        </div>

        {/* Footer Text (e.g., privacy policy) */}
        {settings.footerText && (
          <p
            className="text-xs text-center mt-3"
            style={{ color: descriptionColor || "#94a3b8" }}
            dangerouslySetInnerHTML={{ __html: settings.footerText }}
          />
        )}
      </form>
    </div>
    </WidgetContainer>
  );
}
