"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, Eye, Clock, CheckCircle, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  function openDeleteDialog(post: BlogPost) {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!selectedPost) return;

    try {
      const res = await fetch(`/api/admin/blog/${selectedPost.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Blog post deleted");
      setDeleteDialogOpen(false);
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete blog post");
    }
  }

  async function updateStatus(post: BlogPost, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, status }),
      });

      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Post ${status.toLowerCase()}`);
      fetchPosts();
    } catch (error) {
      toast.error("Failed to update post");
    }
  }

  const filteredPosts = statusFilter === "all"
    ? posts
    : posts.filter((post) => post.status === statusFilter);

  const statusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "DRAFT":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ARCHIVED":
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage blog posts displayed on your website
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Drafts</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredPosts.length} posts</Badge>
      </div>

      {loading ? (
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-40 bg-muted rounded" />
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first blog post to share with your audience
            </p>
            <Button asChild>
              <Link href="/admin/content/blog/new">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{post.title}</p>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(post.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {post.publishedAt ? (
                        <span>
                          Published{" "}
                          {formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Created{" "}
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {post.status === "PUBLISHED" && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/content/blog/${post.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Select
                        value={post.status}
                        onValueChange={(value) =>
                          updateStatus(post, value as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                        }
                      >
                        <SelectTrigger className="h-8 w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Publish</SelectItem>
                          <SelectItem value="ARCHIVED">Archive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => openDeleteDialog(post)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedPost?.title}". This action cannot be
              undone.
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
