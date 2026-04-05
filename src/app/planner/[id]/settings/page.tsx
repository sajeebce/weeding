"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLocalProject, updateLocalProject } from "@/lib/planner-storage";
import { usePlannerCouple } from "@/lib/planner-context";

export default function SettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const isLocal = projectId.startsWith("local-");
  const { brideName, groomName, updateBrideName, updateGroomName } = usePlannerCouple();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    eventType: "WEDDING",
    eventDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (isLocal) {
      const p = getLocalProject(projectId);
      if (p) {
        setForm({
          title: p.title || "",
          eventType: p.eventType || "WEDDING",
          eventDate: p.eventDate ? new Date(p.eventDate).toISOString().split("T")[0] : "",
          status: p.status || "ACTIVE",
        });
      }
      setLoading(false);
      return;
    }

    async function fetchProject() {
      try {
        const res = await fetch(`/api/planner/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.project;
          setForm({
            title: p.title || "",
            eventType: p.eventType || "WEDDING",
            eventDate: p.eventDate ? new Date(p.eventDate).toISOString().split("T")[0] : "",
            status: p.status || "ACTIVE",
          });
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId, isLocal]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isLocal) {
        updateLocalProject(projectId, {
          title: form.title,
          eventType: form.eventType,
          eventDate: form.eventDate || null,
          status: form.status,
        });
      } else {
        await fetch(`/api/planner/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            eventType: form.eventType,
            eventDate: form.eventDate || null,
            status: form.status,
          }),
        });
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Project Settings</h1>

      {/* Couple Names */}
      <Card>
        <CardHeader>
          <CardTitle>Couple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brideName">Bride&apos;s Name</Label>
              <Input
                id="brideName"
                value={brideName}
                onChange={(e) => updateBrideName(e.target.value, projectId, isLocal)}
                placeholder="e.g. Sarah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groomName">Groom&apos;s Name</Label>
              <Input
                id="groomName"
                value={groomName}
                onChange={(e) => updateGroomName(e.target.value, projectId, isLocal)}
                placeholder="e.g. John"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">These names appear across all planner pages automatically.</p>
        </CardContent>
      </Card>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={form.eventType}
              onValueChange={(v) => setForm((f) => ({ ...f, eventType: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEDDING">Wedding</SelectItem>
                <SelectItem value="BAPTISM">Baptism</SelectItem>
                <SelectItem value="PARTY">Party</SelectItem>
                <SelectItem value="CORPORATE">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input
              id="eventDate"
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
