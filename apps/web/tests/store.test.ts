import { beforeEach, describe, expect, it } from "vitest";
import { useUiverseStore } from "../lib/store";
import { demoProjects, demoSettings } from "../lib/demo-data";

function resetStore(): void {
  useUiverseStore.setState({
    hydrated: true,
    projects: structuredClone(demoProjects),
    settings: structuredClone(demoSettings),
    currentProjectId: demoProjects[0]!.id,
    currentScreenId: demoProjects[0]!.lastOpenedScreenId,
    selectedNodeId: demoProjects[0]!.screens[0]!.root.id,
    currentBreakpoint: "base",
    previewDevice: "desktop"
  });
}

describe("uiverse store", () => {
  beforeEach(() => {
    resetStore();
  });

  it("creates a new project and selects its root", () => {
    const project = useUiverseStore.getState().createProject("QA Project");
    const state = useUiverseStore.getState();
    expect(state.projects[0]?.id).toBe(project.id);
    expect(state.selectedNodeId).toBe(project.screens[0]?.root.id);
  });

  it("adds nodes and updates responsive styles", () => {
    const state = useUiverseStore.getState();
    const project = state.projects[0]!;
    const screen = project.screens[0]!;
    state.addNode(project.id, screen.id, "button", screen.root.id);
    const afterAdd = useUiverseStore.getState();
    const created = afterAdd.projects[0]!.screens[0]!.root.children.at(-1)!;
    afterAdd.updateNodeStyle(project.id, screen.id, created.id, "padding", "md", "20px 24px");
    const afterStyle = useUiverseStore.getState();
    const updated = afterStyle.projects[0]!.screens[0]!.root.children.find((node) => node.id === created.id)!;
    expect(updated.styles.padding?.md).toBe("20px 24px");
  });
});
