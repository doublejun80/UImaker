"use client";

import { create } from "zustand";
import type {
  Breakpoint,
  NodeStyles,
  StoredProject,
  StyleProp,
  UiverseNode,
  UiverseSettings
} from "@uiverse/schema";
import { canContainChildren } from "@uiverse/schema";
import { demoProjects, demoSettings } from "./demo-data";
import {
  loadProjectsFromStorage,
  loadSettingsFromStorage,
  saveProjectsToStorage,
  saveSettingsToStorage
} from "./storage";
import { findNode, findProject, insertNode, moveNode, updateNode } from "./tree";
import type { PreviewDevice } from "./rendering";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createNode(type: UiverseNode["type"]): UiverseNode {
  const id = createId(type);
  const baseName = type.charAt(0).toUpperCase() + type.slice(1);
  const common = { id, type, name: `${baseName} ${id.slice(-4)}`, children: [] as UiverseNode[] };

  switch (type) {
    case "text":
      return {
        ...common,
        content: { text: "Editable text" },
        styles: {
          fontSize: { base: "16px" },
          lineHeight: { base: "1.5" },
          color: { base: "#f9f9fd" }
        }
      };
    case "button":
      return {
        ...common,
        content: { label: "Action" },
        styles: {
          padding: { base: "14px 20px" },
          backgroundGradient: { base: "linear-gradient(135deg,#9ba8ff_0%,#4963ff_100%)" },
          color: { base: "#001470" },
          fontWeight: { base: "700" },
          borderRadius: { base: "8px" }
        }
      };
    case "input":
      return {
        ...common,
        content: { placeholder: "Type here" },
        styles: {
          padding: { base: "14px 16px" },
          backgroundColor: { base: "#171a1d" },
          color: { base: "#f9f9fd" },
          borderWidth: { base: "1px" },
          borderStyle: { base: "solid" },
          borderColor: { base: "rgba(70,72,75,0.15)" },
          borderRadius: { base: "8px" }
        }
      };
    case "image":
      return {
        ...common,
        content: { src: "https://placehold.co/640x360", alt: "Placeholder image" },
        styles: {
          width: { base: "100%" },
          borderRadius: { base: "16px" }
        }
      };
    default:
      return {
        ...common,
        styles: {
          display: { base: "flex" },
          direction: { base: "column" },
          gap: { base: "12px" },
          padding: { base: "16px" },
          backgroundColor: { base: "#111417" },
          borderRadius: { base: "12px" }
        }
      };
  }
}

