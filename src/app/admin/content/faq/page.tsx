"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, HelpCircle, Eye, EyeOff, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const categories = [
  { value: "general", label: "General" },
  { value: "llc-formation", label: "LLC Formation" },
  { value: "ein", label: "EIN & Taxes" },
  { value: "banking", label: "Business Banking" },
  { value: "amazon", label: "Amazon Seller" },
  { value: "pricing", label: "Pricing & Payments" },
  { value: "international", label: "International" },
];

const defaultFormData = {
  question: "",
  answer: "",
  category: "general",
  isActive: true,
  sortOrder: 0,
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchFaqs();
  }, []);

  async function fetchFaqs() {
    try {
      const res = await fetch("/api/admin/global-faqs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedFaq(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(faq: FAQ) {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
      isActive: faq.isActive,
      sortOrder: faq.sortOrder,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(faq: FAQ) {
    setSelectedFaq(faq);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.question || !formData.answer) {
      toast.error("Question and answer are required");
      return;
    }

    setSaving(true);
    try {
      const url = selectedFaq
        ? `/api/admin/global-faqs/${selectedFaq.id}`
        : "/api/admin/global-faqs";
      const method = selectedFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedFaq ? "FAQ updated" : "FAQ created");
      setDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedFaq) return;

    try {
      const res = await fetch(`/api/admin/global-faqs/${selectedFaq.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("FAQ deleted");
      setDeleteDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  }

  async function toggleActive(faq: FAQ) {
    try {
      const res = await fetch(`/api/admin/global-faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...faq, isActive: !faq.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  }

  const filteredFaqs = filterCategory === "all"
    ? faqs
    : faqs.filter((faq) => faq.category === filterCategory);

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const cat = faq.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions displayed on the homepage and FAQ page
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">{filteredFaqs.length} FAQs</Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No FAQs yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first frequently asked question
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {categories.find((c) => c.value === category)?.label || category}
                  <Badge variant="secondary">{categoryFaqs.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`rounded-lg border p-4 ${
                      !faq.isActive ? "opacity-60 bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={faq.isActive ? "default" : "secondary"}>
                          {faq.isActive ? "Active" : "Hidden"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(faq)}
                        >
                          {faq.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(faq)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => openDeleteDialog(faq)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What is an LLC?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Provide a detailed answer..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this FAQ. This action cannot be undone.
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
