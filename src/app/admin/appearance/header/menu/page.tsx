"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
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
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  LayoutGrid,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MenuItem, HeaderConfig } from "@/lib/header-footer/types";

interface MenuItemWithChildren extends MenuItem {
  children: MenuItemWithChildren[];
}

const defaultFormData = {
  label: "",
  url: "",
  target: "_self" as "_self" | "_blank",
  icon: "",
  isMegaMenu: false,
  megaMenuColumns: 4,
  isVisible: true,
  visibleOnMobile: true,
  badge: "",
  categoryName: "",
  categoryIcon: "",
  categoryDesc: "",
  parentId: null as string | null,
};

export default function MenuBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [header, setHeader] = useState<HeaderConfig | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemWithChildren[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  // Drag and drop state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch header first to get the ID
      const headerRes = await fetch("/api/admin/header");
      if (!headerRes.ok) throw new Error("Failed to fetch header");
      const headerData = await headerRes.json();

      if (headerData.headers && headerData.headers.length > 0) {
        const activeHeader = headerData.headers.find((h: HeaderConfig) => h.isActive) || headerData.headers[0];
        setHeader(activeHeader);

        // Fetch menu items
        const menuRes = await fetch(`/api/admin/header/menu?headerId=${activeHeader.id}`);
        if (!menuRes.ok) throw new Error("Failed to fetch menu");
        const menuData = await menuRes.json();
        setMenuItems(menuData.menuItems || []);

        // Expand items with children by default
        const itemsWithChildren = new Set<string>();
        function findItemsWithChildren(items: MenuItemWithChildren[]) {
          items.forEach((item) => {
            if (item.children && item.children.length > 0) {
              itemsWithChildren.add(item.id);
              findItemsWithChildren(item.children);
            }
          });
        }
        findItemsWithChildren(menuData.menuItems || []);
        setExpandedItems(itemsWithChildren);
      }
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function openCreateDialog(parentId: string | null = null) {
    setSelectedItem(null);
    setFormData({ ...defaultFormData, parentId });
    setDialogOpen(true);
  }

  function openEditDialog(item: MenuItem) {
    setSelectedItem(item);
    setFormData({
      label: item.label,
      url: item.url || "",
      target: item.target as "_self" | "_blank",
      icon: item.icon || "",
      isMegaMenu: item.isMegaMenu,
      megaMenuColumns: item.megaMenuColumns || 4,
      isVisible: item.isVisible,
      visibleOnMobile: item.visibleOnMobile ?? true,
      badge: item.badge || "",
      categoryName: item.categoryName || "",
      categoryIcon: item.categoryIcon || "",
      categoryDesc: item.categoryDesc || "",
      parentId: item.parentId || null,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(item: MenuItem) {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.label) {
      toast.error("Label is required");
      return;
    }

    if (!header) return;

    setSaving(true);
    try {
      const url = selectedItem
        ? "/api/admin/header/menu"
        : "/api/admin/header/menu";
      const method = selectedItem ? "PUT" : "POST";

      const payload = {
        ...(selectedItem && { id: selectedItem.id }),
        headerId: header.id,
        ...formData,
        url: formData.url || null,
        icon: formData.icon || null,
        badge: formData.badge || null,
        categoryName: formData.categoryName || null,
        categoryIcon: formData.categoryIcon || null,
        categoryDesc: formData.categoryDesc || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedItem ? "Menu item updated" : "Menu item created");
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save menu item");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedItem) return;

    try {
      const res = await fetch(`/api/admin/header/menu?id=${selectedItem.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Menu item deleted");
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  }

  async function toggleVisibility(item: MenuItem) {
    try {
      const res = await fetch("/api/admin/header/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isVisible: !item.isVisible,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");
      fetchData();
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  }

  // Helper to find item by id in tree
  function findItemById(items: MenuItemWithChildren[], id: string): MenuItemWithChildren | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper to find parent id of an item
  function findParentId(items: MenuItemWithChildren[], id: string, parentId: string | null = null): string | null {
    for (const item of items) {
      if (item.id === id) return parentId;
      if (item.children) {
        const found = findParentId(item.children, id, item.id);
        if (found !== undefined) return found;
      }
    }
    return null;
  }

  // Get siblings (items at the same level with the same parent)
  function getSiblings(items: MenuItemWithChildren[], id: string): MenuItemWithChildren[] {
    // Check if it's a root item
    const rootIndex = items.findIndex(item => item.id === id);
    if (rootIndex !== -1) return items;

    // Find in children
    for (const item of items) {
      if (item.children) {
        const childIndex = item.children.findIndex(child => child.id === id);
        if (childIndex !== -1) return item.children;
        const found = getSiblings(item.children, id);
        if (found.length > 0) return found;
      }
    }
    return [];
  }

  // Drag start handler
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  // Drag end handler
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeItem = findItemById(menuItems, active.id as string);
    const overItem = findItemById(menuItems, over.id as string);

    if (!activeItem || !overItem) return;

    // Get the parent of the active item
    const activeParentId = activeItem.parentId;
    const overParentId = overItem.parentId;

    // Only allow reordering within the same parent
    if (activeParentId !== overParentId) {
      toast.error("Items can only be reordered within the same level");
      return;
    }

    // Get siblings
    const siblings = getSiblings(menuItems, active.id as string);
    const oldIndex = siblings.findIndex(item => item.id === active.id);
    const newIndex = siblings.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally
    const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);

    // Update state optimistically
    if (activeParentId === null) {
      // Root level
      setMenuItems(reorderedSiblings);
    } else {
      // Child level - update parent's children
      setMenuItems(prevItems => {
        const updateChildren = (items: MenuItemWithChildren[]): MenuItemWithChildren[] => {
          return items.map(item => {
            if (item.id === activeParentId) {
              return { ...item, children: reorderedSiblings };
            }
            if (item.children) {
              return { ...item, children: updateChildren(item.children) };
            }
            return item;
          });
        };
        return updateChildren(prevItems);
      });
    }

    // Save to backend
    try {
      const itemsToUpdate = reorderedSiblings.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));

      const res = await fetch("/api/admin/header/menu/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToUpdate }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("Menu order updated");
    } catch (error) {
      toast.error("Failed to save menu order");
      fetchData(); // Revert to server state
    }
  }

  // Get the active item for drag overlay
  const activeItem = activeId ? findItemById(menuItems, activeId as string) : null;

  // Sortable Menu Item Component
  function SortableMenuItem({
    item,
    depth = 0,
  }: {
    item: MenuItemWithChildren;
    depth?: number;
  }) {
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

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    // Get child IDs for sortable context
    const childIds = hasChildren ? item.children.map((c) => c.id) : [];

    return (
      <div ref={setNodeRef} style={style}>
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50",
            !item.isVisible && "opacity-50",
            depth > 0 && "ml-6 border-l-4 border-l-primary/20",
            isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
          )}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Expand/Collapse */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {/* Label */}
          <span className="flex-1 font-medium">{item.label}</span>

          {/* URL */}
          {item.url && (
            <span className="text-xs text-muted-foreground">{item.url}</span>
          )}

          {/* Badges */}
          {item.isMegaMenu && (
            <Badge variant="secondary" className="text-xs">
              <LayoutGrid className="mr-1 h-3 w-3" />
              Mega Menu
            </Badge>
          )}
          {item.badge && (
            <Badge variant="outline" className="text-xs">
              {item.badge}
            </Badge>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => toggleVisibility(item)}
            >
              {item.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEditDialog(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => openDeleteDialog(item)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {/* Add child item */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openCreateDialog(item.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Children with their own sortable context */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
              {item.children.map((child) => (
                <SortableMenuItem key={child.id} item={child} depth={depth + 1} />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    );
  }

  // Drag overlay item (non-interactive version for drag preview)
  function DragOverlayItem({ item }: { item: MenuItemWithChildren }) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-card p-3 shadow-xl ring-2 ring-primary",
          !item.isVisible && "opacity-50"
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="w-6" />
        <span className="flex-1 font-medium">{item.label}</span>
        {item.url && (
          <span className="text-xs text-muted-foreground">{item.url}</span>
        )}
        {item.isMegaMenu && (
          <Badge variant="secondary" className="text-xs">
            <LayoutGrid className="mr-1 h-3 w-3" />
            Mega Menu
          </Badge>
        )}
      </div>
    );
  }

  // Get root item IDs for sortable context
  const rootItemIds = useMemo(() => menuItems.map((item) => item.id), [menuItems]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/appearance/header">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Menu Builder</h1>
            <p className="text-muted-foreground">
              Manage navigation menu items and mega menu structure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button onClick={() => openCreateDialog(null)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Menu</CardTitle>
          <CardDescription>
            Drag to reorder items. Click the + button to add child items for dropdowns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
              <p className="mb-4 text-muted-foreground">No menu items yet</p>
              <Button onClick={() => openCreateDialog(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Menu Item
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rootItemIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <SortableMenuItem key={item.id} item={item} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeItem ? <DragOverlayItem item={activeItem} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <LayoutGrid className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Mega Menu Support</p>
              <p className="text-sm text-muted-foreground">
                Enable "Mega Menu" on a parent item to display its children in a multi-column dropdown.
                Add category information (name, icon, description) to create sections within the mega menu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Services"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="e.g., /services"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="target">Link Target</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value: "_self" | "_blank") =>
                    setFormData({ ...formData, target: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Tab</SelectItem>
                    <SelectItem value="_blank">New Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide name)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., building-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Badge Text</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., New, Popular"
                />
              </div>
            </div>

            {/* Mega Menu Settings */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Mega Menu</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable multi-column dropdown for this item
                  </p>
                </div>
                <Switch
                  checked={formData.isMegaMenu}
                  onCheckedChange={(checked) => setFormData({ ...formData, isMegaMenu: checked })}
                />
              </div>

              {formData.isMegaMenu && (
                <div className="space-y-2">
                  <Label>Number of Columns</Label>
                  <Select
                    value={String(formData.megaMenuColumns)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, megaMenuColumns: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Category Info (for mega menu children) */}
            {formData.parentId && (
              <div className="rounded-lg border p-4 space-y-4">
                <Label className="text-base">Category Information</Label>
                <p className="text-sm text-muted-foreground">
                  Used for mega menu section headers
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      placeholder="e.g., Formation & Legal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryIcon">Category Icon</Label>
                    <Input
                      id="categoryIcon"
                      value={formData.categoryIcon}
                      onChange={(e) => setFormData({ ...formData, categoryIcon: e.target.value })}
                      placeholder="e.g., building-2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDesc">Category Description</Label>
                  <Input
                    id="categoryDesc"
                    value={formData.categoryDesc}
                    onChange={(e) => setFormData({ ...formData, categoryDesc: e.target.value })}
                    placeholder="e.g., Start your US business"
                  />
                </div>
              </div>
            )}

            {/* Visibility */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Visible</Label>
                  <p className="text-xs text-muted-foreground">Show in navigation</p>
                </div>
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Visible on Mobile</Label>
                  <p className="text-xs text-muted-foreground">Show in mobile menu</p>
                </div>
                <Switch
                  checked={formData.visibleOnMobile}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibleOnMobile: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {selectedItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedItem?.label}" and all its child items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
