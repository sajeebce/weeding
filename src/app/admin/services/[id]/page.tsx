"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  X,
  FormInput,
  Check,
  Pencil,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/ui/rich-text-editor";
import { FaqRichEditor } from "@/components/admin/ui/faq-rich-editor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/components/ui/currency-selector";
import { Minus, DollarSign, MapPin, Search as SearchIcon, ChevronsUpDown } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface Feature {
  id?: string;
  text: string;
}

// Master feature list for comparison table
interface ServiceFeature {
  id: string;
  text: string;
  description?: string | null;
  tooltip?: string | null;
  sortOrder: number;
  packageMappings?: PackageFeatureMapping[];
}

type FeatureValueType = "BOOLEAN" | "TEXT" | "ADDON" | "DASH";

interface PackageFeatureMapping {
  packageId: string;
  included: boolean;
  customValue?: string | null;
  valueType?: FeatureValueType;
  addonPriceUSD?: number | null;
  addonPriceBDT?: number | null;
}

interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  priceUSD?: number;
  priceBDT: number | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  features: Feature[];
  notIncluded: Feature[];
}

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  sortOrder: number;
}

interface ServiceData {
  id?: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  icon: string;
  image: string;
  startingPrice: number;
  processingTime: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  features: Feature[];
  packages: Package[];
  faqs: FAQ[];
  displayOptions: {
    checkoutBadgeText?: string;
    checkoutBadgeDescription?: string;
    [key: string]: unknown;
  };
}

const defaultService: ServiceData = {
  slug: "",
  name: "",
  shortDesc: "",
  description: "",
  icon: "",
  image: "",
  startingPrice: 0,
  processingTime: "",
  isPopular: false,
  isActive: true,
  sortOrder: 0,
  categoryId: "",
  metaTitle: "",
  metaDescription: "",
  features: [],
  packages: [],
  faqs: [],
  displayOptions: {},
};

const defaultPackage: Package = {
  name: "",
  description: "",
  price: 0,
  priceBDT: null,
  isPopular: false,
  isActive: true,
  sortOrder: 0,
  features: [],
  notIncluded: [],
};

const defaultFaq: FAQ = {
  question: "",
  answer: "",
  sortOrder: 0,
};

