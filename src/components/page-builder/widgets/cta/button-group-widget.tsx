"use client";

import { cn } from "@/lib/utils";
import { StyledButton } from "@/components/ui/styled-button";
import type { ButtonGroupWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BUTTON_GROUP_SETTINGS } from "@/lib/page-builder/defaults";

interface ButtonGroupWidgetProps {
  settings: Partial<ButtonGroupWidgetSettings>;
  isPreview?: boolean;
}

export function ButtonGroupWidget({
  settings: partialSettings,
  isPreview,
}: ButtonGroupWidgetProps) {
  const settings: ButtonGroupWidgetSettings = {
    ...DEFAULT_BUTTON_GROUP_SETTINGS,
    ...partialSettings,
  };

  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[settings.alignment];

  return (
    <div
      className={cn(
        "flex flex-wrap",
        settings.layout === "vertical" && "flex-col items-start",
        settings.layout === "stacked" && "flex-col",
        alignmentClass
      )}
      style={{ gap: `${settings.gap}px` }}
    >
      {settings.buttons.map((btn) => (
        <StyledButton
          key={btn.id}
          as="link"
          href={btn.link}
          openInNewTab={btn.openInNewTab}
          style={btn.style}
          fullWidth={settings.layout === "stacked"}
          isPreview={isPreview}
          size="lg"
        >
          {btn.text}
        </StyledButton>
      ))}
    </div>
  );
}
