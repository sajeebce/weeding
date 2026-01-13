"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Home,
  FileText,
  LayoutTemplate,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PageData {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  templateType: string | null;
  isTemplateActive: boolean;
  sectionsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateInfo {
  type: string;
  label: string;
  description: string;
  isAssigned: boolean;
  assignedPage: { id: string; name: string } | null;
}

const TEMPLATE_LABELS: Record<string, string> = {
  HOME: "Homepage",
  SERVICE_DETAILS: "Service Details",
  SERVICES_LIST: "Services List",
  BLOG_POST: "Blog Post",
  BLOG_LIST: "Blog List",
  ABOUT: "About Page",
  CONTACT: "Contact Page",
  CHECKOUT: "Checkout",
  CUSTOM: "Custom Page",
};

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  HOME: <Home className="h-4 w-4" />,
  SERVICE_DETAILS: <FileText className="h-4 w-4" />,
  SERVICES_LIST: <LayoutTemplate className="h-4 w-4" />,
};

export default function PagesListPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTemplate, setFilterTemplate] = useState<string>("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form state
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");

  // Template assignment state
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>("");

  // Fetch pages and templates
  useEffect(() => {
    async function fetchData() {
      try {
        const [pagesRes, templatesRes] = await Promise.all([
          fetch("/api/admin/pages"),
          fetch("/api/admin/pages/templates"),
        ]);

        if (pagesRes.ok) {
          const data = await pagesRes.json();
          setPages(data.pages || []);
        }

        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data.templates || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load pages");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter pages
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTemplate =
      filterTemplate === "all" ||
      (filterTemplate === "assigned" && page.isTemplateActive) ||
      (filterTemplate === "unassigned" && !page.templateType) ||
      page.templateType === filterTemplate;

    return matchesSearch && matchesTemplate;
  });

  // Create page handler
  const handleCreatePage = async () => {
    if (!newPageName.trim()) {
      toast.error("Page name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPageName,
          slug: newPageSlug || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create page");
      }

      const newPage = await response.json();
      setPages((prev) => [newPage, ...prev]);
      setShowCreateDialog(false);
      setNewPageName("");
      setNewPageSlug("");
      toast.success("Page created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create page");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete page handler
  const handleDeletePage = async () => {
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/pages/${selectedPage.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete page");
      }

      setPages((prev) => prev.filter((p) => p.id !== selectedPage.id));
      setShowDeleteDialog(false);
      setSelectedPage(null);
      toast.success("Page deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete page");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Template assignment handler
  const handleAssignTemplate = async () => {
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/pages/${selectedPage.id}/template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: selectedTemplateType || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign template");
      }

      const result = await response.json();

      // Update local state
      setPages((prev) =>
        prev.map((p) => {
          if (p.id === selectedPage.id) {
            return {
              ...p,
              templateType: selectedTemplateType || null,
              isTemplateActive: !!selectedTemplateType,
            };
          }
          // Unset previous template holder if any
          if (result.previousTemplate && p.id === result.previousTemplate.id) {
            return { ...p, isTemplateActive: false };
          }
          return p;
        })
      );

      setShowTemplateDialog(false);
      setSelectedPage(null);
      setSelectedTemplateType("");
      toast.success(
        selectedTemplateType
          ? `Page assigned as ${TEMPLATE_LABELS[selectedTemplateType]} template`
          : "Template unassigned"
      );

      // Refresh templates list
      const templatesRes = await fetch("/api/admin/pages/templates");
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate page handler
  const handleDuplicatePage = async (page: PageData) => {
    try {
      const response = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${page.name} (Copy)`,
          slug: `${page.slug}-copy-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate page");
      }

      const newPage = await response.json();
      setPages((prev) => [newPage, ...prev]);
      toast.success("Page duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate page");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Page Builder</h1>
          <p className="text-muted-foreground">
            Create and manage page templates for your website
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Page
        </Button>
      </div>

      {/* Template Overview Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {templates.slice(0, 4).map((template) => (
          <Card key={template.type} className={template.isAssigned ? "border-primary/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                {TEMPLATE_ICONS[template.type] || <FileText className="h-4 w-4" />}
                {template.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {template.isAssigned ? (
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.assignedPage?.name}
                  </Badge>
                  <Link href={`/admin/appearance/pages/${template.assignedPage?.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not assigned</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>
                {filteredPages.length} page{filteredPages.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={filterTemplate} onValueChange={setFilterTemplate}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="assigned">Assigned Templates</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="HOME">Homepage</SelectItem>
                  <SelectItem value="SERVICE_DETAILS">Service Details</SelectItem>
                  <SelectItem value="SERVICES_LIST">Services List</SelectItem>
                  <SelectItem value="BLOG_POST">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">No pages found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || filterTemplate !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first page to get started"}
              </p>
              {!searchQuery && filterTemplate === "all" && (
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Page
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/appearance/pages/${page.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {page.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      /{page.slug}
                    </TableCell>
                    <TableCell>
                      {page.isTemplateActive && page.templateType ? (
                        <Badge variant="default">
                          {TEMPLATE_LABELS[page.templateType] || page.templateType}
                        </Badge>
                      ) : page.templateType ? (
                        <Badge variant="outline">
                          {TEMPLATE_LABELS[page.templateType]} (inactive)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{page.sectionsCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/appearance/pages/${page.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPage(page);
                              setSelectedTemplateType(page.templateType || "");
                              setShowTemplateDialog(true);
                            }}
                          >
                            <LayoutTemplate className="mr-2 h-4 w-4" />
                            Assign Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicatePage(page)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedPage(page);
                              setShowDeleteDialog(true);
                            }}
                            disabled={page.isTemplateActive}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Create a new page template. You can assign it as a template for specific page types later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Page Name</Label>
              <Input
                id="name"
                placeholder="e.g., Homepage, Service Details"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                placeholder="Auto-generated from name"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from name
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePage} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedPage?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePage} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Assignment Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign as Template</DialogTitle>
            <DialogDescription>
              Select which page type this template should be used for. Only one template can be active per type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Use as template for</Label>
              <Select value={selectedTemplateType} onValueChange={setSelectedTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select page type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Custom Page)</SelectItem>
                  {Object.entries(TEMPLATE_LABELS).map(([value, label]) => {
                    const template = templates.find((t) => t.type === value);
                    const isAssigned = template?.isAssigned && template.assignedPage?.id !== selectedPage?.id;
                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                        {isAssigned && ` (Currently: ${template.assignedPage?.name})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedTemplateType && (
                <p className="text-xs text-muted-foreground">
                  {templates.find((t) => t.type === selectedTemplateType)?.description}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTemplate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedTemplateType ? "Assign Template" : "Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
