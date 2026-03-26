import { describe, expect, it } from "vitest";
import type { UiverseNode } from "@uiverse/schema";
import { moveNode } from "../lib/tree";

function createTree(): UiverseNode {
  return {
    id: "root",
    type: "root",
    name: "Root",
    styles: {
      display: { base: "flex" },
      direction: { base: "column" }
    },
    children: [
      {
        id: "a",
        type: "section",
        name: "A",
        styles: {},
        children: []
      },
      {
        id: "b",
        type: "section",
        name: "B",
        styles: {},
        children: []
      },
      {
        id: "c",
        type: "section",
        name: "C",
        styles: {},
        children: []
      }
    ]
  };
}

describe("tree moveNode", () => {
  it("keeps same-parent drag order correct when moving downward", () => {
    const moved = moveNode(createTree(), "a", "root", 2);
    expect(moved.children.map((child) => child.id)).toEqual(["b", "a", "c"]);
  });

  it("keeps same-parent drag order correct when moving to the end", () => {
    const moved = moveNode(createTree(), "a", "root", 3);
    expect(moved.children.map((child) => child.id)).toEqual(["b", "c", "a"]);
  });
});
