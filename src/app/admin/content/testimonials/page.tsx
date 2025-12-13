"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, GripVertical } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  name: string;
  company: string | null;
  country: string | null;
  avatar: string | null;
  content: string;
  rating: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const defaultFormData = {
  name: "",
  company: "",
  country: "",
  avatar: "",
  content: "",
  rating: 5,
  isActive: true,
  sortOrder: 0,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const res = await fetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setSelectedTestimonial(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(testimonial: Testimonial) {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      company: testimonial.company || "",
      country: testimonial.country || "",
      avatar: testimonial.avatar || "",
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      sortOrder: testimonial.sortOrder,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(testimonial: Testimonial) {
    setSelectedTestimonial(testimonial);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name || !formData.content) {
      toast.error("Name and content are required");
      return;
    }

    setSaving(true);
    try {
      const url = selectedTestimonial
        ? `/api/admin/testimonials/${selectedTestimonial.id}`
        : "/api/admin/testimonials";
      const method = selectedTestimonial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(selectedTestimonial ? "Testimonial updated" : "Testimonial created");
      setDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedTestimonial) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Testimonial deleted");
      setDeleteDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  }

  async function toggleActive(testimonial: Testimonial) {
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...testimonial, isActive: !testimonial.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to update testimonial");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage customer testimonials displayed on the homepage
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No testimonials yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first customer testimonial
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={!testimonial.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {[testimonial.company, testimonial.country].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                    {testimonial.isActive ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  "{testimonial.content}"
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(testimonial)}
                  >
                    {testimonial.isActive ? (
                      <EyeOff className="mr-1 h-3 w-3" />
                    ) : (
                      <Eye className="mr-1 h-3 w-3" />
                    )}
                    {testimonial.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(testimonial)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => openDeleteDialog(testimonial)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTestimonial ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Amazon Seller"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Bangladesh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <div className="flex gap-1 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200 hover:text-yellow-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Testimonial *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share their experience..."
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Show on homepage</Label>
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
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the testimonial from "{selectedTestimonial?.name}".
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
