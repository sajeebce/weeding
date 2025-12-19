"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  Eye,
  ChevronRight,
  FileText,
  Mail,
  Phone,
  Calendar,
  Hash,
  AlignLeft,
  List,
  CheckSquare,
  Upload,
  MapPin,
  Globe,
  Type,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Field types with icons
const FIELD_TYPES = [
  { type: "TEXT", label: "Text", icon: Type, description: "Single line text input" },
  { type: "EMAIL", label: "Email", icon: Mail, description: "Email address field" },
  { type: "PHONE", label: "Phone", icon: Phone, description: "Phone number field" },
  { type: "NUMBER", label: "Number", icon: Hash, description: "Numeric input" },
  { type: "DATE", label: "Date", icon: Calendar, description: "Date picker" },
  { type: "TEXTAREA", label: "Text Area", icon: AlignLeft, description: "Multi-line text" },
  { type: "SELECT", label: "Dropdown", icon: List, description: "Single selection dropdown" },
  { type: "MULTI_SELECT", label: "Multi Select", icon: List, description: "Multiple selection" },
  { type: "RADIO", label: "Radio", icon: CheckSquare, description: "Single choice options" },
  { type: "CHECKBOX", label: "Checkbox", icon: CheckSquare, description: "True/false toggle" },
  { type: "FILE_UPLOAD", label: "File Upload", icon: Upload, description: "File attachment" },
  { type: "COUNTRY_SELECT", label: "Country", icon: Globe, description: "Country selector" },
  { type: "STATE_SELECT", label: "State", icon: MapPin, description: "State/Province selector" },
  { type: "HEADING", label: "Heading", icon: Type, description: "Section heading" },
  { type: "PARAGRAPH", label: "Paragraph", icon: FileText, description: "Info text block" },
  { type: "DIVIDER", label: "Divider", icon: Minus, description: "Visual separator" },
];

const FIELD_WIDTHS = [
  { value: "FULL", label: "Full Width" },
  { value: "HALF", label: "Half Width" },
  { value: "THIRD", label: "One Third" },
  { value: "TWO_THIRD", label: "Two Thirds" },
];

const DATA_SOURCE_TYPES = [
  { value: "STATIC", label: "Static Options" },
  { value: "COUNTRY_LIST", label: "Countries" },
  { value: "STATE_LIST", label: "States (by Country)" },
  { value: "CURRENCY_LIST", label: "Currencies" },
  { value: "CUSTOM_LIST", label: "Custom List" },
];

interface FormField {
  id?: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  helpText?: string;
  order: number;
  width: string;
  required: boolean;
  validation?: Record<string, unknown>;
  options?: Array<{ value: string; label: string }>;
  dataSourceType?: string;
  dataSourceKey?: string;
  dependsOn?: string;
  conditionalLogic?: Record<string, unknown>;
  accept?: string;
  maxSize?: number;
  defaultValue?: string;
}

interface FormTab {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  fields: FormField[];
}

interface FormTemplate {
  id?: string;
  version: number;
  isActive: boolean;
  tabs: FormTab[];
}

interface ServiceInfo {
  id: string;
  name: string;
  slug: string;
}

const defaultField: FormField = {
  name: "",
  label: "",
  type: "TEXT",
  placeholder: "",
  helpText: "",
  order: 1,
  width: "FULL",
  required: false,
  options: [],
};

const defaultTab: FormTab = {
  name: "New Tab",
  description: "",
  icon: "file-text",
  order: 1,
  fields: [],
};

// Sortable Tab Item Component
interface SortableTabItemProps {
  tab: FormTab;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  canDelete: boolean;
}

