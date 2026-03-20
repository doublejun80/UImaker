import { describe, expect, it } from "vitest";
import { BUNDLE_VERSION, validateBundle, type UiverseBundle } from "@uiverse/schema";

function createBundle(): UiverseBundle {
  return {
    version: BUNDLE_VERSION,
    generatedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
    project: {
      id: "project-1",
      name: "Spec Project",
      slug: "spec-project",
      description: "Validation fixture",
      createdAt: new Date("2026-03-18T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
      lastOpenedScreenId: "screen-1"
    },
    screens: [
      {
        id: "screen-1",
        name: "Home",
        slug: "home",
        lastEditedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
        root: {
          id: "root-1",
          type: "root",
          name: "Root",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" }
          },
          children: [
            {
              id: "text-1",
              type: "text",
              name: "Headline",
              content: { text: "Hello bundle" },
              styles: { fontSize: { base: "20px" }, color: { base: "#fff" } },
              children: []
            }
          ]
        }
      }
    ],
    settings: {
      profileName: "Admin",
      profileEmail: "admin@uiverse.dev",
      defaultExportTarget: "react-tailwind",
      theme: {
        mode: "dark",
        accent: "#9ba8ff"
      }
    }
  };
}

describe("validateBundle", () => {
  it("accepts a valid Uiverse bundle", () => {
    const result = validateBundle(createBundle());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects invalid schema versions", () => {
    const bundle = createBundle() as UiverseBundle & { version: string };
    bundle.version = "2";
    const result = validateBundle(bundle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(`version must be ${BUNDLE_VERSION}`);
  });

  it("rejects non-container children on leaf nodes", () => {
    const bundle = createBundle();
    bundle.screens[0]!.root.children[0]!.children.push({
      id: "text-2",
      type: "text",
      name: "Nested",
      content: { text: "nope" },
      styles: {},
      children: []
    });

    const result = validateBundle(bundle);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("cannot own child nodes"))).toBe(true);
  });
});
