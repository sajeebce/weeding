"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  List,
  FileText,
  ToggleLeft,
  ToggleRight,
  Lock,
  ArrowLeft,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FormTemplate {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  isActive: boolean;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  _count: { leads: number };
}

interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  mapToLeadField?: string;
}

interface PredefinedField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  mapToLeadField: string;
  options?: string[];
  category: "contact" | "business" | "preference";
  locked?: boolean;
}

const PREDEFINED_FIELDS: PredefinedField[] = [
  // Contact fields
  { id: "pf_name", type: "text", name: "name", label: "Full Name", placeholder: "John Doe", required: true, mapToLeadField: "firstName", category: "contact", locked: true },
  { id: "pf_email", type: "email", name: "email", label: "Email Address", placeholder: "john@example.com", required: true, mapToLeadField: "email", category: "contact", locked: true },
  { id: "pf_phone", type: "phone", name: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000", required: false, mapToLeadField: "phone", category: "contact" },
  { id: "pf_country", type: "country_select", name: "country", label: "Country", placeholder: "Select your country", required: false, mapToLeadField: "country", category: "contact" },

  // Business fields
  { id: "pf_company", type: "text", name: "company", label: "Company Name", placeholder: "Acme Corp", required: false, mapToLeadField: "company", category: "business" },
  { id: "pf_service", type: "service_select", name: "service", label: "Service Interest", placeholder: "Select a service", required: false, mapToLeadField: "interestedIn", category: "business" },
  { id: "pf_budget", type: "select", name: "budget", label: "Budget Range", placeholder: "Select budget", required: false, mapToLeadField: "budget", category: "business", options: ["Under $500", "$500-$1000", "$1000-$2500", "$2500-$5000", "$5000+"] },
  { id: "pf_timeline", type: "select", name: "timeline", label: "Timeline", placeholder: "When do you need this?", required: false, mapToLeadField: "timeline", category: "business", options: ["ASAP", "Within 1 week", "Within 1 month", "Within 3 months", "No rush"] },

  // Preference fields
  { id: "pf_message", type: "textarea", name: "message", label: "Message", placeholder: "How can we help you?", required: false, mapToLeadField: "message", category: "preference" },
];

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  textarea: "Text Area",
  radio: "Radio",
  checkbox: "Checkbox",
  number: "Number",
  date: "Date",
  country_select: "Country",
  service_select: "Service",
};

const DEFAULT_FIELDS: FormField[] = [
  { id: "f1", type: "text", name: "name", label: "Full Name", placeholder: "John Doe", required: true, mapToLeadField: "firstName" },
  { id: "f2", type: "email", name: "email", label: "Email", placeholder: "john@example.com", required: true, mapToLeadField: "email" },
  { id: "f3", type: "phone", name: "phone", label: "Phone", placeholder: "+1 (555) 000-0000", required: false, mapToLeadField: "phone" },
  { id: "f4", type: "textarea", name: "message", label: "Message", placeholder: "How can we help?", required: false, mapToLeadField: "message" },
];

