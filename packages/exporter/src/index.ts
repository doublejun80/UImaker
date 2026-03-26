import {
  BREAKPOINTS,
  assertValidBundle,
  resolveScreenIds,
  type Breakpoint,
  type GenerateOptions,
  type GenerateResult,
  type GeneratedFile,
  type NodeStyles,
  type StyleProp,
  type UiverseBundle,
  type UiverseNode,
  type UiverseScreen
} from "@uiverse/schema";

const BREAKPOINT_MIN_WIDTH: Record<Exclude<Breakpoint, "base">, number> = {
  md: 768,
  lg: 1024
};

const DEFAULT_IMAGE_SRC =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='460' viewBox='0 0 720 460' fill='none'%3E%3Crect width='720' height='460' rx='36' fill='%2310161d'/%3E%3Crect x='32' y='30' width='656' height='400' rx='28' fill='%2316202a' stroke='%238aa4ff' stroke-opacity='0.24' stroke-width='2'/%3E%3Crect x='62' y='62' width='596' height='22' rx='11' fill='%23223243'/%3E%3Ccircle cx='88' cy='73' r='6' fill='%238aa4ff'/%3E%3Ccircle cx='108' cy='73' r='6' fill='%238aa4ff' fill-opacity='0.6'/%3E%3Ccircle cx='128' cy='73' r='6' fill='%238aa4ff' fill-opacity='0.35'/%3E%3Crect x='62' y='114' width='318' height='236' rx='22' fill='%23223243'/%3E%3Crect x='90' y='144' width='158' height='18' rx='9' fill='%238aa4ff'/%3E%3Crect x='90' y='178' width='210' height='12' rx='6' fill='%23E8EEF9' fill-opacity='0.22'/%3E%3Crect x='410' y='114' width='248' height='96' rx='22' fill='%23223243'/%3E%3Crect x='410' y='228' width='248' height='122' rx='22' fill='%23223243'/%3E%3C/svg%3E";

