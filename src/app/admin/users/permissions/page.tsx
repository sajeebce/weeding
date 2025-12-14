"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Shield,
  Check,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PermissionCategory {
  label: string;
  permissions: { key: string; label: string }[];
}

interface PermissionsData {
  permissionsByRole: Record<string, string[]>;
  categories: Record<string, PermissionCategory>;
  roleLabels: Record<string, string>;
  editableRoles: string[];
}

export default function PermissionsPage() {
  const [data, setData] = useState<PermissionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [editedPermissions, setEditedPermissions] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const permData = await res.json();
        setData(permData);
        setEditedPermissions(permData.permissionsByRole);
        if (!selectedRole && permData.editableRoles.length > 0) {
          setSelectedRole(permData.editableRoles[0]);
        }
      } else {
        toast.error("Failed to fetch permissions");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to fetch permissions");
    }
  }, [selectedRole]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchPermissions();
      setIsLoading(false);
    };
    loadData();
  }, [fetchPermissions]);

  const handlePermissionToggle = (role: string, permission: string) => {
    setEditedPermissions((prev) => {
      const currentPerms = prev[role] || [];
      const newPerms = currentPerms.includes(permission)
        ? currentPerms.filter((p) => p !== permission)
        : [...currentPerms, permission];

      return { ...prev, [role]: newPerms };
    });

    // Mark as having changes
    setHasChanges((prev) => ({ ...prev, [role]: true }));
  };

  const handleSelectAll = (role: string, category: string) => {
    if (!data) return;
    const categoryPerms = data.categories[category].permissions.map((p) => p.key);
    const currentPerms = editedPermissions[role] || [];
    const allSelected = categoryPerms.every((p) => currentPerms.includes(p));

    setEditedPermissions((prev) => {
      const newPerms = allSelected
        ? currentPerms.filter((p) => !categoryPerms.includes(p))
        : [...new Set([...currentPerms, ...categoryPerms])];
      return { ...prev, [role]: newPerms };
    });

    setHasChanges((prev) => ({ ...prev, [role]: true }));
  };

  const handleSave = async (role: string) => {
    setIsSaving(role);
    try {
      const res = await fetch(`/api/admin/permissions/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: editedPermissions[role] || [] }),
      });

      if (res.ok) {
        toast.success(`Permissions updated for ${data?.roleLabels[role]}`);
        setHasChanges((prev) => ({ ...prev, [role]: false }));
        // Update original data
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            permissionsByRole: {
              ...prev.permissionsByRole,
              [role]: editedPermissions[role] || [],
            },
          };
        });
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save permissions");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setIsSaving(null);
    }
  };

  const handleReset = (role: string) => {
    if (!data) return;
    setEditedPermissions((prev) => ({
      ...prev,
      [role]: data.permissionsByRole[role] || [],
    }));
    setHasChanges((prev) => ({ ...prev, [role]: false }));
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Role Permissions</h1>
            <p className="text-muted-foreground">
              Configure what each role can access
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => fetchPermissions()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Admin Role</p>
                <p className="text-sm text-blue-700">
                  Admins always have full access to all features. Their permissions cannot be modified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Customer Role</p>
                <p className="text-sm text-gray-700">
                  Customers have no admin permissions. They can only access their own data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Permissions</CardTitle>
          <CardDescription>
            Select a role to configure its permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={setSelectedRole}>
            <TabsList className="mb-6">
              {data.editableRoles.map((role) => (
                <TabsTrigger key={role} value={role} className="relative">
                  {data.roleLabels[role]}
                  {hasChanges[role] && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {data.editableRoles.map((role) => (
              <TabsContent key={role} value={role} className="space-y-6">
                {/* Save/Reset buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {(editedPermissions[role] || []).length} permissions
                    </Badge>
                    {hasChanges[role] && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Unsaved changes
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReset(role)}
                      disabled={!hasChanges[role]}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(role)}
                      disabled={!hasChanges[role] || isSaving === role}
                    >
                      {isSaving === role ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Permission categories */}
                <div className="grid gap-6 md:grid-cols-2">
                  {Object.entries(data.categories).map(([categoryKey, category]) => {
                    const rolePerms = editedPermissions[role] || [];
                    const categoryPerms = category.permissions.map((p) => p.key);
                    const selectedCount = categoryPerms.filter((p) => rolePerms.includes(p)).length;
                    const allSelected = selectedCount === categoryPerms.length;

                    return (
                      <Card key={categoryKey}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{category.label}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSelectAll(role, categoryKey)}
                            >
                              {allSelected ? "Deselect All" : "Select All"}
                            </Button>
                          </div>
                          <CardDescription className="text-xs">
                            {selectedCount} of {categoryPerms.length} selected
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {category.permissions.map((perm) => {
                            const isChecked = rolePerms.includes(perm.key);
                            return (
                              <div
                                key={perm.key}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  id={`${role}-${perm.key}`}
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(role, perm.key)
                                  }
                                />
                                <label
                                  htmlFor={`${role}-${perm.key}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                                >
                                  {perm.label}
                                  {isChecked && (
                                    <Check className="h-3 w-3 text-green-600" />
                                  )}
                                </label>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
