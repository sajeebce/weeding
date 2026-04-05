"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PlannerSidebar } from "@/components/planner/sidebar";
import { PlannerHeader } from "@/components/planner/header";
import { AnonymousBanner } from "@/components/planner/anonymous-banner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getLocalProject } from "@/lib/planner-storage";
import { PlannerProvider } from "@/lib/planner-context";

export default function PlannerProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.id as string;
  const isLocal = projectId.startsWith("local-");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Untitled");
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [initialBride, setInitialBride] = useState("");
  const [initialGroom, setInitialGroom] = useState("");

  useEffect(() => {
    if (!projectId) return;

    if (isLocal) {
      const project = getLocalProject(projectId);
      const title = project?.title || "Untitled";
      setProjectTitle(title);
      setEventDate(project?.eventDate ?? null);
      setInitialBride(project?.brideName || "");
      setInitialGroom(project?.groomName || "");
      document.title = `${title} | Wedding Planner`;
      return;
    }

    async function fetchProject() {
      try {
        const res = await fetch(`/api/planner/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          const title = data.project?.title || "Untitled";
          setProjectTitle(title);
          setEventDate(data.project?.eventDate ?? null);
          setInitialBride(data.project?.brideName || "");
          setInitialGroom(data.project?.groomName || "");
          document.title = `${title} | Wedding Planner`;
        }
      } catch {}
    }
    fetchProject();
  }, [projectId, isLocal]);

  return (
    <PlannerProvider initialBrideName={initialBride} initialGroomName={initialGroom}>
      <div className="flex h-screen flex-col overflow-hidden bg-white">
        {/* Anonymous warning banner */}
        <AnonymousBanner projectId={projectId} />

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <PlannerSidebar
              projectId={projectId}
              projectTitle={projectTitle}
              eventDate={eventDate}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Planner Menu</SheetTitle>
              <PlannerSidebar
                projectId={projectId}
                projectTitle={projectTitle}
                eventDate={eventDate}
                mobile
                onToggle={() => setMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <PlannerHeader onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </div>
    </PlannerProvider>
  );
}
