"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { canContainChildren, createBundleFromStoredProject, type StyleProp, type UiverseNode } from "@uiverse/schema";
import { generateReactTailwind } from "@uiverse/exporter";
import {
  ChevronRight,
  Code2,
  Laptop,
  Layers3,
  Monitor,
  Move,
  Plus,
  Smartphone,
  Tablet,
  WandSparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { labelForNode, previewDeviceWidths, resolveStyleValue, stylesToCanvasStyle, type PreviewDevice } from "@/lib/rendering";
import { useUiverseStore } from "@/lib/store";
import { findNode, flattenTree } from "@/lib/tree";

const palette: Array<{ type: UiverseNode["type"]; label: string }> = [
  { type: "section", label: "Section" },
  { type: "container", label: "Container" },
  { type: "stack", label: "Stack" },
  { type: "card", label: "Card" },
  { type: "text", label: "Text" },
  { type: "button", label: "Button" },
  { type: "input", label: "Input" },
  { type: "image", label: "Image" }
];

const styleGroups: Array<{
  label: string;
  properties: Array<{
    key: StyleProp;
    label: string;
    type: "text" | "select";
    options?: string[];
  }>;
}> = [
  {
    label: "Typography",
    properties: [
      { key: "fontSize", label: "Font size", type: "text" },
      { key: "fontWeight", label: "Font weight", type: "text" },
      { key: "lineHeight", label: "Line height", type: "text" },
      { key: "letterSpacing", label: "Letter spacing", type: "text" },
      { key: "textAlign", label: "Text align", type: "select", options: ["left", "center", "right"] },
      { key: "color", label: "Text color", type: "text" }
    ]
  },
  {
    label: "Layout",
    properties: [
      { key: "display", label: "Display", type: "select", options: ["block", "flex", "grid", "none"] },
      { key: "direction", label: "Direction", type: "select", options: ["row", "column"] },
      { key: "gap", label: "Gap", type: "text" },
      { key: "align", label: "Align items", type: "select", options: ["start", "center", "end", "stretch"] },
      { key: "justify", label: "Justify", type: "select", options: ["start", "center", "end", "between", "around"] },
      { key: "width", label: "Width", type: "text" },
      { key: "height", label: "Height", type: "text" },
      { key: "padding", label: "Padding", type: "text" },
      { key: "margin", label: "Margin", type: "text" }
    ]
  },
  {
    label: "Background",
    properties: [
      { key: "backgroundColor", label: "Background color", type: "text" },
      { key: "backgroundGradient", label: "Background gradient", type: "text" }
    ]
  },
  {
    label: "Border",
    properties: [
      { key: "borderStyle", label: "Border style", type: "select", options: ["solid", "dashed", "none"] },
      { key: "borderWidth", label: "Border width", type: "text" },
      { key: "borderColor", label: "Border color", type: "text" },
      { key: "borderRadius", label: "Border radius", type: "text" }
    ]
  },
  {
    label: "Effects",
    properties: [
      { key: "opacity", label: "Opacity", type: "text" },
      { key: "boxShadow", label: "Box shadow", type: "text" }
    ]
  }
];

export function EditorView({ projectId, screenId }: { projectId: string; screenId: string }): React.ReactElement {
  const router = useRouter();
  const projects = useUiverseStore((state) => state.projects);
  const settings = useUiverseStore((state) => state.settings);
  const syncRouteSelection = useUiverseStore((state) => state.syncRouteSelection);
  const selectedNodeId = useUiverseStore((state) => state.selectedNodeId);
  const selectNode = useUiverseStore((state) => state.selectNode);
  const currentBreakpoint = useUiverseStore((state) => state.currentBreakpoint);
  const previewDevice = useUiverseStore((state) => state.previewDevice);
  const setBreakpoint = useUiverseStore((state) => state.setBreakpoint);
  const setPreviewDevice = useUiverseStore((state) => state.setPreviewDevice);
  const addNode = useUiverseStore((state) => state.addNode);
  const updateNodeStyle = useUiverseStore((state) => state.updateNodeStyle);
  const clearNodeStyle = useUiverseStore((state) => state.clearNodeStyle);
  const updateNodeContent = useUiverseStore((state) => state.updateNodeContent);
  const moveNodeInScreen = useUiverseStore((state) => state.moveNodeInScreen);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);

  useEffect(() => {
    syncRouteSelection(projectId, screenId);
  }, [projectId, screenId, syncRouteSelection]);

  const project = projects.find((candidate) => candidate.id === projectId);
  const screen = project?.screens.find((candidate) => candidate.id === screenId);
  const selectedNode = screen ? findNode(screen.root, selectedNodeId ?? screen.root.id) ?? screen.root : null;
  const flatNodes = screen ? flattenTree(screen.root) : [];

  if (!project || !screen) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] items-center justify-center px-6 py-12">
        <Card className="surface-panel w-full max-w-[560px] p-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">Project not found</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">The selected project or screen is not available in local storage.</p>
          <Button className="mt-6" variant="primary" onClick={() => router.push("/projects")}>Return to dashboard</Button>
        </Card>
      </main>
    );
  }

  const bundle = createBundleFromStoredProject(project, settings);
  const liveCode = generateReactTailwind(bundle, { screen: screen.id }).files.find((file) => file.path.endsWith(".tsx"))?.content ?? "";
  const liveCodeLines = liveCode.split("\n").slice(0, 12);

  function handleDeviceChange(device: PreviewDevice): void {
    setPreviewDevice(device);
    setBreakpoint(device === "desktop" ? "lg" : device === "tablet" ? "md" : "base");
  }

  function handleAddNode(type: UiverseNode["type"]): void {
    const targetParent = selectedNode && canContainChildren(selectedNode.type) ? selectedNode.id : screen!.root.id;
    addNode(project!.id, screen!.id, type, targetParent);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1800px] gap-4 px-4 py-4 md:px-6 lg:px-8">
      <section className="surface-panel scrollbar-thin flex w-[300px] shrink-0 flex-col overflow-y-auto rounded-[22px] p-5">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Project</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{project.name}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
        </div>
        <div className="mb-6 space-y-2">
          <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Screens</div>
          {project.screens.map((projectScreen) => (
            <button
              key={projectScreen.id}
              className={cn(
                "flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left text-sm transition",
                projectScreen.id === screen.id
                  ? "bg-[var(--surface-highest)] text-[var(--text-primary)]"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              onClick={() => router.push(`/projects/${project.id}/editor/${projectScreen.id}`)}
            >
              <span>{projectScreen.name}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Element palette</div>
            <span className="text-xs text-[var(--text-secondary)]">Click to insert</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {palette.map((item) => (
              <button
                key={item.type}
                className="rounded-[12px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-3 py-3 text-left text-sm font-medium transition hover:bg-[var(--surface-highest)]"
                onClick={() => handleAddNode(item.type)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Node tree</div>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <Move className="h-3.5 w-3.5" />
              Drag on canvas
            </span>
          </div>
          <div className="space-y-1">
            {flatNodes.map((entry) => (
              <button
                key={entry.node.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm transition",
                  entry.node.id === selectedNode?.id
                    ? "bg-[var(--surface-highest)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                )}
                style={{ paddingLeft: `${entry.depth * 18 + 12}px` }}
                onClick={() => selectNode(entry.node.id)}
              >
                <Layers3 className="h-4 w-4 shrink-0" />
                <span className="truncate">{entry.node.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="min-w-0 flex-1">
        <div className="surface-panel mb-4 flex flex-wrap items-center justify-between gap-4 rounded-[22px] px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Visual Editor</div>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">{screen.name}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-panel flex items-center gap-1 rounded-full border border-[rgba(70,72,75,0.15)] p-1">
              <DeviceButton icon={Smartphone} active={previewDevice === "mobile"} onClick={() => handleDeviceChange("mobile")} />
              <DeviceButton icon={Tablet} active={previewDevice === "tablet"} onClick={() => handleDeviceChange("tablet")} />
              <DeviceButton icon={Laptop} active={previewDevice === "desktop"} onClick={() => handleDeviceChange("desktop")} />
            </div>
            <div className="rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              {currentBreakpoint}
            </div>
            <Button variant="ghost" onClick={() => router.push(`/projects/${project.id}/export`)}>
              <Code2 className="h-4 w-4" />
              Export View
            </Button>
          </div>
        </div>

        <div className="surface-panel relative overflow-hidden rounded-[24px] p-4 md:p-6">
          <div className="canvas-grid flex min-h-[720px] items-start justify-center overflow-auto rounded-[20px] bg-[var(--surface-black)] p-6">
            <div
              className="relative transition-all duration-300"
              style={{ width: `${previewDeviceWidths[previewDevice]}px`, maxWidth: "100%" }}
            >
              <CanvasNode
                node={screen.root}
                breakpoint={currentBreakpoint}
                selectedNodeId={selectedNode?.id ?? null}
                onSelect={selectNode}
                dragNodeId={dragNodeId}
                onDragStart={setDragNodeId}
                onDragEnd={() => setDragNodeId(null)}
                onMove={(nodeId, targetParentId, targetIndex) => moveNodeInScreen(project.id, screen.id, nodeId, targetParentId, targetIndex)}
              />
            </div>
          </div>
          <div className="glass-panel absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[rgba(70,72,75,0.15)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <Monitor className="h-4 w-4 text-[var(--color-primary)]" />
            {previewDeviceWidths[previewDevice]}px preview
            <span className="mx-1 h-1 w-1 rounded-full bg-[var(--text-muted)]" />
            {currentBreakpoint} override
          </div>
        </div>

        <Card className="surface-panel mt-4 overflow-hidden rounded-[22px] bg-[rgba(17,20,23,0.92)]">
          <div className="flex items-center justify-between border-b border-[rgba(70,72,75,0.15)] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              <Code2 className="h-4 w-4 text-[var(--color-primary)]" />
              Live React/Tailwind preview
            </div>
            <div className="text-xs text-[var(--text-secondary)]">Shared exporter output</div>
          </div>
          <pre className="scrollbar-thin overflow-x-auto px-5 py-4 text-xs leading-6 text-[var(--text-secondary)]">
            {liveCodeLines.map((line, index) => (
              <div key={`${index}-${line}`} className="font-mono">
                <span className="mr-4 inline-block w-5 text-right text-[var(--text-muted)]">{index + 1}</span>
                {line}
              </div>
            ))}
          </pre>
        </Card>
      </section>

      <section className="surface-panel scrollbar-thin flex w-[360px] shrink-0 flex-col overflow-y-auto rounded-[22px] p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">Inspector</div>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">{selectedNode?.name ?? "No selection"}</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={() => handleAddNode("stack")}>
            <Plus className="h-4 w-4" />
            Stack
          </Button>
        </div>

        {selectedNode ? (
          <div className="space-y-5">
            <Card className="bg-[var(--surface)] p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Content</div>
              <div className="space-y-3">
                <Field label="Layer name">
                  <Input value={selectedNode.name} readOnly className="opacity-70" />
                </Field>
                {selectedNode.type === "text" ? (
                  <Field label="Text value">
                    <Input
                      value={selectedNode.content?.text ?? ""}
                      onChange={(event) => updateNodeContent(project.id, screen.id, selectedNode.id, { text: event.target.value })}
                    />
                  </Field>
                ) : null}
                {selectedNode.type === "button" ? (
                  <Field label="Button label">
                    <Input
                      value={selectedNode.content?.label ?? ""}
                      onChange={(event) => updateNodeContent(project.id, screen.id, selectedNode.id, { label: event.target.value })}
                    />
                  </Field>
                ) : null}
                {selectedNode.type === "input" ? (
                  <Field label="Placeholder">
                    <Input
                      value={selectedNode.content?.placeholder ?? ""}
                      onChange={(event) => updateNodeContent(project.id, screen.id, selectedNode.id, { placeholder: event.target.value })}
                    />
                  </Field>
                ) : null}
                {selectedNode.type === "image" ? (
                  <>
                    <Field label="Image src">
                      <Input
                        value={selectedNode.content?.src ?? ""}
                        onChange={(event) => updateNodeContent(project.id, screen.id, selectedNode.id, { src: event.target.value })}
                      />
                    </Field>
                    <Field label="Alt text">
                      <Input
                        value={selectedNode.content?.alt ?? ""}
                        onChange={(event) => updateNodeContent(project.id, screen.id, selectedNode.id, { alt: event.target.value })}
                      />
                    </Field>
                  </>
                ) : null}
              </div>
            </Card>

            {styleGroups.map((group) => (
              <Card key={group.label} className="bg-[var(--surface)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{group.label}</div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">{currentBreakpoint}</span>
                </div>
                <div className="space-y-3">
                  {group.properties.map((property) => {
                    const currentValue = selectedNode.styles[property.key]?.[currentBreakpoint] ?? "";
                    const fallbackValue = resolveStyleValue(selectedNode.styles, property.key, currentBreakpoint);
                    return (
                      <Field key={property.key} label={property.label} compact>
                        {property.type === "select" ? (
                          <Select
                            value={currentValue || "inherit"}
                            onChange={(event) => {
                              if (event.target.value === "inherit") {
                                clearNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint);
                                return;
                              }
                              updateNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint, event.target.value);
                            }}
                          >
                            <option value="inherit">Inherit</option>
                            {property.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            placeholder={currentValue ? undefined : fallbackValue || "inherit"}
                            value={currentValue}
                            onChange={(event) => {
                              if (!event.target.value) {
                                clearNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint);
                                return;
                              }
                              updateNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint, event.target.value);
                            }}
                          />
                        )}
                      </Field>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[rgba(70,72,75,0.15)] px-5 py-10 text-center text-sm text-[var(--text-secondary)]">
            Select a node from the tree or canvas.
          </div>
        )}
      </section>
    </main>
  );
}

function DeviceButton({
  icon: Icon,
  active,
  onClick
}: {
  icon: typeof Smartphone;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition",
        active ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-highest)]"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Field({
  label,
  children,
  compact = false
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}): React.ReactElement {
  return (
    <label className={cn("block", compact ? "space-y-1.5" : "space-y-2")}>
      <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}

function CanvasNode({
  node,
  breakpoint,
  selectedNodeId,
  onSelect,
  dragNodeId,
  onDragStart,
  onDragEnd,
  onMove,
  parentId = null,
  index = 0
}: {
  node: UiverseNode;
  breakpoint: "base" | "md" | "lg";
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  dragNodeId: string | null;
  onDragStart: (nodeId: string | null) => void;
  onDragEnd: () => void;
  onMove: (nodeId: string, targetParentId: string, targetIndex?: number) => void;
  parentId?: string | null;
  index?: number;
}): React.ReactElement {
  const isSelected = selectedNodeId === node.id;
  const canAcceptChildren = canContainChildren(node.type);
  const style = stylesToCanvasStyle(node.styles, breakpoint);

  function dropAt(targetParentId: string, targetIndex?: number): void {
    if (!dragNodeId || dragNodeId === node.id) {
      return;
    }
    onMove(dragNodeId, targetParentId, targetIndex);
    onDragStart(null);
  }

  return (
    <div className="relative">
      {parentId ? <DropZone active={Boolean(dragNodeId)} onDrop={() => dropAt(parentId, index)} /> : null}
      <div
        draggable={node.type !== "root"}
        onDragStart={() => onDragStart(node.id)}
        onDragEnd={onDragEnd}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(node.id);
        }}
        className={cn(
          "relative rounded-[18px] transition",
          node.type === "root" ? "min-h-[640px]" : "cursor-pointer",
          isSelected ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--surface-black)]" : "ring-1 ring-transparent"
        )}
        style={style}
      >
        {node.type !== "root" ? (
          <div className="absolute -top-3 left-3 inline-flex items-center gap-2 rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface-black)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] shadow-[0_18px_42px_rgba(0,0,0,0.32)]">
            <WandSparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            {node.type}
          </div>
        ) : null}

        {node.type === "text" ? <p className="m-0">{node.content?.text ?? node.name}</p> : null}
        {node.type === "button" ? <button className="w-full bg-transparent text-inherit">{node.content?.label ?? node.name}</button> : null}
        {node.type === "input" ? <input className="w-full bg-transparent text-inherit outline-none" disabled placeholder={node.content?.placeholder ?? node.name} /> : null}
        {node.type === "image" ? <img className="block w-full" src={node.content?.src ?? "https://placehold.co/640x360"} alt={node.content?.alt ?? node.name} /> : null}
        {! ["text", "button", "input", "image"].includes(node.type) ? (
          <>
            {node.children.map((child, childIndex) => (
              <CanvasNode
                key={child.id}
                node={child}
                breakpoint={breakpoint}
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
                dragNodeId={dragNodeId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onMove={onMove}
                parentId={node.id}
                index={childIndex}
              />
            ))}
            {canAcceptChildren ? (
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropAt(node.id, node.children.length)}
                className={cn(
                  "mt-3 flex min-h-10 items-center justify-center rounded-[14px] border border-dashed text-xs uppercase tracking-[0.22em] transition",
                  dragNodeId && dragNodeId !== node.id
                    ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] text-[var(--color-primary)]"
                    : "border-[rgba(70,72,75,0.15)] text-[var(--text-muted)]"
                )}
              >
                Drop inside {labelForNode(node)}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      {parentId ? <DropZone active={Boolean(dragNodeId)} onDrop={() => dropAt(parentId, index + 1)} /> : null}
    </div>
  );
}

function DropZone({ active, onDrop }: { active: boolean; onDrop: () => void }): React.ReactElement {
  return (
    <div
      className={cn("my-2 h-2 rounded-full transition", active ? "bg-[rgba(155,168,255,0.28)]" : "bg-transparent")}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    />
  );
}

