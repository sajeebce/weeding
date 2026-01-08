"use client";

import { useState, useCallback } from "react";
import {
  Search,
  ArrowLeft,
  LayoutTemplate,
  Type,
  Image,
  Star,
  MessageSquare,
  Users,
  Layers,
  Settings,
  MoreVertical,
  Pencil,
  Contrast,
  Settings2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings } from "@/lib/landing-blocks/types";
import { HeroContentSettings } from "./settings-forms/hero-content-settings";
import { HeroStyleSettings } from "./settings-forms/hero-style-settings";
import { HeroAdvancedSettings } from "./settings-forms/hero-advanced-settings";

// ============================================
// TYPES
// ============================================

type PanelMode = "browse" | "edit" | "layers";
type SettingsTab = "content" | "style" | "advanced";

interface BuilderPanelProps {
  blocks: LandingPageBlock[];
  selectedBlock: LandingPageBlock | null;
  onAddBlock: (type: string) => void;
  onSelectBlock: (id: string | null) => void;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
  pendingInsertPosition?: number | null;
  onClearPendingPosition?: () => void;
  className?: string;
}

interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

// ============================================
// BLOCK DEFINITIONS
// ============================================

const blockDefinitions: BlockDefinition[] = [
  // Hero blocks
  {
    type: "hero-centered",
    name: "Hero - Centered",
    description: "Centered headline with CTA buttons",
    icon: LayoutTemplate,
    category: "hero",
  },
  {
    type: "hero-split",
    name: "Hero - Split",
    description: "Two-column layout with image",
    icon: LayoutTemplate,
    category: "hero",
  },
  {
    type: "hero-split-dashboard",
    name: "Hero - Dashboard",
    description: "Animated words with dashboard visual",
    icon: LayoutTemplate,
    category: "hero",
  },
  {
    type: "hero-minimal",
    name: "Hero - Minimal",
    description: "Clean text-only hero section",
    icon: LayoutTemplate,
    category: "hero",
  },
  // Content blocks
  {
    type: "features",
    name: "Features",
    description: "Feature grid or list section",
    icon: Star,
    category: "content",
  },
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Customer testimonials carousel",
    icon: MessageSquare,
    category: "content",
  },
  {
    type: "team",
    name: "Team",
    description: "Team members grid",
    icon: Users,
    category: "content",
  },
  {
    type: "text",
    name: "Text Block",
    description: "Rich text content area",
    icon: Type,
    category: "content",
  },
  {
    type: "image",
    name: "Image",
    description: "Full-width or contained image",
    icon: Image,
    category: "media",
  },
];

