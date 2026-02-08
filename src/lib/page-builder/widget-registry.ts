// ============================================
// WIDGET REGISTRY SYSTEM
// ============================================

import type {
  WidgetType,
  WidgetCategory,
  WidgetDefinition,
  WidgetCategoryInfo,
} from "./types";
import { DEFAULT_SECTION_SETTINGS, DEFAULT_COLUMN_SETTINGS } from "./defaults";

// Widget Category Information
export const WIDGET_CATEGORIES: WidgetCategoryInfo[] = [
  {
    id: "most-used",
    name: "Most Used",
    icon: "Star",
    description: "Frequently used widgets",
  },
  {
    id: "service",
    name: "Service",
    icon: "Briefcase",
    description: "Service Details template widgets",
  },
  {
    id: "content",
    name: "Content",
    icon: "FileText",
    description: "Text and content widgets",
  },
  {
    id: "media",
    name: "Media",
    icon: "Image",
    description: "Images, videos, and galleries",
  },
  {
    id: "forms",
    name: "Forms",
    icon: "FileInput",
    description: "Forms and user input",
  },
  {
    id: "social-proof",
    name: "Social Proof",
    icon: "Users",
    description: "Testimonials and trust elements",
  },
  {
    id: "blog",
    name: "Blog",
    icon: "Newspaper",
    description: "Blog post display widgets",
  },
  {
    id: "commerce",
    name: "Commerce",
    icon: "CreditCard",
    description: "Pricing and commerce widgets",
  },
  {
    id: "layout",
    name: "Layout",
    icon: "Layout",
    description: "Spacing and layout helpers",
  },
  {
    id: "cta",
    name: "Call to Action",
    icon: "MousePointerClick",
    description: "Buttons and CTAs",
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: "Code",
    description: "Advanced widgets",
  },
];

// Widget Registry Class
class WidgetRegistryClass {
  private widgets: Map<WidgetType, WidgetDefinition> = new Map();
  private mostUsed: WidgetType[] = ["hero-content", "image", "lead-form", "trust-badges"];

  // Register a widget
  register<T>(definition: WidgetDefinition<T>): void {
    this.widgets.set(definition.type, definition as WidgetDefinition);
  }

  // Get a widget definition
  get(type: WidgetType): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  // Get all widgets
  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  // Get widgets by category
  getByCategory(category: WidgetCategory): WidgetDefinition[] {
    if (category === "most-used") {
      return this.mostUsed
        .map((type) => this.widgets.get(type))
        .filter((w): w is WidgetDefinition => w !== undefined);
    }
    return Array.from(this.widgets.values()).filter(
      (widget) => widget.category === category
    );
  }

  // Get category info
  getCategoryInfo(category: WidgetCategory): WidgetCategoryInfo | undefined {
    return WIDGET_CATEGORIES.find((c) => c.id === category);
  }

  // Get all categories with their widgets
  getCategorizedWidgets(): { category: WidgetCategoryInfo; widgets: WidgetDefinition[] }[] {
    return WIDGET_CATEGORIES.map((category) => ({
      category,
      widgets: this.getByCategory(category.id),
    })).filter((group) => group.widgets.length > 0);
  }

  // Check if a widget type exists
  has(type: WidgetType): boolean {
    return this.widgets.has(type);
  }

  // Get default settings for a widget type
  getDefaultSettings(type: WidgetType): Record<string, unknown> {
    const definition = this.widgets.get(type);
    return definition?.defaultSettings || {};
  }

  // Set most used widgets
  setMostUsed(types: WidgetType[]): void {
    this.mostUsed = types;
  }
}

// Export singleton instance
export const WidgetRegistry = new WidgetRegistryClass();

// Helper function to create unique IDs
export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create a new section with default settings
export function createSection(layout: import("./types").SectionLayout = "1"): import("./types").Section {
  const columnCount = getColumnCountFromLayout(layout);
  const columns: import("./types").Column[] = [];

  for (let i = 0; i < columnCount; i++) {
    columns.push({
      id: generateId("col"),
      widgets: [],
      settings: {
        verticalAlign: "top",
        padding: 0,
      },
    });
  }

  return {
    id: generateId("section"),
    order: 0,
    layout,
    columns,
    settings: DEFAULT_SECTION_SETTINGS,
  };
}

// Helper to create a new widget
export function createWidget<T = unknown>(
  type: WidgetType,
  settings?: Partial<T>
): import("./types").Widget<unknown> {
  const definition = WidgetRegistry.get(type);
  const defaultSettings = definition?.defaultSettings || {};

  return {
    id: generateId("widget"),
    type,
    settings: { ...defaultSettings, ...settings },
  };
}

// Helper to get column count from layout
function getColumnCountFromLayout(layout: import("./types").SectionLayout): number {
  switch (layout) {
    case "1":
      return 1;
    case "1-1":
    case "1-2":
    case "2-1":
      return 2;
    case "1-1-1":
    case "1-2-1":
      return 3;
    case "1-1-1-1":
      return 4;
    default:
      return 1;
  }
}

// Export type for registration
export type RegisterWidgetFn = <T>(definition: WidgetDefinition<T>) => void;
