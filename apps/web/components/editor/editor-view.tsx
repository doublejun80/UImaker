"use client";

import { useEffect, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import {
  canContainChildren,
  createBundleFromStoredProject,
  type Breakpoint,
  type NodeStyles,
  type StyleProp,
  type UiverseNode
} from "@uiverse/schema";
import { generateReactTailwind } from "@uiverse/exporter";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Code2,
  GripVertical,
  Laptop,
  Layers3,
  Monitor,
  Move,
  Palette,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
  X
} from "lucide-react";
import { DesignKitGallery } from "@/components/design/design-kit-gallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColorField } from "@/components/ui/color-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { useCopy, useLanguage } from "@/lib/copy";
import { DEFAULT_DESIGN_KIT_ID, getDesignKitSummaries } from "@/lib/design-kits";
import { DEFAULT_IMAGE_PLACEHOLDER } from "@/lib/image-placeholders";
import { labelForNode, previewDeviceWidths, resolveStyleValue, stylesToCanvasStyle, type PreviewDevice } from "@/lib/rendering";
import { useUiverseStore } from "@/lib/store";
import { findNode, flattenTree, type FlatNode } from "@/lib/tree";

const styleGroups: Array<{
  label: string;
  properties: Array<{
    key: StyleProp;
    label: string;
    type: "text" | "select" | "color";
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
      { key: "color", label: "Text color", type: "color" }
    ]
  },
  {
    label: "Layout",
    properties: [
      { key: "position", label: "Position", type: "select", options: ["static", "relative", "absolute"] },
      { key: "top", label: "Top", type: "text" },
      { key: "left", label: "Left", type: "text" },
      { key: "right", label: "Right", type: "text" },
      { key: "bottom", label: "Bottom", type: "text" },
      { key: "zIndex", label: "Layer order", type: "text" },
      { key: "display", label: "Display", type: "select", options: ["block", "flex", "grid", "none"] },
      { key: "direction", label: "Direction", type: "select", options: ["row", "column"] },
      { key: "gridColumns", label: "Columns", type: "select", options: ["1", "2", "3", "4"] },
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
      { key: "backgroundColor", label: "Background color", type: "color" },
      { key: "backgroundGradient", label: "Background gradient", type: "text" }
    ]
  },
  {
    label: "Border",
    properties: [
      { key: "borderStyle", label: "Border style", type: "select", options: ["solid", "dashed", "none"] },
      { key: "borderWidth", label: "Border width", type: "text" },
      { key: "borderColor", label: "Border color", type: "color" },
      { key: "borderRadius", label: "Border radius", type: "text" },
      { key: "borderTopLeftRadius", label: "Top left radius", type: "text" },
      { key: "borderTopRightRadius", label: "Top right radius", type: "text" },
      { key: "borderBottomRightRadius", label: "Bottom right radius", type: "text" },
      { key: "borderBottomLeftRadius", label: "Bottom left radius", type: "text" }
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

const gradientPresets = [
  { id: "ocean", start: "#8ec5ff", end: "#4963ff" },
  { id: "mint", start: "#79f9c2", end: "#28c9c1" },
  { id: "sunset", start: "#ffd27d", end: "#ff8153" },
  { id: "plum", start: "#c8a7ff", end: "#7a7cff" }
] as const;

const gradientAngleOptions = ["0deg", "45deg", "90deg", "135deg", "180deg"] as const;
const radiusChoices = ["0px", "8px", "16px", "24px", "36px"] as const;
const coordinateChoices = ["0px", "24px", "48px", "96px", "160px"] as const;
const zIndexChoices = ["0", "1", "10", "20", "50"] as const;

function buildLinearGradient(angle: string, start: string, end: string): string {
  return `linear-gradient(${angle}, ${start} 0%, ${end} 100%)`;
}

function parseLinearGradient(value: string | undefined): { angle: string; start: string; end: string } {
  if (!value) {
    return { angle: "135deg", start: gradientPresets[0].start, end: gradientPresets[0].end };
  }

  const matched = value.match(/linear-gradient\(([^,]+),\s*([^,]+?)\s+0%,\s*([^,]+?)\s+100%\)/i);
  if (!matched) {
    return { angle: "135deg", start: gradientPresets[0].start, end: gradientPresets[0].end };
  }

  return {
    angle: matched[1]?.trim() || "135deg",
    start: matched[2]?.trim() || gradientPresets[0].start,
    end: matched[3]?.trim() || gradientPresets[0].end
  };
}

function parsePixelValue(value: string | undefined, fallback = 0): number {
  if (!value) {
    return fallback;
  }

  const matched = value.trim().match(/^-?\d+(?:\.\d+)?(?=px$)/i);
  if (!matched) {
    return fallback;
  }

  return Number(matched[0]);
}

function formatPixelValue(value: number): string {
  return `${Math.round(value)}px`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function stylesWithAbsoluteParentGuard(node: UiverseNode, breakpoint: Breakpoint): NodeStyles {
  if (resolveStyleValue(node.styles, "position", breakpoint) || !canContainChildren(node.type)) {
    return node.styles;
  }

  const hasAbsoluteChild = node.children.some(
    (child) => resolveStyleValue(child.styles, "position", breakpoint) === "absolute"
  );

  if (!hasAbsoluteChild) {
    return node.styles;
  }

  return {
    ...node.styles,
    position: {
      ...(node.styles.position ?? {}),
      [breakpoint]: "relative"
    }
  };
}

function splitCanvasNodeStyle(
  style: CSSProperties,
  options: { isLeafNode: boolean; isFreePositioned: boolean }
): {
  shellStyle: CSSProperties;
  contentStyle: CSSProperties;
} {
  const shellStyle: CSSProperties = {};
  const contentStyle: CSSProperties = { ...style };

  if (options.isFreePositioned) {
    if (style.position) {
      shellStyle.position = style.position;
      delete contentStyle.position;
    }
    if (style.top !== undefined) {
      shellStyle.top = style.top;
      delete contentStyle.top;
    }
    if (style.left !== undefined) {
      shellStyle.left = style.left;
      delete contentStyle.left;
    }
    if (style.right !== undefined) {
      shellStyle.right = style.right;
      delete contentStyle.right;
    }
    if (style.bottom !== undefined) {
      shellStyle.bottom = style.bottom;
      delete contentStyle.bottom;
    }
    if (style.zIndex !== undefined) {
      shellStyle.zIndex = style.zIndex;
      delete contentStyle.zIndex;
    }
  }

  if (options.isLeafNode) {
    if (style.display) {
      shellStyle.display = style.display;
      delete contentStyle.display;
    }

    if (style.width) {
      shellStyle.width = style.width;
      delete contentStyle.width;
    }

    if (style.height) {
      shellStyle.height = style.height;
      delete contentStyle.height;
    }

    if (style.margin) {
      shellStyle.margin = style.margin;
      delete contentStyle.margin;
    }
  }

  return { shellStyle, contentStyle };
}

export function EditorView({ projectId, screenId }: { projectId: string; screenId: string }): React.ReactElement {
  const router = useRouter();
  const copy = useCopy();
  const language = useLanguage();
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
  const updateNodeName = useUiverseStore((state) => state.updateNodeName);
  const deleteNodeInScreen = useUiverseStore((state) => state.deleteNodeInScreen);
  const moveNodeInScreen = useUiverseStore((state) => state.moveNodeInScreen);
  const applyProjectDesignKit = useUiverseStore((state) => state.applyProjectDesignKit);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [centerView, setCenterView] = useState<"canvas" | "code">("canvas");
  const [inspectorTab, setInspectorTab] = useState<"content" | "styles">("styles");
  const [layerNameDraft, setLayerNameDraft] = useState("");
  const [isDesignKitDialogOpen, setIsDesignKitDialogOpen] = useState(false);
  const [selectedDesignKitId, setSelectedDesignKitId] = useState(DEFAULT_DESIGN_KIT_ID);
  const [canvasDrag, setCanvasDrag] = useState<{
    nodeId: string;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    parentWidth: number;
    parentHeight: number;
    nodeWidth: number;
    nodeHeight: number;
  } | null>(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{
    nodeId: string;
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    syncRouteSelection(projectId, screenId);
  }, [projectId, screenId, syncRouteSelection]);

  const palette: Array<{ type: UiverseNode["type"]; label: string }> =
    language === "ko"
      ? [
          { type: "section", label: "섹션" },
          { type: "container", label: "컨테이너" },
          { type: "stack", label: "스택" },
          { type: "card", label: "카드" },
          { type: "text", label: "텍스트" },
          { type: "button", label: "버튼" },
          { type: "input", label: "입력창" },
          { type: "image", label: "이미지" }
        ]
      : [
          { type: "section", label: "Section" },
          { type: "container", label: "Container" },
          { type: "stack", label: "Stack" },
          { type: "card", label: "Card" },
          { type: "text", label: "Text" },
          { type: "button", label: "Button" },
          { type: "input", label: "Input" },
          { type: "image", label: "Image" }
        ];

  const localizedStyleGroups = styleGroups.map((group) => ({
    ...group,
    label:
      group.label === "Typography"
        ? copy.editor.groups.typography
        : group.label === "Layout"
          ? copy.editor.groups.layout
          : group.label === "Background"
            ? copy.editor.groups.background
            : group.label === "Border"
              ? copy.editor.groups.border
              : copy.editor.groups.effects,
    properties: group.properties.map((property) => ({
      ...property,
      label: copy.editor.properties[property.key]
    }))
  }));

  const textSuggestions =
    language === "ko"
      ? ["서비스를 더 쉽게 시작하세요", "첫 화면을 빠르게 만들어보세요", "지금 바로 시작해보세요"]
      : ["Start your service faster", "Build your first screen quickly", "Get started now"];
  const buttonSuggestions =
    language === "ko"
      ? ["지금 시작하기", "무료로 체험하기", "자세히 보기"]
      : ["Get Started", "Try for Free", "Learn More"];
  const inputSuggestions =
    language === "ko"
      ? ["이메일을 입력해 주세요", "검색어를 입력해 주세요", "이름을 입력해 주세요"]
      : ["Enter your email", "Search here", "Enter your name"];
  const spacingChoices = {
    gap: ["8px", "16px", "24px", "32px"],
    padding: ["12px", "20px", "32px", "48px"],
    margin: ["0px", "12px", "24px", "40px"],
    width: ["auto", "50%", "100%", "320px"],
    height: ["auto", "240px", "320px", "480px"],
    borderRadius: ["0px", "8px", "16px", "24px"]
  } as const;

  const project = projects.find((candidate) => candidate.id === projectId);
  const screen = project?.screens.find((candidate) => candidate.id === screenId);
  const designKits = getDesignKitSummaries(language);
  const selectedNode = screen ? findNode(screen.root, selectedNodeId ?? screen.root.id) ?? screen.root : null;
  const flatNodes = screen ? flattenTree(screen.root) : [];
  const selectedEntry = flatNodes.find((entry) => entry.node.id === selectedNode?.id) ?? null;

  useEffect(() => {
    const activeDrag = canvasDrag;
    if (!activeDrag) {
      return;
    }
    const dragSession = activeDrag as NonNullable<typeof activeDrag>;

    function handlePointerMove(event: PointerEvent): void {
      const nextLeft = clamp(
        dragSession.originLeft + (event.clientX - dragSession.startX),
        0,
        Math.max(0, dragSession.parentWidth - dragSession.nodeWidth)
      );
      const nextTop = clamp(
        dragSession.originTop + (event.clientY - dragSession.startY),
        0,
        Math.max(0, dragSession.parentHeight - dragSession.nodeHeight)
      );

      setDragPreviewPosition({
        nodeId: dragSession.nodeId,
        left: nextLeft,
        top: nextTop
      });
    }

    function handlePointerUp(): void {
      if (project && screen) {
        const finalLeft =
          dragPreviewPosition?.nodeId === dragSession.nodeId ? dragPreviewPosition.left : dragSession.originLeft;
        const finalTop =
          dragPreviewPosition?.nodeId === dragSession.nodeId ? dragPreviewPosition.top : dragSession.originTop;
        updateNodeStyle(project.id, screen.id, dragSession.nodeId, "left", currentBreakpoint, formatPixelValue(finalLeft));
        updateNodeStyle(project.id, screen.id, dragSession.nodeId, "top", currentBreakpoint, formatPixelValue(finalTop));
      }

      setCanvasDrag(null);
      setDragPreviewPosition(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [canvasDrag, currentBreakpoint, dragPreviewPosition, project, screen, updateNodeStyle]);

  useEffect(() => {
    setLayerNameDraft(selectedNode?.name ?? "");
  }, [selectedNode?.id, selectedNode?.name]);

  useEffect(() => {
    setSelectedDesignKitId(project?.designKitId ?? DEFAULT_DESIGN_KIT_ID);
  }, [project?.designKitId]);

  if (!project || !screen) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] items-center justify-center px-6 py-12">
        <Card className="surface-panel w-full max-w-[560px] p-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">{copy.editor.projectNotFound}</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{copy.editor.projectNotFoundBody}</p>
          <Button className="mt-6" variant="primary" onClick={() => router.push("/projects")}>{copy.common.returnToDashboard}</Button>
        </Card>
      </main>
    );
  }

  const bundle = createBundleFromStoredProject(project, settings);
  const liveCode =
    generateReactTailwind(bundle, { screen: screen.id }).files.find((file) => file.path === `screens/${screen.slug}.tsx`)?.content ?? "";
  const liveCodeLines = liveCode.split("\n");

  function handleDeviceChange(device: PreviewDevice): void {
    setPreviewDevice(device);
    setBreakpoint(device === "desktop" ? "lg" : device === "tablet" ? "md" : "base");
  }

  function handleAddNode(type: UiverseNode["type"]): void {
    if (!project || !screen) {
      return;
    }

    const targetParent = selectedNode && canContainChildren(selectedNode.type) ? selectedNode.id : screen.root.id;
    addNode(project.id, screen.id, type, targetParent);
  }

  function handleDeleteSelected(): void {
    if (!project || !screen || !selectedNode || selectedNode.id === screen.root.id) {
      return;
    }

    deleteNodeInScreen(project.id, screen.id, selectedNode.id);
  }

  function handleMoveSelected(direction: "up" | "down"): void {
    if (!project || !screen || !selectedEntry?.parentId) {
      return;
    }

    const siblings = flatNodes.filter(
      (entry) => entry.parentId === selectedEntry.parentId && entry.depth === selectedEntry.depth
    );
    const offset = direction === "up" ? -1 : 1;
    const nextIndex = Math.max(0, Math.min(selectedEntry.index + offset, siblings.length - 1));
    if (nextIndex === selectedEntry.index) {
      return;
    }

    moveNodeInScreen(project.id, screen.id, selectedEntry.node.id, selectedEntry.parentId, nextIndex);
  }

  function setPlacementMode(mode: "flow" | "free"): void {
    if (!selectedNode || !project || !screen || selectedNode.id === screen.root.id) {
      return;
    }

    if (mode === "flow") {
      [
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "zIndex"
      ].forEach((property) => clearNodeStyle(project.id, screen.id, selectedNode.id, property as StyleProp, currentBreakpoint));
      setCanvasDrag(null);
      setDragPreviewPosition(null);
      return;
    }

    const defaultOffset = selectedEntry ? 24 + selectedEntry.index * 20 : 24;
    applyStyleValue("position", "absolute");
    applyStyleValue(
      "left",
      resolveStyleValue(selectedNode.styles, "left", currentBreakpoint) ?? formatPixelValue(defaultOffset)
    );
    applyStyleValue(
      "top",
      resolveStyleValue(selectedNode.styles, "top", currentBreakpoint) ?? formatPixelValue(defaultOffset)
    );
    applyStyleValue("zIndex", resolveStyleValue(selectedNode.styles, "zIndex", currentBreakpoint) ?? "1");
    clearStyleValues(["right", "bottom"]);

    if (selectedEntry?.parentId) {
      const parentNode = findNode(screen.root, selectedEntry.parentId);
      if (parentNode && !resolveStyleValue(parentNode.styles, "position", currentBreakpoint)) {
        updateNodeStyle(project.id, screen.id, parentNode.id, "position", currentBreakpoint, "relative");
      }
    }
  }

  function applyStyleValue(property: StyleProp, value: string | null): void {
    if (!selectedNode || !project || !screen) {
      return;
    }

    if (value === null) {
      clearNodeStyle(project.id, screen.id, selectedNode.id, property, currentBreakpoint);
      return;
    }

    updateNodeStyle(project.id, screen.id, selectedNode.id, property, currentBreakpoint, value);
  }

  function clearStyleValues(properties: StyleProp[]): void {
    if (!selectedNode || !project || !screen) {
      return;
    }

    properties.forEach((property) => clearNodeStyle(project.id, screen.id, selectedNode.id, property, currentBreakpoint));
  }

  function setBackgroundMode(mode: "none" | "solid" | "gradient"): void {
    if (mode === "none") {
      clearStyleValues(["backgroundColor", "backgroundGradient"]);
      return;
    }

    if (mode === "solid") {
      const nextColor =
        resolveStyleValue(selectedNode?.styles ?? {}, "backgroundColor", currentBreakpoint) ??
        parseLinearGradient(resolveStyleValue(selectedNode?.styles ?? {}, "backgroundGradient", currentBreakpoint)).start ??
        "#1b1f26";
      applyStyleValue("backgroundColor", nextColor);
      applyStyleValue("backgroundGradient", null);
      return;
    }

    const parsed = parseLinearGradient(resolveStyleValue(selectedNode?.styles ?? {}, "backgroundGradient", currentBreakpoint));
    applyStyleValue("backgroundColor", parsed.start);
    applyStyleValue("backgroundGradient", buildLinearGradient(parsed.angle, parsed.start, parsed.end));
  }

  function setSolidBackground(value: string): void {
    applyStyleValue("backgroundColor", value);
    applyStyleValue("backgroundGradient", null);
  }

  function setGradientBackground(start: string, end: string, angle?: string): void {
    const current = parseLinearGradient(resolveStyleValue(selectedNode?.styles ?? {}, "backgroundGradient", currentBreakpoint));
    applyStyleValue("backgroundColor", start);
    applyStyleValue("backgroundGradient", buildLinearGradient(angle ?? current.angle, start, end));
  }

  function setUniformRadius(value: string): void {
    applyStyleValue("borderRadius", value);
    clearStyleValues([
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomRightRadius",
      "borderBottomLeftRadius"
    ]);
  }

  function setCornerRadius(
    property: "borderTopLeftRadius" | "borderTopRightRadius" | "borderBottomRightRadius" | "borderBottomLeftRadius",
    value: string
  ): void {
    if (!value.trim()) {
      applyStyleValue(property, null);
      return;
    }

    applyStyleValue(property, value);
  }

  function applyLayoutPreset(preset: "stack" | "row" | "twoColumn" | "threeColumn" | "cardGrid"): void {
    if (!selectedNode || !canContainChildren(selectedNode.type)) {
      return;
    }

    if (preset === "stack") {
      applyStyleValue("display", "flex");
      applyStyleValue("direction", "column");
      applyStyleValue("gridColumns", null);
      applyStyleValue("gap", "16px");
      applyStyleValue("align", "stretch");
      applyStyleValue("justify", "start");
      return;
    }

    if (preset === "row") {
      applyStyleValue("display", "flex");
      applyStyleValue("direction", "row");
      applyStyleValue("gridColumns", null);
      applyStyleValue("gap", "16px");
      applyStyleValue("align", "center");
      applyStyleValue("justify", "start");
      return;
    }

    applyStyleValue("display", "grid");
    applyStyleValue("direction", null);
    applyStyleValue("align", "stretch");
    applyStyleValue("justify", "start");
    applyStyleValue("gap", preset === "cardGrid" ? "24px" : "20px");
    applyStyleValue("gridColumns", preset === "twoColumn" ? "2" : preset === "threeColumn" ? "3" : "2");
    if (preset === "cardGrid") {
      applyStyleValue("padding", "24px");
      applyStyleValue("borderRadius", "20px");
    }
  }

  function handleCanvasPointerDragStart(
    nodeId: string,
    target: HTMLDivElement,
    event: ReactPointerEvent<HTMLDivElement>
  ): void {
    if (!project || !screen) {
      return;
    }

    const dragNode = findNode(screen.root, nodeId);
    const parentElement = target.parentElement;
    if (!dragNode || !parentElement) {
      return;
    }

    const nodeRect = target.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();
    const originLeft = parsePixelValue(
      resolveStyleValue(dragNode.styles, "left", currentBreakpoint),
      nodeRect.left - parentRect.left
    );
    const originTop = parsePixelValue(
      resolveStyleValue(dragNode.styles, "top", currentBreakpoint),
      nodeRect.top - parentRect.top
    );

    setCanvasDrag({
      nodeId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft,
      originTop,
      parentWidth: parentRect.width,
      parentHeight: parentRect.height,
      nodeWidth: nodeRect.width,
      nodeHeight: nodeRect.height
    });
    setDragPreviewPosition({
      nodeId,
      left: originLeft,
      top: originTop
    });
  }

  const canAddInside = selectedNode ? canContainChildren(selectedNode.type) : false;
  const canDeleteSelected = selectedNode ? selectedNode.id !== screen.root.id : false;
  const placementMode =
    selectedNode && selectedNode.id !== screen.root.id && resolveStyleValue(selectedNode.styles, "position", currentBreakpoint) === "absolute"
      ? "free"
      : "flow";
  const freePositionValues = {
    left: selectedNode ? resolveStyleValue(selectedNode.styles, "left", currentBreakpoint) ?? "0px" : "0px",
    top: selectedNode ? resolveStyleValue(selectedNode.styles, "top", currentBreakpoint) ?? "0px" : "0px",
    zIndex: selectedNode ? resolveStyleValue(selectedNode.styles, "zIndex", currentBreakpoint) ?? "0" : "0"
  };
  const resolvedBackgroundColor = selectedNode
    ? resolveStyleValue(selectedNode.styles, "backgroundColor", currentBreakpoint)
    : undefined;
  const resolvedBackgroundGradient = selectedNode
    ? resolveStyleValue(selectedNode.styles, "backgroundGradient", currentBreakpoint)
    : undefined;
  const backgroundMode = resolvedBackgroundGradient ? "gradient" : resolvedBackgroundColor ? "solid" : "none";
  const parsedGradient = parseLinearGradient(resolvedBackgroundGradient);
  const uniformRadius = selectedNode ? resolveStyleValue(selectedNode.styles, "borderRadius", currentBreakpoint) ?? "0px" : "0px";
  const cornerRadiusValues = {
    borderTopLeftRadius:
      selectedNode
        ? resolveStyleValue(selectedNode.styles, "borderTopLeftRadius", currentBreakpoint) ?? uniformRadius
        : "0px",
    borderTopRightRadius:
      selectedNode
        ? resolveStyleValue(selectedNode.styles, "borderTopRightRadius", currentBreakpoint) ?? uniformRadius
        : "0px",
    borderBottomRightRadius:
      selectedNode
        ? resolveStyleValue(selectedNode.styles, "borderBottomRightRadius", currentBreakpoint) ?? uniformRadius
        : "0px",
    borderBottomLeftRadius:
      selectedNode
        ? resolveStyleValue(selectedNode.styles, "borderBottomLeftRadius", currentBreakpoint) ?? uniformRadius
        : "0px"
  };
  const previewSurfaceStyle = selectedNode
    ? ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "120px",
        width: "100%",
        padding: resolveStyleValue(selectedNode.styles, "padding", currentBreakpoint) ?? "16px",
        color: resolveStyleValue(selectedNode.styles, "color", currentBreakpoint) ?? "#f5f8ff",
        backgroundColor: resolvedBackgroundColor ?? "rgba(255,255,255,0.04)",
        backgroundImage: resolvedBackgroundGradient,
        borderStyle: resolveStyleValue(selectedNode.styles, "borderStyle", currentBreakpoint) ?? "solid",
        borderWidth: resolveStyleValue(selectedNode.styles, "borderWidth", currentBreakpoint) ?? "1px",
        borderColor: resolveStyleValue(selectedNode.styles, "borderColor", currentBreakpoint) ?? "rgba(255,255,255,0.12)",
        borderRadius: uniformRadius,
        borderTopLeftRadius: cornerRadiusValues.borderTopLeftRadius,
        borderTopRightRadius: cornerRadiusValues.borderTopRightRadius,
        borderBottomRightRadius: cornerRadiusValues.borderBottomRightRadius,
        borderBottomLeftRadius: cornerRadiusValues.borderBottomLeftRadius,
        boxShadow: resolveStyleValue(selectedNode.styles, "boxShadow", currentBreakpoint) ?? "none"
      } satisfies CSSProperties)
    : undefined;
  const styleSummary = [
    backgroundMode === "gradient"
      ? language === "ko"
        ? `배경: 그라데이션 ${parsedGradient.angle}`
        : `Background: gradient ${parsedGradient.angle}`
      : backgroundMode === "solid"
        ? language === "ko"
          ? `배경: 단색 ${resolvedBackgroundColor}`
          : `Background: solid ${resolvedBackgroundColor}`
        : language === "ko"
          ? "배경: 없음"
          : "Background: none",
    language === "ko"
      ? `모서리: ${cornerRadiusValues.borderTopLeftRadius} / ${cornerRadiusValues.borderTopRightRadius} / ${cornerRadiusValues.borderBottomRightRadius} / ${cornerRadiusValues.borderBottomLeftRadius}`
      : `Corners: ${cornerRadiusValues.borderTopLeftRadius} / ${cornerRadiusValues.borderTopRightRadius} / ${cornerRadiusValues.borderBottomRightRadius} / ${cornerRadiusValues.borderBottomLeftRadius}`,
    language === "ko"
      ? `간격: ${resolveStyleValue(selectedNode?.styles ?? {}, "gap", currentBreakpoint) ?? "-"}`
      : `Gap: ${resolveStyleValue(selectedNode?.styles ?? {}, "gap", currentBreakpoint) ?? "-"}`,
    language === "ko"
      ? `패딩: ${resolveStyleValue(selectedNode?.styles ?? {}, "padding", currentBreakpoint) ?? "-"}`
      : `Padding: ${resolveStyleValue(selectedNode?.styles ?? {}, "padding", currentBreakpoint) ?? "-"}`,
    placementMode === "free"
      ? language === "ko"
        ? `위치: 자유 배치 ${freePositionValues.left} / ${freePositionValues.top}`
        : `Position: free ${freePositionValues.left} / ${freePositionValues.top}`
      : language === "ko"
        ? "위치: 흐름 배치"
        : "Position: flow"
  ];
  const inspectorHint = inspectorTab === "content" ? copy.editor.arrangementHint : null;

  return (
    <main className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-[1800px] gap-4 overflow-hidden px-4 py-4 md:px-6 lg:px-8">
      <section className="surface-panel flex h-full w-[288px] shrink-0 flex-col overflow-hidden rounded-[22px] p-5">
        <div className="scrollbar-thin flex-1 overflow-y-auto pr-1">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.editor.project}</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{project.name}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{project.description}</p>
          </div>

          <div className="mb-6 space-y-2">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.editor.screens}</div>
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
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.editor.elementPalette}</div>
              <span className="text-xs text-[var(--text-secondary)]">{copy.editor.clickToInsert}</span>
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

          <Card className="bg-[var(--surface)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              <Move className="h-3.5 w-3.5" />
              {language === "ko" ? "직접 선택" : "Direct selection"}
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {language === "ko"
                ? "흐름 배치는 자동으로 줄을 맞추고, 자유 배치는 박스 안에서 직접 끌어 놓을 수 있습니다. 캔버스에서 바로 선택한 뒤 오른쪽에서 숫자까지 다듬으세요."
                : "Flow keeps rows aligned automatically. Free mode lets you drag an item inside its box, then fine-tune the numbers on the right."}
            </p>
          </Card>
        </div>
      </section>

      <section className="flex h-full min-w-0 flex-1 flex-col">
        <div className="surface-panel mb-4 flex flex-wrap items-center justify-between gap-4 rounded-[22px] px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.editor.visualEditor}</div>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">{screen.name}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-panel flex items-center gap-1 rounded-full border border-[rgba(70,72,75,0.15)] p-1">
              <ViewModeButton active={centerView === "canvas"} label={copy.editor.canvasTab} onClick={() => setCenterView("canvas")} />
              <ViewModeButton active={centerView === "code"} label={copy.editor.codeTab} onClick={() => setCenterView("code")} />
            </div>
            <div className="glass-panel flex items-center gap-1 rounded-full border border-[rgba(70,72,75,0.15)] p-1">
              <DeviceButton icon={Smartphone} active={previewDevice === "mobile"} onClick={() => handleDeviceChange("mobile")} />
              <DeviceButton icon={Tablet} active={previewDevice === "tablet"} onClick={() => handleDeviceChange("tablet")} />
              <DeviceButton icon={Laptop} active={previewDevice === "desktop"} onClick={() => handleDeviceChange("desktop")} />
            </div>
            <div className="rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">
              {copy.editor.breakpointLabel}: {currentBreakpoint}
            </div>
            <Button variant="ghost" onClick={() => router.push(`/projects/${project.id}/export`)}>
              <Code2 className="h-4 w-4" />
              {copy.editor.exportView}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedDesignKitId(project.designKitId ?? DEFAULT_DESIGN_KIT_ID);
                setIsDesignKitDialogOpen(true);
              }}
            >
              <Palette className="h-4 w-4" />
              {language === "ko" ? "디자인 세팅" : "Design setup"}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {centerView === "canvas" ? (
            <div className="surface-panel relative flex h-full overflow-hidden rounded-[24px] p-4 md:p-6">
              <div className="canvas-grid flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-[20px] bg-[var(--surface-black)] p-6">
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
                    dragPreviewPosition={dragPreviewPosition}
                    onDragStart={setDragNodeId}
                    onDragEnd={() => setDragNodeId(null)}
                    onFreeDragStart={handleCanvasPointerDragStart}
                    onMove={(nodeId, targetParentId, targetIndex) =>
                      moveNodeInScreen(project.id, screen.id, nodeId, targetParentId, targetIndex)
                    }
                  />
                </div>
              </div>
              <div className="glass-panel absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[rgba(70,72,75,0.15)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                <Monitor className="h-4 w-4 text-[var(--color-primary)]" />
                {copy.editor.previewWidth} {previewDeviceWidths[previewDevice]}px
                <span className="mx-1 h-1 w-1 rounded-full bg-[var(--text-muted)]" />
                {currentBreakpoint}
              </div>
            </div>
          ) : (
            <Card className="surface-panel flex h-full flex-col overflow-hidden rounded-[24px] bg-[rgba(17,20,23,0.92)]">
              <div className="flex items-center justify-between border-b border-[rgba(70,72,75,0.15)] px-5 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <Code2 className="h-4 w-4 text-[var(--color-primary)]" />
                  {copy.editor.livePreview}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{copy.editor.livePreviewHint}</div>
              </div>
              <pre className="scrollbar-thin min-h-0 flex-1 overflow-auto px-5 py-4 text-xs leading-6 text-[var(--text-secondary)]">
                {liveCodeLines.map((line, index) => (
                  <div key={`${index}-${line}`} className="font-mono">
                    <span className="mr-4 inline-block w-5 text-right text-[var(--text-muted)]">{index + 1}</span>
                    {line}
                  </div>
                ))}
              </pre>
            </Card>
          )}
        </div>
      </section>

      <section className="surface-panel flex h-full w-[392px] shrink-0 flex-col overflow-hidden rounded-[22px] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{copy.editor.inspector}</div>
            <h2 className="mt-1 truncate text-xl font-bold tracking-[-0.04em]">
              {selectedNode?.name ?? copy.editor.noLayerSelection}
            </h2>
            {selectedNode ? (
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{selectedNode.type}</div>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleAddNode("stack")} disabled={!canAddInside}>
              <Plus className="h-4 w-4" />
              {copy.editor.addInside}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={!canDeleteSelected}
              title={!canDeleteSelected ? copy.editor.cannotDeleteRoot : undefined}
            >
              <Trash2 className="h-4 w-4" />
              {copy.editor.deleteLayer}
            </Button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <InspectorTabButton active={inspectorTab === "content"} label={copy.editor.contentTab} onClick={() => setInspectorTab("content")} />
          <InspectorTabButton active={inspectorTab === "styles"} label={copy.editor.styleTab} onClick={() => setInspectorTab("styles")} />
        </div>

        {inspectorHint ? (
          <div className="mb-4 rounded-[16px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {inspectorHint}
          </div>
        ) : null}

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
          {selectedNode ? (
            inspectorTab === "content" ? (
              <div className="space-y-4">
                <Card className="bg-[var(--surface)] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{copy.editor.content}</div>
                  <div className="space-y-3">
                    <Field label={copy.editor.layerName}>
                      <Input
                        value={layerNameDraft}
                        onChange={(event) => setLayerNameDraft(event.target.value)}
                        onBlur={() => {
                          if (!layerNameDraft.trim()) {
                            setLayerNameDraft(selectedNode.name);
                            return;
                          }
                          updateNodeName(project.id, screen.id, selectedNode.id, layerNameDraft);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                      />
                    </Field>
                    {selectedEntry?.parentId ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleMoveSelected("up")}>
                          <ArrowUp className="h-4 w-4" />
                          {copy.editor.moveUp}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleMoveSelected("down")}>
                          <ArrowDown className="h-4 w-4" />
                          {copy.editor.moveDown}
                        </Button>
                      </div>
                    ) : null}
                    {selectedNode.type === "text" ? (
                      <Field label={copy.editor.textValue}>
                        <>
                          <Input
                            value={selectedNode.content?.text ?? ""}
                            onChange={(event) =>
                              updateNodeContent(project.id, screen.id, selectedNode.id, { text: event.target.value })
                            }
                          />
                          <SuggestionRow
                            label={language === "ko" ? "추천 문구" : "Suggestions"}
                            items={textSuggestions}
                            onPick={(item) => updateNodeContent(project.id, screen.id, selectedNode.id, { text: item })}
                          />
                        </>
                      </Field>
                    ) : null}
                    {selectedNode.type === "button" ? (
                      <Field label={copy.editor.buttonLabel}>
                        <>
                          <Input
                            value={selectedNode.content?.label ?? ""}
                            onChange={(event) =>
                              updateNodeContent(project.id, screen.id, selectedNode.id, { label: event.target.value })
                            }
                          />
                          <SuggestionRow
                            label={language === "ko" ? "추천 버튼 문구" : "Suggested button labels"}
                            items={buttonSuggestions}
                            onPick={(item) => updateNodeContent(project.id, screen.id, selectedNode.id, { label: item })}
                          />
                        </>
                      </Field>
                    ) : null}
                    {selectedNode.type === "input" ? (
                      <Field label={copy.editor.placeholder}>
                        <>
                          <Input
                            value={selectedNode.content?.placeholder ?? ""}
                            onChange={(event) =>
                              updateNodeContent(project.id, screen.id, selectedNode.id, { placeholder: event.target.value })
                            }
                          />
                          <SuggestionRow
                            label={language === "ko" ? "추천 안내 문구" : "Suggested placeholders"}
                            items={inputSuggestions}
                            onPick={(item) =>
                              updateNodeContent(project.id, screen.id, selectedNode.id, { placeholder: item })
                            }
                          />
                        </>
                      </Field>
                    ) : null}
                    {selectedNode.type === "image" ? (
                      <>
                        <Field label={copy.editor.imageSrc}>
                          <Input
                            value={selectedNode.content?.src ?? ""}
                            onChange={(event) =>
                              updateNodeContent(project.id, screen.id, selectedNode.id, { src: event.target.value })
                            }
                          />
                        </Field>
                        <Field label={copy.editor.altText}>
                          <Input
                            value={selectedNode.content?.alt ?? ""}
                            onChange={(event) =>
                              updateNodeContent(project.id, screen.id, selectedNode.id, { alt: event.target.value })
                            }
                          />
                        </Field>
                      </>
                    ) : null}
                  </div>
                </Card>

                {canContainChildren(selectedNode.type) ? (
                  <Card className="bg-[var(--surface)] p-4">
                    <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{copy.editor.arrangement}</div>
                    <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">{copy.editor.arrangementHint}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <PresetButton label={copy.editor.presets.stack} onClick={() => applyLayoutPreset("stack")} />
                      <PresetButton label={copy.editor.presets.row} onClick={() => applyLayoutPreset("row")} />
                      <PresetButton label={copy.editor.presets.twoColumn} onClick={() => applyLayoutPreset("twoColumn")} />
                      <PresetButton label={copy.editor.presets.threeColumn} onClick={() => applyLayoutPreset("threeColumn")} />
                      <div className="col-span-2">
                        <PresetButton label={copy.editor.presets.cardGrid} onClick={() => applyLayoutPreset("cardGrid")} />
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <QuickChoiceGroup
                        label={copy.editor.properties.gap}
                        choices={[
                          { label: copy.editor.presets.compactGap, value: "8px" },
                          { label: copy.editor.presets.normalGap, value: "16px" },
                          { label: copy.editor.presets.roomyGap, value: "28px" }
                        ]}
                        currentValue={selectedNode.styles.gap?.[currentBreakpoint] ?? ""}
                        onPick={(value) => applyStyleValue("gap", value)}
                      />
                      <QuickChoiceGroup
                        label={copy.editor.properties.padding}
                        choices={[
                          { label: copy.editor.presets.tightPadding, value: "12px" },
                          { label: copy.editor.presets.normalPadding, value: "24px" },
                          { label: copy.editor.presets.widePadding, value: "40px" }
                        ]}
                        currentValue={selectedNode.styles.padding?.[currentBreakpoint] ?? ""}
                        onPick={(value) => applyStyleValue("padding", value)}
                      />
                    </div>
                  </Card>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="bg-[var(--surface)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      {language === "ko" ? "스타일 미리보기" : "Style preview"}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">{currentBreakpoint}</span>
                  </div>
                  <div className="rounded-[22px] bg-[var(--surface-black)] p-3">
                    <StylePreviewSurface node={selectedNode} style={previewSurfaceStyle} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {styleSummary.map((summary) => (
                      <StyleBadge key={summary} label={summary} />
                    ))}
                  </div>
                </Card>

                {selectedNode.id !== screen.root.id ? (
                  <Card className="bg-[var(--surface)] p-4">
                    <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      {language === "ko" ? "요소 위치" : "Element placement"}
                    </div>
                    <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">
                      {placementMode === "free"
                        ? language === "ko"
                          ? "지금은 자유 배치입니다. 캔버스에서 바로 끌어 움직이거나 아래 좌표를 눌러 맞출 수 있습니다."
                          : "Free mode is active. Drag on the canvas or tap a coordinate below to line it up."
                        : language === "ko"
                          ? "흐름 배치는 주변 요소와 함께 자동 정렬됩니다. 자유 배치로 바꾸면 박스 안에서 직접 움직일 수 있습니다."
                          : "Flow mode keeps the item aligned with nearby elements. Switch to free mode to drag it inside the box."}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <SegmentButton
                        active={placementMode === "flow"}
                        label={language === "ko" ? "흐름 배치" : "Flow"}
                        onClick={() => setPlacementMode("flow")}
                      />
                      <SegmentButton
                        active={placementMode === "free"}
                        label={language === "ko" ? "자유 배치" : "Free"}
                        onClick={() => setPlacementMode("free")}
                      />
                    </div>

                    {placementMode === "free" ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <QuickChoiceGroup
                          label={language === "ko" ? "가로 위치" : "X position"}
                          choices={coordinateChoices.map((value) => ({ label: value, value }))}
                          currentValue={freePositionValues.left}
                          onPick={(value) => applyStyleValue("left", value)}
                        />
                        <QuickChoiceGroup
                          label={language === "ko" ? "세로 위치" : "Y position"}
                          choices={coordinateChoices.map((value) => ({ label: value, value }))}
                          currentValue={freePositionValues.top}
                          onPick={(value) => applyStyleValue("top", value)}
                        />
                        <QuickChoiceGroup
                          label={language === "ko" ? "앞뒤 순서" : "Layer order"}
                          choices={zIndexChoices.map((value) => ({ label: value, value }))}
                          currentValue={freePositionValues.zIndex}
                          onPick={(value) => applyStyleValue("zIndex", value)}
                        />
                      </div>
                    ) : null}
                  </Card>
                ) : null}

                <Card className="bg-[var(--surface)] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {language === "ko" ? "배경 모드" : "Background mode"}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <SegmentButton
                      active={backgroundMode === "none"}
                      label={language === "ko" ? "없음" : "None"}
                      onClick={() => setBackgroundMode("none")}
                    />
                    <SegmentButton
                      active={backgroundMode === "solid"}
                      label={language === "ko" ? "단색" : "Solid"}
                      onClick={() => setBackgroundMode("solid")}
                    />
                    <SegmentButton
                      active={backgroundMode === "gradient"}
                      label={language === "ko" ? "그라데이션" : "Gradient"}
                      onClick={() => setBackgroundMode("gradient")}
                    />
                  </div>

                  {backgroundMode === "solid" ? (
                    <div className="mt-4">
                      <Field label={language === "ko" ? "배경 색상" : "Background color"}>
                        <ColorField
                          value={resolvedBackgroundColor ?? "#1b1f26"}
                          helperText={language === "ko" ? "단색을 선택하면 그라데이션은 자동으로 꺼집니다." : "Switching to solid clears the gradient automatically."}
                          onChange={(value) => {
                            if (!value) {
                              setBackgroundMode("none");
                              return;
                            }
                            setSolidBackground(value);
                          }}
                        />
                      </Field>
                    </div>
                  ) : null}

                  {backgroundMode === "gradient" ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={language === "ko" ? "시작 색" : "Start color"}>
                          <ColorField
                            value={parsedGradient.start}
                            helperText={language === "ko" ? "그라데이션 시작 부분 색상" : "Gradient start color"}
                            onChange={(value) => value && setGradientBackground(value, parsedGradient.end)}
                          />
                        </Field>
                        <Field label={language === "ko" ? "끝 색" : "End color"}>
                          <ColorField
                            value={parsedGradient.end}
                            helperText={language === "ko" ? "그라데이션 끝 부분 색상" : "Gradient end color"}
                            onChange={(value) => value && setGradientBackground(parsedGradient.start, value)}
                          />
                        </Field>
                      </div>
                      <QuickChoiceGroup
                        label={language === "ko" ? "결 방향" : "Gradient direction"}
                        choices={gradientAngleOptions.map((value) => ({
                          label: value.replace("deg", "°"),
                          value
                        }))}
                        currentValue={parsedGradient.angle}
                        onPick={(value) => setGradientBackground(parsedGradient.start, parsedGradient.end, value)}
                      />
                      <div className="space-y-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {language === "ko" ? "빠른 그라데이션" : "Gradient presets"}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {gradientPresets.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setGradientBackground(preset.start, preset.end)}
                              className="rounded-[14px] border border-[rgba(70,72,75,0.15)] px-3 py-3 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--surface-highest)]"
                              style={{ backgroundImage: buildLinearGradient(parsedGradient.angle, preset.start, preset.end) }}
                            >
                              {preset.id}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Card>

                <Card className="bg-[var(--surface)] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {language === "ko" ? "모서리와 테두리" : "Corners and border"}
                  </div>
                  <QuickChoiceGroup
                    label={language === "ko" ? "전체 모서리" : "All corners"}
                    choices={radiusChoices.map((value) => ({ label: value, value }))}
                    currentValue={uniformRadius}
                    onPick={setUniformRadius}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <CornerField
                      label={language === "ko" ? "왼쪽 위" : "Top left"}
                      value={cornerRadiusValues.borderTopLeftRadius}
                      onChange={(value) => setCornerRadius("borderTopLeftRadius", value)}
                    />
                    <CornerField
                      label={language === "ko" ? "오른쪽 위" : "Top right"}
                      value={cornerRadiusValues.borderTopRightRadius}
                      onChange={(value) => setCornerRadius("borderTopRightRadius", value)}
                    />
                    <CornerField
                      label={language === "ko" ? "왼쪽 아래" : "Bottom left"}
                      value={cornerRadiusValues.borderBottomLeftRadius}
                      onChange={(value) => setCornerRadius("borderBottomLeftRadius", value)}
                    />
                    <CornerField
                      label={language === "ko" ? "오른쪽 아래" : "Bottom right"}
                      value={cornerRadiusValues.borderBottomRightRadius}
                      onChange={(value) => setCornerRadius("borderBottomRightRadius", value)}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label={copy.editor.properties.borderStyle}>
                      <Select
                        value={selectedNode.styles.borderStyle?.[currentBreakpoint] ?? "solid"}
                        onChange={(event) => applyStyleValue("borderStyle", event.target.value)}
                      >
                        <option value="solid">{copy.editor.options.borderStyle.solid}</option>
                        <option value="dashed">{copy.editor.options.borderStyle.dashed}</option>
                        <option value="none">{copy.editor.options.borderStyle.none}</option>
                      </Select>
                    </Field>
                    <QuickChoiceGroup
                      label={copy.editor.properties.borderWidth}
                      choices={["0px", "1px", "2px", "4px"].map((value) => ({ label: value, value }))}
                      currentValue={selectedNode.styles.borderWidth?.[currentBreakpoint] ?? ""}
                      onPick={(value) => applyStyleValue("borderWidth", value)}
                    />
                  </div>
                  <div className="mt-4">
                    <Field label={copy.editor.properties.borderColor}>
                      <ColorField
                        value={resolveStyleValue(selectedNode.styles, "borderColor", currentBreakpoint) ?? "#46484b"}
                        helperText={language === "ko" ? "테두리 색상" : "Border color"}
                        onChange={(value) => value && applyStyleValue("borderColor", value)}
                      />
                    </Field>
                  </div>
                </Card>

                <Card className="bg-[var(--surface)] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    {language === "ko" ? "간격과 배치" : "Spacing and layout"}
                  </div>
                  {canContainChildren(selectedNode.type) ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <PresetButton label={copy.editor.presets.stack} onClick={() => applyLayoutPreset("stack")} />
                        <PresetButton label={copy.editor.presets.row} onClick={() => applyLayoutPreset("row")} />
                        <PresetButton label={copy.editor.presets.twoColumn} onClick={() => applyLayoutPreset("twoColumn")} />
                        <PresetButton label={copy.editor.presets.threeColumn} onClick={() => applyLayoutPreset("threeColumn")} />
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <QuickChoiceGroup
                          label={copy.editor.properties.gap}
                          choices={(spacingChoices.gap as readonly string[]).map((value) => ({ label: value, value }))}
                          currentValue={selectedNode.styles.gap?.[currentBreakpoint] ?? ""}
                          onPick={(value) => applyStyleValue("gap", value)}
                        />
                        <QuickChoiceGroup
                          label={copy.editor.properties.padding}
                          choices={(spacingChoices.padding as readonly string[]).map((value) => ({ label: value, value }))}
                          currentValue={selectedNode.styles.padding?.[currentBreakpoint] ?? ""}
                          onPick={(value) => applyStyleValue("padding", value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <QuickChoiceGroup
                        label={copy.editor.properties.width}
                        choices={(spacingChoices.width as readonly string[]).map((value) => ({ label: value, value }))}
                        currentValue={selectedNode.styles.width?.[currentBreakpoint] ?? ""}
                        onPick={(value) => applyStyleValue("width", value)}
                      />
                      <QuickChoiceGroup
                        label={copy.editor.properties.height}
                        choices={(spacingChoices.height as readonly string[]).map((value) => ({ label: value, value }))}
                        currentValue={selectedNode.styles.height?.[currentBreakpoint] ?? ""}
                        onPick={(value) => applyStyleValue("height", value)}
                      />
                    </div>
                  )}
                </Card>

                {["text", "button", "input"].includes(selectedNode.type) ? (
                  <Card className="bg-[var(--surface)] p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      {language === "ko" ? "글자 빠른 설정" : "Text quick controls"}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <QuickChoiceGroup
                        label={copy.editor.properties.fontSize}
                        choices={["14px", "16px", "20px", "28px"].map((value) => ({ label: value, value }))}
                        currentValue={selectedNode.styles.fontSize?.[currentBreakpoint] ?? ""}
                        onPick={(value) => applyStyleValue("fontSize", value)}
                      />
                      <QuickChoiceGroup
                        label={copy.editor.properties.textAlign}
                        choices={["left", "center", "right"].map((value) => ({
                          label: copy.editor.options.textAlign[value as keyof typeof copy.editor.options.textAlign],
                          value
                        }))}
                        currentValue={selectedNode.styles.textAlign?.[currentBreakpoint] ?? ""}
                        onPick={(value) => applyStyleValue("textAlign", value)}
                      />
                    </div>
                    <div className="mt-4">
                      <Field label={copy.editor.properties.color}>
                        <ColorField
                          value={resolveStyleValue(selectedNode.styles, "color", currentBreakpoint) ?? "#f5f8ff"}
                          helperText={language === "ko" ? "글자 색상을 바로 확인하면서 바꿉니다." : "Adjust text color with an immediate preview."}
                          onChange={(value) => value && applyStyleValue("color", value)}
                        />
                      </Field>
                    </div>
                  </Card>
                ) : null}

                <InspectorSection
                  title={language === "ko" ? "세부 수치 직접 수정" : "Detailed controls"}
                  badge={currentBreakpoint}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    {localizedStyleGroups.map((group) => (
                      <div key={group.label} className="space-y-3 rounded-[16px] border border-[rgba(70,72,75,0.15)] bg-[rgba(0,0,0,0.12)] p-3">
                        <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{group.label}</div>
                        {group.properties.map((property) => {
                          const currentValue = selectedNode.styles[property.key]?.[currentBreakpoint] ?? "";
                          const fallbackValue = resolveStyleValue(selectedNode.styles, property.key, currentBreakpoint);
                          const optionLabels =
                            property.key === "position"
                              ? copy.editor.options.position
                              : property.key === "display"
                              ? copy.editor.options.display
                              : property.key === "direction"
                                ? copy.editor.options.direction
                                : property.key === "align"
                                  ? copy.editor.options.align
                                  : property.key === "justify"
                                    ? copy.editor.options.justify
                                    : property.key === "gridColumns"
                                      ? copy.editor.options.gridColumns
                                      : property.key === "borderStyle"
                                        ? copy.editor.options.borderStyle
                                        : property.key === "textAlign"
                                          ? copy.editor.options.textAlign
                                          : null;

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
                                  <option value="inherit">{copy.editor.inherit}</option>
                                  {property.options?.map((option) => (
                                    <option key={option} value={option}>
                                      {optionLabels?.[option as keyof typeof optionLabels] ?? option}
                                    </option>
                                  ))}
                                </Select>
                              ) : property.type === "color" ? (
                                <ColorField
                                  value={currentValue}
                                  helperText={
                                    currentValue
                                      ? language === "ko"
                                        ? "현재 요소에 직접 지정된 값"
                                        : "Explicitly set on this element"
                                      : language === "ko"
                                        ? `상위값 사용 중${fallbackValue ? `: ${fallbackValue}` : ""}`
                                        : `Using inherited value${fallbackValue ? `: ${fallbackValue}` : ""}`
                                  }
                                  onChange={(value) => {
                                    if (!value) {
                                      clearNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint);
                                      return;
                                    }
                                    if (property.key === "backgroundColor") {
                                      setSolidBackground(value);
                                      return;
                                    }
                                    updateNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint, value);
                                  }}
                                />
                              ) : (
                                <Input
                                  placeholder={currentValue ? undefined : fallbackValue || copy.editor.inherit}
                                  value={currentValue}
                                  onChange={(event) => {
                                    if (!event.target.value) {
                                      clearNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint);
                                      return;
                                    }
                                    if (property.key === "backgroundGradient") {
                                      const parsed = parseLinearGradient(event.target.value);
                                      applyStyleValue("backgroundColor", parsed.start);
                                    }
                                    updateNodeStyle(project.id, screen.id, selectedNode.id, property.key, currentBreakpoint, event.target.value);
                                  }}
                                />
                              )}
                            </Field>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </InspectorSection>
              </div>
            )
          ) : (
            <div className="rounded-[18px] border border-dashed border-[rgba(70,72,75,0.15)] px-5 py-10 text-center text-sm text-[var(--text-secondary)]">
              {copy.editor.noSelection}
            </div>
          )}
        </div>
      </section>

      {isDesignKitDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.64)] p-4">
          <Card className="surface-panel flex max-h-[88vh] w-full max-w-[1120px] flex-col overflow-hidden bg-[rgba(17,20,23,0.98)] p-0">
            <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  {language === "ko" ? "프로젝트 디자인 세팅" : "Project design setup"}
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
                  {language === "ko" ? "색, 글자, 버튼 톤을 프로젝트 전체에 다시 적용합니다." : "Reapply color, type, and button tone across the project."}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {language === "ko"
                    ? "레이아웃은 그대로 두고 시각 톤만 갈아엎습니다. 모든 화면의 루트, 카드, 버튼, 입력창, 글자 계열에 한 번에 반영됩니다."
                    : "Keep the layout structure, but refresh the visual tone across roots, cards, buttons, inputs, and text in every screen."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDesignKitDialogOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                aria-label={language === "ko" ? "닫기" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="scrollbar-thin overflow-y-auto border-t border-[rgba(70,72,75,0.15)] px-6 py-6">
              <DesignKitGallery
                kits={designKits}
                selectedId={selectedDesignKitId}
                onSelect={setSelectedDesignKitId}
                language={language}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(70,72,75,0.15)] px-6 py-4">
              <div className="text-sm text-[var(--text-secondary)]">
                {language === "ko" ? "선택한 세팅" : "Selected setup"}: {designKits.find((kit) => kit.id === selectedDesignKitId)?.name}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsDesignKitDialogOpen(false)}>
                  {language === "ko" ? "취소" : "Cancel"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    applyProjectDesignKit(project.id, selectedDesignKitId);
                    setIsDesignKitDialogOpen(false);
                  }}
                >
                  <Palette className="h-4 w-4" />
                  {language === "ko" ? "이 세팅 적용" : "Apply this setup"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </main>
  );
}

function ViewModeButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition",
        active ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function InspectorTabButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      className={cn(
        "rounded-[12px] border px-3 py-2 text-sm font-semibold transition",
        active
          ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] text-[var(--text-primary)]"
          : "border-[rgba(70,72,75,0.15)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function InspectorSection({
  title,
  badge,
  defaultOpen = false,
  children
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details open={isOpen} className="rounded-[18px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)]">
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((value) => !value);
        }}
      >
        <span className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{title}</span>
        {badge ? <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">{badge}</span> : null}
      </summary>
      {isOpen ? <div className="border-t border-[rgba(70,72,75,0.15)] px-4 py-4">{children}</div> : null}
    </details>
  );
}

