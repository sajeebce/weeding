"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getLocalProject, updateLocalProject } from "@/lib/planner-storage";

interface PlannerContextValue {
  brideName: string;
  groomName: string;
  updateBrideName: (name: string, projectId: string, isLocal: boolean) => void;
  updateGroomName: (name: string, projectId: string, isLocal: boolean) => void;
  initCouple: (bride: string, groom: string) => void;
}

const PlannerContext = createContext<PlannerContextValue>({
  brideName: "",
  groomName: "",
  updateBrideName: () => {},
  updateGroomName: () => {},
  initCouple: () => {},
});

export function PlannerProvider({
  children,
  initialBrideName = "",
  initialGroomName = "",
}: {
  children: ReactNode;
  initialBrideName?: string;
  initialGroomName?: string;
}) {
  const [brideName, setBrideName] = useState(initialBrideName);
  const [groomName, setGroomName] = useState(initialGroomName);

  // Sync when layout finishes async fetch
  useEffect(() => { if (initialBrideName) setBrideName(initialBrideName); }, [initialBrideName]);
  useEffect(() => { if (initialGroomName) setGroomName(initialGroomName); }, [initialGroomName]);

  const initCouple = useCallback((bride: string, groom: string) => {
    setBrideName(bride);
    setGroomName(groom);
  }, []);

  const updateBrideName = useCallback((name: string, projectId: string, isLocal: boolean) => {
    setBrideName(name);
    if (isLocal) {
      updateLocalProject(projectId, { brideName: name || null });
    } else {
      fetch(`/api/planner/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brideName: name || null }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("[PlannerContext] brideName save failed:", res.status, err);
        }
      }).catch((e) => console.error("[PlannerContext] brideName network error:", e));
    }
  }, []);

  const updateGroomName = useCallback((name: string, projectId: string, isLocal: boolean) => {
    setGroomName(name);
    if (isLocal) {
      updateLocalProject(projectId, { groomName: name || null });
    } else {
      fetch(`/api/planner/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groomName: name || null }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("[PlannerContext] groomName save failed:", res.status, err);
        }
      }).catch((e) => console.error("[PlannerContext] groomName network error:", e));
    }
  }, []);

  return (
    <PlannerContext.Provider value={{ brideName, groomName, updateBrideName, updateGroomName, initCouple }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerCouple() {
  return useContext(PlannerContext);
}
