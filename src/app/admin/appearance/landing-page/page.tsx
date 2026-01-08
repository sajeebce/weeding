"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2,
  Smartphone,
  Monitor,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LandingPage, LandingPageBlock } from "@prisma/client";

// New Components
import { BuilderPanel } from "./components/builder-panel";
import { LivePreviewCanvas } from "./components/live-preview-canvas";

type PageWithBlocks = LandingPage & { blocks: LandingPageBlock[] };

export default function LandingPageBuilderPage() {
  const [page, setPage] = useState<PageWithBlocks | null>(null);
  const [blocks, setBlocks] = useState<LandingPageBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [pendingInsertPosition, setPendingInsertPosition] = useState<number | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load default landing page
  useEffect(() => {
    async function loadPage() {
      try {
        const response = await fetch("/api/admin/landing-pages");
        const pages = await response.json();

        // Find default page or first page
        let defaultPage = pages.find((p: LandingPage) => p.isDefault);
        if (!defaultPage && pages.length > 0) {
          defaultPage = pages[0];
        }

        if (defaultPage) {
          // Fetch full page with blocks
          const pageResponse = await fetch(`/api/admin/landing-pages/${defaultPage.id}`);
          const fullPage = await pageResponse.json();
          setPage(fullPage);
          setBlocks(fullPage.blocks || []);
        } else {
          // Create default homepage
          const createResponse = await fetch("/api/admin/landing-pages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug: "homepage",
              name: "Homepage",
              isDefault: true,
            }),
          });
          const newPage = await createResponse.json();
          setPage(newPage);
          setBlocks([]);
        }
      } catch (error) {
        console.error("Error loading page:", error);
        toast.error("Failed to load landing page");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  // Add block handler - uses pendingInsertPosition if no position provided
  const handleAddBlock = useCallback(async (type: string, position?: number) => {
    if (!page) return;

    // Use pending position if available, otherwise use provided position or append to end
    const insertPosition = position ?? pendingInsertPosition ?? blocks.length;

    try {
      const response = await fetch(`/api/admin/landing-pages/${page.id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          sortOrder: insertPosition,
        }),
      });

      const newBlock = await response.json();

      setBlocks((prev) => {
        const updated = [...prev];
        updated.splice(insertPosition, 0, newBlock);
        return updated.map((b, i) => ({ ...b, sortOrder: i }));
      });

      setSelectedBlockId(newBlock.id);
      setPendingInsertPosition(null); // Clear pending position after insertion
      setIsDirty(true);
      toast.success("Block added");
    } catch (error) {
      console.error("Error adding block:", error);
      toast.error("Failed to add block");
    }
  }, [page, pendingInsertPosition, blocks.length]);

  // Update block settings handler
  const handleUpdateBlockSettings = useCallback(async (blockId: string, settings: Record<string, unknown>) => {
    if (!page) return;

    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, settings: settings as LandingPageBlock["settings"] } : b))
    );
    setIsDirty(true);

    // Debounced save to API
    try {
      await fetch(`/api/admin/landing-pages/${page.id}/blocks/${blockId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
    } catch (error) {
      console.error("Error updating block:", error);
    }
  }, [page]);

  // Delete block handler
  const handleDeleteBlock = useCallback(async (blockId: string) => {
    if (!page) return;

    try {
      await fetch(`/api/admin/landing-pages/${page.id}/blocks/${blockId}`, {
        method: "DELETE",
      });

      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
      setIsDirty(true);
      toast.success("Block deleted");
    } catch (error) {
      console.error("Error deleting block:", error);
      toast.error("Failed to delete block");
    }
  }, [page, selectedBlockId]);

  // Duplicate block handler
  const handleDuplicateBlock = useCallback(async (blockId: string) => {
    if (!page) return;

    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    try {
      const response = await fetch(`/api/admin/landing-pages/${page.id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: block.type,
          settings: block.settings,
          sortOrder: block.sortOrder + 1,
        }),
      });

      const newBlock = await response.json();

      setBlocks((prev) => {
        const index = prev.findIndex((b) => b.id === blockId);
        const updated = [...prev];
        updated.splice(index + 1, 0, newBlock);
        return updated.map((b, i) => ({ ...b, sortOrder: i }));
      });

      setSelectedBlockId(newBlock.id);
      setIsDirty(true);
      toast.success("Block duplicated");
    } catch (error) {
      console.error("Error duplicating block:", error);
      toast.error("Failed to duplicate block");
    }
  }, [page, blocks]);

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !page) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
      ...b,
      sortOrder: i,
    }));

    setBlocks(reorderedBlocks);
    setIsDirty(true);

    // Save to API
    try {
      await fetch(`/api/admin/landing-pages/${page.id}/blocks/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockIds: reorderedBlocks.map((b) => b.id),
        }),
      });
    } catch (error) {
      console.error("Error reordering blocks:", error);
      toast.error("Failed to reorder blocks");
    }
  };

  // Save handler
  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      await fetch(`/api/admin/landing-pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incrementVersion: true,
        }),
      });

      setIsDirty(false);
      toast.success("Page saved");
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  // Get selected block
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Landing Page Builder</span>
            {page && (
              <span className="text-sm text-muted-foreground">
                — {page.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center rounded-md border p-1">
            <Button
              variant={previewDevice === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setPreviewDevice("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setPreviewDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Builder Panel (Context-Aware) */}
          <BuilderPanel
            blocks={blocks}
            selectedBlock={selectedBlock}
            onAddBlock={handleAddBlock}
            onSelectBlock={setSelectedBlockId}
            onUpdateSettings={(settings) =>
              selectedBlockId && handleUpdateBlockSettings(selectedBlockId, settings)
            }
            pendingInsertPosition={pendingInsertPosition}
            onClearPendingPosition={() => setPendingInsertPosition(null)}
            className="w-[360px] shrink-0"
          />

          {/* Right Panel - Live Preview Canvas */}
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <LivePreviewCanvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onRequestAddBlock={(position) => {
                setSelectedBlockId(null); // Switch to browse mode
                setPendingInsertPosition(position);
              }}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              device={previewDevice}
              className="flex-1"
            />
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <div className="rounded-lg border bg-card p-4 shadow-lg">
                {blocks.find((b) => b.id === activeId)?.type || "Block"}
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
}