function StyleBadge({ label }: { label: string }): React.ReactElement {
  return (
    <span className="rounded-full border border-[rgba(70,72,75,0.15)] bg-[rgba(0,0,0,0.16)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
      {label}
    </span>
  );
}

function SegmentButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[12px] border px-3 py-2 text-sm font-semibold transition",
        active
          ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] text-[var(--text-primary)]"
          : "border-[rgba(70,72,75,0.15)] bg-[var(--surface-black)] text-[var(--text-secondary)] hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
      )}
    >
      {label}
    </button>
  );
}

function CornerField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <label className="space-y-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function StylePreviewSurface({
  node,
  style
}: {
  node: UiverseNode;
  style: CSSProperties | undefined;
}): React.ReactElement | null {
  if (!style) {
    return null;
  }

  if (node.type === "text") {
    return (
      <p className="m-0 whitespace-pre-wrap text-sm font-semibold" style={style}>
        {node.content?.text ?? node.name}
      </p>
    );
  }

  if (node.type === "button") {
    return (
      <button type="button" className="cursor-default text-sm font-semibold" style={style}>
        {node.content?.label ?? node.name}
      </button>
    );
  }

  if (node.type === "input") {
    return <input disabled className="text-sm outline-none" placeholder={node.content?.placeholder ?? node.name} style={style} />;
  }

  if (node.type === "image") {
    return <img className="block" src={node.content?.src ?? DEFAULT_IMAGE_PLACEHOLDER} alt={node.content?.alt ?? node.name} style={style} />;
  }

  return (
    <div style={style}>
      <span className="text-sm font-semibold">{node.name}</span>
    </div>
  );
}

