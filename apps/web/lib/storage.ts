import type { StoredProject, UiverseSettings } from "@uiverse/schema";

export const PROJECTS_STORAGE_KEY = "uiverse.projects.v1";
export const SETTINGS_STORAGE_KEY = "uiverse.settings.v1";

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function loadProjectsFromStorage(): StoredProject[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseJson<StoredProject[]>(window.localStorage.getItem(PROJECTS_STORAGE_KEY));
}

export function saveProjectsToStorage(projects: StoredProject[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function loadSettingsFromStorage(): UiverseSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseJson<UiverseSettings>(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
}

export function saveSettingsToStorage(settings: UiverseSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
