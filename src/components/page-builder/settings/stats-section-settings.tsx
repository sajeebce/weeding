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
import type { StatsSectionWidgetSettings, StatItem } from "@/lib/page-builder/types";
import { DEFAULT_STATS_SECTION_SETTINGS } from "@/lib/page-builder/defaults";
import { generateId } from "@/lib/page-builder/widget-registry";
import {
  SelectInput,
  ColorInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface SortableStatItemProps {
  stat: StatItem;
  index: number;
  onUpdate: (id: string, updates: Partial<StatItem>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}

function SortableStatItem({
  stat,
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
  } = useSortable({ id: stat.id });

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
            value={stat.value}
            onChange={(e) => onUpdate(stat.id, { value: e.target.value })}
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
            onClick={() => onCopy(stat.id)}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(stat.id)}
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
              value={stat.label}
              onChange={(e) => onUpdate(stat.id, { label: e.target.value })}
              placeholder="LLCs Formed"
              className="h-8 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Prefix</label>
              <Input
                value={stat.prefix || ""}
                onChange={(e) => onUpdate(stat.id, { prefix: e.target.value })}
                placeholder="$"
                className="h-8 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Suffix</label>
              <Input
                value={stat.suffix || ""}
                onChange={(e) => onUpdate(stat.id, { suffix: e.target.value })}
                placeholder="+"
                className="h-8 mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id={`animate-${stat.id}`}
              checked={stat.animate}
              onCheckedChange={(checked) => onUpdate(stat.id, { animate: !!checked })}
            />
            <label
              htmlFor={`animate-${stat.id}`}
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Animate count up
            </label>
          </div>
        </div>
      )}

      {/* Collapsed Label Preview */}
      {!isExpanded && stat.label && (
        <div className="px-3 pb-2 -mt-1">
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      )}
    </div>
  );
}

interface StatsSectionWidgetSettingsProps {
  settings: StatsSectionWidgetSettings;
  onChange: (settings: StatsSectionWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function StatsSectionWidgetSettingsPanel({
  settings,
  onChange,
  activeTab = "content",
}: StatsSectionWidgetSettingsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Merge with defaults
  const s: StatsSectionWidgetSettings = {
    ...DEFAULT_STATS_SECTION_SETTINGS,
    ...settings,
    style: { ...DEFAULT_STATS_SECTION_SETTINGS.style, ...settings?.style },
  };

  const updateField = <K extends keyof StatsSectionWidgetSettings>(
    key: K,
    value: StatsSectionWidgetSettings[K]
  ) => {
    onChange({ ...s, [key]: value });
  };

  const updateStyleField = (
    key: keyof StatsSectionWidgetSettings["style"],
    value: string | boolean
  ) => {
    onChange({ ...s, style: { ...s.style, [key]: value } });
  };

  const addStat = useCallback(() => {
    const newStat: StatItem = {
      id: generateId("stat"),
      value: "",
      label: "",
      prefix: "",
      suffix: "",
      animate: true,
    };
    onChange({ ...s, stats: [...s.stats, newStat] });
  }, [s, onChange]);

  const updateStat = useCallback((id: string, updates: Partial<StatItem>) => {
    onChange({
      ...s,
      stats: s.stats.map((stat) =>
        stat.id === id ? { ...stat, ...updates } : stat
      ),
    });
  }, [s, onChange]);

  const removeStat = useCallback((id: string) => {
    onChange({
      ...s,
      stats: s.stats.filter((stat) => stat.id !== id),
    });
  }, [s, onChange]);

  const copyStat = useCallback((id: string) => {
    const statToCopy = s.stats.find((st) => st.id === id);
    if (!statToCopy) return;

    const index = s.stats.findIndex((st) => st.id === id);
    const newStat: StatItem = {
      ...statToCopy,
      id: generateId("stat"),
    };
    const newStats = [...s.stats];
    newStats.splice(index + 1, 0, newStat);
    onChange({ ...s, stats: newStats });
  }, [s, onChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = s.stats.findIndex((st) => st.id === active.id);
      const newIndex = s.stats.findIndex((st) => st.id === over.id);
      onChange({ ...s, stats: arrayMove(s.stats, oldIndex, newIndex) });
    }
  }, [s, onChange]);

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Columns */}
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

      {/* Centered */}
      <ToggleSwitch
        label="Center Stats"
        checked={s.centered}
        onChange={(checked) => updateField("centered", checked)}
      />

      {/* Stats List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Stat Items
          </label>
          <span className="text-xs text-muted-foreground">
            {s.stats.length} item{s.stats.length !== 1 ? "s" : ""}
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={s.stats.map((st) => st.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {s.stats.map((stat, index) => (
                <SortableStatItem
                  key={stat.id}
                  stat={stat}
                  index={index}
                  onUpdate={updateStat}
                  onDelete={removeStat}
                  onCopy={copyStat}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addStat}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Stat
        </Button>
      </div>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-3">
      <ColorInput
        label="Value Color"
        value={s.style.valueColor}
        onChange={(v) => updateStyleField("valueColor", v)}
      />
      <ColorInput
        label="Label Color"
        value={s.style.labelColor}
        onChange={(v) => updateStyleField("labelColor", v)}
      />
      <SelectInput
        label="Value Size"
        value={s.style.valueSize}
        onChange={(v) => updateStyleField("valueSize", v)}
        options={[
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "Extra Large" },
        ]}
      />
      <ToggleSwitch
        label="Show Dividers"
        checked={s.style.divider}
        onChange={(checked) => updateStyleField("divider", checked)}
      />
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-3">
      <ToggleSwitch
        label="Animate on Scroll"
        description="Numbers will count up when scrolled into view"
        checked={s.animateOnScroll}
        onChange={(checked) => updateField("animateOnScroll", checked)}
      />
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
