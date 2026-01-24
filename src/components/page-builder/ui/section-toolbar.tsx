"use client";

import {
  GripVertical,
  Settings,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Columns,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section } from "@/lib/page-builder/types";
import { getLayoutOption } from "@/lib/page-builder/section-layouts";

interface SectionToolbarProps {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onEditSettings?: () => void;
  onChangeLayout?: () => void;
}

export function SectionToolbar({
  section,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onEditSettings,
  onChangeLayout,
}: SectionToolbarProps) {
  const layoutOption = getLayoutOption(section.layout);

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1.5 shadow-lg border border-slate-700">
      {/* Drag Handle */}
      <div className="px-1 cursor-grab text-slate-500 hover:text-slate-300">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700" />

      {/* Layout Info */}
      <button
        onClick={onChangeLayout}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded",
          "text-slate-400 hover:text-white hover:bg-slate-700/50",
          "transition-colors"
        )}
        title="Change Layout"
      >
        <Columns className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{layoutOption.name}</span>
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700" />

      {/* Move Up */}
      <button
        onClick={onMoveUp}
        disabled={isFirst}
        className={cn(
          "p-1.5 rounded transition-colors",
          isFirst
            ? "text-slate-600 cursor-not-allowed"
            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
        )}
        title="Move Up"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* Move Down */}
      <button
        onClick={onMoveDown}
        disabled={isLast}
        className={cn(
          "p-1.5 rounded transition-colors",
          isLast
            ? "text-slate-600 cursor-not-allowed"
            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
        )}
        title="Move Down"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700" />

      {/* Settings */}
      <button
        onClick={onEditSettings}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
        title="Section Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