function countProjectComponents(project: StoredProject): number {
  return project.screens.reduce((total, screen) => total + screen.root.children.length, 0);
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

interface UiverseStore {
  hydrated: boolean;
  projects: StoredProject[];
  settings: UiverseSettings;
  currentProjectId: string | null;
  currentScreenId: string | null;
  selectedNodeId: string | null;
  currentBreakpoint: Breakpoint;
  previewDevice: PreviewDevice;
  hydrate: () => void;
  syncRouteSelection: (projectId: string, screenId?: string) => void;
  selectNode: (nodeId: string | null) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  createProject: (name?: string) => StoredProject;
  updateSettings: (patch: Partial<UiverseSettings>) => void;
  addNode: (projectId: string, screenId: string, type: UiverseNode["type"], parentId?: string) => void;
  updateNodeStyle: (
    projectId: string,
    screenId: string,
    nodeId: string,
    property: StyleProp,
    breakpoint: Breakpoint,
    value: string
  ) => void;
  clearNodeStyle: (
    projectId: string,
    screenId: string,
    nodeId: string,
    property: StyleProp,
    breakpoint: Breakpoint
  ) => void;
  updateNodeContent: (
    projectId: string,
    screenId: string,
    nodeId: string,
    patch: Partial<NonNullable<UiverseNode["content"]>>
  ) => void;
  moveNodeInScreen: (
    projectId: string,
    screenId: string,
    nodeId: string,
    targetParentId: string,
    targetIndex?: number
  ) => void;
}

function persistProjects(projects: StoredProject[]): void {
  saveProjectsToStorage(projects);
}

function persistSettings(settings: UiverseSettings): void {
  saveSettingsToStorage(settings);
}

function updateProjectTree(
  projects: StoredProject[],
  projectId: string,
  screenId: string,
  updater: (root: UiverseNode) => UiverseNode
): StoredProject[] {
  const timestamp = nowIso();
  return projects.map((project) => {
    if (project.id !== projectId) {
      return project;
    }

    return {
      ...project,
      updatedAt: timestamp,
      lastOpenedScreenId: screenId,
      screens: project.screens.map((screen) =>
        screen.id === screenId
          ? { ...screen, lastEditedAt: timestamp, root: updater(screen.root) }
          : screen
      )
    };
  });
}

export const useUiverseStore = create<UiverseStore>((set, get) => ({
  hydrated: false,
  projects: demoProjects,
  settings: demoSettings,
  currentProjectId: demoProjects[0]?.id ?? null,
  currentScreenId: demoProjects[0]?.lastOpenedScreenId ?? null,
  selectedNodeId: demoProjects[0]?.screens[0]?.root.id ?? null,
  currentBreakpoint: "base",
  previewDevice: "desktop",
  hydrate: () => {
    const storedProjects = loadProjectsFromStorage();
    const storedSettings = loadSettingsFromStorage();
    const nextProjects = storedProjects && storedProjects.length > 0 ? storedProjects : demoProjects;
    const nextSettings = storedSettings ?? demoSettings;
    set((state) => ({
      hydrated: true,
      projects: nextProjects,
      settings: nextSettings,
      currentProjectId: state.currentProjectId ?? nextProjects[0]?.id ?? null,
      currentScreenId: state.currentScreenId ?? nextProjects[0]?.lastOpenedScreenId ?? null,
      selectedNodeId: state.selectedNodeId ?? nextProjects[0]?.screens[0]?.root.id ?? null
    }));
  },
  syncRouteSelection: (projectId, screenId) => {
    const project = findProject(get().projects, projectId);
    if (!project) {
      return;
    }

    const resolvedScreenId = screenId ?? project.lastOpenedScreenId ?? project.screens[0]?.id ?? null;
    const screen = project.screens.find((candidate) => candidate.id === resolvedScreenId);
    set((state) => ({
      currentProjectId: projectId,
      currentScreenId: resolvedScreenId,
      selectedNodeId:
        state.selectedNodeId && screen?.root && findNode(screen.root, state.selectedNodeId)
          ? state.selectedNodeId
          : screen?.root.id ?? null,
      projects: state.projects.map((candidate) =>
        candidate.id === projectId
          ? { ...candidate, lastOpenedScreenId: resolvedScreenId ?? candidate.lastOpenedScreenId, updatedAt: nowIso() }
          : candidate
      )
    }));
  },
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setBreakpoint: (breakpoint) => set({ currentBreakpoint: breakpoint }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  createProject: (name) => {
    const projectId = createId("project");
    const screenId = createId("screen");
    const projectName = name?.trim() || `New Project ${get().projects.length + 1}`;
    const root = {
      id: createId("root"),
      type: "root",
      name: `${projectName} Root`,
      styles: {
        display: { base: "flex" },
        direction: { base: "column" },
        gap: { base: "20px" },
        padding: { base: "32px" },
        backgroundColor: { base: "#000000" }
      },
      children: [
        {
          id: createId("section"),
          type: "section",
          name: "Starter Section",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "16px" },
            padding: { base: "24px" },
            backgroundColor: { base: "#111417" },
            borderRadius: { base: "16px" }
          },
          children: [
            {
              id: createId("text"),
              type: "text",
              name: "Headline",
              content: { text: "Start designing your next interface." },
              styles: {
                fontSize: { base: "30px" },
                fontWeight: { base: "800" },
                color: { base: "#f9f9fd" }
              },
              children: []
            }
          ]
        }
      ]
    } satisfies UiverseNode;

    const project: StoredProject = {
      id: projectId,
      name: projectName,
      slug: slugify(projectName),
      description: "Fresh local-first workspace",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      lastOpenedScreenId: screenId,
      screens: [
        {
          id: screenId,
          name: "Main Screen",
          slug: "main-screen",
          root,
          lastEditedAt: nowIso()
        }
      ]
    };

    const projects = [project, ...get().projects];
    persistProjects(projects);
    set({
      projects,
      currentProjectId: project.id,
      currentScreenId: screenId,
      selectedNodeId: root.id
    });
    return project;
  },
  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    persistSettings(settings);
    set({ settings });
  },
  addNode: (projectId, screenId, type, parentId) => {
    const state = get();
    const project = findProject(state.projects, projectId);
    const screen = project?.screens.find((candidate) => candidate.id === screenId);
    if (!screen) {
      return;
    }

    const targetParentId = parentId && findNode(screen.root, parentId) ? parentId : screen.root.id;
    const target = findNode(screen.root, targetParentId);
    const safeParentId = target && canContainChildren(target.type) ? targetParentId : screen.root.id;
    const newNode = createNode(type);
    const projects = updateProjectTree(state.projects, projectId, screenId, (root) => insertNode(root, safeParentId, newNode));
    persistProjects(projects);
    set({ projects, selectedNodeId: newNode.id });
  },
  updateNodeStyle: (projectId, screenId, nodeId, property, breakpoint, value) => {
    const projects = updateProjectTree(get().projects, projectId, screenId, (root) =>
      updateNode(root, nodeId, (node) => ({
        ...node,
        styles: {
          ...node.styles,
          [property]: {
            ...(node.styles[property] ?? {}),
            [breakpoint]: value
          }
        } as NodeStyles
      }))
    );
    persistProjects(projects);
    set({ projects });
  },
  clearNodeStyle: (projectId, screenId, nodeId, property, breakpoint) => {
    const projects = updateProjectTree(get().projects, projectId, screenId, (root) =>
      updateNode(root, nodeId, (node) => {
        const existing = { ...(node.styles[property] ?? {}) } as Record<string, string>;
        delete existing[breakpoint];
        return {
          ...node,
          styles: stripUndefined({
            ...node.styles,
            [property]: Object.keys(existing).length > 0 ? existing : undefined
          }) as NodeStyles
        };
      })
    );
    persistProjects(projects);
    set({ projects });
  },
  updateNodeContent: (projectId, screenId, nodeId, patch) => {
    const projects = updateProjectTree(get().projects, projectId, screenId, (root) =>
      updateNode(root, nodeId, (node) => ({
        ...node,
        content: {
          ...node.content,
          ...patch
        }
      }))
    );
    persistProjects(projects);
    set({ projects });
  },
  moveNodeInScreen: (projectId, screenId, nodeId, targetParentId, targetIndex) => {
    const projects = updateProjectTree(get().projects, projectId, screenId, (root) =>
      moveNode(root, nodeId, targetParentId, targetIndex)
    );
    persistProjects(projects);
    set({ projects, selectedNodeId: nodeId });
  }
}));

export function useCurrentProject(): StoredProject | undefined {
  const projectId = useUiverseStore((state) => state.currentProjectId);
  return useUiverseStore((state) => state.projects.find((project) => project.id === projectId));
}

export function useProjectStats(): {
  projectCount: number;
  componentCount: number;
  screenCount: number;
} {
  return useUiverseStore((state) => ({
    projectCount: state.projects.length,
    componentCount: state.projects.reduce((total, project) => total + countProjectComponents(project), 0),
    screenCount: state.projects.reduce((total, project) => total + project.screens.length, 0)
  }));
}
