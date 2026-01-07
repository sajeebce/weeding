"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  LayoutTemplate,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingPageBlock } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlockCanvasProps {
  blocks: LandingPageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onAddBlock: (type: string, position?: number) => void;
  className?: string;
}

interface SortableBlockCardProps {
  block: LandingPageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function getBlockDisplayName(type: string): string {
  const names: Record<string, string> = {
    "hero-centered": "Hero - Centered",
    "hero-split": "Hero - Split",
    "hero-split-dashboard": "Hero - Dashboard",
    "hero-minimal": "Hero - Minimal",
    features: "Features",
    testimonials: "Testimonials",
    team: "Team",
    text: "Text Block",
    image: "Image",
  };
  return names[type] || type;
}

function SortableBlockCard({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableBlockCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card transition-all",
        isSelected && "ring-2 ring-primary",
        isDragging && "opacity-50"
      )}
    >
      {/* Block Header */}
      <div
        className="flex cursor-pointer items-center gap-2 p-3"
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <button
          className="cursor-grab touch-none rounded p-1 hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Block Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
          <LayoutTemplate className="h-4 w-4 text-primary" />
        </div>

        {/* Block Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{getBlockDisplayName(block.type)}</p>
          <p className="text-xs text-muted-foreground">
            {block.name || `Block ${block.sortOrder + 1}`}
          </p>
        </div>

        {/* Visibility Indicators */}
        <div className="flex items-center gap-1">
          {block.hideOnMobile && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Hidden on mobile
            </span>
          )}
          {block.hideOnDesktop && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Hidden on desktop
            </span>
          )}
          {!block.isActive && (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Thumbnail (simplified) */}
      {isSelected && (
        <div className="border-t bg-muted/30 p-2">
          <p className="text-center text-xs text-muted-foreground">
            Click to edit settings →
          </p>
        </div>
      )}
    </div>
  );
}

export function BlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onAddBlock,
  className,
}: BlockCanvasProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className={cn("flex flex-col bg-muted/10", className)}>
      {/* Canvas Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Page Blocks</h3>
          <p className="text-xs text-muted-foreground">
            {blocks.length} block{blocks.length !== 1 ? "s" : ""} • Drag to
            reorder
          </p>
        </div>
      </div>

      {/* Blocks List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {sortedBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
              <LayoutTemplate className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="mb-1 font-medium text-muted-foreground">
                No blocks yet
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Add blocks from the library to get started
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddBlock("hero-centered", 0)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Hero Block
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBlocks.map((block) => (
                <SortableBlockCard
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  onDelete={() => onDeleteBlock(block.id)}
                  onDuplicate={() => onDuplicateBlock(block.id)}
                />
              ))}

              {/* Add Block Button */}
              <button
                onClick={() => onAddBlock("hero-centered", blocks.length)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
                Add Block
              </button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