export default function FormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateStep, setTemplateStep] = useState<"checklist" | "customize">("checklist");
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(new Set(["pf_name", "pf_email"]));
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    fields: DEFAULT_FIELDS,
  });

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<FormTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/lead-form-templates?includeInactive=true");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch form data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Template handlers
  const openTemplateDialog = (template?: FormTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        description: template.description || "",
        fields: template.fields || DEFAULT_FIELDS,
      });
      setTemplateStep("customize");
    } else {
      setEditingTemplate(null);
      setTemplateForm({ name: "", description: "", fields: DEFAULT_FIELDS });
      setSelectedFieldIds(new Set(["pf_name", "pf_email"]));
      setTemplateStep("checklist");
    }
    setTemplateDialogOpen(true);
  };

  const generateFieldsFromChecklist = () => {
    const fields: FormField[] = PREDEFINED_FIELDS
      .filter((pf) => selectedFieldIds.has(pf.id))
      .map((pf, idx) => ({
        id: `f${idx + 1}`,
        type: pf.type,
        name: pf.name,
        label: pf.label,
        placeholder: pf.placeholder,
        required: pf.required,
        options: pf.options,
        mapToLeadField: pf.mapToLeadField,
      }));
    setTemplateForm((prev) => ({ ...prev, fields }));
    setTemplateStep("customize");
  };

  const toggleFieldSelection = (fieldId: string) => {
    const field = PREDEFINED_FIELDS.find((f) => f.id === fieldId);
    if (field?.locked) return;
    setSelectedFieldIds((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const updateTemplateField = (index: number, updates: Partial<FormField>) => {
    setTemplateForm((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], ...updates };
      return { ...prev, fields };
    });
  };

  const removeTemplateField = (index: number) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    try {
      setSavingTemplate(true);
      const url = editingTemplate
        ? `/api/admin/lead-form-templates/${editingTemplate.id}`
        : "/api/admin/lead-form-templates";
      const method = editingTemplate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });

      if (!response.ok) throw new Error("Failed to save template");

      toast.success(editingTemplate ? "Template updated" : "Template created");
      setTemplateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  // Delete handler
  const openDeleteDialog = (template: FormTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/lead-form-templates/${templateToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Template deleted");
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status
  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/lead-form-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Template ${!currentActive ? "activated" : "deactivated"}`);
      fetchData();
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Form Templates</h1>
          <p className="text-muted-foreground">
            Manage reusable form field configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/leads">
              <List className="mr-2 h-4 w-4" />
              Back to Leads
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Templates Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Form Templates</CardTitle>
            <CardDescription>Reusable form field configurations for lead capture</CardDescription>
          </div>
          <Button onClick={() => openTemplateDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No templates yet. Create your first template.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{template.fields?.length || 0} fields</TableCell>
                    <TableCell>{template._count.leads}</TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {template.isSystem && (
                        <Badge variant="outline" className="ml-1">System</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openTemplateDialog(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(template.id, template.isActive)}>
                            {template.isActive ? (
                              <><ToggleLeft className="mr-2 h-4 w-4" />Deactivate</>
                            ) : (
                              <><ToggleRight className="mr-2 h-4 w-4" />Activate</>
                            )}
                          </DropdownMenuItem>
                          {!template.isSystem && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openDeleteDialog(template)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={(open) => {
        setTemplateDialogOpen(open);
        if (!open) setTemplateStep("checklist");
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : templateStep === "checklist" ? "New Template — Select Fields" : "New Template — Customize Fields"}
            </DialogTitle>
            <DialogDescription>
              {templateStep === "checklist"
                ? "Choose which fields to include in your form template"
                : "Customize field labels, placeholders, and settings"
              }
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Checklist */}
          {templateStep === "checklist" && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g., Contact Form"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    placeholder="Optional description..."
                  />
                </div>
              </div>

              {/* Field Checklist grouped by category */}
              {(["contact", "business", "preference"] as const).map((category) => {
                const categoryFields = PREDEFINED_FIELDS.filter((f) => f.category === category);
                const categoryLabels = { contact: "Contact Information", business: "Business Details", preference: "Preferences" };
                return (
                  <div key={category} className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground tracking-wider">
                      {categoryLabels[category]}
                    </Label>
                    <div className="space-y-1">
                      {categoryFields.map((field) => {
                        const isSelected = selectedFieldIds.has(field.id);
                        const isLocked = field.locked;
                        return (
                          <label
                            key={field.id}
                            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                            } ${isLocked ? "cursor-default" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFieldSelection(field.id);
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isLocked}
                              onCheckedChange={() => toggleFieldSelection(field.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{field.label}</span>
                                {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {FIELD_TYPE_LABELS[field.type] || field.type}
                            </Badge>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedFieldIds.size} field{selectedFieldIds.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={generateFieldsFromChecklist}
                    disabled={!templateForm.name.trim() || selectedFieldIds.size === 0}
                  >
                    Next: Customize
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customize */}
          {templateStep === "customize" && (
            <div className="space-y-4 py-2">
              {!editingTemplate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTemplateStep("checklist")}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to field selection
                </Button>
              )}

              {editingTemplate && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name *</Label>
                    <Input
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{templateForm.fields.length} Fields</Label>
                <div className="space-y-2">
                  {templateForm.fields.map((field, index) => (
                    <div key={field.id} className="rounded-md border p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm flex-1">{field.label}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {FIELD_TYPE_LABELS[field.type] || field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="default" className="text-[10px]">Required</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-600"
                          onClick={() => removeTemplateField(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateTemplateField(index, { label: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateTemplateField(index, { placeholder: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateTemplateField(index, { required: checked })}
                          />
                          <Label className="text-xs">Required</Label>
                        </div>
                      </div>
                      {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                        <div className="space-y-1">
                          <Label className="text-xs">Options (one per line)</Label>
                          <Textarea
                            value={field.options?.join("\n") || ""}
                            onChange={(e) => updateTemplateField(index, {
                              options: e.target.value.split("\n").filter(Boolean),
                            })}
                            rows={3}
                            className="text-sm"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                  {savingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
