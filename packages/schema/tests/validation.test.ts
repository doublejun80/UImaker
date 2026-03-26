import { describe, expect, it } from "vitest";
import { BUNDLE_VERSION, createBundleFromStoredProject, validateBundle, type StoredProject, type UiverseBundle } from "@uiverse/schema";

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
            display: { base: "grid" },
            gridColumns: { base: "2" }
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
      language: "ko",
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

  it("normalizes empty project and screen slugs while building a bundle", () => {
    const settings = createBundle().settings;
    const storedProject: StoredProject = {
      id: "project-2",
      name: "행사 소개 페이지",
      slug: "",
      description: "Slug normalization fixture",
      createdAt: new Date("2026-03-18T00:00:00Z").toISOString(),
      updatedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
      lastOpenedScreenId: "screen-2",
      screens: [
        {
          id: "screen-2",
          name: "메인 화면",
          slug: "",
          lastEditedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
          root: {
            id: "root-2",
            type: "root",
            name: "Root",
            styles: {},
            children: []
          }
        }
      ]
    };

    const bundle = createBundleFromStoredProject(storedProject, settings);
    expect(bundle.project.slug).toBe("행사-소개-페이지");
    expect(bundle.screens[0]?.slug).toBe("메인-화면");
    expect(validateBundle(bundle).valid).toBe(true);
  });
});
