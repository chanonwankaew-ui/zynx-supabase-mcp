import path from "node:path";
import { env } from "./env.js";

const workspaceRoots = env.workspaceRoots.map((root) => path.resolve(root));

export function getWorkspaceRoots(): string[] {
  return workspaceRoots;
}

export function resolveWorkspacePath(inputPath: string): string {
  const requested = path.resolve(inputPath);
  const allowed = workspaceRoots.some((root) => requested === root || requested.startsWith(`${root}${path.sep}`));

  if (!allowed) {
    throw new Error(`Path is outside ZYNX_WORKSPACE_ROOTS: ${inputPath}`);
  }

  return requested;
}

export function isLikelyBinary(buffer: Buffer): boolean {
  return buffer.subarray(0, 512).includes(0);
}
