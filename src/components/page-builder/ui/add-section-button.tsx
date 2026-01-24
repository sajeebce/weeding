"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSectionButtonProps {
  onClick: () => void;
  className?: string;
}

export function AddSectionButton({ onClick, className }: AddSectionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full py-6 group",
        "flex items-center justify-center",
        className
      )}
    >
      {/* Line with button */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700 group-hover:bg-slate-600 transition-colors" />

      <div
        className={cn(
          "relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-slate-800 border border-slate-700",
          "text-slate-400 hover:text-white hover:border-orange-500 hover:bg-slate-700",
          "transition-all duration-200"
        )}
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Add Section</span>
      </div>
    </button>
  );
}
