"use client";

import { BarChart3, Database, Palette, UserRound } from "lucide-react";
import { WorkspaceNav } from "@/components/chrome/workspace-nav";
import { Card } from "@/components/ui/card";
import { ColorField } from "@/components/ui/color-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCopy } from "@/lib/copy";
import { useProjectStats, useUiverseStore } from "@/lib/store";

export function SettingsView(): React.ReactElement {
  const copy = useCopy();
  const settings = useUiverseStore((state) => state.settings);
  const updateSettings = useUiverseStore((state) => state.updateSettings);
  const stats = useProjectStats();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1680px] gap-0 px-0">
      <WorkspaceNav />
      <section className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{copy.settings.eyebrow}</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.06em]">{copy.settings.title}</h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            {copy.settings.description}
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <SettingsMetric icon={Database} label={copy.dashboard.metrics.projects} value={String(stats.projectCount)} accent="var(--color-primary)" />
          <SettingsMetric icon={Palette} label={copy.dashboard.metrics.screens} value={String(stats.screenCount)} accent="var(--color-tertiary)" />
          <SettingsMetric icon={BarChart3} label={copy.dashboard.metrics.components} value={String(stats.componentCount)} accent="#c9e7f7" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <Card className="surface-panel bg-[rgba(17,20,23,0.92)] p-6">
              <div className="mb-6 flex items-center gap-3 text-[var(--text-primary)]">
                <UserRound className="h-5 w-5 text-[var(--color-primary)]" />
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.04em]">{copy.settings.profileTitle}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{copy.settings.profileDescription}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={copy.settings.language}>
                  <Select value={settings.language} onChange={(event) => updateSettings({ language: event.target.value === "en" ? "en" : "ko" })}>
                    <option value="ko">{copy.common.korean}</option>
                    <option value="en">{copy.common.english}</option>
                  </Select>
                </Field>
                <Field label={copy.settings.profileName}>
                  <Input value={settings.profileName} onChange={(event) => updateSettings({ profileName: event.target.value })} />
                </Field>
                <Field label={copy.settings.email}>
                  <Input value={settings.profileEmail} onChange={(event) => updateSettings({ profileEmail: event.target.value })} />
                </Field>
                <Field label={copy.settings.exportTarget}>
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
                <Field label={copy.settings.accentColor}>
                  <ColorField
                    value={settings.theme.accent}
                    onChange={(value) => updateSettings({ theme: { ...settings.theme, accent: value } })}
                    helperText={copy.settings.accentHelp}
                  />
                </Field>
              </div>
            </Card>

            <Card className="surface-panel bg-[rgba(17,20,23,0.92)] p-6">
              <div className="mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.04em]">{copy.settings.storageTitle}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{copy.settings.storageDescription}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-[var(--text-secondary)] md:grid-cols-2">
                <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                  <div className="font-mono text-xs text-[var(--color-primary)]">uiverse.projects.v1</div>
                  <div className="mt-2 leading-6">{copy.settings.storageProjects}</div>
                </div>
                <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                  <div className="font-mono text-xs text-[var(--color-tertiary)]">uiverse.settings.v1</div>
                  <div className="mt-2 leading-6">{copy.settings.storageSettings}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="surface-panel h-fit bg-[rgba(17,20,23,0.92)] p-6">
            <h2 className="text-xl font-bold tracking-[-0.04em]">{copy.settings.summaryTitle}</h2>
            <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
              <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{copy.settings.themeMode}</div>
                <div className="font-semibold text-[var(--text-primary)]">{copy.settings.darkOnly}</div>
              </div>
              <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{copy.settings.exportFormats}</div>
                <div className="font-semibold text-[var(--text-primary)]">React/Tailwind, HTML/CSS</div>
              </div>
              <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{copy.settings.dataModel}</div>
                <div className="font-semibold text-[var(--text-primary)]">{copy.settings.summaryModel}</div>
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
