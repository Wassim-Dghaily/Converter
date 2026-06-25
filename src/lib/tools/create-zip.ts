import type { Tool, ToolInput, ToolResult } from "./types";

/** Bundle any set of files into a single ZIP (JSZip, no worker). */
export const createZipTool: Tool = {
  id: "create-zip",
  slug: "create-zip",
  category: "archive",
  title: "Create ZIP",
  description: "Bundle any number of files into a single ZIP archive.",
  accept: [], // any file type
  minFiles: 1,
  maxFiles: 200,
  action: "Create ZIP",
  async run({ files, onProgress }: ToolInput): Promise<ToolResult> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f);

    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" }, (meta) => {
      onProgress?.({ ratio: meta.percent / 100, stage: "Compressing" });
    });
    return { files: [{ blob, filename: "archive-yallaconvert.zip" }] };
  },
};
