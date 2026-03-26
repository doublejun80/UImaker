import { type Language, type NodeStyles, type StoredProject, type StyleProp, type UiverseNode } from "@uiverse/schema";

type LocalizedText = Record<Language, string>;
type ButtonTreatment = "gradient-pill" | "solid-block" | "soft-outline" | "quiet-outline";

interface DesignKitDefinition {
  id: string;
  name: LocalizedText;
  summary: LocalizedText;
  bestFor: LocalizedText;
  colors: {
    canvas: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    accent: string;
    accentSoft: string;
    accentText: string;
    text: string;
    muted: string;
    heroGradient: string;
  };
  typography: {
    displaySize: string;
    bodySize: string;
    labelSize: string;
    lineHeight: string;
    letterSpacing: string;
  };
  radii: {
    panel: string;
    button: string;
    input: string;
    image: string;
  };
  buttonTreatment: ButtonTreatment;
}

export interface DesignKitSummary {
  id: string;
  name: string;
  summary: string;
  bestFor: string;
  colors: DesignKitDefinition["colors"];
  typography: DesignKitDefinition["typography"];
  radii: DesignKitDefinition["radii"];
  buttonTreatment: ButtonTreatment;
}

const DESIGN_KITS: DesignKitDefinition[] = [
  {
    id: "signal-slate",
    name: { ko: "시그널 슬레이트", en: "Signal Slate" },
    summary: {
      ko: "짙은 바탕에 차가운 블루 포인트를 올린 제품형 보드",
      en: "A product-first board with deep neutrals and cool blue accents."
    },
    bestFor: { ko: "SaaS, 대시보드, 기능 소개", en: "SaaS, dashboards, product pages" },
    colors: {
      canvas: "#090d12",
      surface: "#121922",
      surfaceAlt: "#1a2430",
      border: "rgba(132, 173, 255, 0.18)",
      accent: "#8ec5ff",
      accentSoft: "#5f7cff",
      accentText: "#071523",
      text: "#f6f9ff",
      muted: "#b3c2d8",
      heroGradient: "linear-gradient(135deg, #121c29 0%, #0b1018 56%, #163452 100%)"
    },
    typography: {
      displaySize: "56px",
      bodySize: "17px",
      labelSize: "12px",
      lineHeight: "1.7",
      letterSpacing: "0.16em"
    },
    radii: { panel: "24px", button: "999px", input: "16px", image: "24px" },
    buttonTreatment: "gradient-pill"
  },
  {
    id: "canvas-cream",
    name: { ko: "캔버스 크림", en: "Canvas Cream" },
    summary: {
      ko: "밝은 포인트와 따뜻한 표면을 섞은 브랜드 스토리형 보드",
      en: "A warm story-driven board with soft surfaces and lively highlights."
    },
    bestFor: { ko: "브랜드 소개, 이벤트, 포트폴리오", en: "Brand pages, events, portfolios" },
    colors: {
      canvas: "#120f0c",
      surface: "#1d1713",
      surfaceAlt: "#281f19",
      border: "rgba(255, 197, 138, 0.18)",
      accent: "#ffbf7b",
      accentSoft: "#ff7c63",
      accentText: "#261307",
      text: "#fff7f0",
      muted: "#dbc2b1",
      heroGradient: "linear-gradient(135deg, #261813 0%, #17110e 54%, #46291e 100%)"
    },
    typography: {
      displaySize: "54px",
      bodySize: "18px",
      labelSize: "12px",
      lineHeight: "1.72",
      letterSpacing: "0.14em"
    },
    radii: { panel: "28px", button: "16px", input: "16px", image: "28px" },
    buttonTreatment: "solid-block"
  },
  {
    id: "mint-console",
    name: { ko: "민트 콘솔", en: "Mint Console" },
    summary: {
      ko: "짙은 콘솔 톤 위에 민트와 시안 포인트를 얹은 데이터형 보드",
      en: "A darker data board with mint and cyan accents for high contrast."
    },
    bestFor: { ko: "운영판, 내부툴, 분석 화면", en: "Operations, internal tools, analytics" },
    colors: {
      canvas: "#07100f",
      surface: "#101b19",
      surfaceAlt: "#152522",
      border: "rgba(122, 255, 216, 0.18)",
      accent: "#7af8d6",
      accentSoft: "#35cfc3",
      accentText: "#06221d",
      text: "#f2fffb",
      muted: "#b1d4c9",
      heroGradient: "linear-gradient(135deg, #11211f 0%, #0a1413 54%, #0f3a39 100%)"
    },
    typography: {
      displaySize: "52px",
      bodySize: "16px",
      labelSize: "12px",
      lineHeight: "1.66",
      letterSpacing: "0.18em"
    },
    radii: { panel: "20px", button: "999px", input: "14px", image: "20px" },
    buttonTreatment: "soft-outline"
  },
  {
    id: "mono-editorial",
    name: { ko: "모노 에디토리얼", en: "Mono Editorial" },
    summary: {
      ko: "흑백 기반에 한 가지 포인트만 주는 문서형 보드",
      en: "An editorial board that stays mostly monochrome with a single accent."
    },
    bestFor: { ko: "도움말 센터, 문서, 블로그", en: "Help centers, docs, editorial pages" },
    colors: {
      canvas: "#0a0a0c",
      surface: "#151518",
      surfaceAlt: "#1d1d21",
      border: "rgba(255, 255, 255, 0.12)",
      accent: "#f4da8c",
      accentSoft: "#f0b65c",
      accentText: "#251a08",
      text: "#f7f7f5",
      muted: "#b9b9bc",
      heroGradient: "linear-gradient(135deg, #18181b 0%, #111114 60%, #2a2416 100%)"
    },
    typography: {
      displaySize: "50px",
      bodySize: "17px",
      labelSize: "11px",
      lineHeight: "1.75",
      letterSpacing: "0.2em"
    },
    radii: { panel: "18px", button: "999px", input: "14px", image: "18px" },
    buttonTreatment: "quiet-outline"
  }
];

