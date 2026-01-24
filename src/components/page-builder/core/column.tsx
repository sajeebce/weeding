"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column as ColumnType } from "@/lib/page-builder/types";
import { WidgetWrapper } from "./widget-wrapper";

interface ColumnProps {
  column: ColumnType;
  className?: string;
  isSelected?: boolean;
  selectedWidgetId?: string;
  onSelect?: () => void;
  onSelectWidget?: (widgetId: string) => void;
  isPreview?: boolean;
  onAddWidget?: () => void;
}

export function Column({
  column,
  className,
  isSelected = false,
  selectedWidgetId,
  onSelect,
  onSelectWidget,
  isPreview = false,
  onAddWidget,
}: ColumnProps) {
  const { settings, widgets } = column;

  // Vertical alignment classes
  const alignmentClass = {
    top: "justify-start",
    center: "justify-center",
    bottom: "justify-end",
  }[settings.verticalAlign];

  return (
    <div
      className={cn(
        "relative flex flex-col min-h-[100px] transition-all duration-200",
        alignmentClass,
        !isPreview && "group/column",
        isSelected && !isPreview && "ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900 rounded-md",
        className
      )}
      style={{
        padding: settings.padding ? `${settings.padding}px` : undefined,
        backgroundColor: settings.backgroundColor,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview && onSelect) {
          onSelect();
        }
      }}
    >
      {/* Empty State / Add Widget Button */}
      {widgets.length === 0 && !isPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddWidget?.();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full h-full min-h-[100px]",
            "border-2 border-dashed border-slate-600 rounded-lg",
            "text-slate-500 hover:text-slate-400 hover:border-slate-500",
            "transition-colors duration-200"
          )}
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm">Add Widget</span>
        </button>
      )}

      {/* Widgets */}
      {widgets.map((widget) => (
        <WidgetWrapper
          key={widget.id}
          widget={widget}
          isSelected={selectedWidgetId === widget.id}
          onSelect={() => onSelectWidget?.(widget.id)}
          isPreview={isPreview}
        />
      ))}

      {/* Add Widget Button (when column has widgets) */}
      {widgets.length > 0 && !isPreview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddWidget?.();
          }}
          className={cn(
            "flex items-center justify-center gap-1 w-full py-2 mt-2",
            "border-2 border-dashed border-slate-700 rounded-md",
            "text-slate-600 hover:text-slate-400 hover:border-slate-500",
            "opacity-0 group-hover/column:opacity-100 transition-all duration-200"
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">Add Widget</span>
        </button>
      )}
    </div>
  );
}