const categories = [
  { id: "hero", name: "Hero", count: 4 },
  { id: "content", name: "Content", count: 4 },
  { id: "media", name: "Media", count: 1 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getBlockDisplayName(type: string): string {
  const block = blockDefinitions.find((b) => b.type === type);
  return block?.name || type;
}

// ============================================
// BROWSE MODE COMPONENT
// ============================================

interface BrowseModeProps {
  onAddBlock: (type: string) => void;
  onSwitchToLayers: () => void;
  pendingInsertPosition?: number | null;
  onClearPendingPosition?: () => void;
}

function BrowseMode({ onAddBlock, onSwitchToLayers, pendingInsertPosition, onClearPendingPosition }: BrowseModeProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["hero"]);

  const hasPendingPosition = pendingInsertPosition !== null && pendingInsertPosition !== undefined;

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredBlocks = blockDefinitions.filter(
    (block) =>
      block.name.toLowerCase().includes(search.toLowerCase()) ||
      block.description.toLowerCase().includes(search.toLowerCase())
  );

  const getBlocksByCategory = (categoryId: string) =>
    filteredBlocks.filter((b) => b.category === categoryId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Pending Insert Banner */}
      {hasPendingPosition && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-primary/10 px-4 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Select a block to insert at position {pendingInsertPosition + 1}
            </span>
          </div>
          <button
            onClick={onClearPendingPosition}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex shrink-0 border-b">
        <button className="flex flex-1 flex-col items-center gap-1 border-b-2 border-primary py-3 text-primary">
          <LayoutTemplate className="h-5 w-5" />
          <span className="text-xs font-medium">Blocks</span>
        </button>
        <button
          onClick={onSwitchToLayers}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground"
        >
          <Layers className="h-5 w-5" />
          <span className="text-xs font-medium">Layers</span>
        </button>
        <button className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Global</span>
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Block Categories */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {categories.map((category) => {
            const blocks = getBlocksByCategory(category.id);
            const isExpanded = expandedCategories.includes(category.id);

            if (blocks.length === 0) return null;

            return (
              <div key={category.id}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ({blocks.length})
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Block Grid */}
                {isExpanded && (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {blocks.map((block) => (
                      <button
                        key={block.type}
                        onClick={() => onAddBlock(block.type)}
                        className="group flex flex-col items-center gap-2 rounded-lg border bg-card p-3 transition-all hover:border-primary hover:shadow-sm"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                          <block.icon className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-center text-xs font-medium leading-tight">
                          {block.name.replace("Hero - ", "")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// EDIT MODE COMPONENT (Elementor Style)
// ============================================

interface EditModeProps {
  block: LandingPageBlock;
  onBack: () => void;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
}

function EditMode({ block, onBack, onUpdateSettings }: EditModeProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("content");

  const isHeroBlock = block.type.startsWith("hero");
  const settings = block.settings as unknown as HeroSettings;

  const tabs: { id: SettingsTab; icon: React.ElementType; label: string }[] = [
    { id: "content", icon: Pencil, label: "Content" },
    { id: "style", icon: Contrast, label: "Style" },
    { id: "advanced", icon: Settings2, label: "Advanced" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-sm font-semibold">{getBlockDisplayName(block.type)}</span>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Icon Tabs */}
      <div className="flex shrink-0 justify-center border-b py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-6 py-2 transition-colors",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 h-0.5 w-12 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          {isHeroBlock ? (
            <>
              {activeTab === "content" && (
                <HeroContentSettings
                  block={block}
                  settings={settings}
                  onUpdateSettings={(s) => onUpdateSettings(s as unknown as Record<string, unknown>)}
                />
              )}
              {activeTab === "style" && (
                <HeroStyleSettings
                  block={block}
                  settings={settings}
                  onUpdateSettings={(s) => onUpdateSettings(s as unknown as Record<string, unknown>)}
                />
              )}
              {activeTab === "advanced" && (
                <HeroAdvancedSettings
                  block={block}
                  settings={settings}
                  onUpdateSettings={(s) => onUpdateSettings(s as unknown as Record<string, unknown>)}
                />
              )}
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Settings for {block.type} blocks coming soon.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// LAYERS MODE COMPONENT
// ============================================

interface LayersModeProps {
  blocks: LandingPageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onSwitchToBrowse: () => void;
}

function LayersMode({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onSwitchToBrowse,
}: LayersModeProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top Navigation */}
      <div className="flex shrink-0 border-b">
        <button
          onClick={onSwitchToBrowse}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground"
        >
          <LayoutTemplate className="h-5 w-5" />
          <span className="text-xs font-medium">Blocks</span>
        </button>
        <button className="flex flex-1 flex-col items-center gap-1 border-b-2 border-primary py-3 text-primary">
          <Layers className="h-5 w-5" />
          <span className="text-xs font-medium">Layers</span>
        </button>
        <button className="flex flex-1 flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Global</span>
        </button>
      </div>

      {/* Layers List */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {sortedBlocks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No blocks added yet
            </p>
          ) : (
            <div className="space-y-1">
              {sortedBlocks.map((block, index) => (
                <button
                  key={block.id}
                  onClick={() => onSelectBlock(block.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    selectedBlockId === block.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs">
                    {index + 1}
                  </span>
                  <span className="font-medium">{getBlockDisplayName(block.type)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// MAIN BUILDER PANEL COMPONENT
// ============================================

export function BuilderPanel({
  blocks,
  selectedBlock,
  onAddBlock,
  onSelectBlock,
  onUpdateSettings,
  pendingInsertPosition,
  onClearPendingPosition,
  className,
}: BuilderPanelProps) {
  const [mode, setMode] = useState<PanelMode>("browse");

  // Switch to edit mode when block is selected
  const effectiveMode = selectedBlock ? "edit" : mode;

  const handleBack = useCallback(() => {
    onSelectBlock(null);
    setMode("browse");
  }, [onSelectBlock]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden border-r bg-background", className)}>
      {effectiveMode === "browse" && (
        <BrowseMode
          onAddBlock={onAddBlock}
          onSwitchToLayers={() => setMode("layers")}
          pendingInsertPosition={pendingInsertPosition}
          onClearPendingPosition={onClearPendingPosition}
        />
      )}

      {effectiveMode === "edit" && selectedBlock && (
        <EditMode
          block={selectedBlock}
          onBack={handleBack}
          onUpdateSettings={onUpdateSettings}
        />
      )}

      {effectiveMode === "layers" && (
        <LayersMode
          blocks={blocks}
          selectedBlockId={selectedBlock?.id || null}
          onSelectBlock={onSelectBlock}
          onSwitchToBrowse={() => setMode("browse")}
        />
      )}
    </div>
  );
}
