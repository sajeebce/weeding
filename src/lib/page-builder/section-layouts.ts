// ============================================
// SECTION LAYOUTS CONFIGURATION
// ============================================

import type { SectionLayout, LayoutOption } from "./types";

// Layout options with their visual representations
export const SECTION_LAYOUTS: LayoutOption[] = [
  {
    layout: "1",
    name: "1 Column",
    description: "Full width single column",
    columns: 1,
    widths: ["w-full"],
  },
  {
    layout: "1-1",
    name: "2 Columns (50/50)",
    description: "Two equal width columns",
    columns: 2,
    widths: ["w-1/2", "w-1/2"],
  },
  {
    layout: "1-2",
    name: "2 Columns (33/66)",
    description: "Narrow left, wide right",
    columns: 2,
    widths: ["w-1/3", "w-2/3"],
  },
  {
    layout: "2-1",
    name: "2 Columns (66/33)",
    description: "Wide left, narrow right",
    columns: 2,
    widths: ["w-2/3", "w-1/3"],
  },
  {
    layout: "1-1-1",
    name: "3 Columns (33/33/33)",
    description: "Three equal width columns",
    columns: 3,
    widths: ["w-1/3", "w-1/3", "w-1/3"],
  },
  {
    layout: "1-2-1",
    name: "3 Columns (25/50/25)",
    description: "Narrow sides, wide center",
    columns: 3,
    widths: ["w-1/4", "w-1/2", "w-1/4"],
  },
  {
    layout: "1-1-1-1",
    name: "4 Columns (25/25/25/25)",
    description: "Four equal width columns",
    columns: 4,
    widths: ["w-1/4", "w-1/4", "w-1/4", "w-1/4"],
  },
];

// Get layout option by layout type
export function getLayoutOption(layout: SectionLayout): LayoutOption {
  return SECTION_LAYOUTS.find((l) => l.layout === layout) || SECTION_LAYOUTS[0];
}

// Get column count for a layout
export function getColumnCount(layout: SectionLayout): number {
  const option = getLayoutOption(layout);
  return option.columns;
}

// Get Tailwind grid classes for a layout
export function getLayoutGridClass(layout: SectionLayout): string {
  switch (layout) {
    case "1":
      return "grid-cols-1";
    case "1-1":
      return "grid-cols-1 lg:grid-cols-2";
    case "1-2":
      return "grid-cols-1 lg:grid-cols-3";
    case "2-1":
      return "grid-cols-1 lg:grid-cols-3";
    case "1-1-1":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    case "1-2-1":
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    case "1-1-1-1":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    default:
      return "grid-cols-1";
  }
}

// Get column span classes for each column in a layout
export function getColumnSpanClasses(layout: SectionLayout): string[] {
  switch (layout) {
    case "1":
      return ["col-span-1"];
    case "1-1":
      return ["col-span-1", "col-span-1"];
    case "1-2":
      return ["lg:col-span-1", "lg:col-span-2"];
    case "2-1":
      return ["lg:col-span-2", "lg:col-span-1"];
    case "1-1-1":
      return ["col-span-1", "col-span-1", "col-span-1"];
    case "1-2-1":
      return ["lg:col-span-1", "lg:col-span-2", "lg:col-span-1"];
    case "1-1-1-1":
      return ["col-span-1", "col-span-1", "col-span-1", "col-span-1"];
    default:
      return ["col-span-1"];
  }
}

// Get max-width class for section container
export function getMaxWidthClass(maxWidth: string): string {
  switch (maxWidth) {
    case "sm":
      return "max-w-screen-sm";
    case "md":
      return "max-w-screen-md";
    case "lg":
      return "max-w-screen-lg";
    case "xl":
      return "max-w-screen-xl";
    case "2xl":
      return "max-w-screen-2xl";
    case "full":
      return "max-w-full";
    default:
      return "max-w-screen-xl";
  }
}

// Visual representation for layout selector
export interface LayoutPreview {
  layout: SectionLayout;
  bars: { width: string; className: string }[];
}

export const LAYOUT_PREVIEWS: LayoutPreview[] = [
  {
    layout: "1",
    bars: [{ width: "100%", className: "bg-slate-600" }],
  },
  {
    layout: "1-1",
    bars: [
      { width: "48%", className: "bg-slate-600" },
      { width: "48%", className: "bg-slate-600" },
    ],
  },
  {
    layout: "1-2",
    bars: [
      { width: "32%", className: "bg-slate-600" },
      { width: "64%", className: "bg-slate-600" },
    ],
  },
  {
    layout: "2-1",
    bars: [
      { width: "64%", className: "bg-slate-600" },
      { width: "32%", className: "bg-slate-600" },
    ],
  },
  {
    layout: "1-1-1",
    bars: [
      { width: "31%", className: "bg-slate-600" },
      { width: "31%", className: "bg-slate-600" },
      { width: "31%", className: "bg-slate-600" },
    ],
  },
  {
    layout: "1-2-1",
    bars: [
      { width: "23%", className: "bg-slate-600" },
      { width: "48%", className: "bg-slate-600" },
      { width: "23%", className: "bg-slate-600" },
    ],
  },
  {
    layout: "1-1-1-1",
    bars: [
      { width: "22%", className: "bg-slate-600" },
      { width: "22%", className: "bg-slate-600" },
      { width: "22%", className: "bg-slate-600" },
      { width: "22%", className: "bg-slate-600" },
    ],
  },
];
