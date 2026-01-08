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
  List,
  LayoutGrid,
  AlignLeft,
  AlignRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  FeatureItem,
  FeatureListLayout,
  FeatureIconPosition,
} from "@/lib/landing-blocks/types";
import { FormField, ToggleSwitch } from "./form-controls";

// Popular icons for quick selection
const POPULAR_ICONS = [
  "CheckCircle",
  "Check",
  "Star",
  "Zap",
  "Shield",
  "Clock",
  "Globe",
  "Award",
  "ThumbsUp",
  "Heart",
  "Sparkles",
  "Rocket",
  "Target",
  "TrendingUp",
  "Users",
  "Lock",
  "BadgeCheck",
  "CircleCheck",
  "ArrowRight",
  "ChevronRight",
];

// Get Lucide icon component by name
function getLucideIcon(name: string): React.ComponentType<{ className?: string }> | null {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  return icons[name] || null;
}

// Generate unique ID
function generateId(): string {
  return `feat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface SortableFeatureItemProps {
  item: FeatureItem;
  index: number;
  onUpdate: (item: FeatureItem) => void;
  onDelete: () => void;
  onCopy: () => void;
}

function SortableFeatureItem({
  item,
  index,
  onUpdate,
  onDelete,
  onCopy,
}: SortableFeatureItemProps) {
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
    ? POPULAR_ICONS.filter((icon) =>
        icon.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : POPULAR_ICONS;

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
                placeholder="e.g., Rocket, Star, Heart"
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
          placeholder="Feature text..."
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

// Inline Color Picker Component
interface InlineColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function InlineColorPicker({ label, value, onChange }: InlineColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    "#22c55e", // green
    "#f97316", // orange
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#ef4444", // red
    "#eab308", // yellow
    "#14b8a6", // teal
    "#6366f1", // indigo
    "#ffffff", // white
  ];

  return (
    <FormField label={label}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50">
            <div
              className="h-6 w-6 rounded border shadow-sm"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left text-sm font-mono">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="start" side="right">
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "h-8 w-8 rounded-md border-2 transition-transform hover:scale-110",
                    value === color ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="border-t pt-2">
              <label className="text-xs text-muted-foreground">Custom color</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border"
                />
                <Input
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#000000"
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

interface FeatureListEditorProps {
  enabled: boolean;
  items: FeatureItem[];
  layout: FeatureListLayout;
  iconPosition: FeatureIconPosition;
  iconColor: string;
  columns: 1 | 2 | 3 | 4;
  onEnabledChange: (enabled: boolean) => void;
  onItemsChange: (items: FeatureItem[]) => void;
  onLayoutChange: (layout: FeatureListLayout) => void;
  onIconPositionChange: (position: FeatureIconPosition) => void;
  onIconColorChange: (color: string) => void;
  onColumnsChange: (columns: 1 | 2 | 3 | 4) => void;
}

export function FeatureListEditor({
  enabled,
  items,
  layout,
  iconPosition,
  iconColor,
  columns,
  onEnabledChange,
  onItemsChange,
  onLayoutChange,
  onIconPositionChange,
  onIconColorChange,
  onColumnsChange,
}: FeatureListEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addItem = useCallback(() => {
    const newItem: FeatureItem = {
      id: generateId(),
      text: "",
      icon: "CheckCircle",
    };
    onItemsChange([...items, newItem]);
  }, [items, onItemsChange]);

  const updateItem = useCallback(
    (index: number, updatedItem: FeatureItem) => {
      const newItems = [...items];
      newItems[index] = updatedItem;
      onItemsChange(newItems);
    },
    [items, onItemsChange]
  );

  const deleteItem = useCallback(
    (index: number) => {
      onItemsChange(items.filter((_, i) => i !== index));
    },
    [items, onItemsChange]
  );

  const copyItem = useCallback(
    (index: number) => {
      const itemToCopy = items[index];
      const newItem: FeatureItem = {
        ...itemToCopy,
        id: generateId(),
      };
      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
      onItemsChange(newItems);
    },
    [items, onItemsChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        onItemsChange(arrayMove(items, oldIndex, newIndex));
      }
    },
    [items, onItemsChange]
  );

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <ToggleSwitch
        label="Show Features"
        checked={enabled}
        onChange={onEnabledChange}
      />

      {enabled && (
        <>
          {/* Layout Options */}
          <div className="grid grid-cols-2 gap-3">
            {/* Layout Style */}
            <FormField label="Layout Style">
              <div className="flex gap-1">
                <button
                  onClick={() => onLayoutChange("list")}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center gap-1.5 rounded border text-xs transition-colors",
                    layout === "list"
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  onClick={() => onLayoutChange("grid")}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center gap-1.5 rounded border text-xs transition-colors",
                    layout === "grid"
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Grid
                </button>
              </div>
            </FormField>

            {/* Icon Position */}
            <FormField label="Icon Position">
              <div className="flex gap-1">
                <button
                  onClick={() => onIconPositionChange("left")}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center gap-1.5 rounded border text-xs transition-colors",
                    iconPosition === "left"
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                  Left
                </button>
                <button
                  onClick={() => onIconPositionChange("right")}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center gap-1.5 rounded border text-xs transition-colors",
                    iconPosition === "right"
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <AlignRight className="h-3.5 w-3.5" />
                  Right
                </button>
              </div>
            </FormField>
          </div>

          {/* Grid Columns (only for grid layout) */}
          {layout === "grid" && (
            <FormField label="Columns">
              <Select
                value={columns.toString()}
                onValueChange={(v) => onColumnsChange(parseInt(v) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}

          {/* Icon Color - Inline picker */}
          <InlineColorPicker
            label="Icon Color"
            value={iconColor}
            onChange={onIconColorChange}
          />

          {/* Feature Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Feature Items
              </label>
              <span className="text-xs text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <SortableFeatureItem
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
              Add Feature
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
