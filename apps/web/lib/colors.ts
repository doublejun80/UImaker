const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const COLOR_PRESET_VALUES = [
  "#9ba8ff",
  "#4963ff",
  "#81ecff",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#f9f9fd",
  "#171a1d"
] as const;

function expandShortHex(hex: string): string {
  if (hex.length !== 4) {
    return hex.toLowerCase();
  }

  return `#${hex
    .slice(1)
    .split("")
    .map((char) => `${char}${char}`)
    .join("")}`.toLowerCase();
}

export function isHexColor(value: string | undefined | null): value is string {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value.trim());
}

export function normalizeHexColor(value: string | undefined | null, fallback = "#9ba8ff"): string {
  if (!isHexColor(value)) {
    return fallback;
  }

  return expandShortHex(value.trim());
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function splitHexColor(hex: string): [number, number, number] {
  const normalized = normalizeHexColor(hex);
  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16)
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((value) => clampChannel(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function darkenHexColor(hex: string, amount = 0.18): string {
  const [r, g, b] = splitHexColor(hex);
  return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export function getContrastTextColor(hex: string): string {
  const [r, g, b] = splitHexColor(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.68 ? "#111417" : "#f9f9fd";
}
