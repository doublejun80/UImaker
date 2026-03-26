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
            display: { base: "grid" },
            gridColumns: { base: "2", md: "3" },
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
                position: { base: "absolute" },
                top: { base: "24px" },
                left: { base: "32px" },
                zIndex: { base: "10" },
                padding: { base: "14px 20px" },
                backgroundGradient: { base: "linear-gradient(135deg, #9ba8ff 0%, #4963ff 100%)" },
                color: { base: "#001470" },
                borderRadius: { base: "8px" },
                borderTopRightRadius: { base: "24px" }
              },
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

describe("exporter", () => {
  it("generates React/Tailwind screens with responsive classes", () => {
    const result = generateReactTailwind(createBundle());
    const screen = result.files.find((file) => file.path.endsWith("home.tsx"));
    expect(result.files.some((file) => file.path === "app/layout.tsx")).toBe(true);
    expect(result.files.some((file) => file.path === "app/globals.css")).toBe(true);
    expect(result.files.some((file) => file.path === "app/home/page.tsx")).toBe(true);
    expect(screen?.content).toContain("md:gap-[24px]");
    expect(screen?.content).toContain("grid-cols-2");
    expect(screen?.content).toContain("md:grid-cols-3");
    expect(screen?.content).toContain("absolute");
    expect(screen?.content).toContain("top-[24px]");
    expect(screen?.content).toContain("left-[32px]");
    expect(screen?.content).toContain("rounded-tr-[24px]");
    expect(screen?.content).toContain("Launch");
    expect(result.files.some((file) => file.path === "manifest.json")).toBe(true);
  });

  it("generates paired HTML/CSS artifacts", () => {
    const result = generateHtmlCss(createBundle());
    const stylesheet = result.files.find((file) => file.path === "styles/home.css");
    const globals = result.files.find((file) => file.path === "styles/globals.css");
    expect(result.files.some((file) => file.path === "screens/home.html")).toBe(true);
    expect(result.files.some((file) => file.path === "index.html")).toBe(true);
    expect(globals?.content).toContain("--ui-accent: #9ba8ff;");
    expect(result.files.some((file) => file.path === "styles/home.css")).toBe(true);
    expect(stylesheet?.content).toContain("background-image: linear-gradient(135deg, #9ba8ff 0%, #4963ff 100%);");
    expect(stylesheet?.content).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(stylesheet?.content).toContain("position: absolute;");
    expect(stylesheet?.content).toContain("top: 24px;");
    expect(stylesheet?.content).toContain("left: 32px;");
    expect(stylesheet?.content).toContain("border-top-right-radius: 24px;");
  });
});
