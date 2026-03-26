import { describe, expect, it } from "vitest";
import { createZipArchive } from "@/lib/zip";

function containsSequence(haystack: Uint8Array, needle: Uint8Array): boolean {
  for (let index = 0; index <= haystack.length - needle.length; index += 1) {
    let matches = true;
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[index + offset] !== needle[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return true;
    }
  }

  return false;
}

describe("zip", () => {
  it("creates a zip archive with UTF-8 file paths and content", async () => {
    const archive = createZipArchive([
      { path: "app/layout.tsx", content: 'export const title = "Demo";' },
      { path: "screens/피처-스프린트-4.tsx", content: "export default function Screen() { return null; }" }
    ]);

    expect(archive.type).toBe("application/zip");

    const bytes = new Uint8Array(await archive.arrayBuffer());
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);

    expect(containsSequence(bytes, new TextEncoder().encode("app/layout.tsx"))).toBe(true);
    expect(containsSequence(bytes, new TextEncoder().encode("screens/피처-스프린트-4.tsx"))).toBe(true);
    expect(containsSequence(bytes, new TextEncoder().encode('export const title = "Demo";'))).toBe(true);
  });
});