function slugify(value: string, fallback = "item"): string {
  const slug = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function pascalCase(value: string, fallback = "Screen"): string {
  const parts = value
    .normalize("NFKC")
    .split(/[^\p{Letter}\p{Number}]+/gu)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return parts || fallback;
}

function escapeCssValue(value: string): string {
  return value.trim();
}

function escapeTailwindValue(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

function escapeJsxText(value: string): string {
  return value.replace(/[{}]/g, (match) => (match === "{" ? "&#123;" : "&#125;"));
}

function classForSpacing(prefix: string, value: string): string {
  const normalized = escapeTailwindValue(value);
  return `${prefix}-[${normalized}]`;
}

function fontWeightClass(value: string): string {
  const known: Record<string, string> = {
    "400": "font-normal",
    "500": "font-medium",
    "600": "font-semibold",
    "700": "font-bold",
    "800": "font-extrabold"
  };

  return known[value] ?? `font-[${escapeTailwindValue(value)}]`;
}

function resolveStyleValue(styles: NodeStyles, property: StyleProp, breakpoint: Breakpoint): string | undefined {
  const values = styles[property];
  if (!values) {
    return undefined;
  }

  if (breakpoint === "lg") {
    return values.lg ?? values.md ?? values.base;
  }

  if (breakpoint === "md") {
    return values.md ?? values.base;
  }

  return values.base;
}

function withAbsoluteParentGuard(node: UiverseNode): NodeStyles {
  const nextStyles: NodeStyles = { ...node.styles };
  let nextPosition = nextStyles.position ? { ...nextStyles.position } : undefined;

  BREAKPOINTS.forEach((breakpoint) => {
    const hasAbsoluteChild = node.children.some(
      (child) => resolveStyleValue(child.styles, "position", breakpoint) === "absolute"
    );
    if (!hasAbsoluteChild || resolveStyleValue(node.styles, "position", breakpoint)) {
      return;
    }

    nextPosition = { ...(nextPosition ?? {}), [breakpoint]: "relative" };
  });

  if (nextPosition) {
    nextStyles.position = nextPosition;
  }

  return nextStyles;
}

function mapStylePropToTailwind(property: StyleProp, value: string): string[] {
  const normalized = escapeTailwindValue(value);

  switch (property) {
    case "position":
      return [value];
    case "top":
      return [`top-[${normalized}]`];
    case "left":
      return [`left-[${normalized}]`];
    case "right":
      return [`right-[${normalized}]`];
    case "bottom":
      return [`bottom-[${normalized}]`];
    case "zIndex":
      return [`z-[${normalized}]`];
    case "display":
      return [value === "none" ? "hidden" : value];
    case "direction":
      return [value === "column" ? "flex-col" : "flex-row"];
    case "gap":
      return [classForSpacing("gap", value)];
    case "align":
      return [`items-${value === "start" ? "start" : value === "end" ? "end" : value}`];
    case "justify":
      return [
        value === "between"
          ? "justify-between"
          : value === "around"
            ? "justify-around"
            : `justify-${value === "start" ? "start" : value === "end" ? "end" : value}`
      ];
    case "gridColumns":
      return [`grid-cols-${value}`];
    case "width":
      return [value === "full" ? "w-full" : value === "auto" ? "w-auto" : `w-[${normalized}]`];
    case "height":
      return [value === "full" ? "h-full" : value === "auto" ? "h-auto" : `h-[${normalized}]`];
    case "padding":
      return [classForSpacing("p", value)];
    case "margin":
      return [classForSpacing("m", value)];
    case "fontSize":
      return [`text-[${normalized}]`];
    case "fontWeight":
      return [fontWeightClass(value)];
    case "lineHeight":
      return [`leading-[${normalized}]`];
    case "letterSpacing":
      return [`tracking-[${normalized}]`];
    case "textAlign":
      return [`text-${value}`];
    case "color":
      return [`text-[${normalized}]`];
    case "backgroundColor":
      return [`bg-[${normalized}]`];
    case "backgroundGradient":
      return [`bg-[${normalized}]`];
    case "borderStyle":
      return value === "none" ? ["border-none"] : value === "solid" ? ["border"] : ["border", "border-dashed"];
    case "borderWidth":
      return [`border-[${normalized}]`];
    case "borderColor":
      return [`border-[${normalized}]`];
    case "borderRadius":
      return value === "0px" ? ["rounded-none"] : [`rounded-[${normalized}]`];
    case "borderTopLeftRadius":
      return value === "0px" ? ["rounded-tl-none"] : [`rounded-tl-[${normalized}]`];
    case "borderTopRightRadius":
      return value === "0px" ? ["rounded-tr-none"] : [`rounded-tr-[${normalized}]`];
    case "borderBottomRightRadius":
      return value === "0px" ? ["rounded-br-none"] : [`rounded-br-[${normalized}]`];
    case "borderBottomLeftRadius":
      return value === "0px" ? ["rounded-bl-none"] : [`rounded-bl-[${normalized}]`];
    case "opacity":
      return [`opacity-[${normalized}]`];
    case "boxShadow":
      return [`shadow-[${normalized}]`];
    default:
      return [];
  }
}

function renderTailwindClasses(styles: NodeStyles): string {
  const classes: string[] = [];

  for (const [property, responsiveValues] of Object.entries(styles) as Array<[StyleProp, NodeStyles[StyleProp]]>) {
    if (!responsiveValues) {
      continue;
    }

    for (const [breakpoint, rawValue] of Object.entries(responsiveValues) as Array<[Breakpoint, string]>) {
      const mapped = mapStylePropToTailwind(property, rawValue);
      const prefix = breakpoint === "base" ? "" : `${breakpoint}:`;
      mapped.forEach((item) => classes.push(`${prefix}${item}`));
    }
  }

  return Array.from(new Set(classes)).join(" ");
}

function contentForNode(node: UiverseNode): string {
  if (node.type === "text") {
    return escapeJsxText(node.content?.text ?? "Editable text");
  }

  if (node.type === "button") {
    return escapeJsxText(node.content?.label ?? "Button");
  }

  return "";
}

function tagForNode(node: UiverseNode): string {
  switch (node.type) {
    case "root":
      return "main";
    case "section":
      return "section";
    case "text":
      return "p";
    case "button":
      return "button";
    case "input":
      return "input";
    case "image":
      return "img";
    default:
      return "div";
  }
}

function renderReactNode(node: UiverseNode, depth = 2): string {
  const indent = "  ".repeat(depth);
  const tag = tagForNode(node);
  const className = renderTailwindClasses(withAbsoluteParentGuard(node));
  const attrs: string[] = [];

  if (className) {
    attrs.push(`className="${className}"`);
  }

  if (node.type === "input") {
    attrs.push(`placeholder="${node.content?.placeholder ?? "Type here"}"`);
  }

  if (node.type === "image") {
    attrs.push(`src="${node.content?.src ?? DEFAULT_IMAGE_SRC}"`);
    attrs.push(`alt="${node.content?.alt ?? node.name}"`);
  }

  const open = `<${tag}${attrs.length > 0 ? ` ${attrs.join(" ")}` : ""}>`;
  if (node.type === "input" || node.type === "image") {
    return `${indent}${open.replace(/>$/, " />")}`;
  }

  const children: string[] = [];
  const content = contentForNode(node);
  if (content) {
    children.push(`${indent}  ${content}`);
  }

  node.children.forEach((child) => children.push(renderReactNode(child, depth + 1)));

  if (children.length === 0) {
    return `${indent}${open}</${tag}>`;
  }

  return `${indent}${open}\n${children.join("\n")}\n${indent}</${tag}>`;
}

function cssDeclarations(styles: NodeStyles, breakpoint: Breakpoint): string[] {
  const declarations: string[] = [];
  const map: Record<StyleProp, string> = {
    position: "position",
    top: "top",
    left: "left",
    right: "right",
    bottom: "bottom",
    zIndex: "z-index",
    display: "display",
    direction: "flex-direction",
    gap: "gap",
    align: "align-items",
    justify: "justify-content",
    gridColumns: "grid-template-columns",
    width: "width",
    height: "height",
    padding: "padding",
    margin: "margin",
    fontSize: "font-size",
    fontWeight: "font-weight",
    lineHeight: "line-height",
    letterSpacing: "letter-spacing",
    textAlign: "text-align",
    color: "color",
    backgroundColor: "background-color",
    backgroundGradient: "background-image",
    borderStyle: "border-style",
    borderWidth: "border-width",
    borderColor: "border-color",
    borderRadius: "border-radius",
    borderTopLeftRadius: "border-top-left-radius",
    borderTopRightRadius: "border-top-right-radius",
    borderBottomRightRadius: "border-bottom-right-radius",
    borderBottomLeftRadius: "border-bottom-left-radius",
    opacity: "opacity",
    boxShadow: "box-shadow"
  };

  for (const [property, responsiveValues] of Object.entries(styles) as Array<[StyleProp, NodeStyles[StyleProp]]>) {
    const value = responsiveValues?.[breakpoint];
    if (!value) {
      continue;
    }

    let normalized = escapeCssValue(value);
    if (property === "align") {
      normalized = value === "start" ? "flex-start" : value === "end" ? "flex-end" : value;
    }

    if (property === "justify") {
      normalized =
        value === "start"
          ? "flex-start"
          : value === "end"
            ? "flex-end"
            : value === "between"
              ? "space-between"
              : value === "around"
                ? "space-around"
                : value;
    }

    if (property === "gridColumns") {
      normalized = `repeat(${value}, minmax(0, 1fr))`;
    }

    declarations.push(`${map[property]}: ${normalized};`);
  }

  return declarations;
}

function htmlClassName(node: UiverseNode): string {
  return `${slugify(node.name, "node")}-${node.id.slice(0, 6)}`;
}

function renderHtmlNode(node: UiverseNode, lines: string[], css: string[], depth = 2): void {
  const indent = "  ".repeat(depth);
  const tag = tagForNode(node);
  const className = htmlClassName(node);
  const effectiveStyles = withAbsoluteParentGuard(node);
  const baseDeclarations = cssDeclarations(effectiveStyles, "base");
  if (baseDeclarations.length > 0) {
    css.push(`.${className} {`);
    baseDeclarations.forEach((declaration) => css.push(`  ${declaration}`));
    css.push("}");
  }

  for (const breakpoint of ["md", "lg"] as const) {
    const declarations = cssDeclarations(effectiveStyles, breakpoint);
    if (declarations.length === 0) {
      continue;
    }

    css.push(`@media (min-width: ${BREAKPOINT_MIN_WIDTH[breakpoint]}px) {`);
    css.push(`  .${className} {`);
    declarations.forEach((declaration) => css.push(`    ${declaration}`));
    css.push("  }");
    css.push("}");
  }

  const attrs = [`class="${className}"`];
  if (node.type === "input") {
    attrs.push(`placeholder="${node.content?.placeholder ?? "Type here"}"`);
  }
  if (node.type === "image") {
    attrs.push(`src="${node.content?.src ?? DEFAULT_IMAGE_SRC}"`);
    attrs.push(`alt="${node.content?.alt ?? node.name}"`);
  }

  if (node.type === "input" || node.type === "image") {
    lines.push(`${indent}<${tag} ${attrs.join(" ")} />`);
    return;
  }

  lines.push(`${indent}<${tag} ${attrs.join(" ")}>`);
  const content = node.type === "text" ? node.content?.text : node.type === "button" ? node.content?.label : "";
  if (content) {
    lines.push(`${indent}  ${content}`);
  }

  node.children.forEach((child) => renderHtmlNode(child, lines, css, depth + 1));
  lines.push(`${indent}</${tag}>`);
}

function buildReactScreen(screen: UiverseScreen): GeneratedFile {
  const componentName = `${pascalCase(screen.slug, "Screen")}Screen`;
  const content = [
    'import React from "react";',
    "",
    `export function ${componentName}() {`,
    "  return (",
    renderReactNode(screen.root, 2),
    "  );",
    "}",
    "",
    `export default ${componentName};`
  ].join("\n");

  return {
    path: `screens/${screen.slug}.tsx`,
    content,
    kind: "screen"
  };
}

function buildReactLayout(bundle: UiverseBundle): GeneratedFile {
  const content = [
    'import type { Metadata } from "next";',
    'import type { ReactNode } from "react";',
    'import "./globals.css";',
    "",
    "export const metadata: Metadata = {",
    `  title: ${JSON.stringify(bundle.project.name)},`,
    `  description: ${JSON.stringify(bundle.project.description)},`,
    "};",
    "",
    "export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {",
    "  return (",
    `    <html lang="${bundle.settings.language}">`,
    "      <body>{children}</body>",
    "    </html>",
    "  );",
    "}"
  ].join("\n");

  return {
    path: "app/layout.tsx",
    content,
    kind: "support"
  };
}

function buildReactGlobals(bundle: UiverseBundle): GeneratedFile {
  const content = [
    ":root {",
    "  color-scheme: dark;",
    `  --ui-bg: #0c0e11;`,
    `  --ui-surface: #111417;`,
    `  --ui-surface-strong: #171b20;`,
    `  --ui-text: #f9f9fd;`,
    `  --ui-muted: #aab4c7;`,
    `  --ui-accent: ${bundle.settings.theme.accent};`,
    '  font-family: "SF Pro Display", "Segoe UI", system-ui, sans-serif;',
    "}",
    "",
    "* {",
    "  box-sizing: border-box;",
    "}",
    "",
    "html,",
    "body {",
    "  min-height: 100%;",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent 42%), var(--ui-bg);",
    "  color: var(--ui-text);",
    '  font-family: "SF Pro Display", "Segoe UI", system-ui, sans-serif;',
    "}",
    "",
    "main {",
    "  min-height: 100vh;",
    "}",
    "",
    "img {",
    "  display: block;",
    "  max-width: 100%;",
    "  height: auto;",
    "}",
    "",
    "button,",
    "input,",
    "textarea,",
    "select {",
    "  font: inherit;",
    "}",
    "",
    "a {",
    "  color: inherit;",
    "}"
  ].join("\n");

  return {
    path: "app/globals.css",
    content,
    kind: "style"
  };
}

function buildReactIndexPage(screen: UiverseScreen): GeneratedFile {
  return {
    path: "app/page.tsx",
    content: `export { default } from "./${screen.slug}/page";\n`,
    kind: "support"
  };
}

function buildReactRoutePage(screen: UiverseScreen): GeneratedFile {
  const componentName = `${pascalCase(screen.slug, "Screen")}Screen`;
  const content = [
    `import ${componentName} from "../../screens/${screen.slug}";`,
    "",
    "export default function Page() {",
    `  return <${componentName} />;`,
    "}"
  ].join("\n");

  return {
    path: `app/${screen.slug}/page.tsx`,
    content,
    kind: "support"
  };
}

function buildHtmlGlobals(bundle: UiverseBundle): GeneratedFile {
  const content = [
    ":root {",
    "  color-scheme: dark;",
    `  --ui-bg: #0c0e11;`,
    `  --ui-surface: #111417;`,
    `  --ui-surface-strong: #171b20;`,
    `  --ui-text: #f9f9fd;`,
    `  --ui-muted: #aab4c7;`,
    `  --ui-accent: ${bundle.settings.theme.accent};`,
    '  font-family: "SF Pro Display", "Segoe UI", system-ui, sans-serif;',
    "}",
    "",
    "* {",
    "  box-sizing: border-box;",
    "}",
    "",
    "html,",
    "body {",
    "  min-height: 100%;",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent 42%), var(--ui-bg);",
    "  color: var(--ui-text);",
    '  font-family: "SF Pro Display", "Segoe UI", system-ui, sans-serif;',
    "}",
    "",
    "img {",
    "  display: block;",
    "  max-width: 100%;",
    "  height: auto;",
    "}",
    "",
    "button,",
    "input,",
    "textarea,",
    "select {",
    "  font: inherit;",
    "}",
    "",
    ".uiverse-index {",
    "  min-height: 100vh;",
    "  display: grid;",
    "  place-items: center;",
    "  padding: 40px 24px;",
    "}",
    "",
    ".uiverse-index__panel {",
    "  width: min(960px, 100%);",
    "  padding: 32px;",
    "  border: 1px solid rgba(255, 255, 255, 0.08);",
    "  border-radius: 28px;",
    "  background: rgba(23, 27, 32, 0.92);",
    "  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.35);",
    "}",
    "",
    ".uiverse-index__eyebrow {",
    "  margin: 0 0 12px;",
    "  font-size: 12px;",
    "  letter-spacing: 0.24em;",
    "  text-transform: uppercase;",
    "  color: var(--ui-muted);",
    "}",
    "",
    ".uiverse-index__title {",
    "  margin: 0;",
    "  font-size: clamp(32px, 5vw, 52px);",
    "}",
    "",
    ".uiverse-index__description {",
    "  margin: 16px 0 0;",
    "  max-width: 60ch;",
    "  color: var(--ui-muted);",
    "  line-height: 1.7;",
    "}",
    "",
    ".uiverse-index__list {",
    "  display: grid;",
    "  gap: 14px;",
    "  margin-top: 28px;",
    "}",
    "",
    ".uiverse-index__link {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: space-between;",
    "  gap: 16px;",
    "  padding: 18px 20px;",
    "  border-radius: 18px;",
    "  border: 1px solid rgba(255, 255, 255, 0.08);",
    "  background: rgba(255, 255, 255, 0.03);",
    "  color: inherit;",
    "  text-decoration: none;",
    "}",
    "",
    ".uiverse-index__link:hover {",
    "  border-color: rgba(255, 255, 255, 0.16);",
    "  background: rgba(255, 255, 255, 0.05);",
    "}"
  ].join("\n");

  return {
    path: "styles/globals.css",
    content,
    kind: "style"
  };
}

