export const BUNDLE_VERSION = "1" as const;

export const BREAKPOINTS = ["base", "md", "lg"] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

export const EXPORT_TARGETS = ["react-tailwind", "html-css"] as const;
export type ExportTarget = (typeof EXPORT_TARGETS)[number];

export const NODE_TYPES = [
  "root",
  "section",
  "container",
  "stack",
  "text",
  "button",
  "input",
  "image",
  "card"
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export const STYLE_PROPS = [
  "display",
  "direction",
  "gap",
  "align",
  "justify",
  "width",
  "height",
  "padding",
  "margin",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "color",
  "backgroundColor",
  "backgroundGradient",
  "borderStyle",
  "borderWidth",
  "borderColor",
  "borderRadius",
  "opacity",
  "boxShadow"
] as const;
export type StyleProp = (typeof STYLE_PROPS)[number];

export type ResponsiveValue<T extends string = string> = Partial<Record<Breakpoint, T>>;

export interface NodeStyles {
  display?: ResponsiveValue<"block" | "flex" | "grid" | "none">;
  direction?: ResponsiveValue<"row" | "column">;
  gap?: ResponsiveValue;
  align?: ResponsiveValue<"start" | "center" | "end" | "stretch">;
  justify?: ResponsiveValue<"start" | "center" | "end" | "between" | "around">;
  width?: ResponsiveValue;
  height?: ResponsiveValue;
  padding?: ResponsiveValue;
  margin?: ResponsiveValue;
  fontSize?: ResponsiveValue;
  fontWeight?: ResponsiveValue;
  lineHeight?: ResponsiveValue;
  letterSpacing?: ResponsiveValue;
  textAlign?: ResponsiveValue<"left" | "center" | "right">;
  color?: ResponsiveValue;
  backgroundColor?: ResponsiveValue;
  backgroundGradient?: ResponsiveValue;
  borderStyle?: ResponsiveValue<"solid" | "dashed" | "none">;
  borderWidth?: ResponsiveValue;
  borderColor?: ResponsiveValue;
  borderRadius?: ResponsiveValue;
  opacity?: ResponsiveValue;
  boxShadow?: ResponsiveValue;
}

export interface NodeContent {
  text?: string;
  label?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
}

export interface UiverseNode {
  id: string;
  type: NodeType;
  name: string;
  content?: NodeContent;
  styles: NodeStyles;
  children: UiverseNode[];
}

export interface UiverseScreen {
  id: string;
  name: string;
  slug: string;
  root: UiverseNode;
  lastEditedAt: string;
}

export interface UiverseProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedScreenId: string;
}

export interface UiverseThemeConfig {
  mode: "dark";
  accent: string;
}

export interface UiverseSettings {
  profileName: string;
  profileEmail: string;
  defaultExportTarget: ExportTarget;
  theme: UiverseThemeConfig;
}

export interface UiverseBundle {
  version: typeof BUNDLE_VERSION;
  project: UiverseProject;
  screens: UiverseScreen[];
  settings: UiverseSettings;
  generatedAt: string;
}

export interface StoredProject extends UiverseProject {
  screens: UiverseScreen[];
}

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  value?: T;
}

export interface GeneratedFile {
  path: string;
  content: string;
  kind: "screen" | "style" | "manifest";
}

export interface GenerateOptions {
  screen?: string;
}

export interface GenerateResult {
  files: GeneratedFile[];
  manifest: {
    projectSlug: string;
    format: ExportTarget;
    generatedAt: string;
    screens: Array<{
      id: string;
      slug: string;
      files: string[];
    }>;
  };
}
