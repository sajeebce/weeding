"use client";

import { useState, useCallback, useMemo } from "react";
import {
  GripVertical,
  Settings,
  Copy,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { LandingPageBlock } from "@prisma/client";
import type { HeroSettings } from "@/lib/landing-blocks/types";

// Import landing block components
import { HeroBlock } from "@/components/landing-blocks/hero";

interface LivePreviewCanvasProps {
  blocks: LandingPageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onRequestAddBlock: (position: number) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  device: "desktop" | "mobile";
  className?: string;
}

interface PreviewBlockProps {
  block: LandingPageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// ============================================
// ADD BLOCK BUTTON
// ============================================

interface AddBlockButtonProps {
  onClick: () => void;
}

function AddBlockButton({ onClick }: AddBlockButtonProps) {
  return (
    <div className="group relative py-3">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/50" />
      <button
        onClick={onClick}
        className="relative left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-dashed border-muted-foreground/30 bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Block
      </button>
    </div>
  );
}

// ============================================
// PREVIEW BLOCK WRAPPER
// ============================================

function PreviewBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: PreviewBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Render the actual block component
  const renderBlockContent = () => {
    const settings = block.settings as unknown as HeroSettings;

    if (block.type.startsWith("hero")) {
      // Map block type to variant and pass via settings
      const variantMap: Record<string, HeroSettings["variant"]> = {
        "hero-centered": "centered",
        "hero-split": "split",
        "hero-split-dashboard": "split-dashboard",
        "hero-minimal": "minimal",
      };

      const mergedSettings: HeroSettings = {
        ...settings,
        variant: variantMap[block.type] || "centered",
      };

      return <HeroBlock settings={mergedSettings} />;
    }

    // Placeholder for other block types
    return (
      <div className="flex min-h-[200px] items-center justify-center bg-muted/50 text-muted-foreground">
        {block.type} block (preview coming soon)
      </div>
    );
  };

  const showControls = isSelected || isHovered;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all",
        isDragging && "opacity-50"
      )}
    >
      {/* Hover detection wrapper - includes toolbar area */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Toolbar - positioned inside hover area */}
        <div
          className={cn(
            "flex h-12 items-center justify-center transition-opacity",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-1 rounded-lg border bg-background px-2 py-1 shadow-lg">
            <button
              className="cursor-grab rounded p-1.5 hover:bg-accent active:cursor-grabbing"
              title="Drag to reorder"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="rounded p-1.5 hover:bg-accent"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="rounded p-1.5 hover:bg-accent"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded p-1.5 text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={isFirst}
              className={cn(
                "rounded p-1.5",
                isFirst ? "cursor-not-allowed opacity-30" : "hover:bg-accent"
              )}
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={isLast}
              className={cn(
                "rounded p-1.5",
                isLast ? "cursor-not-allowed opacity-30" : "hover:bg-accent"
              )}
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Block Content */}
        <div
          className="relative cursor-pointer"
          onClick={onSelect}
        >
          {/* Selection/Hover Border */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-40 border-2 transition-colors",
              isSelected
                ? "border-primary"
                : isHovered
                ? "border-primary/50"
                : "border-transparent"
            )}
          />

          {/* Block Label */}
          {showControls && (
            <div className="absolute left-2 top-2 z-50 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {block.type}
            </div>
          )}

          {/* Actual Block Render */}
          <div className="pointer-events-none">
            {renderBlockContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN LIVE PREVIEW CANVAS
// ============================================

export function LivePreviewCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onRequestAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
  device,
  className,
}: LivePreviewCanvasProps) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks]
  );

  const handleClickOutside = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelectBlock(null);
      }
    },
    [onSelectBlock]
  );

  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-hidden bg-muted/30",
        className
      )}
      onClick={handleClickOutside}
    >
      {/* Viewport Controls */}
      <div className="flex items-center justify-center border-b bg-background py-2 text-xs text-muted-foreground">
        {device === "desktop" ? "Desktop (1440px)" : "Mobile (375px)"}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 scrollbar-auto-hide">
        <div
          className={cn(
            "mx-auto overflow-hidden rounded-lg border bg-background shadow-sm transition-all",
            device === "desktop" ? "w-full max-w-[1440px]" : "w-[375px]"
          )}
        >
          {sortedBlocks.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Start building your page</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add blocks from the left panel to get started
              </p>
              <button
                onClick={() => onRequestAddBlock(0)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add Block
              </button>
            </div>
          ) : (
            <div>
              {sortedBlocks.map((block, index) => (
                <div key={block.id}>
                  {/* Add Block Button Between Blocks */}
                  {index === 0 && (
                    <AddBlockButton onClick={() => onRequestAddBlock(0)} />
                  )}

                  {/* Block */}
                  <PreviewBlock
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onDelete={() => onDeleteBlock(block.id)}
                    onDuplicate={() => onDuplicateBlock(block.id)}
                    onMoveUp={() => {
                      // Handle move up
                    }}
                    onMoveDown={() => {
                      // Handle move down
                    }}
                    isFirst={index === 0}
                    isLast={index === sortedBlocks.length - 1}
                  />

                  {/* Add Block Button After Block */}
                  <AddBlockButton
                    onClick={() => onRequestAddBlock(index + 1)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
