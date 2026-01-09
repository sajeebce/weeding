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
  Shield,
  Clock,
  Globe,
  Star,
  CheckCircle,
  Award,
  Lock,
  Zap,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TrustBadgeItem } from "@/lib/landing-blocks/types";
import { ToggleSwitch } from "./form-controls";

// Popular icons for trust badges
const BADGE_ICONS = [
  "Shield",
  "Clock",
  "Globe",
  "Star",
  "CheckCircle",
  "Award",
  "Lock",
  "Zap",
  "BadgeCheck",
  "ShieldCheck",
  "Users",
  "Verified",
  "ThumbsUp",
  "Heart",
  "Sparkles",
  "Trophy",
];

// Get Lucide icon component by name
function getLucideIcon(name: string): React.ComponentType<{ className?: string }> | null {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[name] || null;
}

// Generate unique ID
function generateId(): string {
  return `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface SortableBadgeItemProps {
  item: TrustBadgeItem & { id: string };
  index: number;
  onUpdate: (item: TrustBadgeItem & { id: string }) => void;
  onDelete: () => void;
  onCopy: () => void;
}

function SortableBadgeItem({
  item,
  index,
  onUpdate,
  onDelete,
  onCopy,
}: SortableBadgeItemProps) {
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");

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

  const IconComponent = getLucideIcon(item.icon);

  // Filter icons based on search
  const filteredIcons = iconSearch
    ? BADGE_ICONS.filter((icon) =>
        icon.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : BADGE_ICONS;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-start gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-primary/50",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex flex-col items-center gap-1 pt-1.5 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{index + 1}</span>
      </div>

      {/* Icon Picker */}
      <Popover open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 transition-colors hover:bg-muted"
            title="Change icon"
          >
            {IconComponent ? (
              <IconComponent className="h-4 w-4 text-primary" />
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start" side="right">
          <div className="space-y-3">
            <Input
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              className="h-8"
            />
            <div className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto">
              {filteredIcons.map((iconName) => {
                const Icon = getLucideIcon(iconName);
                if (!Icon) return null;
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onUpdate({ ...item, icon: iconName });
                      setIsIconPickerOpen(false);
                      setIconSearch("");
                    }}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded transition-colors",
                      item.icon === iconName
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    title={iconName}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">
                Or type icon name directly:
              </p>
              <Input
                placeholder="e.g., Shield, Clock, Globe"
                value={item.icon}
                onChange={(e) => onUpdate({ ...item, icon: e.target.value })}
                className="mt-1 h-8 font-mono text-xs"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Text Input */}
      <div className="flex-1">
        <Input
          value={item.text}
          onChange={(e) => onUpdate({ ...item, text: e.target.value })}
          placeholder="Badge text..."
          className="h-9"
        />
      </div>

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
  );
}

interface TrustBadgesEditorProps {
  enabled: boolean;
  items: TrustBadgeItem[];
  onEnabledChange: (enabled: boolean) => void;
  onItemsChange: (items: TrustBadgeItem[]) => void;
}

export function TrustBadgesEditor({
  enabled,
  items,
  onEnabledChange,
  onItemsChange,
}: TrustBadgesEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Ensure items have IDs
  const itemsWithIds = items.map((item, index) => ({
    ...item,
    id: (item as TrustBadgeItem & { id?: string }).id || `badge_${index}`,
  }));

  const addItem = useCallback(() => {
    const newItem = {
      id: generateId(),
      icon: "Shield",
      text: "",
    };
    onItemsChange([...items, newItem]);
  }, [items, onItemsChange]);

  const updateItem = useCallback(
    (index: number, updatedItem: TrustBadgeItem & { id: string }) => {
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
        label="Show Trust Badges"
        checked={enabled}
        onChange={onEnabledChange}
      />

      {enabled && (
        <>
          {/* Badge Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Badge Items
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
                    <SortableBadgeItem
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
              Add Badge
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
