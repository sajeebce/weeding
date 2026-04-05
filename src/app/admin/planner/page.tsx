"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, ExternalLink, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Project {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string | null };
  members: { id: string; role: string; displayName: string | null }[];
}

export default function AdminPlannerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/planner")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
    COMPLETED: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Event Planner Projects</h1>
          <p className="text-sm text-muted-foreground">All projects created by users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: projects.length },
          { label: "Active", value: projects.filter((p) => p.status === "ACTIVE").length },
          { label: "Completed", value: projects.filter((p) => p.status === "COMPLETED").length },
          { label: "Archived", value: projects.filter((p) => p.status === "ARCHIVED").length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No projects yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{project.user.name || "—"}</p>
                        <p className="text-muted-foreground">{project.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {project.members.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project.eventDate ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(project.eventDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColor[project.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/planner/${project.id}`}
                        target="_blank"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
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
