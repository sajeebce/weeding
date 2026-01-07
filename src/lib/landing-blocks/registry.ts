import type { z } from "zod";
import type { BlockCategory, BlockDefinition } from "./types";

// ============================================
// BLOCK REGISTRY
// ============================================

class BlockRegistry {
  private blocks = new Map<string, BlockDefinition<unknown>>();

  /**
   * Register a new block type
   */
  register<T>(definition: BlockDefinition<T>): void {
    this.blocks.set(definition.type, definition as BlockDefinition<unknown>);
  }

  /**
   * Get a block definition by type
   */
  get(type: string): BlockDefinition<unknown> | undefined {
    return this.blocks.get(type);
  }

  /**
   * Get all registered blocks
   */
  getAll(): BlockDefinition<unknown>[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Get blocks by category
   */
  getByCategory(category: BlockCategory): BlockDefinition<unknown>[] {
    return this.getAll().filter((b) => b.category === category);
  }

  /**
   * Get the component for a block type
   */
  getComponent(type: string): React.ComponentType<{ settings: unknown }> | undefined {
    return this.get(type)?.component;
  }

  /**
   * Get the settings panel for a block type
   */
  getSettingsPanel(
    type: string
  ): React.ComponentType<{ settings: unknown; onChange: (settings: unknown) => void }> | undefined {
    return this.get(type)?.settingsPanel;
  }

  /**
   * Get the default settings for a block type
   */
  getDefaultSettings(type: string): unknown | undefined {
    return this.get(type)?.defaultSettings;
  }

  /**
   * Check if a block type is registered
   */
  has(type: string): boolean {
    return this.blocks.has(type);
  }

  /**
   * Get all block types
   */
  getTypes(): string[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * Get blocks grouped by category
   */
  getGroupedByCategory(): Record<BlockCategory, BlockDefinition<unknown>[]> {
    const grouped: Partial<Record<BlockCategory, BlockDefinition<unknown>[]>> = {};

    for (const block of this.getAll()) {
      if (!grouped[block.category]) {
        grouped[block.category] = [];
      }
      grouped[block.category]!.push(block);
    }

    return grouped as Record<BlockCategory, BlockDefinition<unknown>[]>;
  }
}

// Singleton instance
export const blockRegistry = new BlockRegistry();

// ============================================
// BLOCK CATEGORY METADATA
// ============================================

export const blockCategories: Record<
  BlockCategory,
  { name: string; description: string; icon: string }
> = {
  hero: {
    name: "Hero",
    description: "Above-the-fold hero sections",
    icon: "Layout",
  },
  trust: {
    name: "Trust",
    description: "Logo bars, testimonials, stats",
    icon: "Shield",
  },
  services: {
    name: "Services",
    description: "Service grids and listings",
    icon: "Grid3x3",
  },
  process: {
    name: "Process",
    description: "How it works, timelines",
    icon: "ListOrdered",
  },
  pricing: {
    name: "Pricing",
    description: "Pricing tables and cards",
    icon: "DollarSign",
  },
  faq: {
    name: "FAQ",
    description: "Frequently asked questions",
    icon: "HelpCircle",
  },
  cta: {
    name: "CTA",
    description: "Call-to-action sections",
    icon: "MousePointerClick",
  },
  content: {
    name: "Content",
    description: "Rich text, images, videos",
    icon: "FileText",
  },
  navigation: {
    name: "Navigation",
    description: "Tabs, anchors, navigation",
    icon: "Navigation",
  },
  "lead-capture": {
    name: "Lead Capture",
    description: "Forms, newsletters, popups",
    icon: "Mail",
  },
};
