"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Loader2,
  Search,
  Edit,
  Trash2,
  Star,
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CountrySelector, ELIGIBLE_COUNTRIES } from "@/components/ui/country-selector";

interface Location {
  id: string;
  code: string;
  name: string;
  country: string;
  type: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

const defaultLocation = {
  code: "",
  name: "",
  country: "",
  type: "STATE" as string,
  isPopular: false,
  isActive: true,
  sortOrder: 0,
};

const LOCATION_TYPES = [
  { value: "STATE", label: "State" },
  { value: "PROVINCE", label: "Province" },
  { value: "COUNTRY", label: "Country" },
  { value: "TERRITORY", label: "Territory" },
];

export default function LocationPricingPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState(defaultLocation);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/location-pricing");
      const data = await response.json();

      if (response.ok) {
        setLocations(data.locations);
      } else {
        toast.error("Failed to load locations");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Client-side filtering
  const filteredLocations = locations.filter((l) => {
    if (filterCountry && l.country !== filterCountry) return false;
    if (filterType && l.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        code: location.code,
        name: location.name,
        country: location.country,
        type: location.type,
        isPopular: location.isPopular,
        isActive: location.isActive,
        sortOrder: location.sortOrder,
      });
    } else {
      setEditingLocation(null);
      setFormData(defaultLocation);
    }
    setDialogOpen(true);
  };

  const saveLocation = async () => {
    if (!formData.code.trim() || !formData.name.trim() || !formData.country.trim()) {
      toast.error("Code, name, and country are required");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingLocation
        ? `/api/admin/location-pricing/${editingLocation.id}`
        : "/api/admin/location-pricing";
      const method = editingLocation ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingLocation ? "Location updated" : "Location created"
        );
        setDialogOpen(false);
        fetchLocations();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save location");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLocation = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all associated fees.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/location-pricing/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Location deleted");
        fetchLocations();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  const toggleActive = async (location: Location) => {
    try {
      const response = await fetch(
        `/api/admin/location-pricing/${location.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !location.isActive }),
        }
      );

      if (response.ok) {
        toast.success(
          location.isActive ? "Location deactivated" : "Location activated"
        );
        fetchLocations();
      }
    } catch (error) {
      console.error("Error toggling location:", error);
    }
  };

  const activeCount = locations.filter((l) => l.isActive).length;
  const popularCount = locations.filter((l) => l.isPopular).length;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Location</h1>
          <p className="text-muted-foreground">
            Manage locations (states, provinces, countries) for services
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Locations</CardDescription>
            <CardTitle className="text-3xl">{locations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Popular</CardDescription>
            <CardTitle className="text-3xl">{popularCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterCountry || "all"}
          onValueChange={(v) => setFilterCountry(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {[...new Set(locations.map((l) => l.country))].sort().map((code) => {
              const country = ELIGIBLE_COUNTRIES.find((c) => c.code === code);
              return (
                <SelectItem key={code} value={code}>
                  {country ? `${country.flag} ${country.name}` : code}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LOCATION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    {locations.length === 0
                      ? "No locations found. Add your first location to get started."
                      : "No locations match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow
                    key={location.id}
                    className={
                      !location.isActive ? "opacity-50" : undefined
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {location.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{location.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const c = ELIGIBLE_COUNTRIES.find((c) => c.code === location.country);
                        return c ? (
                          <span>{c.flag} {c.name}</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            {location.country}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {location.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {location.isPopular && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={location.isActive}
                        onCheckedChange={() => toggleActive(location)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteLocation(location.id)}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Add Location"}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? "Update location details"
                : "Add a new service location"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., US-WY"
                  disabled={!!editingLocation}
                />
                <p className="text-xs text-muted-foreground">
                  Format: COUNTRY-CODE (e.g., US-WY, CA-ON)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Wyoming"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country *</Label>
                <CountrySelector
                  value={formData.country}
                  onChange={(code) =>
                    setFormData({ ...formData, country: code })
                  }
                  placeholder="Select country..."
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Popular Location</Label>
                <p className="text-xs text-muted-foreground">
                  Show in quick selection
                </p>
              </div>
              <Switch
                checked={formData.isPopular}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, isPopular: v })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Available for selection
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) =>
                  setFormData({ ...formData, isActive: v })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveLocation} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLocation ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
