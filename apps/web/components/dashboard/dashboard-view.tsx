"use client";

import { startTransition, useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, FolderKanban, Layers3, Search, Sparkles, Wand2 } from "lucide-react";
import { WorkspaceNav } from "@/components/chrome/workspace-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectStats, useUiverseStore } from "@/lib/store";
import { countNodes } from "@/lib/tree";

export function DashboardView(): React.ReactElement {
  const router = useRouter();
  const projects = useUiverseStore((state) => state.projects);
  const createProject = useUiverseStore((state) => state.createProject);
  const syncRouteSelection = useUiverseStore((state) => state.syncRouteSelection);
  const stats = useProjectStats();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const query = deferredSearch.trim().toLowerCase();
  const filtered = !query
    ? projects
    : projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.slug.toLowerCase().includes(query)
      );

  const recent = [...projects]
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    .slice(0, 4);

  function openProject(projectId: string, screenId: string): void {
    syncRouteSelection(projectId, screenId);
    router.push(`/projects/${projectId}/editor/${screenId}`);
  }

  function handleCreateProject(): void {
    startTransition(() => {
      const project = createProject();
      router.push(`/projects/${project.id}/editor/${project.lastOpenedScreenId}`);
    });
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1680px] gap-0 px-0">
      <WorkspaceNav onCreateProject={handleCreateProject} />
      <section className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              Local-first UI architecture
            </p>
            <h1 className="text-4xl font-extrabold tracking-[-0.06em] md:text-5xl">Build your interface system before touching app code.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
              Manage screen-based projects, refine CSS decisions visually, then export React/Tailwind or HTML/CSS bundles through one deterministic contract.
            </p>
          </div>
          <div className="flex w-full max-w-[420px] items-center gap-3 rounded-[18px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
              placeholder="Search projects, slugs, or use cases"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard label="Projects" value={String(stats.projectCount)} accent="var(--color-primary)" ratio={Math.min(stats.projectCount / 8, 1)} />
          <MetricCard label="Screens" value={String(stats.screenCount)} accent="var(--color-tertiary)" ratio={Math.min(stats.screenCount / 16, 1)} />
          <MetricCard label="Surface Components" value={String(stats.componentCount)} accent="#c9e7f7" ratio={Math.min(stats.componentCount / 40, 1)} />
        </div>

        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em]">Project Dashboard</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Each project can hold multiple screens with independent export output and shared visual rules.</p>
          </div>
          <Button variant="primary" onClick={handleCreateProject}>
            <Wand2 className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((project) => {
              const componentCount = project.screens.reduce((total, screen) => total + countNodes(screen.root), 0);
              return (
                <Card key={project.id} className="group overflow-hidden bg-[rgba(17,20,23,0.92)]">
                  <div className="h-44 border-b border-[rgba(70,72,75,0.12)] bg-[radial-gradient(circle_at_top_left,rgba(73,99,255,0.22),transparent_40%),linear-gradient(180deg,#111417_0%,#0c0e11_100%)] p-6">
                    <div className="flex h-full flex-col justify-between rounded-[18px] border border-[rgba(70,72,75,0.15)] bg-[rgba(0,0,0,0.45)] p-5">
                      <div className="h-3 w-24 rounded-full bg-[rgba(155,168,255,0.4)]" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-[12px] bg-[rgba(23,26,29,0.9)]" />
                        <div className="h-16 rounded-[12px] bg-[rgba(23,26,29,0.76)]" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5 p-6">
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold tracking-[-0.04em]">{project.name}</h3>
                          <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">/projects/{project.slug}</p>
                        </div>
                        <span className="rounded-full bg-[var(--surface-highest)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                          {project.screens.length} screens
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5">
                        <Layers3 className="h-3.5 w-3.5" />
                        {componentCount} nodes
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Button variant="ghost" onClick={() => router.push(`/projects/${project.id}/export`)}>
                        <FolderKanban className="h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="primary" onClick={() => openProject(project.id, project.lastOpenedScreenId)}>
                        Open Editor
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Card className="surface-panel h-fit bg-[rgba(17,20,23,0.92)] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-[-0.04em]">Recent Activity</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Latest workspaces edited in the local bundle cache.</p>
              </div>
            </div>
            <div className="space-y-3">
              {recent.map((project) => (
                <button
                  key={project.id}
                  className="flex w-full items-start justify-between gap-3 rounded-[16px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-4 text-left transition hover:bg-[var(--surface-highest)]"
                  onClick={() => openProject(project.id, project.lastOpenedScreenId)}
                >
                  <div>
                    <div className="font-semibold">{project.name}</div>
                    <div className="mt-1 text-sm text-[var(--text-secondary)]">{project.description}</div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{new Date(project.updatedAt).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  accent,
  ratio
}: {
  label: string;
  value: string;
  accent: string;
  ratio: number;
}): React.ReactElement {
  return (
    <Card className="surface-panel overflow-hidden bg-[rgba(17,20,23,0.92)] p-6">
      <div className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-4xl font-extrabold tracking-[-0.06em]">{value}</span>
        <span className="text-sm font-medium" style={{ color: accent }}>
          live
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-highest)]">
        <div className="metric-bar h-full" style={{ width: `${Math.max(ratio * 100, 8)}%`, backgroundColor: accent }} />
      </div>
    </Card>
  );
}
