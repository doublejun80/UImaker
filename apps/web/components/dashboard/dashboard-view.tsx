"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, FolderKanban, Layers3, Search, Sparkles, Wand2, X } from "lucide-react";
import { WorkspaceNav } from "@/components/chrome/workspace-nav";
import { DesignKitGallery } from "@/components/design/design-kit-gallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatLocalDate, useCopy, useLanguage } from "@/lib/copy";
import { DEFAULT_DESIGN_KIT_ID, getDesignKitSummaries } from "@/lib/design-kits";
import { getProjectTemplateCategories, type ProjectTemplatePresetSummary } from "@/lib/project-templates";
import { useProjectStats, useUiverseStore } from "@/lib/store";
import { countNodes } from "@/lib/tree";

export function DashboardView(): React.ReactElement {
  const router = useRouter();
  const copy = useCopy();
  const language = useLanguage();
  const projects = useUiverseStore((state) => state.projects);
  const createProject = useUiverseStore((state) => state.createProject);
  const createProjectFromTemplate = useUiverseStore((state) => state.createProjectFromTemplate);
  const syncRouteSelection = useUiverseStore((state) => state.syncRouteSelection);
  const stats = useProjectStats();
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const templateCategories = getProjectTemplateCategories(language);
  const designKits = getDesignKitSummaries(language);
  const [selectedCategoryId, setSelectedCategoryId] = useState(templateCategories[0]?.id ?? "");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
  const [selectedDesignKitId, setSelectedDesignKitId] = useState<string>(DEFAULT_DESIGN_KIT_ID);

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

  const selectedCategory =
    templateCategories.find((category) => category.id === selectedCategoryId) ?? templateCategories[0] ?? null;
  const selectedTemplate =
    selectedCategory?.presets.find((preset) => preset.id === selectedTemplateId) ?? null;
  const selectedDesignKit = designKits.find((kit) => kit.id === selectedDesignKitId) ?? designKits[0] ?? null;

  useEffect(() => {
    if (!selectedCategory && templateCategories[0]) {
      setSelectedCategoryId(templateCategories[0].id);
      setSelectedTemplateId(templateCategories[0].presets[0]?.id ?? "custom");
      return;
    }

    if (!selectedCategory) {
      return;
    }

    const templateStillExists = selectedCategory.presets.some((preset) => preset.id === selectedTemplateId);
    if (selectedTemplateId !== "custom" && !templateStillExists) {
      setSelectedTemplateId(selectedCategory.presets[0]?.id ?? "custom");
    }
  }, [selectedCategory, selectedTemplateId, templateCategories]);

  function resetCreateDialog(): void {
    setIsCreateDialogOpen(false);
    setSelectedCategoryId(templateCategories[0]?.id ?? "");
    setSelectedTemplateId(templateCategories[0]?.presets[0]?.id ?? "custom");
    setSelectedDesignKitId(DEFAULT_DESIGN_KIT_ID);
  }

  function handleCreateProject(): void {
    startTransition(() => {
      const project =
        selectedTemplateId === "custom"
          ? createProject(undefined, selectedDesignKitId)
          : createProjectFromTemplate(selectedTemplateId, selectedDesignKitId);
      resetCreateDialog();
      router.push(`/projects/${project.id}/editor/${project.lastOpenedScreenId}`);
    });
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1680px] gap-0 px-0">
      <WorkspaceNav onCreateProject={() => setIsCreateDialogOpen(true)} />
      <section className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              {copy.dashboard.badge}
            </p>
            <h1 className="text-3xl font-extrabold tracking-[-0.06em] md:text-4xl">{copy.dashboard.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)] md:text-lg">
              {copy.dashboard.description}
            </p>
          </div>
          <div className="flex w-full max-w-[420px] items-center gap-3 rounded-[18px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              className="border-0 bg-transparent px-0 shadow-none focus:ring-0"
              placeholder={copy.dashboard.searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard label={copy.dashboard.metrics.projects} value={String(stats.projectCount)} accent="var(--color-primary)" ratio={Math.min(stats.projectCount / 8, 1)} liveLabel={copy.common.live} />
          <MetricCard label={copy.dashboard.metrics.screens} value={String(stats.screenCount)} accent="var(--color-tertiary)" ratio={Math.min(stats.screenCount / 16, 1)} liveLabel={copy.common.live} />
          <MetricCard label={copy.dashboard.metrics.components} value={String(stats.componentCount)} accent="#c9e7f7" ratio={Math.min(stats.componentCount / 40, 1)} liveLabel={copy.common.live} />
        </div>

        <Card className="surface-panel mb-8 overflow-hidden bg-[rgba(17,20,23,0.92)] p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.04em]">{copy.dashboard.quickStartTitle}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {copy.dashboard.quickStartSteps.map((step, index) => (
                  <div key={step} className="rounded-[16px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                    <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--color-primary)]">{language === "ko" ? "단계" : "Step"} {index + 1}</div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/help"
                className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--surface-bright)] px-4 text-sm font-semibold text-[var(--text-primary)] transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--surface-highest)]"
              >
                {copy.dashboard.quickStartHelp}
              </Link>
              <Button
                variant="primary"
                onClick={() => {
                  setIsCreateDialogOpen(true);
                  setSelectedCategoryId(templateCategories[0]?.id ?? "");
                  setSelectedTemplateId(templateCategories[0]?.presets[0]?.id ?? "custom");
                  setSelectedDesignKitId(DEFAULT_DESIGN_KIT_ID);
                }}
              >
                <Wand2 className="h-4 w-4" />
                {copy.dashboard.quickStartCreate}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em]">{copy.dashboard.dashboardTitle}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{copy.dashboard.dashboardDescription}</p>
          </div>
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
                          {project.screens.length} {copy.dashboard.cardScreens}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5">
                        <Layers3 className="h-3.5 w-3.5" />
                        {componentCount} {copy.dashboard.cardNodes}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface)] px-3 py-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatLocalDate(project.updatedAt, language)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <Button variant="ghost" onClick={() => router.push(`/projects/${project.id}/export`)}>
                        <FolderKanban className="h-4 w-4" />
                        {copy.common.export}
                      </Button>
                      <Button variant="primary" onClick={() => openProject(project.id, project.lastOpenedScreenId)}>
                        {copy.common.openEditor}
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
                <h3 className="text-xl font-bold tracking-[-0.04em]">{copy.dashboard.recentTitle}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{copy.dashboard.recentDescription}</p>
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
                  <div className="text-xs text-[var(--text-muted)]">{formatLocalDate(project.updatedAt, language)}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {isCreateDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.64)] p-4">
          <Card className="surface-panel flex max-h-[88vh] w-full max-w-[1240px] flex-col overflow-hidden bg-[rgba(17,20,23,0.98)] p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="px-6 pb-4 pt-6">
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {language === "ko" ? "새 프로젝트" : "New project"}
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                  {language === "ko" ? "원하는 프로젝트 종류를 선택하세요." : "Choose the kind of project you want to start."}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {language === "ko"
                    ? "먼저 큰 분류를 고르고, 그 안에서 많이 쓰는 기본 화면 3가지를 비교한 뒤 바로 시작할 수 있습니다. 마지막 카드의 사용자 지정은 빈 화면부터 직접 만지는 방식입니다."
                    : "Pick a category first, compare three widely used starter layouts, and launch straight into editing. The custom option starts from a blank screen."}
                </p>
              </div>
              <button
                type="button"
                onClick={resetCreateDialog}
                className="mr-6 mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                aria-label={language === "ko" ? "닫기" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 border-t border-[rgba(70,72,75,0.15)] xl:grid-cols-[280px_minmax(0,1fr)]">
              <div className="scrollbar-thin overflow-y-auto border-b border-[rgba(70,72,75,0.15)] px-6 py-5 xl:border-b-0 xl:border-r">
                <div className="mb-4 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {language === "ko" ? "프로젝트 카테고리" : "Project categories"}
                </div>
                <div className="space-y-2">
                  {templateCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setSelectedTemplateId(category.presets[0]?.id ?? "custom");
                      }}
                      className={
                        category.id === selectedCategoryId
                          ? "w-full rounded-[18px] border border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] px-4 py-4 text-left"
                          : "w-full rounded-[18px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-4 text-left transition hover:bg-[var(--surface-highest)]"
                      }
                    >
                      <div className="font-semibold">{category.name}</div>
                      <div className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{category.summary}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="scrollbar-thin overflow-y-auto px-6 py-5">
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {language === "ko" ? "기본 샘플 3종" : "Three starter samples"}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">{selectedCategory?.name}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedCategory?.summary}
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {selectedCategory?.presets.map((preset) => (
                    <TemplateCard
                      key={preset.id}
                      preset={preset}
                      selected={selectedTemplateId === preset.id}
                      onSelect={() => setSelectedTemplateId(preset.id)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateId("custom")}
                    className={
                      selectedTemplateId === "custom"
                        ? "rounded-[24px] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.04)] p-5 text-left shadow-[0_20px_48px_rgba(0,0,0,0.28)]"
                        : "rounded-[24px] border border-dashed border-[rgba(70,72,75,0.24)] bg-[var(--surface)] p-5 text-left transition hover:bg-[var(--surface-highest)]"
                    }
                  >
                    <div className="mb-4 rounded-[20px] border border-dashed border-[rgba(70,72,75,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.01)_100%)] p-5">
                      <div className="grid gap-3">
                        <div className="h-3 w-28 rounded-full bg-[rgba(255,255,255,0.18)]" />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="h-20 rounded-[18px] bg-[rgba(255,255,255,0.06)]" />
                          <div className="h-20 rounded-[18px] bg-[rgba(255,255,255,0.04)]" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-bold tracking-[-0.03em]">
                          {language === "ko" ? "사용자 지정" : "Custom build"}
                        </div>
                        <div className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                          {language === "ko" ? "샘플 없이 빈 화면부터 직접 구성" : "Start from a blank canvas with no preset"}
                        </div>
                      </div>
                      {selectedTemplateId === "custom" ? (
                        <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[var(--text-primary)]">
                          {language === "ko" ? "선택됨" : "Selected"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {language === "ko"
                        ? "추천 샘플을 쓰지 않고 처음부터 끝까지 직접 배치와 요소를 구성합니다."
                        : "Skip the starter samples and build every section and layout yourself."}
                    </p>
                  </button>
                </div>

                <div className="mt-8 border-t border-[rgba(70,72,75,0.15)] pt-6">
                  <div className="mb-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      {language === "ko" ? "디자인 세팅 보드" : "Design setup board"}
                    </div>
                    <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                      {language === "ko" ? "색, 글자, 버튼 톤을 먼저 정하고 시작합니다." : "Define color, type, and button tone before you build."}
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                      {language === "ko"
                        ? "선택한 샘플 구조는 그대로 두고, 전체 프로젝트의 바탕색, 카드 표면, 글자 계열, 버튼 스타일을 한 번에 맞춥니다."
                        : "Keep the selected layout structure, but align canvas color, surfaces, text hierarchy, and button treatment in one pass."}
                    </p>
                  </div>
                  <DesignKitGallery
                    kits={designKits}
                    selectedId={selectedDesignKitId}
                    onSelect={setSelectedDesignKitId}
                    language={language}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(70,72,75,0.15)] px-6 py-4">
              <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                <div>
                  {selectedTemplate
                    ? selectedTemplate.name
                    : language === "ko"
                      ? "사용자 지정"
                      : "Custom build"}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {language === "ko" ? "디자인 세팅" : "Design setup"}: {selectedDesignKit?.name}
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                onClick={resetCreateDialog}
              >
                {language === "ko" ? "취소" : "Cancel"}
              </Button>
                <Button variant="primary" onClick={handleCreateProject}>
                <Wand2 className="h-4 w-4" />
                  {selectedTemplateId === "custom"
                    ? language === "ko"
                      ? "세팅한 디자인으로 시작"
                      : "Start with this setup"
                    : language === "ko"
                      ? "샘플 + 디자인 세팅으로 시작"
                      : "Start with sample + design setup"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}

function TemplateCard({
  preset,
  selected,
  onSelect
}: {
  preset: ProjectTemplatePresetSummary;
  selected: boolean;
  onSelect: () => void;
}): React.ReactElement {
  const language = useLanguage();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? "rounded-[24px] border border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] p-5 text-left shadow-[0_20px_48px_rgba(0,0,0,0.28)]"
          : "rounded-[24px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] p-5 text-left transition hover:bg-[var(--surface-highest)]"
      }
    >
      <TemplatePreview preset={preset} />
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold tracking-[-0.03em]">{preset.name}</div>
          <div className="mt-1 text-sm font-medium" style={{ color: preset.accent }}>
            {preset.focus}
          </div>
        </div>
        {selected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-xs text-[var(--text-primary)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {language === "ko" ? "선택" : "Selected"}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{preset.description}</p>
      <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
        <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[rgba(0,0,0,0.18)] px-4 py-3">
          <span className="mr-2 font-semibold text-[var(--text-primary)]">{language === "ko" ? "특화" : "Specialized"}</span>
          {preset.specializedFor}
        </div>
        <div className="rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[rgba(0,0,0,0.18)] px-4 py-3">
          <span className="mr-2 font-semibold text-[var(--text-primary)]">{language === "ko" ? "중점" : "Emphasis"}</span>
          {preset.emphasis}
        </div>
      </div>
    </button>
  );
}

function TemplatePreview({ preset }: { preset: ProjectTemplatePresetSummary }): React.ReactElement {
  const gradient = `linear-gradient(135deg, ${preset.accent}40 0%, ${preset.accentSoft}55 100%)`;

  if (preset.preview === "dashboard") {
    return (
      <div className="rounded-[20px] border border-[rgba(70,72,75,0.16)] bg-[rgba(9,11,15,0.82)] p-4">
        <div className="mb-3 h-3 w-24 rounded-full" style={{ background: gradient }} />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)]" />
          <div className="h-20 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]" />
          <div className="col-span-2 h-28 rounded-[18px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]" />
        </div>
      </div>
    );
  }

  if (preset.preview === "docs") {
    return (
      <div className="rounded-[20px] border border-[rgba(70,72,75,0.16)] bg-[rgba(9,11,15,0.82)] p-4">
        <div className="mb-3 h-12 rounded-[16px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)]" />
        <div className="grid gap-3">
          <div className="h-16 rounded-[16px]" style={{ background: gradient }} />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.05)]" />
            <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.04)]" />
            <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.03)]" />
          </div>
        </div>
      </div>
    );
  }

  if (preset.preview === "commerce") {
    return (
      <div className="rounded-[20px] border border-[rgba(70,72,75,0.16)] bg-[rgba(9,11,15,0.82)] p-4">
        <div className="mb-3 h-24 rounded-[18px]" style={{ background: gradient }} />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.05)]" />
          <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.04)]" />
          <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.03)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[rgba(70,72,75,0.16)] bg-[rgba(9,11,15,0.82)] p-4">
      <div className="mb-3 h-24 rounded-[18px]" style={{ background: gradient }} />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.05)]" />
        <div className="h-16 rounded-[14px] bg-[rgba(255,255,255,0.03)]" />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
  ratio,
  liveLabel
}: {
  label: string;
  value: string;
  accent: string;
  ratio: number;
  liveLabel: string;
}): React.ReactElement {
  return (
    <Card className="surface-panel overflow-hidden bg-[rgba(17,20,23,0.92)] p-6">
      <div className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-4xl font-extrabold tracking-[-0.06em]">{value}</span>
        <span className="text-sm font-medium" style={{ color: accent }}>
          {liveLabel}
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-highest)]">
        <div className="metric-bar h-full" style={{ width: `${Math.max(ratio * 100, 8)}%`, backgroundColor: accent }} />
      </div>
    </Card>
  );
}
