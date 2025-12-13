"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SunEditorWrapper } from "@/components/editor/sun-editor";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: BlogCategory | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags: string[];
  categories: BlogCategory[];
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const defaultFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  tags: [] as string[],
  metaTitle: "",
  metaDescription: "",
};

export default function BlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [tagsInput, setTagsInput] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchPost();
    }
  }, [isNew, resolvedParams.id]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/blog-categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function fetchPost() {
    try {
      const res = await fetch(`/api/admin/blog/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: BlogPost = await res.json();
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        coverImage: data.coverImage || "",
        status: data.status,
        tags: data.tags || [],
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
      });
      setTagsInput(data.tags?.join(", ") || "");
      setSelectedCategoryId(data.categories?.[0]?.id || "");
    } catch (error) {
      toast.error("Failed to load blog post");
      router.push("/admin/content/blog");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(title: string) {
    setFormData({
      ...formData,
      title,
      slug: isNew ? generateSlug(title) : formData.slug,
    });
  }

  function handleTagsChange(input: string) {
    setTagsInput(input);
    const tags = input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData({ ...formData, tags });
  }

  async function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData({ ...formData, coverImage: data.url });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  function getCategoryDisplayName(category: BlogCategory): string {
    if (!category.parent) return category.name;
    return `${category.parent.name} > ${category.name}`;
  }

  async function handleSave(publish = false) {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const status = publish ? "PUBLISHED" : formData.status;
      const url = isNew
        ? "/api/admin/blog"
        : `/api/admin/blog/${resolvedParams.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status,
          categoryIds: selectedCategoryId ? [selectedCategoryId] : [],
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(
        isNew
          ? "Blog post created"
          : publish
          ? "Blog post published"
          : "Blog post saved"
      );
      router.push("/admin/content/blog");
    } catch (error) {
      toast.error("Failed to save blog post");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/content/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Blog Post" : "Edit Blog Post"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Create a new blog post" : "Update your blog post"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && formData.status === "PUBLISHED" && (
            <Button variant="outline" asChild>
              <Link href={`/blog/${formData.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog post title"
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  placeholder="url-friendly-slug"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Brief summary of the post..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <SunEditorWrapper
                  value={formData.content}
                  onChange={(content) =>
                    setFormData({ ...formData, content })
                  }
                  placeholder="Write your blog post content here..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {getCategoryDisplayName(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {!selectedCategoryId
                  ? "No category selected. Post will be assigned to Uncategorized"
                  : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <Link href="/admin/content/blog-categories" target="_blank">
                  Manage Categories
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
              {formData.coverImage && (
                <div className="rounded-lg border overflow-hidden">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="LLC, Business, Tips"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate tags with commas
              </p>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="SEO title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  placeholder="SEO description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
