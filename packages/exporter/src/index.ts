import {
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pascalCase(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
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

function mapStylePropToTailwind(property: StyleProp, value: string): string[] {
  const normalized = escapeTailwindValue(value);

  switch (property) {
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
  const className = renderTailwindClasses(node.styles);
  const attrs: string[] = [];

  if (className) {
    attrs.push(`className="${className}"`);
  }

  if (node.type === "input") {
    attrs.push(`placeholder="${node.content?.placeholder ?? "Type here"}"`);
  }

  if (node.type === "image") {
    attrs.push(`src="${node.content?.src ?? "https://placehold.co/640x360"}"`);
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
    display: "display",
    direction: "flex-direction",
    gap: "gap",
    align: "align-items",
    justify: "justify-content",
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

    declarations.push(`${map[property]}: ${normalized};`);
  }

  return declarations;
}

function htmlClassName(node: UiverseNode): string {
  return `${slugify(node.name)}-${node.id.slice(0, 6)}`;
}

function renderHtmlNode(node: UiverseNode, lines: string[], css: string[], depth = 2): void {
  const indent = "  ".repeat(depth);
  const tag = tagForNode(node);
  const className = htmlClassName(node);
  const baseDeclarations = cssDeclarations(node.styles, "base");
  if (baseDeclarations.length > 0) {
    css.push(`.${className} {`);
    baseDeclarations.forEach((declaration) => css.push(`  ${declaration}`));
    css.push("}");
  }

  for (const breakpoint of ["md", "lg"] as const) {
    const declarations = cssDeclarations(node.styles, breakpoint);
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
    attrs.push(`src="${node.content?.src ?? "https://placehold.co/640x360"}"`);
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
  const componentName = `${pascalCase(screen.slug)}Screen`;
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

function buildHtmlScreen(screen: UiverseScreen): GeneratedFile[] {
  const htmlLines = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${screen.name}</title>`,
    `    <link rel="stylesheet" href="../styles/${screen.slug}.css" />`,
    "  </head>",
    "  <body>"
  ];
  const cssLines = [
    ":root {",
    "  color-scheme: dark;",
    "  font-family: Inter, system-ui, sans-serif;",
    "  background: #0c0e11;",
    "  color: #f9f9fd;",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  background: #0c0e11;",
    "  color: #f9f9fd;",
    "}"
  ];

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
    files: files.filter((file) => file.path.includes(`/${screen.slug}.`)).map((file) => file.path)
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
  const files = screens.map(buildReactScreen);
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
  const files = screens.flatMap(buildHtmlScreen);
  const manifest = buildManifest({ ...bundle, screens }, "html-css", files);

  files.push({
    path: "manifest.json",
    content: JSON.stringify(manifest, null, 2),
    kind: "manifest"
  });

  return { files, manifest };
}