function LayerTreeRow({
  entry,
  selected,
  dragNodeId,
  rootId,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete
}: {
  entry: FlatNode;
  selected: boolean;
  dragNodeId: string | null;
  rootId: string;
  onSelect: (nodeId: string) => void;
  onDragStart: (nodeId: string | null) => void;
  onDragEnd: () => void;
  onDrop: (targetParentId: string, targetIndex?: number) => void;
  onDelete: (nodeId: string) => void;
}): React.ReactElement {
  const canDelete = entry.node.id !== rootId;
  const canNest = canContainChildren(entry.node.type);
  const activeDropInside = Boolean(dragNodeId && dragNodeId !== entry.node.id && canNest);

  return (
    <div className="relative">
      {entry.parentId ? (
        <LayerDropZone active={Boolean(dragNodeId)} depth={entry.depth} onDrop={() => onDrop(entry.parentId!, entry.index)} />
      ) : null}
      <div
        onDragOver={(event) => {
          if (!activeDropInside) {
            return;
          }

          event.preventDefault();
        }}
        onDrop={(event) => {
          if (!activeDropInside) {
            return;
          }

          event.preventDefault();
          onDrop(entry.node.id, entry.node.children.length);
        }}
        className={cn(
          "flex items-center gap-2 rounded-[14px] border transition",
          selected
            ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] text-[var(--text-primary)]"
            : "border-[rgba(70,72,75,0.15)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]",
          activeDropInside ? "ring-1 ring-[rgba(155,168,255,0.35)]" : ""
        )}
      >
        <div
          role="button"
          tabIndex={0}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2"
          style={{ paddingLeft: `${entry.depth * 14 + 10}px` }}
          onClick={() => onSelect(entry.node.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(entry.node.id);
            }
          }}
        >
          <button
            type="button"
            draggable={canDelete}
            onDragStart={(event) => {
              event.stopPropagation();
              event.dataTransfer.setData("text/plain", entry.node.id);
              event.dataTransfer.effectAllowed = "move";
              onDragStart(entry.node.id);
            }}
            onDragEnd={(event) => {
              event.stopPropagation();
              onDragEnd();
            }}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition",
              canDelete ? "cursor-grab hover:bg-[var(--surface-highest)]" : "cursor-default opacity-50"
            )}
            aria-label="Drag layer"
          >
            <GripVertical className="h-4 w-4 shrink-0" />
          </button>
          <Layers3 className="h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{labelForNode(entry.node)}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{entry.node.type}</div>
          </div>
        </div>
        {canDelete ? (
          <button
            type="button"
            className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[rgba(215,51,87,0.16)] hover:text-[var(--color-danger)]"
            onClick={() => onDelete(entry.node.id)}
            aria-label="Delete layer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {entry.parentId ? (
        <LayerDropZone active={Boolean(dragNodeId)} depth={entry.depth} onDrop={() => onDrop(entry.parentId!, entry.index + 1)} />
      ) : null}
    </div>
  );
}

