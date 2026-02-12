"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Loader2,
  RefreshCw,
  GripVertical,
  Power,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { formatCurrency } from "@/lib/utils";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

interface ServicePackage {
  id: string;
  name: string;
  price: number;
}

interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  icon: string | null;
  image: string | null;
  startingPrice: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  category: ServiceCategory | null;
  packagesCount: number;
  featuresCount: number;
  faqsCount: number;
  packages: ServicePackage[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
  servicesCount: number;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [currency, setCurrency] = useState("USD");

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.append("categoryId", categoryFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/services?${params}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
      } else {
        console.error("Services API error:", response.status, data);
        toast.error(data.error || "Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((data) => { if (data.currency) setCurrency(data.currency); })
      .catch(() => {});
  }, [fetchServices, fetchCategories]);

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}/toggle`, {
        method: "PATCH",
      });

      if (response.ok) {
        const updated = await response.json();
        setServices((prev) =>
          prev.map((s) =>
            s.id === service.id ? { ...s, isActive: updated.isActive } : s
          )
        );
        toast.success(
          `Service ${updated.isActive ? "activated" : "deactivated"}`
        );
      } else {
        toast.error("Failed to toggle service status");
      }
    } catch (error) {
      console.error("Error toggling service:", error);
      toast.error("Failed to toggle service status");
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/services/${serviceToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
        toast.success("Service deleted successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const activeServicesCount = services.filter((s) => s.isActive).length;
  const popularServicesCount = services.filter((s) => s.isPopular).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage your service offerings and packages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchServices} disabled={isLoading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-sm text-muted-foreground">Total Services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeServicesCount}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{popularServicesCount}</div>
            <p className="text-sm text-muted-foreground">Popular</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.servicesCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" asChild>
              <Link href="/admin/services/categories">Manage Categories</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>{services.length} services total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No services found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first service"}
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/services/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Packages
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow
                    key={service.id}
                    className={!service.isActive ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/services/${service.id}`}
                              className="font-medium hover:underline"
                            >
                              {service.name}
                            </Link>
                            {service.isPopular && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="max-w-xs truncate text-xs text-muted-foreground">
                            {service.shortDesc}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {service.category ? (
                        <Badge variant="outline">{service.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(service.startingPrice, currency)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {service.packagesCount} pkg
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {service.featuresCount} feat
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {service.faqsCount} faq
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                        className={
                          service.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/services/${service.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View on Site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/services/${service.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Service
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(service)}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {service.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setServiceToDelete(service);
                              setDeleteDialogOpen(true);
                            }}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service &quot;{serviceToDelete?.name}&quot;
              and all its packages, features, and FAQs. This action cannot be undone.
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
