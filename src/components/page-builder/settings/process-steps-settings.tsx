"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import type {
  ProcessStepsWidgetSettings,
  ProcessStep,
  BadgeStyle,
  ProcessStepsLayout,
  ConnectorLineStyle,
  ConnectorAnimation,
  StepNumberStyle,
  StepIconStyle,
} from "@/lib/page-builder/types";
import { DEFAULT_PROCESS_STEPS_SETTINGS } from "@/lib/page-builder/defaults";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
  TextInput,
  TextAreaInput,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProcessStepsWidgetSettingsProps {
  settings: ProcessStepsWidgetSettings;
  onChange: (settings: ProcessStepsWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function ProcessStepsWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: ProcessStepsWidgetSettingsProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Merge with defaults
  const s: ProcessStepsWidgetSettings = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS,
    ...settings,
    header: {
      ...DEFAULT_PROCESS_STEPS_SETTINGS.header,
      ...settings?.header,
      badge: { ...DEFAULT_PROCESS_STEPS_SETTINGS.header.badge, ...settings?.header?.badge },
      heading: { ...DEFAULT_PROCESS_STEPS_SETTINGS.header.heading, ...settings?.header?.heading },
      description: { ...DEFAULT_PROCESS_STEPS_SETTINGS.header.description, ...settings?.header?.description },
    },
    steps: settings?.steps || DEFAULT_PROCESS_STEPS_SETTINGS.steps,
    layout: { ...DEFAULT_PROCESS_STEPS_SETTINGS.layout, ...settings?.layout },
    stepNumber: { ...DEFAULT_PROCESS_STEPS_SETTINGS.stepNumber, ...settings?.stepNumber },
    stepIcon: { ...DEFAULT_PROCESS_STEPS_SETTINGS.stepIcon, ...settings?.stepIcon },
    stepContent: { ...DEFAULT_PROCESS_STEPS_SETTINGS.stepContent, ...settings?.stepContent },
    connector: { ...DEFAULT_PROCESS_STEPS_SETTINGS.connector, ...settings?.connector },
    card: { ...DEFAULT_PROCESS_STEPS_SETTINGS.card, ...settings?.card },
    responsive: { ...DEFAULT_PROCESS_STEPS_SETTINGS.responsive, ...settings?.responsive },
    animation: { ...DEFAULT_PROCESS_STEPS_SETTINGS.animation, ...settings?.animation },
  };

  // Update helpers
  const updateHeader = (updates: Partial<ProcessStepsWidgetSettings["header"]>) => {
    onChange({ ...s, header: { ...s.header, ...updates } });
  };

  const updateHeaderBadge = (updates: Partial<ProcessStepsWidgetSettings["header"]["badge"]>) => {
    onChange({ ...s, header: { ...s.header, badge: { ...s.header.badge, ...updates } } });
  };

  const updateHeaderHeading = (updates: Partial<ProcessStepsWidgetSettings["header"]["heading"]>) => {
    onChange({ ...s, header: { ...s.header, heading: { ...s.header.heading, ...updates } } });
  };

  const updateHeaderDescription = (updates: Partial<ProcessStepsWidgetSettings["header"]["description"]>) => {
    onChange({ ...s, header: { ...s.header, description: { ...s.header.description, ...updates } } });
  };

  const updateLayout = (updates: Partial<ProcessStepsWidgetSettings["layout"]>) => {
    onChange({ ...s, layout: { ...s.layout, ...updates } });
  };

  const updateStepNumber = (updates: Partial<ProcessStepsWidgetSettings["stepNumber"]>) => {
    onChange({ ...s, stepNumber: { ...s.stepNumber, ...updates } });
  };

  const updateStepIcon = (updates: Partial<ProcessStepsWidgetSettings["stepIcon"]>) => {
    onChange({ ...s, stepIcon: { ...s.stepIcon, ...updates } });
  };

  const updateStepContent = (updates: Partial<ProcessStepsWidgetSettings["stepContent"]>) => {
    onChange({ ...s, stepContent: { ...s.stepContent, ...updates } });
  };

  const updateConnector = (updates: Partial<ProcessStepsWidgetSettings["connector"]>) => {
    onChange({ ...s, connector: { ...s.connector, ...updates } });
  };

  const updateCard = (updates: Partial<ProcessStepsWidgetSettings["card"]>) => {
    onChange({ ...s, card: { ...s.card, ...updates } });
  };

  const updateResponsive = (updates: Partial<ProcessStepsWidgetSettings["responsive"]>) => {
    onChange({ ...s, responsive: { ...s.responsive, ...updates } });
  };

  const updateAnimation = (updates: Partial<ProcessStepsWidgetSettings["animation"]>) => {
    onChange({ ...s, animation: { ...s.animation, ...updates } });
  };

  // Step management
  const addStep = () => {
    const newStep: ProcessStep = {
      id: `step_${Date.now()}`,
      icon: "CheckCircle",
      title: "New Step",
      description: "Describe this step...",
    };
    onChange({ ...s, steps: [...s.steps, newStep] });
    setExpandedStepId(newStep.id);
  };

  const removeStep = (stepId: string) => {
    onChange({ ...s, steps: s.steps.filter((step) => step.id !== stepId) });
  };

  const updateStep = (stepId: string, updates: Partial<ProcessStep>) => {
    onChange({
      ...s,
      steps: s.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...s.steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    onChange({ ...s, steps: newSteps });
  };

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-3 w-full min-w-0 max-w-full">
      {/* Section Header */}
      <AccordionSection title="Section Header">
        <ToggleSwitch
          label="Show Header"
          checked={s.header.show}
          onChange={(checked) => updateHeader({ show: checked })}
        />
      </AccordionSection>

      {/* Badge */}
      {s.header.show && (
        <AccordionSection title="Badge">
          <ToggleSwitch
            label="Show Badge"
            checked={s.header.badge.show}
            onChange={(checked) => updateHeaderBadge({ show: checked })}
          />
          {s.header.badge.show && (
            <div className="mt-4">
              <TextInput
                label="Badge Text"
                value={s.header.badge.text}
                onChange={(v) => updateHeaderBadge({ text: v })}
                placeholder="How It Works"
              />
            </div>
          )}
        </AccordionSection>
      )}

      {/* Heading */}
      {s.header.show && (
        <AccordionSection title="Heading">
          <div className="space-y-4">
            <TextInput
              label="Heading Text"
              value={s.header.heading.text}
              onChange={(v) => updateHeaderHeading({ text: v })}
              placeholder="Start Your LLC in 4 Simple Steps"
            />
            <TextInput
              label="Highlight Words"
              value={s.header.heading.highlightWords || ""}
              onChange={(v) => updateHeaderHeading({ highlightWords: v })}
              placeholder="Leave empty for no highlight"
            />
          </div>
        </AccordionSection>
      )}

      {/* Description */}
      {s.header.show && (
        <AccordionSection title="Description">
          <ToggleSwitch
            label="Show Description"
            checked={s.header.description.show}
            onChange={(checked) => updateHeaderDescription({ show: checked })}
          />
          {s.header.description.show && (
            <div className="mt-4">
              <TextAreaInput
                label="Description Text"
                value={s.header.description.text}
                onChange={(v) => updateHeaderDescription({ text: v })}
                rows={3}
              />
            </div>
          )}
        </AccordionSection>
      )}

      {/* Steps */}
      <AccordionSection title="Steps" defaultOpen={true}>
        <div className="space-y-3 w-full min-w-0">
          {s.steps.map((step, index) => (
            <div
              key={step.id}
              className="border rounded-lg bg-muted/30 overflow-hidden min-w-0 w-full"
            >
              {/* Step Header */}
              <div
                className="flex items-center gap-1.5 px-2 py-2 cursor-pointer hover:bg-muted/50 min-w-0 w-full"
                onClick={() =>
                  setExpandedStepId(expandedStepId === step.id ? null : step.id)
                }
              >
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 font-medium text-sm truncate min-w-0">
                  {index + 1}. {step.title}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, "up");
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, "down");
                    }}
                    disabled={index === s.steps.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(step.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Step Content (Expanded) */}
              {expandedStepId === step.id && (
                <div className="p-3 pt-0 space-y-4 border-t">
                  <TextInput
                    label="Icon"
                    value={step.icon}
                    onChange={(v) => updateStep(step.id, { icon: v })}
                    placeholder="ClipboardList"
                    description="Lucide icon name (e.g., ClipboardList, FileCheck, Rocket)"
                  />
                  <TextInput
                    label="Title"
                    value={step.title}
                    onChange={(v) => updateStep(step.id, { title: v })}
                    placeholder="Step title"
                  />
                  <TextAreaInput
                    label="Description"
                    value={step.description}
                    onChange={(v) => updateStep(step.id, { description: v })}
                    rows={3}
                    placeholder="Step description"
                  />
                  <NumberInput
                    label="Custom Number (optional)"
                    value={step.number ?? index + 1}
                    onChange={(v) => updateStep(step.id, { number: v })}
                    min={1}
                    max={99}
                  />
                </div>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addStep}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-3 w-full min-w-0 max-w-full">
      {/* Layout */}
      <AccordionSection title="Layout" defaultOpen={true}>
        <div className="space-y-4">
          <SelectInput
            label="Layout Type"
            value={s.layout.type}
            onChange={(v) => updateLayout({ type: v as ProcessStepsLayout })}
            options={[
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
              { value: "alternating", label: "Alternating (Timeline)" },
            ]}
          />
          {s.layout.type === "horizontal" && (
            <SelectInput
              label="Columns"
              value={String(s.layout.columns)}
              onChange={(v) => updateLayout({ columns: parseInt(v) as 2 | 3 | 4 | 5 })}
              options={[
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
                { value: "5", label: "5 Columns" },
              ]}
            />
          )}
          <NumberInput
            label="Gap"
            value={s.layout.gap}
            onChange={(v) => updateLayout({ gap: v })}
            min={0}
            max={100}
          />
          {(s.layout.type === "vertical" || s.layout.type === "alternating") && (
            <NumberInput
              label="Vertical Spacing"
              value={s.layout.verticalSpacing}
              onChange={(v) => updateLayout({ verticalSpacing: v })}
              min={0}
              max={200}
            />
          )}
        </div>
      </AccordionSection>

      {/* Header Styling */}
      {s.header.show && (
        <AccordionSection title="Header Style">
          <div className="space-y-4">
            <SelectInput
              label="Alignment"
              value={s.header.alignment}
              onChange={(v) => updateHeader({ alignment: v as "left" | "center" | "right" })}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
            <NumberInput
              label="Bottom Margin"
              value={s.header.marginBottom}
              onChange={(v) => updateHeader({ marginBottom: v })}
              min={0}
              max={120}
            />

            {/* Badge Style */}
            {s.header.badge.show && (
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground">Badge Style</p>
                <SelectInput
                  label="Style"
                  value={s.header.badge.style}
                  onChange={(v) => updateHeaderBadge({ style: v as BadgeStyle })}
                  options={[
                    { value: "pill", label: "Pill" },
                    { value: "solid", label: "Solid" },
                    { value: "outline", label: "Outline" },
                  ]}
                />
                <ColorInput
                  label="Background"
                  value={s.header.badge.bgColor || "#1e3a5f"}
                  onChange={(v) => updateHeaderBadge({ bgColor: v })}
                />
                <ColorInput
                  label="Text Color"
                  value={s.header.badge.textColor || "#ffffff"}
                  onChange={(v) => updateHeaderBadge({ textColor: v })}
                />
              </div>
            )}

            {/* Heading Style */}
            <div className="space-y-3 pt-3 border-t">
              <p className="text-xs font-medium text-muted-foreground">Heading Style</p>
              <SelectInput
                label="Size"
                value={s.header.heading.size}
                onChange={(v) => updateHeaderHeading({ size: v as "sm" | "md" | "lg" | "xl" | "2xl" })}
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                  { value: "xl", label: "Extra Large" },
                  { value: "2xl", label: "2X Large" },
                ]}
              />
              <ColorInput
                label="Color"
                value={s.header.heading.color || "#0f172a"}
                onChange={(v) => updateHeaderHeading({ color: v })}
              />
              {s.header.heading.highlightWords && (
                <ColorInput
                  label="Highlight Color"
                  value={s.header.heading.highlightColor || "#f97316"}
                  onChange={(v) => updateHeaderHeading({ highlightColor: v })}
                />
              )}
            </div>

            {/* Description Style */}
            {s.header.description.show && (
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground">Description Style</p>
                <SelectInput
                  label="Size"
                  value={s.header.description.size}
                  onChange={(v) => updateHeaderDescription({ size: v as "sm" | "md" | "lg" })}
                  options={[
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]}
                />
                <ColorInput
                  label="Color"
                  value={s.header.description.color || "#64748b"}
                  onChange={(v) => updateHeaderDescription({ color: v })}
                />
              </div>
            )}
          </div>
        </AccordionSection>
      )}

      {/* Step Number Badge */}
      <AccordionSection title="Step Numbers">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Numbers"
            checked={s.stepNumber.show}
            onChange={(checked) => updateStepNumber({ show: checked })}
          />
          {s.stepNumber.show && (
            <>
              <SelectInput
                label="Style"
                value={s.stepNumber.style}
                onChange={(v) => updateStepNumber({ style: v as StepNumberStyle })}
                options={[
                  { value: "circle", label: "Circle (Filled)" },
                  { value: "circle-outline", label: "Circle (Outline)" },
                  { value: "rounded-square", label: "Rounded Square" },
                  { value: "badge", label: "Badge" },
                ]}
              />
              <SelectInput
                label="Size"
                value={s.stepNumber.size}
                onChange={(v) => updateStepNumber({ size: v as "sm" | "md" | "lg" })}
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
              <SelectInput
                label="Position"
                value={s.stepNumber.position}
                onChange={(v) => updateStepNumber({ position: v as "top-left" | "top-center" | "top-right" })}
                options={[
                  { value: "top-left", label: "Top Left" },
                  { value: "top-center", label: "Top Center" },
                  { value: "top-right", label: "Top Right" },
                ]}
              />
              <ColorInput
                label="Background"
                value={s.stepNumber.bgColor || "#f97316"}
                onChange={(v) => updateStepNumber({ bgColor: v })}
              />
              <ColorInput
                label="Text Color"
                value={s.stepNumber.textColor || "#ffffff"}
                onChange={(v) => updateStepNumber({ textColor: v })}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Step Icon */}
      <AccordionSection title="Step Icons">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Icons"
            checked={s.stepIcon.show}
            onChange={(checked) => updateStepIcon({ show: checked })}
          />
          {s.stepIcon.show && (
            <>
              <SelectInput
                label="Style"
                value={s.stepIcon.style}
                onChange={(v) => updateStepIcon({ style: v as StepIconStyle })}
                options={[
                  { value: "circle", label: "Circle" },
                  { value: "circle-outline", label: "Circle (Outline)" },
                  { value: "rounded", label: "Rounded" },
                  { value: "square", label: "Square" },
                  { value: "floating", label: "Floating (Shadow)" },
                ]}
              />
              <SelectInput
                label="Size"
                value={s.stepIcon.size}
                onChange={(v) => updateStepIcon({ size: v as "sm" | "md" | "lg" | "xl" })}
                options={[
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                  { value: "xl", label: "Extra Large" },
                ]}
              />
              <ColorInput
                label="Background"
                value={s.stepIcon.bgColor || "#fff7ed"}
                onChange={(v) => updateStepIcon({ bgColor: v })}
              />
              <ColorInput
                label="Icon Color"
                value={s.stepIcon.iconColor || "#f97316"}
                onChange={(v) => updateStepIcon({ iconColor: v })}
              />
              <SelectInput
                label="Hover Animation"
                value={s.stepIcon.hoverAnimation}
                onChange={(v) => updateStepIcon({ hoverAnimation: v as "none" | "bounce" | "pulse" | "rotate" | "shake" })}
                options={[
                  { value: "none", label: "None" },
                  { value: "bounce", label: "Bounce" },
                  { value: "pulse", label: "Pulse" },
                  { value: "rotate", label: "Rotate" },
                  { value: "shake", label: "Shake" },
                ]}
              />
            </>
          )}
        </div>
      </AccordionSection>

      {/* Step Content */}
      <AccordionSection title="Step Content">
        <div className="space-y-4">
          <SelectInput
            label="Alignment"
            value={s.stepContent.alignment}
            onChange={(v) => updateStepContent({ alignment: v as "left" | "center" | "right" })}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
          <SelectInput
            label="Title Size"
            value={s.stepContent.titleSize}
            onChange={(v) => updateStepContent({ titleSize: v as "sm" | "md" | "lg" | "xl" })}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
            ]}
          />
          <ColorInput
            label="Title Color"
            value={s.stepContent.titleColor || "#0f172a"}
            onChange={(v) => updateStepContent({ titleColor: v })}
          />
          <SelectInput
            label="Description Size"
            value={s.stepContent.descriptionSize}
            onChange={(v) => updateStepContent({ descriptionSize: v as "sm" | "md" | "lg" })}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />
          <ColorInput
            label="Description Color"
            value={s.stepContent.descriptionColor || "#64748b"}
            onChange={(v) => updateStepContent({ descriptionColor: v })}
          />
        </div>
      </AccordionSection>

      {/* Connector Line */}
      <AccordionSection title="Connector Line">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Connector"
            checked={s.connector.show}
            onChange={(checked) => updateConnector({ show: checked })}
          />
          {s.connector.show && (
            <>
              <SelectInput
                label="Line Style"
                value={s.connector.style}
                onChange={(v) => updateConnector({ style: v as ConnectorLineStyle })}
                options={[
                  { value: "solid", label: "Solid" },
                  { value: "dashed", label: "Dashed" },
                  { value: "dotted", label: "Dotted" },
                  { value: "gradient", label: "Gradient" },
                  { value: "double", label: "Double" },
                  { value: "wavy", label: "Wavy" },
                  { value: "glow", label: "Glow" },
                ]}
              />
              <SelectInput
                label="Animation"
                value={s.connector.animation}
                onChange={(v) => updateConnector({ animation: v as ConnectorAnimation })}
                options={[
                  { value: "none", label: "None" },
                  { value: "flow", label: "Gradient Flow" },
                  { value: "pulse", label: "Pulse Glow" },
                  { value: "dash-flow", label: "Dashes Flow" },
                  { value: "dot-travel", label: "Traveling Dot" },
                  { value: "shimmer", label: "Shimmer" },
                  { value: "draw", label: "Draw on Scroll" },
                  { value: "bounce", label: "Bounce" },
                  { value: "rainbow", label: "Rainbow" },
                  { value: "snake", label: "Snake" },
                ]}
              />
              {s.connector.animation !== "none" && (
                <SelectInput
                  label="Animation Speed"
                  value={s.connector.animationSpeed}
                  onChange={(v) => updateConnector({ animationSpeed: v as "slow" | "medium" | "fast" })}
                  options={[
                    { value: "slow", label: "Slow" },
                    { value: "medium", label: "Medium" },
                    { value: "fast", label: "Fast" },
                  ]}
                />
              )}
              <NumberInput
                label="Thickness"
                value={s.connector.thickness}
                onChange={(v) => updateConnector({ thickness: v })}
                min={1}
                max={8}
              />
              <ColorInput
                label="Line Color"
                value={s.connector.color || "#fde8d7"}
                onChange={(v) => updateConnector({ color: v })}
              />
              {(s.connector.style === "gradient" || s.connector.style === "glow" || s.connector.animation === "flow") && (
                <ColorInput
                  label={s.connector.style === "glow" ? "Glow Color" : "Secondary Color"}
                  value={s.connector.secondaryColor || "#f97316"}
                  onChange={(v) => updateConnector({ secondaryColor: v })}
                />
              )}
              {s.connector.animation === "dot-travel" && (
                <>
                  <NumberInput
                    label="Dot Size"
                    value={s.connector.dotSize || 8}
                    onChange={(v) => updateConnector({ dotSize: v })}
                    min={4}
                    max={16}
                  />
                  <ColorInput
                    label="Dot Color"
                    value={s.connector.dotColor || "#f97316"}
                    onChange={(v) => updateConnector({ dotColor: v })}
                  />
                </>
              )}
            </>
          )}
        </div>
      </AccordionSection>

      {/* Card Style */}
      <AccordionSection title="Card Style">
        <div className="space-y-4">
          <ToggleSwitch
            label="Show Card Background"
            checked={s.card.show}
            onChange={(checked) => updateCard({ show: checked })}
          />
          {s.card.show && (
            <>
              {/* Background Type */}
              <SelectInput
                label="Background Type"
                value={s.card.backgroundType || "solid"}
                onChange={(v) => {
                  const newType = v as "solid" | "gradient";
                  updateCard({
                    backgroundType: newType,
                    ...(newType === "gradient" && !s.card.gradientBackground
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
              {/* Solid background */}
              {(s.card.backgroundType || "solid") === "solid" && (
                <ColorInput
                  label="Background"
                  value={s.card.backgroundColor || "#ffffff"}
                  onChange={(v) => updateCard({ backgroundColor: v })}
                />
              )}
              {/* Gradient background */}
              {s.card.backgroundType === "gradient" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Gradient Colors</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <ColorInput
                        label="From"
                        value={s.card.gradientBackground?.colors?.[0] || "#1e1b4b"}
                        onChange={(v) =>
                          updateCard({
                            gradientBackground: {
                              colors: [v, s.card.gradientBackground?.colors?.[1] || "#0f172a"],
                              angle: s.card.gradientBackground?.angle || 135,
                            },
                          })
                        }
                      />
                      <ColorInput
                        label="To"
                        value={s.card.gradientBackground?.colors?.[1] || "#0f172a"}
                        onChange={(v) =>
                          updateCard({
                            gradientBackground: {
                              colors: [s.card.gradientBackground?.colors?.[0] || "#1e1b4b", v],
                              angle: s.card.gradientBackground?.angle || 135,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <NumberInput
                    label="Gradient Angle"
                    value={s.card.gradientBackground?.angle || 135}
                    onChange={(v) =>
                      updateCard({
                        gradientBackground: {
                          colors: s.card.gradientBackground?.colors || ["#1e1b4b", "#0f172a"],
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
                label="Border Radius"
                value={s.card.borderRadius}
                onChange={(v) => updateCard({ borderRadius: v })}
                min={0}
                max={32}
              />
              <NumberInput
                label="Border Width"
                value={s.card.borderWidth}
                onChange={(v) => updateCard({ borderWidth: v })}
                min={0}
                max={4}
              />
              {s.card.borderWidth > 0 && !s.card.gradientBorder?.enabled && (
                <ColorInput
                  label="Border Color"
                  value={s.card.borderColor || "#e2e8f0"}
                  onChange={(v) => updateCard({ borderColor: v })}
                />
              )}
              {/* Gradient Border */}
              <ToggleSwitch
                label="Gradient Border"
                checked={s.card.gradientBorder?.enabled || false}
                onChange={(v: boolean) =>
                  updateCard({
                    gradientBorder: {
                      enabled: v,
                      colors: s.card.gradientBorder?.colors || ["#f97316", "#8b5cf6"],
                      angle: s.card.gradientBorder?.angle || 135,
                    },
                    ...(v && s.card.borderWidth === 0 ? { borderWidth: 2 } : {}),
                  })
                }
              />
              {s.card.gradientBorder?.enabled && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">Border Gradient Colors</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <ColorInput
                        label="From"
                        value={s.card.gradientBorder?.colors?.[0] || "#f97316"}
                        onChange={(v) =>
                          updateCard({
                            gradientBorder: {
                              enabled: true,
                              colors: [v, s.card.gradientBorder?.colors?.[1] || "#8b5cf6"],
                              angle: s.card.gradientBorder?.angle || 135,
                            },
                          })
                        }
                      />
                      <ColorInput
                        label="To"
                        value={s.card.gradientBorder?.colors?.[1] || "#8b5cf6"}
                        onChange={(v) =>
                          updateCard({
                            gradientBorder: {
                              enabled: true,
                              colors: [s.card.gradientBorder?.colors?.[0] || "#f97316", v],
                              angle: s.card.gradientBorder?.angle || 135,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <NumberInput
                    label="Border Gradient Angle"
                    value={s.card.gradientBorder?.angle || 135}
                    onChange={(v) =>
                      updateCard({
                        gradientBorder: {
                          enabled: true,
                          colors: s.card.gradientBorder?.colors || ["#f97316", "#8b5cf6"],
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
                value={s.card.padding}
                onChange={(v) => updateCard({ padding: v })}
                min={0}
                max={48}
              />
              <SelectInput
                label="Shadow"
                value={s.card.shadow}
                onChange={(v) => updateCard({ shadow: v as "none" | "sm" | "md" | "lg" })}
                options={[
                  { value: "none", label: "None" },
                  { value: "sm", label: "Small" },
                  { value: "md", label: "Medium" },
                  { value: "lg", label: "Large" },
                ]}
              />
              <SelectInput
                label="Hover Effect"
                value={s.card.hoverEffect}
                onChange={(v) => updateCard({ hoverEffect: v as "none" | "lift" | "glow" | "scale" })}
                options={[
                  { value: "none", label: "None" },
                  { value: "lift", label: "Lift" },
                  { value: "glow", label: "Glow" },
                  { value: "scale", label: "Scale" },
                ]}
              />
            </>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-3 w-full min-w-0 max-w-full">
      {/* Animation Settings */}
      <AccordionSection title="Animation" defaultOpen={true}>
        <div className="space-y-4">
          <ToggleSwitch
            label="Animate on Scroll"
            checked={s.animation.animateOnScroll}
            onChange={(checked) => updateAnimation({ animateOnScroll: checked })}
          />
          <NumberInput
            label="Stagger Delay (ms)"
            value={s.animation.staggerDelay}
            onChange={(v) => updateAnimation({ staggerDelay: v })}
            min={0}
            max={500}
          />
        </div>
      </AccordionSection>

      {/* Responsive Settings */}
      <AccordionSection title="Responsive">
        <div className="space-y-4">
          <p className="text-xs font-medium text-muted-foreground">Tablet</p>
          <SelectInput
            label="Layout"
            value={s.responsive.tablet.layout}
            onChange={(v) =>
              updateResponsive({
                tablet: { ...s.responsive.tablet, layout: v as ProcessStepsLayout },
              })
            }
            options={[
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
              { value: "alternating", label: "Alternating" },
            ]}
          />
          {s.responsive.tablet.layout === "horizontal" && (
            <SelectInput
              label="Columns"
              value={String(s.responsive.tablet.columns)}
              onChange={(v) =>
                updateResponsive({
                  tablet: { ...s.responsive.tablet, columns: parseInt(v) as 2 | 3 | 4 },
                })
              }
              options={[
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
              ]}
            />
          )}

          <div className="pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-3">Mobile</p>
            <p className="text-xs text-muted-foreground">
              Mobile always uses vertical layout with 1 column for optimal readability.
            </p>
          </div>
        </div>
      </AccordionSection>
    </div>
  );

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </div>
  );
}
