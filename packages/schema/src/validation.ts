import {
  BUNDLE_VERSION,
  BREAKPOINTS,
  EXPORT_TARGETS,
  NODE_TYPES,
  STYLE_PROPS,
  type Breakpoint,
  type GenerateOptions,
  type StoredProject,
  type StyleProp,
  type UiverseBundle,
  type UiverseNode,
  type UiverseProject,
  type UiverseScreen,
  type UiverseSettings,
  type ValidationResult
} from "./types";

const CONTAINER_NODE_TYPES = new Set<string>(["root", "section", "container", "stack", "card"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function validateResponsiveStyle(
  value: unknown,
  path: string,
  errors: string[],
  property: StyleProp
): void {
  if (!isRecord(value)) {
    errors.push(`${path}.${property} must be an object keyed by breakpoint`);
    return;
  }

  for (const [breakpoint, breakpointValue] of Object.entries(value)) {
    if (!(BREAKPOINTS as readonly string[]).includes(breakpoint)) {
      errors.push(`${path}.${property}.${breakpoint} is not a supported breakpoint`);
      continue;
    }

    if (typeof breakpointValue !== "string") {
      errors.push(`${path}.${property}.${breakpoint} must be a string`);
    }
  }
}

function validateStyles(value: unknown, path: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${path}.styles must be an object`);
    return;
  }

  for (const key of Object.keys(value)) {
    if (!(STYLE_PROPS as readonly string[]).includes(key)) {
      errors.push(`${path}.styles.${key} is not a supported style property`);
      continue;
    }

    validateResponsiveStyle(value[key], `${path}.styles`, errors, key as StyleProp);
  }
}

function validateNode(value: unknown, path: string, errors: string[]): value is UiverseNode {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  if (!isString(value.id)) {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (!isString(value.name)) {
    errors.push(`${path}.name must be a non-empty string`);
  }

  const nodeType = isString(value.type) ? value.type : undefined;
  if (!nodeType || !(NODE_TYPES as readonly string[]).includes(nodeType)) {
    errors.push(`${path}.type must be one of ${NODE_TYPES.join(", ")}`);
  }

  validateStyles(value.styles, path, errors);

  if (!Array.isArray(value.children)) {
    errors.push(`${path}.children must be an array`);
    return false;
  }

  value.children.forEach((child, index) => {
    validateNode(child, `${path}.children[${index}]`, errors);
  });

  if (nodeType && !CONTAINER_NODE_TYPES.has(nodeType) && value.children.length > 0) {
    errors.push(`${path} of type ${nodeType} cannot own child nodes`);
  }

  return errors.length === 0;
}

function validateProject(value: unknown, path: string, errors: string[]): value is UiverseProject {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  const requiredFields = [
    "id",
    "name",
    "slug",
    "description",
    "createdAt",
    "updatedAt",
    "lastOpenedScreenId"
  ] as const;

  requiredFields.forEach((field) => {
    if (!isString(value[field])) {
      errors.push(`${path}.${field} must be a non-empty string`);
    }
  });

  return errors.length === 0;
}

function validateScreen(value: unknown, path: string, errors: string[]): value is UiverseScreen {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  if (!isString(value.id)) {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (!isString(value.name)) {
    errors.push(`${path}.name must be a non-empty string`);
  }

  if (!isString(value.slug)) {
    errors.push(`${path}.slug must be a non-empty string`);
  }

  if (!isString(value.lastEditedAt)) {
    errors.push(`${path}.lastEditedAt must be a non-empty string`);
  }

  if (!validateNode(value.root, `${path}.root`, errors)) {
    return false;
  }

  if (isRecord(value.root) && value.root.type !== "root") {
    errors.push(`${path}.root.type must be root`);
  }

  return errors.length === 0;
}

function validateSettings(
  value: unknown,
  path: string,
  errors: string[]
): value is UiverseSettings {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  if (!isString(value.profileName)) {
    errors.push(`${path}.profileName must be a non-empty string`);
  }

  if (!isString(value.profileEmail)) {
    errors.push(`${path}.profileEmail must be a non-empty string`);
  }

  if (
    !isString(value.defaultExportTarget) ||
    !(EXPORT_TARGETS as readonly string[]).includes(value.defaultExportTarget)
  ) {
    errors.push(`${path}.defaultExportTarget must be a supported export target`);
  }

  if (!isRecord(value.theme)) {
    errors.push(`${path}.theme must be an object`);
  } else {
    if (value.theme.mode !== "dark") {
      errors.push(`${path}.theme.mode must be dark in V1`);
    }

    if (!isString(value.theme.accent)) {
      errors.push(`${path}.theme.accent must be a non-empty string`);
    }
  }

  return errors.length === 0;
}

export function validateBundle(value: unknown): ValidationResult<UiverseBundle> {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { valid: false, errors: ["bundle must be an object"] };
  }

  if (value.version !== BUNDLE_VERSION) {
    errors.push(`version must be ${BUNDLE_VERSION}`);
  }

  validateProject(value.project, "project", errors);

  if (!Array.isArray(value.screens) || value.screens.length === 0) {
    errors.push("screens must be a non-empty array");
  } else {
    value.screens.forEach((screen, index) => validateScreen(screen, `screens[${index}]`, errors));
  }

  validateSettings(value.settings, "settings", errors);

  if (!isString(value.generatedAt)) {
    errors.push("generatedAt must be a non-empty string");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors,
    value: value as unknown as UiverseBundle
  };
}

export function assertValidBundle(value: unknown): UiverseBundle {
  const result = validateBundle(value);
  if (!result.valid || !result.value) {
    throw new Error(result.errors.join("\n"));
  }

  return result.value;
}

export function canContainChildren(nodeType: UiverseNode["type"]): boolean {
  return CONTAINER_NODE_TYPES.has(nodeType);
}

export function normalizeBreakpointValue<T extends string>(
  record: Partial<Record<Breakpoint, T>> | undefined,
  breakpoint: Breakpoint
): T | undefined {
  if (!record) {
    return undefined;
  }

  if (breakpoint === "lg") {
    return record.lg ?? record.md ?? record.base;
  }

  if (breakpoint === "md") {
    return record.md ?? record.base;
  }

  return record.base;
}

export function createBundleFromStoredProject(
  project: StoredProject,
  settings: UiverseSettings
): UiverseBundle {
  return {
    version: BUNDLE_VERSION,
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      lastOpenedScreenId: project.lastOpenedScreenId
    },
    screens: project.screens,
    settings,
    generatedAt: new Date().toISOString()
  };
}

export function resolveScreenIds(
  screens: UiverseScreen[],
  options: GenerateOptions | undefined
): UiverseScreen[] {
  if (!options?.screen) {
    return screens;
  }

  return screens.filter((screen) => screen.id === options.screen || screen.slug === options.screen);
}