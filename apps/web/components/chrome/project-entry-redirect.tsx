"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiverseStore } from "@/lib/store";

export function ProjectEntryRedirect({ projectId }: { projectId: string }): React.ReactElement | null {
  const router = useRouter();
  const projects = useUiverseStore((state) => state.projects);
  const syncRouteSelection = useUiverseStore((state) => state.syncRouteSelection);

  useEffect(() => {
    const project = projects.find((candidate) => candidate.id === projectId);
    if (!project) {
      router.replace("/projects");
      return;
    }

    syncRouteSelection(project.id, project.lastOpenedScreenId);
    router.replace(`/projects/${project.id}/editor/${project.lastOpenedScreenId}`);
  }, [projectId, projects, router, syncRouteSelection]);

  return null;
}