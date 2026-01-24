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
import { Plus, Trash2, GripVertical, Copy } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { TrustBadgesWidgetSettings, TrustBadge } from "@/lib/page-builder/types";
import { DEFAULT_TRUST_BADGES_SETTINGS } from "@/lib/page-builder/defaults";
import { generateId } from "@/lib/page-builder/widget-registry";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  "ThumbsUp",
  "Heart",
  "Sparkles",
  "Trophy",
  "Rocket",
];

// Get Lucide icon component by name
function getLucideIcon(
  name: string
): React.ComponentType<{ className?: string }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  return icons[name] || LucideIcons.Shield;
}

interface SortableBadgeItemProps {
  badge: TrustBadge;
  index: number;
  onUpdate: (id: string, field: keyof TrustBadge, value: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}

function SortableBadgeItem({
  badge,
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
  } = useSortable({ id: badge.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getLucideIcon(badge.icon);

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
            <Icon className="h-4 w-4 text-primary" />
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
                const IconOption = getLucideIcon(iconName);
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onUpdate(badge.id, "icon", iconName);
                      setIsIconPickerOpen(false);
                      setIconSearch("");
                    }}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded transition-colors",
                      badge.icon === iconName
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    title={iconName}
                  >
                    <IconOption className="h-4 w-4" />
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
                value={badge.icon}
                onChange={(e) => onUpdate(badge.id, "icon", e.target.value)}
                className="mt-1 h-8 font-mono text-xs"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Text Input */}
      <div className="flex-1">
        <Input
          value={badge.text}
          onChange={(e) => onUpdate(badge.id, "text", e.target.value)}
          placeholder="Badge text..."
          className="h-9"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onCopy(badge.id)}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(badge.id)}
          className="flex h-7 w-7 items-center justify-center rounded text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface TrustBadgesWidgetSettingsProps {
  settings: TrustBadgesWidgetSettings;
  onChange: (settings: TrustBadgesWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function TrustBadgesWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: TrustBadgesWidgetSettingsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Merge with defaults
  const s: TrustBadgesWidgetSettings = {
    ...DEFAULT_TRUST_BADGES_SETTINGS,
    ...settings,
    style: { ...DEFAULT_TRUST_BADGES_SETTINGS.style, ...settings?.style },
  };

  const updateField = <K extends keyof TrustBadgesWidgetSettings>(
    key: K,
    value: TrustBadgesWidgetSettings[K]
  ) => {
    onChange({ ...s, [key]: value });
  };

  const updateStyleField = (key: keyof TrustBadgesWidgetSettings["style"], value: string | number) => {
    onChange({ ...s, style: { ...s.style, [key]: value } });
  };

  const addBadge = useCallback(() => {
    const newBadge: TrustBadge = {
      id: generateId("badge"),
      icon: "Shield",
      text: "",
    };
    onChange({ ...s, badges: [...s.badges, newBadge] });
  }, [s, onChange]);

  const updateBadge = useCallback((id: string, field: keyof TrustBadge, value: string) => {
    onChange({
      ...s,
      badges: s.badges.map((badge) =>
        badge.id === id ? { ...badge, [field]: value } : badge
      ),
    });
  }, [s, onChange]);

  const removeBadge = useCallback((id: string) => {
    onChange({
      ...s,
      badges: s.badges.filter((badge) => badge.id !== id),
    });
  }, [s, onChange]);

  const copyBadge = useCallback((id: string) => {
    const badgeToCopy = s.badges.find((b) => b.id === id);
    if (!badgeToCopy) return;

    const index = s.badges.findIndex((b) => b.id === id);
    const newBadge: TrustBadge = {
      ...badgeToCopy,
      id: generateId("badge"),
    };
    const newBadges = [...s.badges];
    newBadges.splice(index + 1, 0, newBadge);
    onChange({ ...s, badges: newBadges });
  }, [s, onChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = s.badges.findIndex((b) => b.id === active.id);
      const newIndex = s.badges.findIndex((b) => b.id === over.id);
      onChange({ ...s, badges: arrayMove(s.badges, oldIndex, newIndex) });
    }
  }, [s, onChange]);

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Layout */}
      <SelectInput
        label="Layout"
        value={s.layout}
        onChange={(v) => updateField("layout", v as "horizontal" | "grid")}
        options={[
          { value: "horizontal", label: "Horizontal (Inline)" },
          { value: "grid", label: "Grid" },
        ]}
      />

      {/* Columns (for grid layout) */}
      {s.layout === "grid" && (
        <SelectInput
          label="Columns"
          value={s.columns.toString()}
          onChange={(v) => updateField("columns", parseInt(v) as 2 | 3 | 4 | 5)}
          options={[
            { value: "2", label: "2 Columns" },
            { value: "3", label: "3 Columns" },
            { value: "4", label: "4 Columns" },
            { value: "5", label: "5 Columns" },
          ]}
        />
      )}

      {/* Centered */}
      <ToggleSwitch
        label="Center Badges"
        checked={s.centered}
        onChange={(checked) => updateField("centered", checked)}
      />

      {/* Badges List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Badge Items
          </label>
          <span className="text-xs text-muted-foreground">
            {s.badges.length} item{s.badges.length !== 1 ? "s" : ""}
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={s.badges.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {s.badges.map((badge, index) => (
                <SortableBadgeItem
                  key={badge.id}
                  badge={badge}
                  index={index}
                  onUpdate={updateBadge}
                  onDelete={removeBadge}
                  onCopy={copyBadge}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addBadge}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Badge
        </Button>
      </div>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-3">
      <ColorInput
        label="Background Color"
        value={s.style.backgroundColor}
        onChange={(v) => updateStyleField("backgroundColor", v)}
      />
      <ColorInput
        label="Border Color"
        value={s.style.borderColor}
        onChange={(v) => updateStyleField("borderColor", v)}
      />
      <ColorInput
        label="Icon Color"
        value={s.style.iconColor}
        onChange={(v) => updateStyleField("iconColor", v)}
      />
      <ColorInput
        label="Text Color"
        value={s.style.textColor}
        onChange={(v) => updateStyleField("textColor", v)}
      />
      <NumberInput
        label="Border Radius"
        value={s.style.borderRadius}
        onChange={(v) => updateStyleField("borderRadius", v)}
        min={0}
        max={24}
        step={1}
        unit="px"
      />
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center py-4">
        Advanced settings coming soon.
      </p>
    </div>
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
