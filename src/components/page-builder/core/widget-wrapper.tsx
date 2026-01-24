"use client";

import { GripVertical, Settings, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Widget } from "@/lib/page-builder/types";
import { WidgetRegistry } from "@/lib/page-builder/widget-registry";

interface WidgetWrapperProps {
  widget: Widget<unknown>;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  isPreview?: boolean;
}

export function WidgetWrapper({
  widget,
  isSelected = false,
  onSelect,
  onDelete,
  onDuplicate,
  isPreview = false,
}: WidgetWrapperProps) {
  const definition = WidgetRegistry.get(widget.type);

  // Render the widget component or a placeholder if not found
  const renderWidget = () => {
    if (!definition?.component) {
      return (
        <div className="flex items-center justify-center h-24 bg-slate-800 rounded-lg border border-slate-700">
          <span className="text-slate-500 text-sm">
            Widget not found: {widget.type}
          </span>
        </div>
      );
    }

    const WidgetComponent = definition.component as React.ComponentType<{ settings: unknown; isPreview?: boolean }>;
    return <WidgetComponent settings={widget.settings} isPreview={isPreview} />;
  };

  // Get spacing styles
  const spacingStyles: React.CSSProperties = {
    marginTop: widget.spacing?.marginTop ? `${widget.spacing.marginTop}px` : undefined,
    marginBottom: widget.spacing?.marginBottom ? `${widget.spacing.marginBottom}px` : undefined,
  };

  return (
    <div
      className={cn(
        "relative group/widget transition-all duration-200",
        !isPreview && "cursor-pointer",
        isSelected && !isPreview && "ring-2 ring-green-500 ring-offset-1 ring-offset-slate-900 rounded-md"
      )}
      style={spacingStyles}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview && onSelect) {
          onSelect();
        }
      }}
    >
      {/* Widget Toolbar (shown on hover in edit mode) */}
      {!isPreview && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-between opacity-0 group-hover/widget:opacity-100 transition-opacity z-20">
          {/* Left: Drag Handle & Widget Name */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-md px-2 py-1 shadow-lg border border-slate-700">
            <GripVertical className="h-3 w-3 text-slate-500 cursor-grab" />
            <span className="text-xs text-slate-400">
              {definition?.name || widget.type}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-md px-1 py-1 shadow-lg border border-slate-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Settings"
            >
              <Settings className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.();
              }}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={cn(!isPreview && "pointer-events-none")}>
        {renderWidget()}
      </div>
    </div>
  );
}