export const DEFAULT_DESIGN_KIT_ID = DESIGN_KITS[0]!.id;

function t(value: LocalizedText, language: Language): string {
  return value[language];
}

function resolveStyleValue(styles: NodeStyles, property: StyleProp): string | undefined {
  return styles[property]?.base ?? styles[property]?.md ?? styles[property]?.lg;
}

function parseNumeric(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const matched = value.match(/-?\d+(?:\.\d+)?/);
  return matched ? Number(matched[0]) : 0;
}

function setBaseStyle(styles: NodeStyles, property: StyleProp, value: string): NodeStyles {
  return {
    ...styles,
    [property]: {
      ...(styles[property] ?? {}),
      base: value
    }
  } as NodeStyles;
}

function clearStyle(styles: NodeStyles, property: StyleProp): NodeStyles {
  const next = { ...styles } as Partial<NodeStyles>;
  delete next[property];
  return next as NodeStyles;
}

function looksSecondaryButton(node: UiverseNode): boolean {
  const label = `${node.name} ${node.content?.label ?? ""}`.toLowerCase();
  return /secondary|view|filter|learn|details|보기|필터|자세히|구조/.test(label);
}

function looksHeroSection(node: UiverseNode): boolean {
  return /hero|헤로|히어로/.test(node.name.toLowerCase());
}

function applyTextStyles(node: UiverseNode, kit: DesignKitDefinition): NodeStyles {
  let styles = { ...node.styles };
  const fontSize = parseNumeric(resolveStyleValue(node.styles, "fontSize"));
  const fontWeight = parseNumeric(resolveStyleValue(node.styles, "fontWeight"));
  const hasTracking = Boolean(resolveStyleValue(node.styles, "letterSpacing"));

  if (hasTracking || fontSize <= 13) {
    styles = setBaseStyle(styles, "color", kit.colors.accent);
    styles = setBaseStyle(styles, "fontWeight", "700");
    styles = setBaseStyle(styles, "fontSize", kit.typography.labelSize);
    styles = setBaseStyle(styles, "letterSpacing", kit.typography.letterSpacing);
    return styles;
  }

  if (fontSize >= 28 || fontWeight >= 700) {
    styles = setBaseStyle(styles, "color", kit.colors.text);
    styles = setBaseStyle(styles, "fontWeight", String(Math.max(fontWeight || 700, 700)));
    return styles;
  }

  styles = setBaseStyle(styles, "color", kit.colors.muted);
  if (fontSize <= 18 || fontSize === 0) {
    styles = setBaseStyle(styles, "fontSize", kit.typography.bodySize);
  }
  styles = setBaseStyle(styles, "lineHeight", kit.typography.lineHeight);
  return styles;
}