function LayerDropZone({
  active,
  depth,
  onDrop
}: {
  active: boolean;
  depth: number;
  onDrop: () => void;
}): React.ReactElement {
  return (
    <div
      className={cn("my-1.5 h-2 rounded-full transition", active ? "bg-[rgba(155,168,255,0.28)]" : "bg-transparent")}
      style={{ marginLeft: `${depth * 14 + 16}px` }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    />
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

function SuggestionRow({
  label,
  items,
  onPick
}: {
  label: string;
  items: string[];
  onPick: (value: string) => void;
}): React.ReactElement {
  return (
    <div className="mt-2 space-y-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className="rounded-full border border-[rgba(70,72,75,0.15)] bg-[var(--surface-black)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickChoiceGroup({
  label,
  choices,
  currentValue,
  onPick
}: {
  label: string;
  choices: Array<{ label: string; value: string }>;
  currentValue: string;
  onPick: (value: string) => void;
}): React.ReactElement {
  return (
    <div className="mt-2 space-y-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</div>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            key={`${choice.label}-${choice.value}`}
            type="button"
            onClick={() => onPick(choice.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              currentValue === choice.value
                ? "border-[rgba(155,168,255,0.45)] bg-[rgba(155,168,255,0.08)] text-[var(--text-primary)]"
                : "border-[rgba(70,72,75,0.15)] bg-[var(--surface-black)] text-[var(--text-secondary)] hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
            )}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[14px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface-black)] px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
    >
      {label}
    </button>
  );
}

function CanvasNode({
  node,
  breakpoint,
  selectedNodeId,
  onSelect,
  dragNodeId,
  dragPreviewPosition,
  onDragStart,
  onDragEnd,
  onFreeDragStart,
  onMove,
  parentId = null,
  index = 0
}: {
  node: UiverseNode;
  breakpoint: Breakpoint;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  dragNodeId: string | null;
  dragPreviewPosition: { nodeId: string; left: number; top: number } | null;
  onDragStart: (nodeId: string | null) => void;
  onDragEnd: () => void;
  onFreeDragStart: (
    nodeId: string,
    target: HTMLDivElement,
    event: ReactPointerEvent<HTMLDivElement>
  ) => void;
  onMove: (nodeId: string, targetParentId: string, targetIndex?: number) => void;
  parentId?: string | null;
  index?: number;
}): React.ReactElement {
  const isSelected = selectedNodeId === node.id;
  const canAcceptChildren = canContainChildren(node.type);
  const isFreePositioned = resolveStyleValue(node.styles, "position", breakpoint) === "absolute";
  const surfaceStyle = stylesToCanvasStyle(stylesWithAbsoluteParentGuard(node, breakpoint), breakpoint);
  const isLeafNode = ["text", "button", "input", "image"].includes(node.type);
  const resolvedSurfaceStyle: CSSProperties = {
    ...surfaceStyle,
    minHeight: node.type === "root" ? "640px" : surfaceStyle.minHeight
  };
  const { shellStyle, contentStyle } = splitCanvasNodeStyle(resolvedSurfaceStyle, {
    isLeafNode,
    isFreePositioned
  });
  if (isFreePositioned && dragPreviewPosition?.nodeId === node.id) {
    shellStyle.left = formatPixelValue(dragPreviewPosition.left);
    shellStyle.top = formatPixelValue(dragPreviewPosition.top);
    shellStyle.right = undefined;
    shellStyle.bottom = undefined;
  }
  const leafContentStyle: CSSProperties = isLeafNode
    ? {
        ...contentStyle,
        width: shellStyle.width ? "100%" : undefined,
        height: shellStyle.height ? "100%" : undefined
      }
    : {};

  function dropAt(targetParentId: string, targetIndex?: number): void {
    if (!dragNodeId || dragNodeId === node.id) {
      return;
    }
    onMove(dragNodeId, targetParentId, targetIndex);
    onDragStart(null);
  }

  const shell = (
    <div
      draggable={node.type !== "root" && !isFreePositioned}
      onPointerDown={(event) => {
        if (!isFreePositioned || node.type === "root") {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        onSelect(node.id);
        onFreeDragStart(node.id, event.currentTarget, event);
      }}
      onDragStart={(event) => {
        if (isFreePositioned) {
          event.preventDefault();
          return;
        }
        event.stopPropagation();
        event.dataTransfer.setData("text/plain", node.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(node.id);
      }}
      onDragEnd={(event) => {
        event.stopPropagation();
        onDragEnd();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      className={cn(
        "relative rounded-[18px] transition",
        node.type === "root"
          ? "min-h-[640px]"
          : isFreePositioned
            ? dragPreviewPosition?.nodeId === node.id
              ? "cursor-grabbing select-none"
              : "cursor-grab select-none"
            : "cursor-pointer",
        isSelected ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--surface-black)]" : "ring-1 ring-transparent"
      )}
      style={shellStyle}
    >
      <div
        className={cn(
          "relative",
          node.type !== "root" && !isLeafNode ? "overflow-hidden" : "",
          node.type === "text" ? "block" : node.type === "button" || node.type === "input" ? "inline-block max-w-full" : ""
        )}
        style={isLeafNode ? undefined : contentStyle}
      >
        {node.type === "text" ? (
          <p className="m-0 pointer-events-none whitespace-pre-wrap" style={leafContentStyle}>
            {node.content?.text ?? node.name}
          </p>
        ) : null}
        {node.type === "button" ? (
          <button className="pointer-events-none text-inherit" draggable={false} type="button" style={leafContentStyle}>
            {node.content?.label ?? node.name}
          </button>
        ) : null}
        {node.type === "input" ? (
          <input
            className="pointer-events-none text-inherit outline-none"
            draggable={false}
            disabled
            placeholder={node.content?.placeholder ?? node.name}
            style={leafContentStyle}
          />
        ) : null}
        {node.type === "image" ? (
          <img
            className="pointer-events-none block"
            draggable={false}
            src={node.content?.src ?? DEFAULT_IMAGE_PLACEHOLDER}
            alt={node.content?.alt ?? node.name}
            style={leafContentStyle}
          />
        ) : null}
        {!isLeafNode ? (
          <>
            {node.children.map((child, childIndex) => (
              <CanvasNode
                key={child.id}
                node={child}
                breakpoint={breakpoint}
                selectedNodeId={selectedNodeId}
                onSelect={onSelect}
                dragNodeId={dragNodeId}
                dragPreviewPosition={dragPreviewPosition}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onFreeDragStart={onFreeDragStart}
                onMove={onMove}
                parentId={node.id}
                index={childIndex}
              />
            ))}
            {canAcceptChildren && dragNodeId && !isFreePositioned ? (
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  dropAt(node.id, node.children.length);
                }}
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
    </div>
  );

  if (isFreePositioned) {
    return shell;
  }

  return (
    <div className="relative">
      {parentId ? <DropZone active={Boolean(dragNodeId)} onDrop={() => dropAt(parentId, index)} /> : null}
      {shell}
      {parentId ? <DropZone active={Boolean(dragNodeId)} onDrop={() => dropAt(parentId, index + 1)} /> : null}
    </div>
  );
}

function DropZone({ active, onDrop }: { active: boolean; onDrop: () => void }): React.ReactElement {
  return (
    <div
      className={cn("my-2 h-2 rounded-full transition", active ? "bg-[rgba(155,168,255,0.28)]" : "bg-transparent")}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    />
  );
}
