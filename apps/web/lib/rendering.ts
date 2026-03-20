import type { Breakpoint, NodeStyles, StyleProp, UiverseNode } from "@uiverse/schema";
import type { CSSProperties } from "react";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export const previewDeviceWidths: Record<PreviewDevice, number> = {
  desktop: 1280,
  tablet: 820,
  mobile: 390
};

export function resolveStyleValue(
  styles: NodeStyles,
  property: StyleProp,
  breakpoint: Breakpoint
): string | undefined {
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

export function stylesToCanvasStyle(styles: NodeStyles, breakpoint: Breakpoint): CSSProperties {
  const style: CSSProperties = {};

  const display = resolveStyleValue(styles, "display", breakpoint);
  if (display) style.display = display as CSSProperties["display"];

  const direction = resolveStyleValue(styles, "direction", breakpoint);
  if (direction) style.flexDirection = direction as CSSProperties["flexDirection"];

  const gap = resolveStyleValue(styles, "gap", breakpoint);
  if (gap) style.gap = gap;

  const align = resolveStyleValue(styles, "align", breakpoint);
  if (align) style.alignItems = (align === "start" ? "flex-start" : align === "end" ? "flex-end" : align) as CSSProperties["alignItems"];

  const justify = resolveStyleValue(styles, "justify", breakpoint);
  if (justify) {
    style.justifyContent = (
      justify === "start"
        ? "flex-start"
        : justify === "end"
          ? "flex-end"
          : justify === "between"
            ? "space-between"
            : justify === "around"
              ? "space-around"
              : justify
    ) as CSSProperties["justifyContent"];
  }

  const width = resolveStyleValue(styles, "width", breakpoint);
  if (width) style.width = width === "full" ? "100%" : width;

  const height = resolveStyleValue(styles, "height", breakpoint);
  if (height) style.height = height === "full" ? "100%" : height;

  const padding = resolveStyleValue(styles, "padding", breakpoint);
  if (padding) style.padding = padding;

  const margin = resolveStyleValue(styles, "margin", breakpoint);
  if (margin) style.margin = margin;

  const fontSize = resolveStyleValue(styles, "fontSize", breakpoint);
  if (fontSize) style.fontSize = fontSize;

  const fontWeight = resolveStyleValue(styles, "fontWeight", breakpoint);
  if (fontWeight) style.fontWeight = Number(fontWeight) || fontWeight;

  const lineHeight = resolveStyleValue(styles, "lineHeight", breakpoint);
  if (lineHeight) style.lineHeight = lineHeight;

  const letterSpacing = resolveStyleValue(styles, "letterSpacing", breakpoint);
  if (letterSpacing) style.letterSpacing = letterSpacing;

  const textAlign = resolveStyleValue(styles, "textAlign", breakpoint);
  if (textAlign) style.textAlign = textAlign as CSSProperties["textAlign"];

  const color = resolveStyleValue(styles, "color", breakpoint);
  if (color) style.color = color;

  const backgroundColor = resolveStyleValue(styles, "backgroundColor", breakpoint);
  if (backgroundColor) style.backgroundColor = backgroundColor;

  const backgroundGradient = resolveStyleValue(styles, "backgroundGradient", breakpoint);
  if (backgroundGradient) style.backgroundImage = backgroundGradient;

  const borderStyle = resolveStyleValue(styles, "borderStyle", breakpoint);
  if (borderStyle) style.borderStyle = borderStyle as CSSProperties["borderStyle"];

  const borderWidth = resolveStyleValue(styles, "borderWidth", breakpoint);
  if (borderWidth) style.borderWidth = borderWidth;

  const borderColor = resolveStyleValue(styles, "borderColor", breakpoint);
  if (borderColor) style.borderColor = borderColor;

  const borderRadius = resolveStyleValue(styles, "borderRadius", breakpoint);
  if (borderRadius) style.borderRadius = borderRadius;

  const opacity = resolveStyleValue(styles, "opacity", breakpoint);
  if (opacity) style.opacity = Number(opacity);

  const boxShadow = resolveStyleValue(styles, "boxShadow", breakpoint);
  if (boxShadow) style.boxShadow = boxShadow;

  return style;
}

export function labelForNode(node: UiverseNode): string {
  if (node.type === "text") {
    return node.content?.text ?? node.name;
  }

  if (node.type === "button") {
    return node.content?.label ?? node.name;
  }

  if (node.type === "input") {
    return node.content?.placeholder ?? node.name;
  }

  return node.name;
}