function applyButtonStyles(node: UiverseNode, kit: DesignKitDefinition): NodeStyles {
  let styles = { ...node.styles };
  const isSecondary = looksSecondaryButton(node);
  styles = setBaseStyle(styles, "fontWeight", "700");
  styles = setBaseStyle(styles, "borderRadius", kit.radii.button);
  styles = clearStyle(styles, "borderTopLeftRadius");
  styles = clearStyle(styles, "borderTopRightRadius");
  styles = clearStyle(styles, "borderBottomRightRadius");
  styles = clearStyle(styles, "borderBottomLeftRadius");

  if (isSecondary) {
    styles = clearStyle(styles, "backgroundGradient");
    styles = setBaseStyle(styles, "backgroundColor", kit.colors.surfaceAlt);
    styles = setBaseStyle(styles, "color", kit.colors.text);
    styles = setBaseStyle(styles, "borderWidth", "1px");
    styles = setBaseStyle(styles, "borderStyle", "solid");
    styles = setBaseStyle(styles, "borderColor", kit.colors.border);
    styles = clearStyle(styles, "boxShadow");
    return styles;
  }

  switch (kit.buttonTreatment) {
    case "solid-block":
      styles = clearStyle(styles, "backgroundGradient");
      styles = setBaseStyle(styles, "backgroundColor", kit.colors.accent);
      styles = setBaseStyle(styles, "color", kit.colors.accentText);
      styles = clearStyle(styles, "borderWidth");
      styles = clearStyle(styles, "borderStyle");
      styles = clearStyle(styles, "borderColor");
      styles = setBaseStyle(styles, "boxShadow", `0px 18px 42px ${kit.colors.accent}33`);
      return styles;
    case "soft-outline":
      styles = clearStyle(styles, "backgroundGradient");
      styles = setBaseStyle(styles, "backgroundColor", kit.colors.surfaceAlt);
      styles = setBaseStyle(styles, "color", kit.colors.accent);
      styles = setBaseStyle(styles, "borderWidth", "1px");
      styles = setBaseStyle(styles, "borderStyle", "solid");
      styles = setBaseStyle(styles, "borderColor", kit.colors.accent);
      styles = clearStyle(styles, "boxShadow");
      return styles;
    case "quiet-outline":
      styles = clearStyle(styles, "backgroundGradient");
      styles = setBaseStyle(styles, "backgroundColor", "transparent");
      styles = setBaseStyle(styles, "color", kit.colors.text);
      styles = setBaseStyle(styles, "borderWidth", "1px");
      styles = setBaseStyle(styles, "borderStyle", "solid");
      styles = setBaseStyle(styles, "borderColor", kit.colors.border);
      styles = clearStyle(styles, "boxShadow");
      return styles;
    case "gradient-pill":
    default:
      styles = setBaseStyle(
        styles,
        "backgroundGradient",
        `linear-gradient(135deg, ${kit.colors.accent} 0%, ${kit.colors.accentSoft} 100%)`
      );
      styles = setBaseStyle(styles, "backgroundColor", kit.colors.accent);
      styles = setBaseStyle(styles, "color", kit.colors.accentText);
      styles = clearStyle(styles, "borderWidth");
      styles = clearStyle(styles, "borderStyle");
      styles = clearStyle(styles, "borderColor");
      styles = setBaseStyle(styles, "boxShadow", `0px 18px 42px ${kit.colors.accent}33`);
      return styles;
  }
}

function applyInputStyles(node: UiverseNode, kit: DesignKitDefinition): NodeStyles {
  let styles = { ...node.styles };
  styles = setBaseStyle(styles, "backgroundColor", kit.colors.surfaceAlt);
  styles = setBaseStyle(styles, "color", kit.colors.text);
  styles = setBaseStyle(styles, "borderWidth", "1px");
  styles = setBaseStyle(styles, "borderStyle", "solid");
  styles = setBaseStyle(styles, "borderColor", kit.colors.border);
  styles = setBaseStyle(styles, "borderRadius", kit.radii.input);
  styles = clearStyle(styles, "backgroundGradient");
  return styles;
}