export default function ServiceEditorPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const serviceId = isNew ? null : (params.id as string);

  const [service, setService] = useState<ServiceData>(defaultService);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // Package modal state
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingPackageIndex, setEditingPackageIndex] = useState<number | null>(null);

  // FAQ modal state
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqPreviewMode, setFaqPreviewMode] = useState(false);

  // Master feature list state (for comparison table)
  const [masterFeatures, setMasterFeatures] = useState<ServiceFeature[]>([]);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ServiceFeature | null>(null);

  // Currency from business settings
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Pending mapping changes (for batch update)
  const [pendingMappingChanges, setPendingMappingChanges] = useState<
    Map<string, Partial<PackageFeatureMapping> & { packageId: string; featureId: string }>
  >(new Map());
  const [isSavingMappings, setIsSavingMappings] = useState(false);

  const fetchService = useCallback(async () => {
    if (!serviceId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`);
      const data = await response.json();

      if (response.ok) {
        setService({
          ...defaultService,
          ...data,
          slug: data.slug || "",
          name: data.name || "",
          shortDesc: data.shortDesc || "",
          description: data.description || "",
          icon: data.icon || "",
          image: data.image || "",
          startingPrice: data.startingPrice ?? 0,
          processingTime: data.processingTime || "",
          categoryId: data.categoryId || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          features: data.features || [],
          packages: (data.packages || []).map((pkg: Package) => ({
            ...pkg,
            name: pkg.name || "",
            description: pkg.description || "",
            price: pkg.price ?? pkg.priceUSD ?? 0,
            features: pkg.features || [],
            notIncluded: pkg.notIncluded || [],
          })),
          faqs: data.faqs || [],
          displayOptions: data.displayOptions || {},
        });
      } else {
        toast.error("Failed to load service");
        router.push("/admin/services");
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Failed to load service");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId, router]);

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

  const fetchMasterFeatures = useCallback(async () => {
    if (!serviceId) return;
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/features`);
      const data = await response.json();
      if (response.ok) {
        setMasterFeatures(data.features || []);
      }
    } catch (error) {
      console.error("Error fetching master features:", error);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchService();
      fetchMasterFeatures();
    }
    // Fetch currency from business config
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) {
          setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      })
      .catch(() => {});
  }, [isNew, fetchService, fetchCategories, fetchMasterFeatures]);

  const handleInputChange = (
    field: keyof ServiceData,
    value: string | number | boolean
  ) => {
    setService((prev) => ({ ...prev, [field]: value }));
  };

  const handleDisplayOptionChange = (key: string, value: string) => {
    setService((prev) => ({
      ...prev,
      displayOptions: { ...prev.displayOptions, [key]: value },
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!service.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    if (!service.slug.trim()) {
      toast.error("URL slug is required");
      return;
    }
    if (!service.shortDesc.trim()) {
      toast.error("Short description is required");
      return;
    }
    if (!service.description.trim()) {
      toast.error("Full description is required");
      return;
    }

    setIsSaving(true);
    try {
      // First save any pending mapping changes
      if (pendingMappingChanges.size > 0) {
        const mappingsSaved = await savePendingMappings();
        if (!mappingsSaved) {
          setIsSaving(false);
          return;
        }
      }

      const url = isNew
        ? "/api/admin/services"
        : `/api/admin/services/${serviceId}`;
      const method = isNew ? "POST" : "PUT";

      // Don't send features for existing services - they're managed via Features tab
      // This prevents losing PackageFeatureMap data on save
      const { features: _features, ...serviceWithoutFeatures } = service;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...serviceWithoutFeatures,
          // Only send features for NEW services
          ...(isNew && { features: service.features.map((f) => f.text) }),
          categoryId: service.categoryId || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isNew ? "Service created" : "Service updated");
        if (isNew) {
          router.push(`/admin/services/${data.id}`);
        }
      } else {
        toast.error(data.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  // Feature management
  const addFeature = () => {
    setService((prev) => ({
      ...prev,
      features: [...prev.features, { text: "" }],
    }));
  };

  const updateFeature = (index: number, text: string) => {
    setService((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, text } : f)),
    }));
  };

  const removeFeature = (index: number) => {
    setService((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Package management
  const openPackageDialog = (pkg?: Package, index?: number) => {
    if (pkg && index !== undefined) {
      setEditingPackage({ ...pkg });
      setEditingPackageIndex(index);
    } else {
      setEditingPackage({ ...defaultPackage, sortOrder: service.packages.length });
      setEditingPackageIndex(null);
    }
    setPackageDialogOpen(true);
  };

  const savePackage = async () => {
    if (!editingPackage) return;

    if (!editingPackage.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (editingPackageIndex !== null) {
      // Update existing package
      setService((prev) => ({
        ...prev,
        packages: prev.packages.map((p, i) =>
          i === editingPackageIndex ? editingPackage : p
        ),
      }));
    } else {
      // Add new package
      setService((prev) => ({
        ...prev,
        packages: [...prev.packages, editingPackage],
      }));
    }

    setPackageDialogOpen(false);
    setEditingPackage(null);
    setEditingPackageIndex(null);

    // If service exists, save package to API
    if (serviceId && editingPackageIndex === null) {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}/packages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingPackage,
            priceUSD: editingPackage.price,
            features: editingPackage.features.map((f) => f.text),
            notIncluded: editingPackage.notIncluded.map((n) => n.text),
          }),
        });

        if (response.ok) {
          toast.success("Package added");
          fetchService();
        }
      } catch (error) {
        console.error("Error saving package:", error);
      }
    }
  };

  const removePackage = async (index: number) => {
    const pkg = service.packages[index];

    if (pkg.id) {
      try {
        const response = await fetch(`/api/admin/packages/${pkg.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Package deleted");
        } else {
          const data = await response.json();
          toast.error(data.error || "Failed to delete package");
          return;
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        toast.error("Failed to delete package");
        return;
      }
    }

    setService((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  // FAQ management
  const openFaqDialog = (faq?: FAQ, index?: number) => {
    if (faq && index !== undefined) {
      setEditingFaq({ ...faq });
      setEditingFaqIndex(index);
    } else {
      setEditingFaq({ ...defaultFaq, sortOrder: service.faqs.length });
      setEditingFaqIndex(null);
    }
    setFaqDialogOpen(true);
  };

  const saveFaq = async () => {
    if (!editingFaq) return;

    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    if (editingFaqIndex !== null) {
      setService((prev) => ({
        ...prev,
        faqs: prev.faqs.map((f, i) => (i === editingFaqIndex ? editingFaq : f)),
      }));
    } else {
      setService((prev) => ({
        ...prev,
        faqs: [...prev.faqs, editingFaq],
      }));
    }

    setFaqDialogOpen(false);
    setEditingFaq(null);
    setEditingFaqIndex(null);

    // If service exists, save FAQ to API
    if (serviceId && editingFaqIndex === null) {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}/faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingFaq),
        });

        if (response.ok) {
          toast.success("FAQ added");
          fetchService();
        }
      } catch (error) {
        console.error("Error saving FAQ:", error);
      }
    }
  };

  const removeFaq = async (index: number) => {
    const faq = service.faqs[index];

    if (faq.id) {
      try {
        const response = await fetch(`/api/admin/faqs/${faq.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("FAQ deleted");
        } else {
          toast.error("Failed to delete FAQ");
          return;
        }
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        toast.error("Failed to delete FAQ");
        return;
      }
    }

    setService((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Master Feature management (for comparison table)
  const openFeatureDialog = (feature?: ServiceFeature) => {
    if (feature) {
      setEditingFeature({ ...feature });
    } else {
      setEditingFeature({
        id: "",
        text: "",
        description: null,
        tooltip: null,
        sortOrder: masterFeatures.length,
      });
    }
    setFeatureDialogOpen(true);
  };

  const saveMasterFeature = async () => {
    if (!editingFeature || !serviceId) return;

    if (!editingFeature.text.trim()) {
      toast.error("Feature text is required");
      return;
    }

    try {
      if (editingFeature.id) {
        // Update existing
        const response = await fetch(`/api/admin/features/${editingFeature.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: editingFeature.text,
            description: editingFeature.description,
            tooltip: editingFeature.tooltip,
          }),
        });

        if (response.ok) {
          toast.success("Feature updated");
          fetchMasterFeatures();
        } else {
          toast.error("Failed to update feature");
        }
      } else {
        // Create new
        const response = await fetch(`/api/admin/services/${serviceId}/features`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: editingFeature.text,
            description: editingFeature.description,
            tooltip: editingFeature.tooltip,
          }),
        });

        if (response.ok) {
          toast.success("Feature added");
          fetchMasterFeatures();
        } else {
          toast.error("Failed to add feature");
        }
      }
    } catch (error) {
      console.error("Error saving feature:", error);
      toast.error("Failed to save feature");
    }

    setFeatureDialogOpen(false);
    setEditingFeature(null);
  };

  const removeMasterFeature = async (featureId: string) => {
    try {
      const response = await fetch(`/api/admin/features/${featureId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Feature deleted");
        fetchMasterFeatures();
      } else {
        toast.error("Failed to delete feature");
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
      toast.error("Failed to delete feature");
    }
  };

  const togglePackageFeature = async (packageId: string, featureId: string, currentIncluded: boolean) => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId,
          included: !currentIncluded,
        }),
      });

      if (response.ok) {
        // Update local state
        setMasterFeatures((prev) =>
          prev.map((f) => {
            if (f.id !== featureId) return f;

            const existingMappings = f.packageMappings || [];
            const mappingExists = existingMappings.some((m) => m.packageId === packageId);

            if (mappingExists) {
              // Update existing mapping
              return {
                ...f,
                packageMappings: existingMappings.map((m) =>
                  m.packageId === packageId ? { ...m, included: !currentIncluded } : m
                ),
              };
            } else {
              // Create new mapping in local state
              return {
                ...f,
                packageMappings: [
                  ...existingMappings,
                  { packageId, included: !currentIncluded },
                ],
              };
            }
          })
        );
        toast.success("Feature updated");
      } else {
        toast.error("Failed to update feature");
      }
    } catch (error) {
      console.error("Error toggling feature:", error);
      toast.error("Failed to update feature");
    }
  };

  // Update package feature mapping locally (batch update on save)
  const updatePackageFeatureMapping = (
    packageId: string,
    featureId: string,
    updates: Partial<PackageFeatureMapping>
  ) => {
    const key = `${packageId}-${featureId}`;

    // Update pending changes
    setPendingMappingChanges((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(key) || { packageId, featureId };
      newMap.set(key, { ...existing, ...updates });
      return newMap;
    });

    // Update local UI state immediately
    setMasterFeatures((prev) =>
      prev.map((f) => {
        if (f.id !== featureId) return f;

        const existingMappings = f.packageMappings || [];
        const mappingExists = existingMappings.some((m) => m.packageId === packageId);

        if (mappingExists) {
          return {
            ...f,
            packageMappings: existingMappings.map((m) =>
              m.packageId === packageId
                ? { ...m, ...updates }
                : m
            ),
          };
        } else {
          return {
            ...f,
            packageMappings: [...existingMappings, { packageId, ...updates } as PackageFeatureMapping],
          };
        }
      })
    );
  };

  // Save all pending mapping changes
  const savePendingMappings = async () => {
    if (pendingMappingChanges.size === 0) return true;

    setIsSavingMappings(true);
    try {
      const changes = Array.from(pendingMappingChanges.values());

      // Group changes by packageId for batch API calls
      const changesByPackage = changes.reduce((acc, change) => {
        if (!acc[change.packageId]) {
          acc[change.packageId] = [];
        }
        acc[change.packageId].push(change);
        return acc;
      }, {} as Record<string, typeof changes>);

      // Make parallel API calls for each package
      const results = await Promise.all(
        Object.entries(changesByPackage).map(async ([packageId, packageChanges]) => {
          // Send each change for this package
          const responses = await Promise.all(
            packageChanges.map((change) =>
              fetch(`/api/admin/packages/${packageId}/features`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(change),
              })
            )
          );
          return responses.every((r) => r.ok);
        })
      );

      if (results.every(Boolean)) {
        setPendingMappingChanges(new Map());
        return true;
      } else {
        toast.error("Some feature mappings failed to save");
        return false;
      }
    } catch (error) {
      console.error("Error saving feature mappings:", error);
      toast.error("Failed to save feature mappings");
      return false;
    } finally {
      setIsSavingMappings(false);
    }
  };

  // Generate slug from name
  const generateSlug = () => {
    const slug = service.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    handleInputChange("slug", slug);
  };

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/services">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Service" : "Edit Service"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Create a new service" : service.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="outline" asChild>
              <Link href={`/admin/services/${serviceId}/form-builder`}>
                <FormInput className="mr-2 h-4 w-4" />
                Form Builder
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || isSavingMappings}>
            {isSaving || isSavingMappings ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
            {pendingMappingChanges.size > 0 && (
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                {pendingMappingChanges.size}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          {!isNew && (
            <TabsTrigger value="features">
              Features ({masterFeatures.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="packages" className="relative">
            Packages ({service.packages.length})
            {pendingMappingChanges.size > 0 && (
              <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-orange-500" title="Unsaved changes" />
            )}
          </TabsTrigger>
          <TabsTrigger value="faqs">FAQs ({service.faqs.length})</TabsTrigger>
          {!isNew && (
            <TabsTrigger value="location-pricing">Location Pricing</TabsTrigger>
          )}
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        value={service.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., LLC Formation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="slug"
                          value={service.slug}
                          onChange={(e) => handleInputChange("slug", e.target.value)}
                          placeholder="e.g., llc-formation"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateSlug}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description *</Label>
                    <Textarea
                      id="shortDesc"
                      value={service.shortDesc}
                      onChange={(e) => handleInputChange("shortDesc", e.target.value)}
                      placeholder="Brief description for service cards..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Description *</Label>
                    <RichTextEditor
                      value={service.description}
                      onChange={(value) => handleInputChange("description", value)}
                      placeholder="Detailed service description with formatting..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Service Features</CardTitle>
                      <CardDescription>
                        Key features displayed on service cards
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {service.features.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No features added yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                          <Input
                            value={feature.text}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder="Feature description..."
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={service.categoryId}
                      onValueChange={(v) => handleInputChange("categoryId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startingPrice">Starting Price ({currencySymbol})</Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      min="0"
                      value={service.startingPrice}
                      onChange={(e) =>
                        handleInputChange("startingPrice", Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processingTime">Processing Time</Label>
                    <Input
                      id="processingTime"
                      value={service.processingTime}
                      onChange={(e) =>
                        handleInputChange("processingTime", e.target.value)
                      }
                      placeholder="e.g., 3-5 business days"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input
                      id="icon"
                      value={service.icon}
                      onChange={(e) => handleInputChange("icon", e.target.value)}
                      placeholder="e.g., Building2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lucide icon name
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isPopular">Popular Service</Label>
                    <Switch
                      id="isPopular"
                      checked={service.isPopular}
                      onCheckedChange={(v) => handleInputChange("isPopular", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={service.isActive}
                      onCheckedChange={(v) => handleInputChange("isActive", v)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Checkout Badge</CardTitle>
                  <CardDescription>
                    Optional badge text shown below the order summary CTA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkoutBadgeText">Badge Text</Label>
                    <Input
                      id="checkoutBadgeText"
                      value={service.displayOptions.checkoutBadgeText || ""}
                      onChange={(e) =>
                        handleDisplayOptionChange("checkoutBadgeText", e.target.value)
                      }
                      placeholder="e.g., One-time fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkoutBadgeDescription">Badge Description</Label>
                    <Textarea
                      id="checkoutBadgeDescription"
                      value={service.displayOptions.checkoutBadgeDescription || ""}
                      onChange={(e) =>
                        handleDisplayOptionChange("checkoutBadgeDescription", e.target.value)
                      }
                      placeholder="e.g., Our formation fee is a one-time payment."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Features Tab (Master Feature List) */}
        {!isNew && (
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Master Feature List</CardTitle>
                    <CardDescription>
                      Define all features for comparison table. Order matters - features appear in this order.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openFeatureDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {masterFeatures.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No features defined yet. Add features to create comparison table.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {masterFeatures.map((feature, index) => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                      >
                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{feature.text}</p>
                          {feature.tooltip && (
                            <p className="text-xs text-muted-foreground truncate">{feature.tooltip}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openFeatureDialog(feature)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMasterFeature(feature.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  Tip: Drag to reorder features. The order determines how they appear in the comparison table.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Packages</CardTitle>
                  <CardDescription>
                    Pricing packages for this service. Click ✓/✗ to toggle feature inclusion.
                  </CardDescription>
                </div>
                <Button onClick={() => openPackageDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {service.packages.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No packages added yet. Add your first package to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {/* Comparison Table View */}
                  {masterFeatures.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="min-w-[200px] px-4 py-3 text-left text-sm font-medium">
                              Features
                            </th>
                            {service.packages.map((pkg, index) => (
                              <th
                                key={pkg.id || index}
                                className="min-w-[120px] px-4 py-3 text-center"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-semibold">{pkg.name}</span>
                                  <span className="text-lg font-bold">{currencySymbol}{pkg.price}</span>
                                  {pkg.isPopular && (
                                    <Badge variant="default" className="text-xs">
                                      Popular
                                    </Badge>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => openPackageDialog(pkg, index)}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {masterFeatures.map((feature) => (
                            <tr key={feature.id} className="border-b hover:bg-muted/30">
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{feature.text}</span>
                                  {feature.tooltip && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-[200px] text-xs">{feature.tooltip}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </td>
                              {service.packages.map((pkg) => {
                                const mapping = feature.packageMappings?.find(
                                  (m) => m.packageId === pkg.id
                                );
                                const isIncluded = mapping?.included ?? false;
                                const valueType = mapping?.valueType || "BOOLEAN";
                                const addonPriceUSD = mapping?.addonPriceUSD;

                                // Render cell icon/content based on valueType
                                const renderCellIcon = () => {
                                  switch (valueType) {
                                    case "ADDON":
                                      return (
                                        <div className="flex flex-col items-center gap-0.5">
                                          <DollarSign className="h-4 w-4" />
                                          <span className="text-[10px]">{addonPriceUSD || 0}</span>
                                        </div>
                                      );
                                    case "TEXT":
                                      return <span className="text-xs font-medium">{mapping?.customValue || "—"}</span>;
                                    case "DASH":
                                      return <Minus className="h-4 w-4 stroke-2" />;
                                    default:
                                      return isIncluded ? (
                                        <Check className="h-4 w-4 stroke-3" />
                                      ) : (
                                        <X className="h-4 w-4 stroke-3" />
                                      );
                                  }
                                };

                                const getCellColors = () => {
                                  switch (valueType) {
                                    case "ADDON":
                                      return "bg-amber-500 text-white hover:bg-amber-600";
                                    case "TEXT":
                                      return "bg-blue-500 text-white hover:bg-blue-600";
                                    case "DASH":
                                      return "bg-gray-400 text-white hover:bg-gray-500";
                                    default:
                                      return isIncluded
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                        : "bg-slate-300 text-slate-600 hover:bg-slate-400";
                                  }
                                };

                                return (
                                  <td key={pkg.id} className="px-4 py-2 text-center">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button
                                          className={cn(
                                            "inline-flex h-8 min-w-8 items-center justify-center rounded-full transition-colors px-2",
                                            getCellColors()
                                          )}
                                          disabled={!pkg.id}
                                        >
                                          {renderCellIcon()}
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-64" align="center">
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label className="text-xs font-medium">Value Type</Label>
                                            <Select
                                              value={valueType}
                                              onValueChange={(value: FeatureValueType) => {
                                                if (pkg.id) {
                                                  updatePackageFeatureMapping(pkg.id, feature.id, {
                                                    valueType: value,
                                                    included: value === "BOOLEAN" ? isIncluded : true,
                                                  });
                                                }
                                              }}
                                            >
                                              <SelectTrigger className="h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="BOOLEAN">Included (✓/✗)</SelectItem>
                                                <SelectItem value="ADDON">Add-on (+$XX)</SelectItem>
                                                <SelectItem value="TEXT">Custom Text</SelectItem>
                                                <SelectItem value="DASH">Not Applicable (—)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          {valueType === "BOOLEAN" && (
                                            <div className="flex items-center justify-between">
                                              <Label className="text-xs">Included</Label>
                                              <Switch
                                                checked={isIncluded}
                                                onCheckedChange={(checked) => {
                                                  if (pkg.id) {
                                                    updatePackageFeatureMapping(pkg.id, feature.id, {
                                                      included: checked,
                                                    });
                                                  }
                                                }}
                                              />
                                            </div>
                                          )}

                                          {valueType === "ADDON" && (
                                            <div className="space-y-2">
                                              <Label className="text-xs">Add-on Price (USD)</Label>
                                              <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="e.g. 50"
                                                value={addonPriceUSD ?? ""}
                                                className="h-8"
                                                onChange={(e) => {
                                                  if (pkg.id) {
                                                    updatePackageFeatureMapping(pkg.id, feature.id, {
                                                      addonPriceUSD: e.target.value ? parseFloat(e.target.value) : null,
                                                    });
                                                  }
                                                }}
                                              />
                                            </div>
                                          )}

                                          {valueType === "TEXT" && (
                                            <div className="space-y-2">
                                              <Label className="text-xs">Custom Value</Label>
                                              <Input
                                                placeholder='e.g. "10 per month"'
                                                value={mapping?.customValue ?? ""}
                                                className="h-8"
                                                onChange={(e) => {
                                                  if (pkg.id) {
                                                    updatePackageFeatureMapping(pkg.id, feature.id, {
                                                      customValue: e.target.value || null,
                                                    });
                                                  }
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Package Cards (for delete action) */}
                  <div className="flex flex-wrap gap-4">
                    {service.packages.map((pkg, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border px-4 py-2"
                      >
                        <span className="font-medium">{pkg.name}</span>
                        <span className="text-muted-foreground">{currencySymbol}{pkg.price}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removePackage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {masterFeatures.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Add features in the Features tab to see the comparison table.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>FAQs</CardTitle>
                  <CardDescription>
                    Frequently asked questions for this service
                  </CardDescription>
                </div>
                <Button onClick={() => openFaqDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {service.faqs.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No FAQs added yet. Add your first FAQ to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {service.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium">{faq.question}</p>
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground line-clamp-2 *:my-0"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                      <div className="ml-4 flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFaqDialog(faq, index)}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFaq(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Pricing Tab */}
        {!isNew && serviceId && (
          <TabsContent value="location-pricing">
            <LocationPricingTab serviceId={serviceId} currencySymbol={currencySymbol} />
          </TabsContent>
        )}

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your service page for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={service.metaTitle}
                  onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                  placeholder="SEO title (60 characters max)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {service.metaTitle?.length || 0}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={service.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  placeholder="SEO description (160 characters max)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {service.metaDescription?.length || 0}/160 characters
                </p>
              </div>

              {/* SEO Preview */}
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Search Engine Preview
                </p>
                <div className="space-y-1">
                  <p className="text-lg text-blue-600 hover:underline">
                    {service.metaTitle || service.name || "Service Title"}
                  </p>
                  <p className="text-sm text-green-700">
                    llcpad.com/services/{service.slug || "service-slug"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.metaDescription ||
                      service.shortDesc ||
                      "Service description will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Package Dialog */}
      <Dialog open={packageDialogOpen} onOpenChange={setPackageDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPackageIndex !== null ? "Edit Package" : "Add Package"}
            </DialogTitle>
            <DialogDescription>
              Configure the package details and pricing
            </DialogDescription>
          </DialogHeader>
          {editingPackage && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Package Name *</Label>
                  <Input
                    value={editingPackage.name}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, name: e.target.value })
                    }
                    placeholder="e.g., Basic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ({currencySymbol}) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingPackage.price}
                    onChange={(e) =>
                      setEditingPackage({
                        ...editingPackage,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingPackage.description}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      description: e.target.value,
                    })
                  }
                  placeholder="Package tagline..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPackage.isPopular}
                    onCheckedChange={(v) =>
                      setEditingPackage({ ...editingPackage, isPopular: v })
                    }
                  />
                  <Label>Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPackage.isActive}
                    onCheckedChange={(v) =>
                      setEditingPackage({ ...editingPackage, isActive: v })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: Feature inclusion is managed from the Features tab using the comparison table.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePackage}>Save Package</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={(open) => {
        setFaqDialogOpen(open);
        if (!open) setFaqPreviewMode(false);
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {editingFaqIndex !== null ? "Edit FAQ" : "Add FAQ"}
              </DialogTitle>
              {editingFaq?.answer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFaqPreviewMode(!faqPreviewMode)}
                  className="gap-1.5"
                >
                  {faqPreviewMode ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Preview
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogHeader>
          {editingFaq && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question *</Label>
                <Input
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  placeholder="What is...?"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer *</Label>
                {faqPreviewMode ? (
                  <div
                    className="prose prose-sm max-w-none rounded-lg border bg-muted/30 p-4 min-h-50"
                    dangerouslySetInnerHTML={{ __html: editingFaq.answer }}
                  />
                ) : (
                  <FaqRichEditor
                    content={editingFaq.answer}
                    onChange={(html) =>
                      setEditingFaq({ ...editingFaq, answer: html })
                    }
                    placeholder="Write your FAQ answer with rich formatting..."
                    minHeight={200}
                  />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setFaqDialogOpen(false);
              setFaqPreviewMode(false);
            }}>
              Cancel
            </Button>
            <Button onClick={saveFaq}>Save FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Master Feature Dialog */}
      <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFeature?.id ? "Edit Feature" : "Add Feature"}
            </DialogTitle>
            <DialogDescription>
              Define a feature for the comparison table
            </DialogDescription>
          </DialogHeader>
          {editingFeature && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Feature Name *</Label>
                <Input
                  value={editingFeature.text}
                  onChange={(e) =>
                    setEditingFeature({ ...editingFeature, text: e.target.value })
                  }
                  placeholder="e.g., US Fintech Bank Account"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={editingFeature.description || ""}
                  onChange={(e) =>
                    setEditingFeature({
                      ...editingFeature,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed description of this feature..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tooltip (shown on hover in table)</Label>
                <Input
                  value={editingFeature.tooltip || ""}
                  onChange={(e) =>
                    setEditingFeature({
                      ...editingFeature,
                      tooltip: e.target.value,
                    })
                  }
                  placeholder="Brief tooltip text..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMasterFeature}>Save Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Location Pricing Tab Component ============

interface LocationFeeRow {
  id?: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  locationCountry: string;
  filingFee: number;
  annualFee: number | null;
  processingTime: string;
  isActive: boolean;
}

function LocationPricingTab({ serviceId, currencySymbol }: { serviceId: string; currencySymbol: string }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [feeLabel, setFeeLabel] = useState("State Fee");
  const [fees, setFees] = useState<LocationFeeRow[]>([]);
  const [allLocations, setAllLocations] = useState<
    { id: string; code: string; name: string; country: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());
  const [addLocationSearch, setAddLocationSearch] = useState("");

  // Fetch service location fees and all available locations
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [feesRes, locationsRes] = await Promise.all([
        fetch(`/api/admin/services/${serviceId}/location-fees`),
        fetch("/api/admin/location-pricing"),
      ]);

      if (feesRes.ok) {
        const feesData = await feesRes.json();
        setIsEnabled(feesData.service.hasLocationBasedPricing);
        setFeeLabel(feesData.service.locationFeeLabel || "State Fee");

        // Group fees by location
        const feeMap = new Map<string, LocationFeeRow>();
        for (const fee of feesData.fees) {
          const key = fee.locationId;
          const existing = feeMap.get(key);
          if (!existing) {
            feeMap.set(key, {
              id: fee.id,
              locationId: fee.locationId,
              locationCode: fee.location.code,
              locationName: fee.location.name,
              locationCountry: fee.location.country,
              filingFee: fee.feeType === "FILING" ? fee.amountUSD : 0,
              annualFee: fee.feeType === "ANNUAL" ? fee.amountUSD : null,
              processingTime: fee.processingTime || "",
              isActive: fee.isActive,
            });
          } else {
            if (fee.feeType === "FILING") {
              existing.filingFee = fee.amountUSD;
            } else if (fee.feeType === "ANNUAL") {
              existing.annualFee = fee.amountUSD;
            }
            if (fee.processingTime) {
              existing.processingTime = fee.processingTime;
            }
          }
        }
        setFees(Array.from(feeMap.values()));
      }

      if (locationsRes.ok) {
        const locData = await locationsRes.json();
        setAllLocations(
          locData.locations.map(
            (l: { id: string; code: string; name: string; country: string }) => ({
              id: l.id,
              code: l.code,
              name: l.name,
              country: l.country,
            })
          )
        );
      }
    } catch (error) {
      console.error("Error fetching location pricing data:", error);
      toast.error("Failed to load location pricing data");
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFeeRow = (
    locationId: string,
    field: keyof LocationFeeRow,
    value: string | number | boolean | null
  ) => {
    setFees((prev) =>
      prev.map((f) =>
        f.locationId === locationId ? { ...f, [field]: value } : f
      )
    );
    setHasChanges(true);
  };

  const addLocationFee = (locationId: string) => {
    const location = allLocations.find((l) => l.id === locationId);
    if (!location) return;

    // Don't add duplicates
    if (fees.find((f) => f.locationId === locationId)) {
      toast.error("This location already has fees configured");
      return;
    }

    setFees((prev) => [
      ...prev,
      {
        locationId: location.id,
        locationCode: location.code,
        locationName: location.name,
        locationCountry: location.country,
        filingFee: 0,
        annualFee: null,
        processingTime: "",
        isActive: true,
      },
    ]);
    setHasChanges(true);
  };

  const addMultipleLocationFees = () => {
    if (selectedLocationIds.size === 0) return;

    const newFees: LocationFeeRow[] = [];
    for (const locId of selectedLocationIds) {
      if (fees.find((f) => f.locationId === locId)) continue;
      const location = allLocations.find((l) => l.id === locId);
      if (!location) continue;
      newFees.push({
        locationId: location.id,
        locationCode: location.code,
        locationName: location.name,
        locationCountry: location.country,
        filingFee: 0,
        annualFee: null,
        processingTime: "",
        isActive: true,
      });
    }

    if (newFees.length > 0) {
      setFees((prev) => [...prev, ...newFees]);
      setHasChanges(true);
      toast.success(`Added ${newFees.length} location(s)`);
    }
    setSelectedLocationIds(new Set());
    setAddPopoverOpen(false);
    setAddLocationSearch("");
  };

  const removeLocationFee = async (locationId: string) => {
    // Remove from local state
    setFees((prev) => prev.filter((f) => f.locationId !== locationId));
    setHasChanges(true);

    // Also delete from server
    try {
      await fetch(
        `/api/admin/services/${serviceId}/location-fees?locationId=${locationId}`,
        { method: "DELETE" }
      );
    } catch (error) {
      console.error("Error removing location fee:", error);
    }
  };

  const saveFees = async () => {
    setIsSaving(true);
    try {
      // Build the bulk upsert payload
      const feePayload = [];
      for (const row of fees) {
        // Always add filing fee
        feePayload.push({
          locationId: row.locationId,
          feeType: "FILING" as const,
          amountUSD: row.filingFee,
          processingTime: row.processingTime || null,
          isActive: row.isActive,
        });
        // Add annual fee if set
        if (row.annualFee !== null && row.annualFee !== undefined) {
          feePayload.push({
            locationId: row.locationId,
            feeType: "ANNUAL" as const,
            amountUSD: row.annualFee,
            isActive: row.isActive,
          });
        }
      }

      const response = await fetch(
        `/api/admin/services/${serviceId}/location-fees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hasLocationBasedPricing: isEnabled,
            locationFeeLabel: feeLabel,
            fees: feePayload,
          }),
        }
      );

      if (response.ok) {
        toast.success("Location pricing saved");
        setHasChanges(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving location fees:", error);
      toast.error("Failed to save location pricing");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter fees by search
  const filteredFees = fees.filter(
    (f) =>
      f.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.locationCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Locations not yet added
  const availableLocations = allLocations.filter(
    (l) => !fees.find((f) => f.locationId === l.id)
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location-Based Pricing
            </CardTitle>
            <CardDescription>
              Configure location-specific pricing for this service
            </CardDescription>
          </div>
          <Button onClick={saveFees} disabled={isSaving || !hasChanges}>
            {isSaving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label className="text-base">
              Enable location-based pricing
            </Label>
            <p className="text-sm text-muted-foreground">
              When enabled, customers will select a location and the
              corresponding fee will be added to their order
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(v) => {
              setIsEnabled(v);
              setHasChanges(true);
            }}
          />
        </div>

        {isEnabled && (
          <>
            {/* Fee Label */}
            <div className="space-y-2">
              <Label>Customer-facing label</Label>
              <Input
                value={feeLabel}
                onChange={(e) => {
                  setFeeLabel(e.target.value);
                  setHasChanges(true);
                }}
                placeholder='e.g., "State Fee", "Filing Fee", "Province Fee"'
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                This label appears in the pricing table and checkout
              </p>
            </div>

            {/* Add Location + Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {availableLocations.length > 0 && (
                <Popover open={addPopoverOpen} onOpenChange={(open) => {
                  setAddPopoverOpen(open);
                  if (!open) {
                    setSelectedLocationIds(new Set());
                    setAddLocationSearch("");
                  }
                }}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-55 justify-between">
                      <span className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add Locations
                        {selectedLocationIds.size > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {selectedLocationIds.size}
                          </Badge>
                        )}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-3 border-b space-y-2">
                      <Input
                        placeholder="Search locations..."
                        value={addLocationSearch}
                        onChange={(e) => setAddLocationSearch(e.target.value)}
                        className="h-8"
                      />
                      <div className="flex items-center justify-between">
                        <label
                          className="flex items-center gap-2 text-sm cursor-pointer"
                          onClick={() => {
                            const filteredAvailable = availableLocations.filter((loc) =>
                              addLocationSearch
                                ? loc.name.toLowerCase().includes(addLocationSearch.toLowerCase()) ||
                                  loc.code.toLowerCase().includes(addLocationSearch.toLowerCase())
                                : true
                            );
                            const allFilteredSelected = filteredAvailable.length > 0 &&
                              filteredAvailable.every((loc) => selectedLocationIds.has(loc.id));

                            setSelectedLocationIds((prev) => {
                              const next = new Set(prev);
                              if (allFilteredSelected) {
                                filteredAvailable.forEach((loc) => next.delete(loc.id));
                              } else {
                                filteredAvailable.forEach((loc) => next.add(loc.id));
                              }
                              return next;
                            });
                          }}
                        >
                          <Checkbox
                            checked={(() => {
                              const filteredAvailable = availableLocations.filter((loc) =>
                                addLocationSearch
                                  ? loc.name.toLowerCase().includes(addLocationSearch.toLowerCase()) ||
                                    loc.code.toLowerCase().includes(addLocationSearch.toLowerCase())
                                  : true
                              );
                              return filteredAvailable.length > 0 &&
                                filteredAvailable.every((loc) => selectedLocationIds.has(loc.id));
                            })()}
                          />
                          Select All{addLocationSearch ? " (filtered)" : ""}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {selectedLocationIds.size} selected
                        </span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                      {(() => {
                        const filtered = availableLocations.filter((loc) =>
                          addLocationSearch
                            ? loc.name.toLowerCase().includes(addLocationSearch.toLowerCase()) ||
                              loc.code.toLowerCase().includes(addLocationSearch.toLowerCase())
                            : true
                        );
                        if (filtered.length === 0) {
                          return (
                            <p className="p-3 text-center text-sm text-muted-foreground">
                              No locations found
                            </p>
                          );
                        }
                        return filtered.map((loc) => (
                          <label
                            key={loc.id}
                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                          >
                            <Checkbox
                              checked={selectedLocationIds.has(loc.id)}
                              onCheckedChange={(checked) => {
                                setSelectedLocationIds((prev) => {
                                  const next = new Set(prev);
                                  if (checked) {
                                    next.add(loc.id);
                                  } else {
                                    next.delete(loc.id);
                                  }
                                  return next;
                                });
                              }}
                            />
                            <span className="flex-1">{loc.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{loc.code}</span>
                          </label>
                        ));
                      })()}
                    </div>
                    {selectedLocationIds.size > 0 && (
                      <div className="border-t p-2">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={addMultipleLocationFees}
                        >
                          Add {selectedLocationIds.size} Location{selectedLocationIds.size > 1 ? "s" : ""}
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Fee Table */}
            {filteredFees.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 font-medium">No location fees configured</p>
                <p className="text-sm text-muted-foreground">
                  Add locations above to start configuring fees
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Filing Fee ({currencySymbol})</TableHead>
                      <TableHead>Annual Fee ({currencySymbol})</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFees.map((row) => (
                      <TableRow key={row.locationId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {row.locationCode}
                            </Badge>
                            <span className="font-medium">
                              {row.locationName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.filingFee}
                            onChange={(e) =>
                              updateFeeRow(
                                row.locationId,
                                "filingFee",
                                Number(e.target.value)
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.annualFee ?? ""}
                            onChange={(e) =>
                              updateFeeRow(
                                row.locationId,
                                "annualFee",
                                e.target.value
                                  ? Number(e.target.value)
                                  : null
                              )
                            }
                            className="w-24"
                            placeholder="-"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={row.processingTime}
                            onChange={(e) =>
                              updateFeeRow(
                                row.locationId,
                                "processingTime",
                                e.target.value
                              )
                            }
                            className="w-36"
                            placeholder="e.g., 3-5 days"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={row.isActive}
                            onCheckedChange={(v) =>
                              updateFeeRow(
                                row.locationId,
                                "isActive",
                                v
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() =>
                              removeLocationFee(row.locationId)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

          </>
        )}
      </CardContent>
    </Card>
  );
}
