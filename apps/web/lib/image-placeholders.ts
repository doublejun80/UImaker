import type { UiverseNode } from "@uiverse/schema";

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function clampHex(value: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

export function createMockImageDataUri(options?: {
  accent?: string;
  canvas?: string;
  surface?: string;
  surfaceAlt?: string;
}): string {
  const accent = clampHex(options?.accent ?? "#8aa4ff", "#8aa4ff");
  const canvas = clampHex(options?.canvas ?? "#10161d", "#10161d");
  const surface = clampHex(options?.surface ?? "#16202a", "#16202a");
  const surfaceAlt = clampHex(options?.surfaceAlt ?? "#223243", "#223243");

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="460" viewBox="0 0 720 460" fill="none">
      <rect width="720" height="460" rx="36" fill="${canvas}"/>
      <rect x="32" y="30" width="656" height="400" rx="28" fill="${surface}" stroke="${accent}" stroke-opacity="0.24" stroke-width="2"/>
      <rect x="62" y="62" width="596" height="22" rx="11" fill="${surfaceAlt}" opacity="0.9"/>
      <circle cx="88" cy="73" r="6" fill="${accent}" fill-opacity="0.95"/>
      <circle cx="108" cy="73" r="6" fill="${accent}" fill-opacity="0.6"/>
      <circle cx="128" cy="73" r="6" fill="${accent}" fill-opacity="0.35"/>
      <rect x="62" y="114" width="318" height="236" rx="22" fill="${surfaceAlt}" opacity="0.95"/>
      <rect x="90" y="144" width="158" height="18" rx="9" fill="${accent}" fill-opacity="0.9"/>
      <rect x="90" y="178" width="210" height="12" rx="6" fill="#E8EEF9" fill-opacity="0.22"/>
      <rect x="90" y="202" width="176" height="12" rx="6" fill="#E8EEF9" fill-opacity="0.16"/>
      <rect x="90" y="262" width="118" height="60" rx="16" fill="${accent}" fill-opacity="0.92"/>
      <rect x="224" y="262" width="120" height="60" rx="16" fill="${canvas}" stroke="${accent}" stroke-opacity="0.34" stroke-width="2"/>
      <rect x="410" y="114" width="248" height="96" rx="22" fill="${surfaceAlt}" opacity="0.95"/>
      <rect x="438" y="142" width="100" height="16" rx="8" fill="${accent}" fill-opacity="0.75"/>
      <rect x="438" y="172" width="152" height="12" rx="6" fill="#E8EEF9" fill-opacity="0.2"/>
      <rect x="410" y="228" width="248" height="122" rx="22" fill="${surfaceAlt}" opacity="0.95"/>
      <rect x="438" y="258" width="28" height="62" rx="14" fill="${accent}" fill-opacity="0.9"/>
      <rect x="482" y="238" width="28" height="82" rx="14" fill="${accent}" fill-opacity="0.74"/>
      <rect x="526" y="274" width="28" height="46" rx="14" fill="${accent}" fill-opacity="0.56"/>
      <rect x="570" y="248" width="28" height="72" rx="14" fill="${accent}" fill-opacity="0.42"/>
      <rect x="614" y="286" width="16" height="34" rx="8" fill="${accent}" fill-opacity="0.32"/>
      <rect x="438" y="336" width="192" height="6" rx="3" fill="#E8EEF9" fill-opacity="0.12"/>
    </svg>
  `);
}

export const DEFAULT_IMAGE_PLACEHOLDER = createMockImageDataUri();

export function isLegacyPlaceholderImage(src: string | undefined): boolean {
  return Boolean(src && /^https:\/\/placehold\.co\//i.test(src));
}

export function normalizeNodeImages(node: UiverseNode): UiverseNode {
  const nextContent =
    node.type === "image" && isLegacyPlaceholderImage(node.content?.src)
      ? {
          ...node.content,
          src: DEFAULT_IMAGE_PLACEHOLDER
        }
      : node.content;

  return {
    ...node,
    ...(nextContent ? { content: nextContent } : {}),
    children: node.children.map((child) => normalizeNodeImages(child))
  };
}
