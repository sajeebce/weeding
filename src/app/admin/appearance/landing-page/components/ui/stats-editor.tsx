"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  GripVertical,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { StatItem } from "@/lib/landing-blocks/types";
import { ToggleSwitch } from "./form-controls";

// Generate unique ID
function generateId(): string {
  return `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface SortableStatItemProps {
  item: StatItem & { id: string };
  index: number;
  onUpdate: (item: StatItem & { id: string }) => void;
  onDelete: () => void;
  onCopy: () => void;
}

function SortableStatItem({
  item,
  index,
  onUpdate,
  onDelete,
  onCopy,
}: SortableStatItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card transition-colors hover:border-primary/50",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      {/* Header Row */}
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{index + 1}</span>
        </div>

        {/* Value Input */}
        <div className="flex-1">
          <Input
            value={item.value}
            onChange={(e) => onUpdate({ ...item, value: e.target.value })}
            placeholder="10,000+"
            className="h-9 font-semibold"
          />
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Fields */}
      {isExpanded && (
        <div className="border-t px-3 pb-3 pt-2 space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">Label</label>
            <Input
              value={item.label}
              onChange={(e) => onUpdate({ ...item, label: e.target.value })}
              placeholder="LLCs Formed"
              className="h-8 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Prefix</label>
              <Input
                value={item.prefix || ""}
                onChange={(e) => onUpdate({ ...item, prefix: e.target.value })}
                placeholder="$"
                className="h-8 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Suffix</label>
              <Input
                value={item.suffix || ""}
                onChange={(e) => onUpdate({ ...item, suffix: e.target.value })}
                placeholder="+"
                className="h-8 mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Label Preview */}
      {!isExpanded && item.label && (
        <div className="px-3 pb-2 -mt-1">
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      )}
    </div>
  );
}

interface StatsEditorProps {
  enabled: boolean;
  items: StatItem[];
  onEnabledChange: (enabled: boolean) => void;
  onItemsChange: (items: StatItem[]) => void;
}

export function StatsEditor({
  enabled,
  items,
  onEnabledChange,
  onItemsChange,
}: StatsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Ensure items have IDs
  const itemsWithIds = items.map((item, index) => ({
    ...item,
    id: (item as StatItem & { id?: string }).id || `stat_${index}`,
  }));

  const addItem = useCallback(() => {
    const newItem = {
      id: generateId(),
      value: "",
      label: "",
      prefix: "",
      suffix: "",
    };
    onItemsChange([...items, newItem]);
  }, [items, onItemsChange]);

  const updateItem = useCallback(
    (index: number, updatedItem: StatItem & { id: string }) => {
      const newItems = [...itemsWithIds];
      newItems[index] = updatedItem;
      onItemsChange(newItems);
    },
    [itemsWithIds, onItemsChange]
  );

  const deleteItem = useCallback(
    (index: number) => {
      onItemsChange(itemsWithIds.filter((_, i) => i !== index));
    },
    [itemsWithIds, onItemsChange]
  );

  const copyItem = useCallback(
    (index: number) => {
      const itemToCopy = itemsWithIds[index];
      const newItem = {
        ...itemToCopy,
        id: generateId(),
      };
      const newItems = [...itemsWithIds];
      newItems.splice(index + 1, 0, newItem);
      onItemsChange(newItems);
    },
    [itemsWithIds, onItemsChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = itemsWithIds.findIndex((item) => item.id === active.id);
        const newIndex = itemsWithIds.findIndex((item) => item.id === over.id);
        onItemsChange(arrayMove(itemsWithIds, oldIndex, newIndex));
      }
    },
    [itemsWithIds, onItemsChange]
  );

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <ToggleSwitch
        label="Show Stats Section"
        checked={enabled}
        onChange={onEnabledChange}
      />

      {enabled && (
        <>
          {/* Stat Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Stat Items
              </label>
              <span className="text-xs text-muted-foreground">
                {itemsWithIds.length} item{itemsWithIds.length !== 1 ? "s" : ""}
              </span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemsWithIds.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {itemsWithIds.map((item, index) => (
                    <SortableStatItem
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={(updated) => updateItem(index, updated)}
                      onDelete={() => deleteItem(index)}
                      onCopy={() => copyItem(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Stat
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
