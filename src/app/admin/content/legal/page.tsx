"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
  version: number;
  updatedAt: string;
  createdAt: string;
}

const defaultPages = [
  { slug: "terms", title: "Terms of Service", description: "Service terms and conditions" },
  { slug: "privacy", title: "Privacy Policy", description: "How we handle user data" },
  { slug: "refund-policy", title: "Refund Policy", description: "Refund and cancellation policy" },
  { slug: "disclaimer", title: "Disclaimer", description: "Legal disclaimers" },
];

export default function LegalPagesAdmin() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const res = await fetch("/api/admin/legal-pages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      toast.error("Failed to load legal pages");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(page: LegalPage) {
    try {
      const res = await fetch(`/api/admin/legal-pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !page.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(`Page ${page.isActive ? "hidden" : "published"}`);
      fetchPages();
    } catch (error) {
      toast.error("Failed to update page status");
    }
  }

  // Check which default pages are missing
  const existingSlugs = pages.map(p => p.slug);
  const missingPages = defaultPages.filter(p => !existingSlugs.includes(p.slug));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Legal Pages</h1>
          <p className="text-muted-foreground">
            Manage terms of service, privacy policy, and other legal content
          </p>
        </div>
        <Link href="/admin/content/legal/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Page
          </Button>
        </Link>
      </div>

      {/* Missing Pages Alert */}
      {missingPages.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-amber-800">Missing Legal Pages</CardTitle>
            <CardDescription className="text-amber-700">
              The following recommended legal pages haven&apos;t been created yet:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingPages.map((page) => (
                <Link key={page.slug} href={`/admin/content/legal/new?slug=${page.slug}`}>
                  <Button variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                    <Plus className="mr-1 h-3 w-3" />
                    Create {page.title}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Legal Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No legal pages yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first legal page to get started
              </p>
              <Link href="/admin/content/legal/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Legal Page
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.isActive ? "default" : "secondary"}>
                        {page.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>v{page.version}</TableCell>
                    <TableCell>{formatDate(page.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(page)}
                          title={page.isActive ? "Hide page" : "Show page"}
                        >
                          {page.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Link href={`/admin/content/legal/${page.slug}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
