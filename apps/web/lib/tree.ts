import { canContainChildren, type StoredProject, type UiverseNode } from "@uiverse/schema";

export interface TreeLocation {
  node: UiverseNode;
  parentId: string | null;
  index: number;
}

export interface FlatNode extends TreeLocation {
  depth: number;
}

export function findNode(root: UiverseNode, nodeId: string): UiverseNode | undefined {
  if (root.id === nodeId) {
    return root;
  }

  for (const child of root.children) {
    const match = findNode(child, nodeId);
    if (match) {
      return match;
    }
  }

  return undefined;
}

export function flattenTree(root: UiverseNode, depth = 0, parentId: string | null = null): FlatNode[] {
  const current: FlatNode = { node: root, parentId, index: 0, depth };
  const children = root.children.flatMap((child, index) => flattenTreeWithIndex(child, depth + 1, root.id, index));
  return [current, ...children];
}

function flattenTreeWithIndex(
  node: UiverseNode,
  depth: number,
  parentId: string,
  index: number
): FlatNode[] {
  const current: FlatNode = { node, parentId, index, depth };
  const children = node.children.flatMap((child, childIndex) => flattenTreeWithIndex(child, depth + 1, node.id, childIndex));
  return [current, ...children];
}

function mapChildren(node: UiverseNode, mapper: (child: UiverseNode) => UiverseNode): UiverseNode {
  return {
    ...node,
    children: node.children.map(mapper)
  };
}

export function updateNode(
  root: UiverseNode,
  nodeId: string,
  updater: (node: UiverseNode) => UiverseNode
): UiverseNode {
  if (root.id === nodeId) {
    return updater(root);
  }

  return mapChildren(root, (child) => updateNode(child, nodeId, updater));
}

export function insertNode(root: UiverseNode, parentId: string, node: UiverseNode, index?: number): UiverseNode {
  return updateNode(root, parentId, (target) => {
    if (!canContainChildren(target.type)) {
      return target;
    }

    const nextChildren = [...target.children];
    const safeIndex = typeof index === "number" ? Math.max(0, Math.min(index, nextChildren.length)) : nextChildren.length;
    nextChildren.splice(safeIndex, 0, node);
    return { ...target, children: nextChildren };
  });
}

export function removeNode(
  root: UiverseNode,
  nodeId: string
): { root: UiverseNode; removed?: UiverseNode } {
  let removed: UiverseNode | undefined;

  function walk(node: UiverseNode): UiverseNode {
    const nextChildren: UiverseNode[] = [];
    for (const child of node.children) {
      if (child.id === nodeId) {
        removed = child;
        continue;
      }
      nextChildren.push(walk(child));
    }
    return { ...node, children: nextChildren };
  }

  const nextRoot = walk(root);
  if (!removed) {
    return { root: nextRoot };
  }

  return { root: nextRoot, removed };
}

export function containsNode(root: UiverseNode, nodeId: string): boolean {
  if (root.id === nodeId) {
    return true;
  }

  return root.children.some((child) => containsNode(child, nodeId));
}

export function moveNode(
  root: UiverseNode,
  nodeId: string,
  targetParentId: string,
  targetIndex?: number
): UiverseNode {
  if (nodeId === root.id || nodeId === targetParentId) {
    return root;
  }

  const targetParent = findNode(root, targetParentId);
  if (!targetParent || !canContainChildren(targetParent.type)) {
    return root;
  }

  const draggedNode = findNode(root, nodeId);
  if (!draggedNode) {
    return root;
  }

  if (containsNode(draggedNode, targetParentId)) {
    return root;
  }

  const sourceEntry = flattenTree(root).find((entry) => entry.node.id === nodeId);
  let safeTargetIndex = targetIndex;

  if (
    sourceEntry?.parentId === targetParentId &&
    typeof safeTargetIndex === "number" &&
    sourceEntry.index < safeTargetIndex
  ) {
    safeTargetIndex -= 1;
  }

  const removed = removeNode(root, nodeId);
  if (!removed.removed) {
    return root;
  }

  return insertNode(removed.root, targetParentId, removed.removed, safeTargetIndex);
}

export function countNodes(root: UiverseNode): number {
  return flattenTree(root).length - 1;
}

export function findProject(projects: StoredProject[], projectId: string): StoredProject | undefined {
  return projects.find((project) => project.id === projectId);
}
