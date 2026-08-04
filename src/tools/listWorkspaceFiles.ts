import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getWorkspaceRoots, resolveWorkspacePath } from "../lib/filesystem.js";

export const ListWorkspaceFilesInputSchema = z.object({
  dirPath: z.string().optional().describe("Directory to list. Defaults to the first configured workspace root."),
  depth: z.number().int().min(0).max(5).default(1),
  limit: z.number().int().min(1).max(500).default(100)
});

export type ListWorkspaceFilesInput = z.infer<typeof ListWorkspaceFilesInputSchema>;

export async function listWorkspaceFiles(input: ListWorkspaceFilesInput) {
  const parsed = ListWorkspaceFilesInputSchema.parse(input);
  const root = parsed.dirPath ? resolveWorkspacePath(parsed.dirPath) : getWorkspaceRoots()[0];
  const rows: Array<{ path: string; type: "file" | "directory"; size: number | null }> = [];

  async function walk(current: string, depth: number) {
    if (rows.length >= parsed.limit) return;
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      if (rows.length >= parsed.limit) break;
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;

      const fullPath = path.join(current, entry.name);
      const info = await stat(fullPath);
      const type = entry.isDirectory() ? "directory" : "file";
      rows.push({ path: fullPath, type, size: type === "file" ? info.size : null });

      if (entry.isDirectory() && depth > 0) {
        await walk(fullPath, depth - 1);
      }
    }
  }

  await walk(root, parsed.depth);

  return {
    success: true,
    root,
    workspaceRoots: getWorkspaceRoots(),
    count: rows.length,
    rows
  };
}
