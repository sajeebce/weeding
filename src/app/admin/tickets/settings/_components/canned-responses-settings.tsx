"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Pencil, Trash2, Copy, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string | null;
  useCount: number;
  isPublic: boolean;
  createdBy?: { id: string; name: string | null };
}

const defaultCategories = ["General", "LLC", "EIN", "Banking", "Amazon", "Compliance"];

export function CannedResponsesSettings() {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("General");

  // Load responses on mount
  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/canned-responses");
      if (!response.ok) throw new Error("Failed to load responses");
      const data = await response.json();
      setResponses(data.responses || []);
      if (data.categories?.length > 0) {
        setCategories([...new Set([...defaultCategories, ...data.categories])]);
      }
    } catch (error) {
      console.error("Error loading responses:", error);
      toast.error("Failed to load canned responses");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || response.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openEditDialog = (response: CannedResponse) => {
    setEditingResponse(response);
    setFormTitle(response.title);
    setFormContent(response.content);
    setFormCategory(response.category || "General");
    setIsAddDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingResponse(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory("General");
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingResponse
        ? `/api/admin/canned-responses/${editingResponse.id}`
        : "/api/admin/canned-responses";

      const response = await fetch(url, {
        method: editingResponse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          category: formCategory,
        }),
      });

      if (!response.ok) throw new Error("Failed to save response");

      toast.success(editingResponse ? "Response updated" : "Response created");
      setIsAddDialogOpen(false);
      loadResponses();
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error("Failed to save response");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/admin/canned-responses/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete response");

      toast.success("Response deleted");
      setDeleteId(null);
      loadResponses();
    } catch (error) {
      console.error("Error deleting response:", error);
      toast.error("Failed to delete response");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Create quick replies that agents can use to respond faster
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Response
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? "Edit Canned Response" : "Add Canned Response"}
              </DialogTitle>
              <DialogDescription>
                Create a quick reply template that agents can use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Welcome Message"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Response Content</Label>
                <Textarea
                  placeholder="Enter the response text..."
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use {"{customer_name}"} to insert the customer's name
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingResponse ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search responses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Responses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Preview</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Uses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {responses.length === 0
                    ? "No canned responses yet. Create your first one!"
                    : "No canned responses found matching your search"}
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">{response.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{response.category || "General"}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate text-muted-foreground">
                    {response.content}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    {response.useCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(response.content)}
                        title="Copy content"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(response)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(response.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Variable Help */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="font-medium mb-2">Available Variables</h4>
        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <code className="rounded bg-muted px-1">{"{customer_name}"}</code>
            <span className="ml-2 text-muted-foreground">Customer's name</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{ticket_id}"}</code>
            <span className="ml-2 text-muted-foreground">Ticket number</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{agent_name}"}</code>
            <span className="ml-2 text-muted-foreground">Agent's name</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{company_name}"}</code>
            <span className="ml-2 text-muted-foreground">Your company name</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{support_email}"}</code>
            <span className="ml-2 text-muted-foreground">Support email</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{current_date}"}</code>
            <span className="ml-2 text-muted-foreground">Today's date</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Canned Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the canned response.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
