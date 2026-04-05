"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Calendar, MoreVertical, Trash2, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  getAllLocalProjects,
  deleteLocalProject,
  type LocalProject,
} from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";

interface DbProject {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  coverImage: string | null;
  createdAt: string;
  members: { id: string; role: string; displayName: string | null }[];
}

type Project = {
  id: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  coverImage: string | null;
  isLocal: boolean;
};

function dbToProject(p: DbProject): Project {
  return { id: p.id, title: p.title, eventType: p.eventType, eventDate: p.eventDate, status: p.status, coverImage: p.coverImage, isLocal: false };
}

function localToProject(p: LocalProject): Project {
  return { id: p.id, title: p.title, eventType: p.eventType, eventDate: p.eventDate, status: p.status, coverImage: null, isLocal: true };
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function MyProjectsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadProjects() {
    setLoading(true);
    const local = getAllLocalProjects().map(localToProject);

    if (session?.user?.id) {
      try {
        const res = await fetch("/api/planner/projects");
        if (res.ok) {
          const data = await res.json();
          const db = (data.projects as DbProject[]).map(dbToProject);
          setProjects([...local, ...db]);
        } else {
          setProjects(local);
        }
      } catch {
        setProjects(local);
      }
    } else {
      setProjects(local);
    }
    setLoading(false);
  }

  async function handleDelete(project: Project) {
    if (!confirm(t("projects.deleteConfirm"))) return;
    if (project.isLocal) {
      deleteLocalProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      return;
    }
    const res = await fetch(`/api/planner/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== project.id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("projects.title")}</h1>
            <p className="mt-1 text-muted-foreground">
              {t("projects.subtitle")}
            </p>
          </div>
          <Link href="/planner/create">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0">
              <Plus className="h-4 w-4" />
              {t("projects.newProject")}
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        )}

        {!loading && projects.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 text-5xl">💍</div>
              <h2 className="mb-2 text-xl font-semibold">{t("projects.noProjects")}</h2>
              <p className="mb-6 text-muted-foreground">
                {t("projects.noProjectsDesc")}
              </p>
              <Link href="/planner/create">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0">
                  <Plus className="h-4 w-4" />
                  {t("projects.createNew")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => router.push(`/planner/${project.id}`)}
              >
                <div className="relative h-40 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-blue-700">
                  {project.coverImage && (
                    <img src={project.coverImage} alt="" className="h-full w-full object-cover" />
                  )}
                  <div className="absolute right-2 top-2 flex gap-2">
                    {project.isLocal ? (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 flex items-center gap-1">
                        <CloudOff className="h-3 w-3" />
                        {t("common.notSaved")}
                      </Badge>
                    ) : (
                      <Badge className={statusColors[project.status] || ""}>
                        {project.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{project.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {project.eventType.toLowerCase()}
                      </p>
                      {project.eventDate && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(project.eventDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(project); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
