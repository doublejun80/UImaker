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
    expect(project.designKitId).toBeDefined();
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

  it("renames and deletes a selected node", () => {
    const state = useUiverseStore.getState();
    const project = state.projects[0]!;
    const screen = project.screens[0]!;
    const targetNode = screen.root.children[0]!;

    state.updateNodeName(project.id, screen.id, targetNode.id, "히어로 섹션");
    state.deleteNodeInScreen(project.id, screen.id, targetNode.id);

    const nextState = useUiverseStore.getState();
    expect(nextState.projects[0]!.screens[0]!.root.children.find((node) => node.id === targetNode.id)).toBeUndefined();
    expect(nextState.selectedNodeId).toBe(screen.root.id);
  });

  it("creates a starter project from a template", () => {
    const project = useUiverseStore.getState().createProjectFromTemplate("landing-trust-launch", "mint-console");
    expect(project.name.length).toBeGreaterThan(0);
    expect(project.screens[0]?.root.children.length).toBeGreaterThan(0);
    expect(project.slug.length).toBeGreaterThan(0);
    expect(project.designKitId).toBe("mint-console");
  });

  it("reapplies a design kit across the current project", () => {
    const state = useUiverseStore.getState();
    const project = state.projects[0]!;

    state.applyProjectDesignKit(project.id, "canvas-cream");

    const nextProject = useUiverseStore.getState().projects.find((entry) => entry.id === project.id)!;
    expect(nextProject.designKitId).toBe("canvas-cream");
    expect(nextProject.screens[0]!.root.styles.backgroundColor?.base).toBe("#120f0c");
  });
});
