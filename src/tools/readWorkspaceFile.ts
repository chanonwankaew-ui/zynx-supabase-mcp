import { readFile, stat } from "node:fs/promises";
import { z } from "zod";
import { env } from "../lib/env.js";
import { isLikelyBinary, resolveWorkspacePath } from "../lib/filesystem.js";

export const ReadWorkspaceFileInputSchema = z.object({
  filePath: z.string().min(1).describe("File path inside one configured workspace root.")
});

export type ReadWorkspaceFileInput = z.infer<typeof ReadWorkspaceFileInputSchema>;

export async function readWorkspaceFile(input: ReadWorkspaceFileInput) {
  const parsed = ReadWorkspaceFileInputSchema.parse(input);
  const filePath = resolveWorkspacePath(parsed.filePath);
  const info = await stat(filePath);

  if (!info.isFile()) {
    return { success: false, error: "Path is not a file.", filePath };
  }

  if (info.size > env.maxFileBytes) {
    return {
      success: false,
      error: `File exceeds ZYNX_MAX_FILE_BYTES (${env.maxFileBytes}).`,
      filePath,
      size: info.size
    };
  }

  const buffer = await readFile(filePath);
  if (isLikelyBinary(buffer)) {
    return { success: false, error: "Binary file reading is not supported.", filePath, size: info.size };
  }

  return {
    success: true,
    filePath,
    size: info.size,
    text: buffer.toString("utf8")
  };
}
