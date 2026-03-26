"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBundleFromStoredProject, type ExportTarget, type GenerateOptions } from "@uiverse/schema";
import { generateHtmlCss, generateReactTailwind } from "@uiverse/exporter";
import { Copy, Download, FileJson2, FolderDown, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CodeHighlighter } from "@/components/export/code-highlighter";
import { useCopy } from "@/lib/copy";
import { useUiverseStore } from "@/lib/store";
import { createZipArchive, downloadBlob } from "@/lib/zip";

function downloadText(filename: string, content: string): void {
  downloadBlob(filename, new Blob([content], { type: "text/plain;charset=utf-8" }));
}

function sanitizeFilename(value: string, fallback: string): string {
  const normalized = value
    .normalize("NFKC")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

export function ExportView({ projectId }: { projectId: string }): React.ReactElement {
  const router = useRouter();
  const copy = useCopy();
  const projects = useUiverseStore((state) => state.projects);
  const settings = useUiverseStore((state) => state.settings);
  const syncRouteSelection = useUiverseStore((state) => state.syncRouteSelection);
  const [target, setTarget] = useState<ExportTarget>(settings.defaultExportTarget);
  const [screenFilter, setScreenFilter] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string>("");

  useEffect(() => {
    syncRouteSelection(projectId);
  }, [projectId, syncRouteSelection]);

  const project = projects.find((candidate) => candidate.id === projectId);

  useEffect(() => {
    if (!project) {
      return;
    }

    const bundle = createBundleFromStoredProject(project, settings);
    const generateOptions: GenerateOptions | undefined = screenFilter ? { screen: screenFilter } : undefined;
    const result =
      target === "react-tailwind"
        ? generateReactTailwind(bundle, generateOptions)
        : generateHtmlCss(bundle, generateOptions);

    if (!result.files.find((file) => file.path === selectedPath)) {
      setSelectedPath(result.files[0]?.path ?? "");
    }
  }, [project, screenFilter, selectedPath, settings, target]);

  if (!project) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] items-center justify-center px-6 py-12">
        <Card className="surface-panel w-full max-w-[560px] p-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">{copy.exportView.exportUnavailable}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{copy.exportView.exportUnavailableBody}</p>
          <Button className="mt-6" variant="primary" onClick={() => router.push("/projects")}>{copy.common.returnToDashboard}</Button>
        </Card>
      </main>
    );
  }

  const activeProject = project;
  const bundle = createBundleFromStoredProject(activeProject, settings);
  const generateOptions: GenerateOptions | undefined = screenFilter ? { screen: screenFilter } : undefined;
  const result =
    target === "react-tailwind"
      ? generateReactTailwind(bundle, generateOptions)
      : generateHtmlCss(bundle, generateOptions);
  const files = result.files;
  const currentFile = files.find((file) => file.path === selectedPath) ?? files[0];
  const sharedFiles =
    target === "react-tailwind"
      ? ["app/layout.tsx", "app/globals.css", "app/page.tsx"]
      : ["index.html", "styles/globals.css", "manifest.json"];
  const currentLanguage = currentFile?.path.endsWith(".tsx")
    ? "tsx"
    : currentFile?.path.endsWith(".html")
      ? "html"
      : currentFile?.path.endsWith(".css")
        ? "css"
        : "json";

  async function handleCopy(): Promise<void> {
    if (!currentFile) {
      return;
    }
    await navigator.clipboard.writeText(currentFile.content);
  }

  function handleDownloadZip(): void {
    const scopeLabel = screenFilter
      ? activeProject.screens.find((screen) => screen.id === screenFilter)?.slug ?? "screen"
      : "all-screens";
    const archiveName = `${sanitizeFilename(activeProject.slug || activeProject.name, "project")}-${scopeLabel}-${target}.zip`;
    downloadBlob(archiveName, createZipArchive(files));
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1760px] gap-4 px-4 py-4 md:px-6 lg:px-8">
      <section className="surface-panel flex w-[320px] shrink-0 flex-col rounded-[22px] p-5">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.exportView.title}</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{activeProject.name}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{copy.exportView.description}</p>
        </div>

        <Card className="mt-5 bg-[var(--surface)] p-4">
          <div className="space-y-3">
            <Field label={copy.exportView.target}>
              <Select value={target} onChange={(event) => setTarget(event.target.value === "html-css" ? "html-css" : "react-tailwind")}>
                <option value="react-tailwind">React / Tailwind</option>
                <option value="html-css">HTML / CSS</option>
              </Select>
            </Field>
            <Field label={copy.exportView.screenFilter}>
              <Select value={screenFilter} onChange={(event) => setScreenFilter(event.target.value)}>
                <option value="">{copy.exportView.allScreens}</option>
                {activeProject.screens.map((screen) => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card className="mt-5 bg-[var(--surface)] p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.exportView.sharedFiles}</div>
          <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
            {sharedFiles.map((file) => (
              <div key={file} className="rounded-[12px] border border-[rgba(70,72,75,0.15)] bg-[rgba(0,0,0,0.12)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]">
                {file}
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-5 bg-[var(--surface-black)] p-4 font-mono text-xs text-[var(--text-secondary)]">
          <div className="mb-2 flex items-center gap-2 text-[var(--text-primary)]">
            <TerminalSquare className="h-4 w-4 text-[var(--color-primary)]" />
            {copy.exportView.cliHandoff}
          </div>
          <div className="leading-6">
            npx @uiverse/cli generate ./uiverse-bundle.json --format {target} --out ./generated
          </div>
        </Card>

        <div className="mt-5 space-y-3">
          <Button variant="primary" className="w-full justify-center" onClick={handleDownloadZip}>
            <Download className="h-4 w-4" />
            {copy.exportView.downloadZip}
          </Button>
          <Button variant="secondary" className="w-full justify-center" onClick={() => currentFile && downloadText(currentFile.path.split("/").pop() ?? "artifact.txt", currentFile.content)}>
            <Download className="h-4 w-4" />
            {copy.exportView.downloadCurrent}
          </Button>
          <Button variant="secondary" className="w-full justify-center" onClick={() => downloadText("uiverse-bundle.json", JSON.stringify(bundle, null, 2))}>
            <FileJson2 className="h-4 w-4" />
            {copy.exportView.downloadBundle}
          </Button>
          <Button variant="ghost" className="w-full justify-center" onClick={() => router.push(`/projects/${activeProject.id}/editor/${activeProject.lastOpenedScreenId}`)}>
            <FolderDown className="h-4 w-4" />
            {copy.exportView.backToEditor}
          </Button>
        </div>
      </section>

      <section className="surface-panel min-w-0 flex-1 overflow-hidden rounded-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(70,72,75,0.15)] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {(["react-tailwind", "html-css"] as const).map((candidate) => (
              <button
                key={candidate}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${candidate === target ? "bg-[var(--surface-highest)] text-[var(--text-primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)]"}`}
                onClick={() => setTarget(candidate)}
              >
                {candidate === "react-tailwind" ? "React / Tailwind" : "HTML / CSS"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              {copy.exportView.copy}
            </Button>
            <Button variant="ghost" onClick={() => currentFile && downloadText(currentFile.path.split("/").pop() ?? "artifact.txt", currentFile.content)}>
              <Download className="h-4 w-4" />
              {copy.exportView.saveCurrentFile}
            </Button>
            <Button variant="primary" onClick={handleDownloadZip}>
              <Download className="h-4 w-4" />
              {copy.exportView.saveZip}
            </Button>
          </div>
        </div>

        <div className="grid h-[calc(100vh-10.5rem)] min-h-[720px] grid-cols-[280px_minmax(0,1fr)]">
          <aside className="scrollbar-thin overflow-y-auto border-r border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-4">
            <div className="mb-3 text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.exportView.generatedFiles}</div>
            <div className="space-y-2">
              {files.map((file) => (
                <button
                  key={file.path}
                  className={`w-full rounded-[12px] border px-3 py-3 text-left text-sm transition ${file.path === currentFile?.path ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] text-[var(--text-primary)]" : "border-[rgba(70,72,75,0.15)] text-[var(--text-secondary)] hover:bg-[var(--surface-highest)]"}`}
                  onClick={() => setSelectedPath(file.path)}
                >
                  <div className="font-medium">{file.path.split("/").pop()}</div>
                  <div className="mt-1 font-mono text-xs text-[var(--text-muted)]">{file.path}</div>
                </button>
              ))}
            </div>
          </aside>
          <div className="flex min-w-0 flex-col bg-[#050607]">
            <div className="flex items-center justify-between border-b border-[rgba(70,72,75,0.15)] px-5 py-3 text-sm text-[var(--text-secondary)]">
              <span>{currentFile?.path}</span>
              <span>{currentLanguage}</span>
            </div>
            {currentFile ? <CodeHighlighter code={currentFile.content} language={currentLanguage} /> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <label className="block space-y-2 text-sm text-[var(--text-secondary)]">
      <span>{label}</span>
      {children}
    </label>
  );
}