function buildHtmlIndex(bundle: UiverseBundle, screens: UiverseScreen[]): GeneratedFile {
  const content = [
    "<!DOCTYPE html>",
    `<html lang="${bundle.settings.language}">`,
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${bundle.project.name}</title>`,
    '    <link rel="stylesheet" href="./styles/globals.css" />',
    "  </head>",
    "  <body>",
    '    <main class="uiverse-index">',
    '      <section class="uiverse-index__panel">',
    '        <p class="uiverse-index__eyebrow">Exported project</p>',
    `        <h1 class="uiverse-index__title">${bundle.project.name}</h1>`,
    `        <p class="uiverse-index__description">${bundle.project.description}</p>`,
    '        <div class="uiverse-index__list">',
    ...screens.map(
      (screen) =>
        `          <a class="uiverse-index__link" href="./screens/${screen.slug}.html"><span>${screen.name}</span><span>${screen.slug}</span></a>`
    ),
    "        </div>",
    "      </section>",
    "    </main>",
    "  </body>",
    "</html>"
  ].join("\n");

  return {
    path: "index.html",
    content,
    kind: "support"
  };
}

function buildHtmlScreen(screen: UiverseScreen, language: string): GeneratedFile[] {
  const htmlLines = [
    "<!DOCTYPE html>",
    `<html lang="${language}">`,
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${screen.name}</title>`,
    '    <link rel="stylesheet" href="../styles/globals.css" />',
    `    <link rel="stylesheet" href="../styles/${screen.slug}.css" />`,
    "  </head>",
    "  <body>"
  ];
  const cssLines: string[] = [];

  renderHtmlNode(screen.root, htmlLines, cssLines, 2);

  htmlLines.push("  </body>", "</html>");

  return [
    {
      path: `screens/${screen.slug}.html`,
      content: htmlLines.join("\n"),
      kind: "screen"
    },
    {
      path: `styles/${screen.slug}.css`,
      content: cssLines.join("\n"),
      kind: "style"
    }
  ];
}

