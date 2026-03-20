import { describe, expect, it } from "vitest";
import { BUNDLE_VERSION, type UiverseBundle } from "@uiverse/schema";
import { generateHtmlCss, generateReactTailwind } from "@uiverse/exporter";

function createBundle(): UiverseBundle {
  return {
    version: BUNDLE_VERSION,
    generatedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
    project: {
      id: "project-1",
      name: "Export Fixture",
      slug: "export-fixture",
      description: "Exporter fixture",
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
            direction: { base: "column" },
            gap: { base: "16px", md: "24px" },
            padding: { base: "20px" },
            backgroundColor: { base: "#000000" }
          },
          children: [
            {
              id: "button-1",
              type: "button",
              name: "Primary Button",
              content: { label: "Launch" },
              styles: {
                padding: { base: "14px 20px" },
                backgroundGradient: { base: "linear-gradient(135deg,#9ba8ff_0%,#4963ff_100%)" },
                color: { base: "#001470" },
                borderRadius: { base: "8px" }
              },
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

describe("exporter", () => {
  it("generates React/Tailwind screens with responsive classes", () => {
    const result = generateReactTailwind(createBundle());
    const screen = result.files.find((file) => file.path.endsWith("home.tsx"));
    expect(screen?.content).toContain("md:gap-[24px]");
    expect(screen?.content).toContain("Launch");
    expect(result.files.some((file) => file.path === "manifest.json")).toBe(true);
  });

  it("generates paired HTML/CSS artifacts", () => {
    const result = generateHtmlCss(createBundle());
    expect(result.files.some((file) => file.path === "screens/home.html")).toBe(true);
    expect(result.files.some((file) => file.path === "styles/home.css")).toBe(true);
  });
});
