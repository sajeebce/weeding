"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetType, WidgetCategory } from "@/lib/page-builder/types";
import { WidgetRegistry, WIDGET_CATEGORIES } from "@/lib/page-builder/widget-registry";

interface WidgetBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (widgetType: WidgetType) => void;
}

// Get Lucide icon component by name
function getLucideIcon(
  name: string
): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  return icons[name] || LucideIcons.Box;
}

export function WidgetBrowser({ isOpen, onClose, onSelect }: WidgetBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | null>(null);

  if (!isOpen) return null;

  // Get categorized widgets
  const categorizedWidgets = WidgetRegistry.getCategorizedWidgets();

  // Filter widgets based on search
  const filteredWidgets = searchQuery
    ? categorizedWidgets
        .map((group) => ({
          ...group,
          widgets: group.widgets.filter(
            (widget) =>
              widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              widget.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((group) => group.widgets.length > 0)
    : selectedCategory
    ? categorizedWidgets.filter((group) => group.category.id === selectedCategory)
    : categorizedWidgets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Add Widget</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg",
                "bg-slate-800 border border-slate-700",
                "text-white placeholder:text-slate-500",
                "focus:outline-none focus:border-orange-500"
              )}
            />
          </div>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="px-6 py-2 border-b border-slate-800 overflow-x-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                  !selectedCategory
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                All
              </button>
              {WIDGET_CATEGORIES.map((category) => {
                const Icon = getLucideIcon(category.icon);
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                      selectedCategory === category.id
                        ? "bg-orange-500 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No widgets found</p>
            </div>
          ) : (
            filteredWidgets.map((group) => {
              const CategoryIcon = getLucideIcon(group.category.icon);
              return (
                <div key={group.category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="h-4 w-4 text-orange-400" />
                    <h3 className="text-sm font-semibold text-white">
                      {group.category.name}
                    </h3>
                  </div>

                  {/* Widget Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {group.widgets.map((widget) => {
                      const WidgetIcon = getLucideIcon(widget.icon);
                      return (
                        <button
                          key={widget.type}
                          onClick={() => {
                            onSelect(widget.type);
                            onClose();
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-lg",
                            "border border-slate-700 bg-slate-800/50",
                            "hover:border-orange-500 hover:bg-slate-800",
                            "transition-all duration-200 group"
                          )}
                        >
                          <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-orange-500/20 transition-colors">
                            <WidgetIcon className="h-5 w-5 text-slate-300 group-hover:text-orange-400 transition-colors" />
                          </div>
                          <span className="text-xs font-medium text-slate-300 group-hover:text-white text-center transition-colors">
                            {widget.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
