import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BUNDLE_VERSION, type UiverseBundle } from "@uiverse/schema";
import { parseGenerateArgs, runGenerateCommand } from "@uiverse/cli";

function createBundle(): UiverseBundle {
  return {
    version: BUNDLE_VERSION,
    generatedAt: new Date("2026-03-20T00:00:00Z").toISOString(),
    project: {
      id: "project-1",
      name: "CLI Fixture",
      slug: "cli-fixture",
      description: "CLI fixture",
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
          styles: { display: { base: "flex" }, direction: { base: "column" } },
          children: []
        }
      }
    ],
    settings: {
      language: "ko",
      profileName: "Admin",
      profileEmail: "admin@uiverse.dev",
      defaultExportTarget: "react-tailwind",
      theme: { mode: "dark", accent: "#9ba8ff" }
    }
  };
}

describe("cli", () => {
  it("parses generate command arguments", () => {
    const parsed = parseGenerateArgs(["generate", "bundle.json", "--format", "react-tailwind", "--out", "./generated", "--screen", "home"]);
    expect(parsed.options.format).toBe("react-tailwind");
    expect(parsed.options.screen).toBe("home");
  });

  it("writes generated files to disk", async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), "uiverse-cli-"));
    const inputPath = path.join(tmp, "bundle.json");
    await writeFile(inputPath, JSON.stringify(createBundle()), "utf8");

    const written = await runGenerateCommand({
      inputPath,
      outDir: path.join(tmp, "out"),
      format: "react-tailwind",
      overwrite: true
    });

    const screenFile = written.find((file) => file.endsWith(path.join("screens", "home.tsx")));
    expect(screenFile).toBeTruthy();
    const content = await readFile(screenFile!, "utf8");
    expect(content).toContain("export function HomeScreen");

    await rm(tmp, { recursive: true, force: true });
  });
});