function buildManifest(
  bundle: UiverseBundle,
  format: "react-tailwind" | "html-css",
  files: GeneratedFile[]
): GenerateResult["manifest"] {
  const screens = bundle.screens.map((screen) => ({
    id: screen.id,
    slug: screen.slug,
    files: files
      .filter(
        (file) => file.path.includes(`/${screen.slug}.`) || file.path.includes(`/${screen.slug}/`)
      )
      .map((file) => file.path)
  }));

  return {
    projectSlug: bundle.project.slug,
    format,
    generatedAt: bundle.generatedAt,
    screens
  };
}

export function generateReactTailwind(
  input: UiverseBundle,
  options?: GenerateOptions
): GenerateResult {
  const bundle = assertValidBundle(input);
  const screens = resolveScreenIds(bundle.screens, options);
  const files: GeneratedFile[] = [
    buildReactLayout(bundle),
    buildReactGlobals(bundle),
    buildReactIndexPage(screens[0]!),
    ...screens.flatMap((screen) => [buildReactRoutePage(screen), buildReactScreen(screen)])
  ];
  const manifest = buildManifest({ ...bundle, screens }, "react-tailwind", files);

  files.push({
    path: "manifest.json",
    content: JSON.stringify(manifest, null, 2),
    kind: "manifest"
  });

  return { files, manifest };
}

export function generateHtmlCss(input: UiverseBundle, options?: GenerateOptions): GenerateResult {
  const bundle = assertValidBundle(input);
  const screens = resolveScreenIds(bundle.screens, options);
  const files: GeneratedFile[] = [
    buildHtmlIndex(bundle, screens),
    buildHtmlGlobals(bundle),
    ...screens.flatMap((screen) => buildHtmlScreen(screen, bundle.settings.language))
  ];
  const manifest = buildManifest({ ...bundle, screens }, "html-css", files);

  files.push({
    path: "manifest.json",
    content: JSON.stringify(manifest, null, 2),
    kind: "manifest"
  });

  return { files, manifest };
}
