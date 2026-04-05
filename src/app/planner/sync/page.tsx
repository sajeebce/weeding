"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getLocalProject, deleteLocalProject } from "@/lib/planner-storage";

function SyncContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("Syncing your project...");

  useEffect(() => {
    if (status === "loading") return;

    const from = searchParams.get("from");

    // Not logged in — redirect to login carrying the sync URL
    if (!session?.user?.id) {
      const callbackUrl = encodeURIComponent(`/planner/sync?from=${from}`);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // No local project ID in URL
    if (!from || !from.startsWith("local-")) {
      router.replace("/planner");
      return;
    }

    const local = getLocalProject(from);

    // Local project not found in localStorage
    if (!local) {
      router.replace("/planner");
      return;
    }

    async function sync() {
      try {
        const res = await fetch("/api/planner/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localId: local!.id,
            title: local!.title,
            role: local!.role,
            eventType: local!.eventType,
            eventDate: local!.eventDate,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          deleteLocalProject(from!);
          router.replace(`/planner/${data.project.id}`);
        } else {
          setMessage("Sync failed. Redirecting to your projects...");
          setTimeout(() => router.replace("/planner"), 2000);
        }
      } catch {
        setMessage("Something went wrong. Redirecting...");
        setTimeout(() => router.replace("/planner"), 2000);
      }
    }

    sync();
  }, [session, status, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default function PlannerSyncPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SyncContent />
    </Suspense>
  );
}