function applyImageStyles(node: UiverseNode, kit: DesignKitDefinition): NodeStyles {
  let styles = { ...node.styles };
  styles = setBaseStyle(styles, "borderRadius", kit.radii.image);
  return styles;
}

function applyContainerStyles(node: UiverseNode, kit: DesignKitDefinition): NodeStyles {
  let styles = { ...node.styles };

  if (node.type === "root") {
    styles = setBaseStyle(styles, "backgroundColor", kit.colors.canvas);
    styles = clearStyle(styles, "backgroundGradient");
    return styles;
  }

  const visualSurface =
    node.type === "card" || Boolean(resolveStyleValue(node.styles, "backgroundColor")) || Boolean(resolveStyleValue(node.styles, "backgroundGradient"));

  if (looksHeroSection(node)) {
    styles = setBaseStyle(styles, "backgroundGradient", kit.colors.heroGradient);
    styles = setBaseStyle(styles, "backgroundColor", kit.colors.surface);
  } else if (visualSurface) {
    styles = setBaseStyle(
      styles,
      "backgroundColor",
      node.type === "card" || node.type === "container" ? kit.colors.surface : kit.colors.surfaceAlt
    );
    styles = clearStyle(styles, "backgroundGradient");
  }

  if (
    node.type === "card" ||
    node.type === "container" ||
    Boolean(resolveStyleValue(node.styles, "borderWidth")) ||
    Boolean(resolveStyleValue(node.styles, "borderColor"))
  ) {
    styles = setBaseStyle(styles, "borderWidth", resolveStyleValue(node.styles, "borderWidth") || "1px");
    styles = setBaseStyle(styles, "borderStyle", resolveStyleValue(node.styles, "borderStyle") || "solid");
    styles = setBaseStyle(styles, "borderColor", kit.colors.border);
  }

  if (
    node.type === "card" ||
    node.type === "container" ||
    node.type === "section" ||
    Boolean(resolveStyleValue(node.styles, "borderRadius"))
  ) {
    styles = setBaseStyle(styles, "borderRadius", kit.radii.panel);
    styles = clearStyle(styles, "borderTopLeftRadius");
    styles = clearStyle(styles, "borderTopRightRadius");
    styles = clearStyle(styles, "borderBottomRightRadius");
    styles = clearStyle(styles, "borderBottomLeftRadius");
  }

  return styles;
}

function applyNode(node: UiverseNode, kit: DesignKitDefinition): UiverseNode {
  let styles = node.styles;

  if (node.type === "text") {
    styles = applyTextStyles(node, kit);
  } else if (node.type === "button") {
    styles = applyButtonStyles(node, kit);
  } else if (node.type === "input") {
    styles = applyInputStyles(node, kit);
  } else if (node.type === "image") {
    styles = applyImageStyles(node, kit);
  } else {
    styles = applyContainerStyles(node, kit);
  }

  return {
    ...node,
    styles,
    children: node.children.map((child) => applyNode(child, kit))
  };
}

export function getDesignKitSummaries(language: Language): DesignKitSummary[] {
  return DESIGN_KITS.map((kit) => ({
    id: kit.id,
    name: t(kit.name, language),
    summary: t(kit.summary, language),
    bestFor: t(kit.bestFor, language),
    colors: kit.colors,
    typography: kit.typography,
    radii: kit.radii,
    buttonTreatment: kit.buttonTreatment
  }));
}

export function getDesignKitSummary(id: string | undefined, language: Language): DesignKitSummary | undefined {
  const kit = DESIGN_KITS.find((entry) => entry.id === id);
  if (!kit) {
    return undefined;
  }

  return {
    id: kit.id,
    name: t(kit.name, language),
    summary: t(kit.summary, language),
    bestFor: t(kit.bestFor, language),
    colors: kit.colors,
    typography: kit.typography,
    radii: kit.radii,
    buttonTreatment: kit.buttonTreatment
  };
}

export function applyDesignKitToProject(project: StoredProject, designKitId: string): StoredProject {
  const kit = DESIGN_KITS.find((entry) => entry.id === designKitId);
  if (!kit) {
    return project;
  }

  return {
    ...project,
    designKitId,
    screens: project.screens.map((screen) => ({
      ...screen,
      root: applyNode(screen.root, kit)
    }))
  };
}
