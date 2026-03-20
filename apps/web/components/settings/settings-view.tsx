"use client";

import { BarChart3, Database, Palette, UserRound } from "lucide-react";
import { WorkspaceNav } from "@/components/chrome/workspace-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useProjectStats, useUiverseStore } from "@/lib/store";

export function SettingsView(): React.ReactElement {
  const settings = useUiverseStore((state) => state.settings);
  const updateSettings = useUiverseStore((state) => state.updateSettings);
  const stats = useProjectStats();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1680px] gap-0 px-0">
      <WorkspaceNav />
      <section className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Project & User Settings</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.06em]">Manage local profile state, export defaults, and bundle statistics.</h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            This MVP keeps everything local. The settings page mirrors the USERS-PROJECTS-COMPONENTS model without requiring remote auth or persistence.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SettingsMetric icon={Database} label="Projects" value={String(stats.projectCount)} accent="var(--color-primary)" />
          <SettingsMetric icon={Palette} label="Screens" value={String(stats.screenCount)} accent="var(--color-tertiary)" />
          <SettingsMetric icon={BarChart3} label="Component Nodes" value={String(stats.componentCount)} accent="#c9e7f7" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <Card className="surface-panel bg-[rgba(17,20,23,0.92)] p-6">
              <div className="mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                <UserRound className="h-5 w-5 text-[var(--color-primary)]" />
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.04em]">Local profile</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Stored in `uiverse.settings.v1`.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Profile name">
                  <Input value={settings.profileName} onChange={(event) => updateSettings({ profileName: event.target.value })} />
                </Field>
                <Field label="Email">
                  <Input value={settings.profileEmail} onChange={(event) => updateSettings({ profileEmail: event.target.value })} />
                </Field>
                <Field label="Default export target">
                  <Select
                    value={settings.defaultExportTarget}
                    onChange={(event) =>
                      updateSettings({
                        defaultExportTarget: event.target.value === "html-css" ? "html-css" : "react-tailwind"
                      })
                    }
                  >
                    <option value="react-tailwind">React / Tailwind</option>
                    <option value="html-css">HTML / CSS</option>
                  </Select>
                </Field>
                <Field label="Accent color">
                  <Input value={settings.theme.accent} onChange={(event) => updateSettings({ theme: { ...settings.theme, accent: event.target.value } })} />
                </Field>
              </div>
            </Card>

            <Card className="surface-panel bg-[rgba(17,20,23,0.92)] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.04em]">Storage contracts</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Versioned keys used by the local-first MVP.</p>
                </div>
                <Button variant="secondary">Inspect JSON</Button>
              </div>
              <div className="grid gap-3 text-sm text-[var(--text-secondary)] md:grid-cols-2">
                <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                  <div className="font-mono text-xs text-[var(--color-primary)]">uiverse.projects.v1</div>
                  <div className="mt-2 leading-6">Stored project documents, screens, node trees, and last-opened screen references.</div>
                </div>
                <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                  <div className="font-mono text-xs text-[var(--color-tertiary)]">uiverse.settings.v1</div>
                  <div className="mt-2 leading-6">Profile metadata, theme accent, and default export target preferences.</div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="surface-panel h-fit bg-[rgba(17,20,23,0.92)] p-6">
            <h2 className="text-xl font-bold tracking-[-0.04em]">System summary</h2>
            <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
              <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Theme Mode</div>
                <div className="font-semibold text-[var(--text-primary)]">Dark-only V1</div>
              </div>
              <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Export Formats</div>
                <div className="font-semibold text-[var(--text-primary)]">React/Tailwind, HTML/CSS</div>
              </div>
              <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Data Model</div>
                <div className="font-semibold text-[var(--text-primary)]">USERS → PROJECTS → COMPONENTS</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <label className="space-y-2 text-sm text-[var(--text-secondary)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SettingsMetric({
  icon: Icon,
  label,
  value,
  accent
}: {
  icon: typeof Database;
  label: string;
  value: string;
  accent: string;
}): React.ReactElement {
  return (
    <Card className="surface-panel bg-[rgba(17,20,23,0.92)] p-5">
      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        {label}
      </div>
      <div className="mt-4 text-4xl font-extrabold tracking-[-0.06em]">{value}</div>
    </Card>
  );
}
