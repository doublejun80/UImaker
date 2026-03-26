import { describe, expect, it } from "vitest";
import type { UiverseNode } from "@uiverse/schema";
import {
  DEFAULT_IMAGE_PLACEHOLDER,
  createMockImageDataUri,
  isLegacyPlaceholderImage,
  normalizeNodeImages
} from "../lib/image-placeholders";

describe("image placeholders", () => {
  it("creates a local SVG data URI instead of an external placeholder URL", () => {
    expect(createMockImageDataUri()).toContain("data:image/svg+xml");
  });

  it("replaces legacy placehold images recursively", () => {
    const root: UiverseNode = {
      id: "root",
      type: "root",
      name: "Root",
      styles: {},
      children: [
        {
          id: "image-1",
          type: "image",
          name: "Preview",
          content: {
            src: "https://placehold.co/720x460/10161d/e9eef9?text=%EB%9E%9C%EB%94%A9",
            alt: "Landing preview"
          },
          styles: {},
          children: []
        }
      ]
    };

    const normalized = normalizeNodeImages(root);
    expect(isLegacyPlaceholderImage(root.children[0]?.content?.src)).toBe(true);
    expect(normalized.children[0]?.content?.src).toBe(DEFAULT_IMAGE_PLACEHOLDER);
  });
});
