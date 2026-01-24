"use client";

import { cn } from "@/lib/utils";
import type { Section as SectionType } from "@/lib/page-builder/types";
import {
  getLayoutGridClass,
  getColumnSpanClasses,
  getMaxWidthClass,
} from "@/lib/page-builder/section-layouts";
import { Column } from "./column";

interface SectionProps {
  section: SectionType;
  isSelected?: boolean;
  onSelect?: () => void;
  onSelectColumn?: (columnId: string) => void;
  onSelectWidget?: (columnId: string, widgetId: string) => void;
  selectedColumnId?: string;
  selectedWidgetId?: string;
  isPreview?: boolean;
  onAddWidget?: (columnId: string) => void;
}

export function Section({
  section,
  isSelected = false,
  onSelect,
  onSelectColumn,
  onSelectWidget,
  selectedColumnId,
  selectedWidgetId,
  isPreview = false,
  onAddWidget,
}: SectionProps) {
  const { settings, layout, columns } = section;
  const columnSpanClasses = getColumnSpanClasses(layout);

  // Build background styles
  const backgroundStyles: React.CSSProperties = {};
  if (settings.backgroundColor) {
    backgroundStyles.backgroundColor = settings.backgroundColor;
  }
  if (settings.backgroundImage) {
    backgroundStyles.backgroundImage = `url(${settings.backgroundImage})`;
    backgroundStyles.backgroundSize = "cover";
    backgroundStyles.backgroundPosition = "center";
  }

  return (
    <div
      className={cn(
        "relative w-full transition-all duration-200",
        !isPreview && "group/section",
        isSelected && !isPreview && "ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900"
      )}
      style={{
        ...backgroundStyles,
        paddingTop: `${settings.paddingTop}px`,
        paddingBottom: `${settings.paddingBottom}px`,
        borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview && onSelect) {
          onSelect();
        }
      }}
    >
      {/* Background Overlay */}
      {settings.backgroundOverlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: settings.backgroundOverlay.color,
            opacity: settings.backgroundOverlay.opacity,
            borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
          }}
        />
      )}

      {/* Section Toolbar (shown on hover in edit mode) */}
      {!isPreview && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-1 bg-slate-800 rounded-md px-2 py-1 shadow-lg border border-slate-700">
            <span className="text-xs text-slate-400">Section</span>
          </div>
        </div>
      )}

      {/* Container */}
      <div
        className={cn(
          "relative mx-auto px-4",
          !settings.fullWidth && getMaxWidthClass(settings.maxWidth)
        )}
      >
        {/* Grid */}
        <div
          className={cn("grid", getLayoutGridClass(layout))}
          style={{ gap: `${settings.gap}px` }}
        >
          {columns.map((column, index) => (
            <Column
              key={column.id}
              column={column}
              className={columnSpanClasses[index]}
              isSelected={selectedColumnId === column.id}
              selectedWidgetId={selectedWidgetId}
              onSelect={() => onSelectColumn?.(column.id)}
              onSelectWidget={(widgetId) => onSelectWidget?.(column.id, widgetId)}
              isPreview={isPreview}
              onAddWidget={() => onAddWidget?.(column.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