function SortableTabItem({
  tab,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  canDelete,
}: SortableTabItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id || `tab-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 opacity-50 hover:opacity-100" />
        </div>
        <span className="truncate">{tab.name}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onEdit}
        >
          <Settings2 className="h-3 w-3" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Sortable Field Item Component
interface SortableFieldItemProps {
  field: FormField;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableFieldItem({
  field,
  index,
  onEdit,
  onDelete,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id || `field-${index}` });

  const fieldType = FIELD_TYPES.find((ft) => ft.type === field.type);
  const Icon = fieldType?.icon || Type;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 bg-background",
        field.width === "HALF" && "w-1/2",
        field.width === "THIRD" && "w-1/3",
        field.width === "TWO_THIRD" && "w-2/3"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </div>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {field.label}
          </span>
          {field.required && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {fieldType?.label} • {field.name}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // UI State
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  // Tab dialog
  const [tabDialogOpen, setTabDialogOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<FormTab | null>(null);
  const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);

  // Custom lists for data sources
  const [customLists, setCustomLists] = useState<Array<{ id: string; key: string; name: string }>>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle tab reorder
  const handleTabDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !template) return;

    const oldIndex = template.tabs.findIndex((tab) => (tab.id || `tab-${template.tabs.indexOf(tab)}`) === active.id);
    const newIndex = template.tabs.findIndex((tab) => (tab.id || `tab-${template.tabs.indexOf(tab)}`) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update UI
    const newTabs = arrayMove(template.tabs, oldIndex, newIndex);
    setTemplate({ ...template, tabs: newTabs });

    // Adjust selected tab index if needed
    if (selectedTabIndex === oldIndex) {
      setSelectedTabIndex(newIndex);
    } else if (oldIndex < selectedTabIndex && newIndex >= selectedTabIndex) {
      setSelectedTabIndex(selectedTabIndex - 1);
    } else if (oldIndex > selectedTabIndex && newIndex <= selectedTabIndex) {
      setSelectedTabIndex(selectedTabIndex + 1);
    }

    // Persist to server
    try {
      const tabIds = newTabs.map((tab) => tab.id).filter(Boolean);
      const response = await fetch(`/api/admin/form-templates/${serviceId}/tabs/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tabIds }),
      });

      if (!response.ok) {
        // Revert on error
        fetchTemplate();
        toast.error("Failed to reorder tabs");
      }
    } catch (error) {
      console.error("Error reordering tabs:", error);
      fetchTemplate();
      toast.error("Failed to reorder tabs");
    }
  };

  // Handle field reorder
  const handleFieldDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !template) return;

    const currentTab = template.tabs[selectedTabIndex];
    if (!currentTab?.id) return;

    const oldIndex = currentTab.fields.findIndex((field) => (field.id || `field-${currentTab.fields.indexOf(field)}`) === active.id);
    const newIndex = currentTab.fields.findIndex((field) => (field.id || `field-${currentTab.fields.indexOf(field)}`) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update UI
    const newFields = arrayMove(currentTab.fields, oldIndex, newIndex);
    const newTabs = [...template.tabs];
    newTabs[selectedTabIndex] = { ...currentTab, fields: newFields };
    setTemplate({ ...template, tabs: newTabs });

    // Persist to server
    try {
      const fieldIds = newFields.map((field) => field.id).filter(Boolean);
      const response = await fetch(`/api/admin/form-templates/${serviceId}/tabs/${currentTab.id}/fields/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldIds }),
      });

      if (!response.ok) {
        // Revert on error
        fetchTemplate();
        toast.error("Failed to reorder fields");
      }
    } catch (error) {
      console.error("Error reordering fields:", error);
      fetchTemplate();
      toast.error("Failed to reorder fields");
    }
  };

  const fetchTemplate = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/form-templates/${serviceId}`);
      const data = await response.json();

      if (response.ok) {
        setService(data.service);
        setTemplate(data.template);
      } else {
        toast.error(data.error || "Failed to load form template");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load form template");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  const fetchCustomLists = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/lists/custom");
      const data = await response.json();
      if (response.ok) {
        setCustomLists(data);
      }
    } catch (error) {
      console.error("Error fetching custom lists:", error);
    }
  }, []);

  useEffect(() => {
    fetchTemplate();
    fetchCustomLists();
  }, [fetchTemplate, fetchCustomLists]);

  // Create template if it doesn't exist
  const createTemplate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/form-templates/${serviceId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setTemplate(data);
        toast.success("Form template created");
      } else {
        toast.error(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsSaving(false);
    }
  };

  // Tab management
  const openTabDialog = (tab?: FormTab, index?: number) => {
    if (tab && index !== undefined) {
      setEditingTab({ ...tab });
      setEditingTabIndex(index);
    } else {
      setEditingTab({ ...defaultTab, order: (template?.tabs.length || 0) + 1 });
      setEditingTabIndex(null);
    }
    setTabDialogOpen(true);
  };

  const saveTab = async () => {
    if (!editingTab || !template) return;

    if (!editingTab.name.trim()) {
      toast.error("Tab name is required");
      return;
    }

    setIsSaving(true);
    try {
      if (editingTabIndex !== null) {
        // Update existing tab
        const tab = template.tabs[editingTabIndex];
        const response = await fetch(
          `/api/admin/form-templates/${serviceId}/tabs/${tab.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingTab.name,
              description: editingTab.description,
              icon: editingTab.icon,
            }),
          }
        );

        if (response.ok) {
          toast.success("Tab updated");
          fetchTemplate();
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to update tab");
        }
      } else {
        // Create new tab
        const response = await fetch(
          `/api/admin/form-templates/${serviceId}/tabs`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editingTab.name,
              description: editingTab.description,
              icon: editingTab.icon,
            }),
          }
        );

        if (response.ok) {
          toast.success("Tab created");
          fetchTemplate();
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to create tab");
        }
      }

      setTabDialogOpen(false);
      setEditingTab(null);
      setEditingTabIndex(null);
    } catch (error) {
      console.error("Error saving tab:", error);
      toast.error("Failed to save tab");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTab = async (index: number) => {
    if (!template) return;

    const tab = template.tabs[index];
    if (!tab.id) return;

    if (!confirm("Are you sure you want to delete this tab? All fields will be deleted.")) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/form-templates/${serviceId}/tabs/${tab.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Tab deleted");
        if (selectedTabIndex >= template.tabs.length - 1) {
          setSelectedTabIndex(Math.max(0, template.tabs.length - 2));
        }
        fetchTemplate();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete tab");
      }
    } catch (error) {
      console.error("Error deleting tab:", error);
      toast.error("Failed to delete tab");
    } finally {
      setIsSaving(false);
    }
  };

  // Field management
  const addField = async (type: string) => {
    if (!template) return;

    const currentTab = template.tabs[selectedTabIndex];
    if (!currentTab?.id) return;

    const fieldType = FIELD_TYPES.find((ft) => ft.type === type);
    const newField: FormField = {
      ...defaultField,
      type,
      name: `field_${Date.now()}`,
      label: fieldType?.label || type,
      order: currentTab.fields.length + 1,
    };

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/form-templates/${serviceId}/tabs/${currentTab.id}/fields`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newField),
        }
      );

      if (response.ok) {
        toast.success("Field added");
        fetchTemplate();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add field");
      }
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error("Failed to add field");
    } finally {
      setIsSaving(false);
    }
  };

  const openFieldEditor = (field: FormField, index: number) => {
    setEditingField({ ...field });
    setSelectedFieldIndex(index);
    setShowFieldEditor(true);
  };

  const saveField = async () => {
    if (!editingField || !template || selectedFieldIndex === null) return;

    const currentTab = template.tabs[selectedTabIndex];
    const field = currentTab.fields[selectedFieldIndex];
    if (!field.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/form-templates/${serviceId}/tabs/${currentTab.id}/fields/${field.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingField),
        }
      );

      if (response.ok) {
        toast.success("Field updated");
        fetchTemplate();
        setShowFieldEditor(false);
        setEditingField(null);
        setSelectedFieldIndex(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update field");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update field");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteField = async (fieldIndex: number) => {
    if (!template) return;

    const currentTab = template.tabs[selectedTabIndex];
    const field = currentTab.fields[fieldIndex];
    if (!field.id) return;

    if (!confirm("Are you sure you want to delete this field?")) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/form-templates/${serviceId}/tabs/${currentTab.id}/fields/${field.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        toast.success("Field deleted");
        fetchTemplate();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete field");
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      toast.error("Failed to delete field");
    } finally {
      setIsSaving(false);
    }
  };

  // Add option for select fields
  const addOption = () => {
    if (!editingField) return;
    setEditingField({
      ...editingField,
      options: [...(editingField.options || []), { value: "", label: "" }],
    });
  };

  const updateOption = (index: number, key: "value" | "label", value: string) => {
    if (!editingField) return;
    const options = [...(editingField.options || [])];
    options[index] = { ...options[index], [key]: value };
    setEditingField({ ...editingField, options });
  };

  const removeOption = (index: number) => {
    if (!editingField) return;
    setEditingField({
      ...editingField,
      options: (editingField.options || []).filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no template exists, show create button
  if (!template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/services/${serviceId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Form Builder</h1>
            <p className="text-muted-foreground">{service?.name}</p>
          </div>
        </div>

        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Form Template</CardTitle>
            <CardDescription>
              This service doesn&apos;t have a custom form template yet. Create one to start building your checkout form.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={createTemplate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Form Template
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTab = template.tabs[selectedTabIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Builder</h1>
          <p className="text-muted-foreground">{service?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/checkout/${service?.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/services/${serviceId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar - Tabs & Field Types */}
        <div className="space-y-6 lg:col-span-3">
          {/* Tabs Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Form Steps</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openTabDialog()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTabDragEnd}
              >
                <SortableContext
                  items={template.tabs.map((tab, i) => tab.id || `tab-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {template.tabs.map((tab, index) => (
                    <SortableTabItem
                      key={tab.id || `tab-${index}`}
                      tab={tab}
                      index={index}
                      isSelected={selectedTabIndex === index}
                      onSelect={() => setSelectedTabIndex(index)}
                      onEdit={(e) => {
                        e.stopPropagation();
                        openTabDialog(tab, index);
                      }}
                      onDelete={(e) => {
                        e.stopPropagation();
                        deleteTab(index);
                      }}
                      canDelete={template.tabs.length > 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>

          {/* Field Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Add Field</CardTitle>
              <CardDescription className="text-xs">
                Click to add a field to the current tab
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    size="sm"
                    className="h-auto flex-col gap-1 py-2"
                    onClick={() => addField(fieldType.type)}
                    disabled={isSaving}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{fieldType.label}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Form Preview */}
        <div className="lg:col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentTab?.name || "Form Fields"}</CardTitle>
                  {currentTab?.description && (
                    <CardDescription>{currentTab.description}</CardDescription>
                  )}
                </div>
                <Badge variant="outline">
                  {currentTab?.fields.length || 0} fields
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!currentTab?.fields.length ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                  <p className="mb-4 text-muted-foreground">
                    No fields in this tab yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click on a field type in the sidebar to add it
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleFieldDragEnd}
                >
                  <SortableContext
                    items={currentTab.fields.map((field, i) => field.id || `field-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {currentTab.fields.map((field, index) => (
                        <SortableFieldItem
                          key={field.id || `field-${index}`}
                          field={field}
                          index={index}
                          onEdit={() => openFieldEditor(field, index)}
                          onDelete={() => deleteField(index)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Edit Dialog */}
      <Dialog open={tabDialogOpen} onOpenChange={setTabDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTabIndex !== null ? "Edit Tab" : "Add Tab"}
            </DialogTitle>
            <DialogDescription>
              Configure the form step settings
            </DialogDescription>
          </DialogHeader>
          {editingTab && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tab Name *</Label>
                <Input
                  value={editingTab.name}
                  onChange={(e) =>
                    setEditingTab({ ...editingTab, name: e.target.value })
                  }
                  placeholder="e.g., Personal Information"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingTab.description || ""}
                  onChange={(e) =>
                    setEditingTab({ ...editingTab, description: e.target.value })
                  }
                  placeholder="Brief description of this step..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  value={editingTab.icon || ""}
                  onChange={(e) =>
                    setEditingTab({ ...editingTab, icon: e.target.value })
                  }
                  placeholder="e.g., user, map-pin, file"
                />
                <p className="text-xs text-muted-foreground">
                  Lucide icon name (optional)
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTabDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTab} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Editor Sheet */}
      <Sheet open={showFieldEditor} onOpenChange={setShowFieldEditor}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg px-6">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Field Settings</SheetTitle>
            <SheetDescription>Configure field properties</SheetDescription>
          </SheetHeader>
          {editingField && (() => {
            // Determine which settings to show based on field type
            const fieldType = editingField.type;
            const isDisplayOnly = ["HEADING", "PARAGRAPH", "DIVIDER"].includes(fieldType);
            const hasPlaceholder = ["TEXT", "EMAIL", "PHONE", "NUMBER", "DATE", "TEXTAREA", "SELECT", "MULTI_SELECT", "COUNTRY_SELECT", "STATE_SELECT"].includes(fieldType);
            const hasHelpText = !["HEADING", "PARAGRAPH", "DIVIDER"].includes(fieldType);
            const hasWidth = !["DIVIDER"].includes(fieldType);
            const hasRequired = !["HEADING", "PARAGRAPH", "DIVIDER"].includes(fieldType);
            const hasOptions = ["SELECT", "MULTI_SELECT", "RADIO", "CHECKBOX_GROUP"].includes(fieldType);
            const hasFileSettings = ["FILE_UPLOAD", "IMAGE_UPLOAD"].includes(fieldType);

            return (
            <div className="mt-6 space-y-6 pr-2">
              {/* Field Type - At the top since other fields depend on it */}
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={editingField.type}
                  onValueChange={(v) =>
                    setEditingField({ ...editingField, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((ft) => (
                      <SelectItem key={ft.type} value={ft.type}>
                        {ft.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Basic Settings</h4>

                {/* Label */}
                <div className="space-y-2">
                  <Label>Label *</Label>
                  <Input
                    value={editingField.label}
                    onChange={(e) =>
                      setEditingField({ ...editingField, label: e.target.value })
                    }
                    placeholder={isDisplayOnly ? "Heading text..." : "Field label"}
                  />
                  <p className="text-xs text-muted-foreground">
                    The text shown to users for this field
                  </p>
                </div>

                {/* Placeholder - Only for text-based inputs */}
                {hasPlaceholder && (
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input
                      value={editingField.placeholder || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          placeholder: e.target.value,
                        })
                      }
                      placeholder="Placeholder text..."
                    />
                  </div>
                )}

                {/* Help Text - For most fields */}
                {hasHelpText && (
                  <div className="space-y-2">
                    <Label>Help Text</Label>
                    <Textarea
                      value={editingField.helpText || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          helpText: e.target.value,
                        })
                      }
                      placeholder="Help text shown below the field..."
                      rows={2}
                    />
                  </div>
                )}

                {/* Width */}
                {hasWidth && (
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Select
                      value={editingField.width}
                      onValueChange={(v) =>
                        setEditingField({ ...editingField, width: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_WIDTHS.map((fw) => (
                          <SelectItem key={fw.value} value={fw.value}>
                            {fw.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Required Toggle - For input fields */}
                {hasRequired && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label>Required</Label>
                      <p className="text-xs text-muted-foreground">
                        Make this field mandatory
                      </p>
                    </div>
                    <Switch
                      checked={editingField.required}
                      onCheckedChange={(v) =>
                        setEditingField({ ...editingField, required: v })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Options for Select/Radio fields */}
              {["SELECT", "MULTI_SELECT", "RADIO", "CHECKBOX_GROUP"].includes(
                editingField.type
              ) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Data Source</h4>
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select
                      value={editingField.dataSourceType || "STATIC"}
                      onValueChange={(v) =>
                        setEditingField({
                          ...editingField,
                          dataSourceType: v,
                          dataSourceKey: undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_SOURCE_TYPES.map((ds) => (
                          <SelectItem key={ds.value} value={ds.value}>
                            {ds.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editingField.dataSourceType === "CUSTOM_LIST" && (
                    <div className="space-y-2">
                      <Label>Custom List</Label>
                      <Select
                        value={editingField.dataSourceKey || ""}
                        onValueChange={(v) =>
                          setEditingField({
                            ...editingField,
                            dataSourceKey: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        <SelectContent>
                          {customLists.map((list) => (
                            <SelectItem key={list.id} value={list.key}>
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {editingField.dataSourceType === "STATE_LIST" && (
                    <div className="space-y-2">
                      <Label>Depends On Field</Label>
                      <Input
                        value={editingField.dependsOn || ""}
                        onChange={(e) =>
                          setEditingField({
                            ...editingField,
                            dependsOn: e.target.value,
                          })
                        }
                        placeholder="country field name"
                      />
                      <p className="text-xs text-muted-foreground">
                        The country field name to filter states by
                      </p>
                    </div>
                  )}

                  {(!editingField.dataSourceType ||
                    editingField.dataSourceType === "STATIC") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button variant="ghost" size="sm" onClick={addOption}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      {(editingField.options || []).map((opt, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={opt.value}
                            onChange={(e) =>
                              updateOption(i, "value", e.target.value)
                            }
                            placeholder="Value"
                            className="w-1/3"
                          />
                          <Input
                            value={opt.label}
                            onChange={(e) =>
                              updateOption(i, "label", e.target.value)
                            }
                            placeholder="Label"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(i)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* File Upload Settings */}
              {["FILE_UPLOAD", "IMAGE_UPLOAD"].includes(editingField.type) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">File Settings</h4>
                  <div className="space-y-2">
                    <Label>Accepted File Types</Label>
                    <Input
                      value={editingField.accept || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          accept: e.target.value,
                        })
                      }
                      placeholder=".pdf,.jpg,.png"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated file extensions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={editingField.maxSize || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          maxSize: parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-6 mt-6 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFieldEditor(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={saveField}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Field
                </Button>
              </div>
            </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
