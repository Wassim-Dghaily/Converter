import type { Tool, ToolInput, ToolResult, ToolFile } from "./types";

/** Extract the files from a ZIP archive (JSZip, no worker). Returns one output per entry. */
export const extractZipTool: Tool = {
  id: "extract-zip",
  slug: "extract-zip",
  category: "archive",
  title: "Extract ZIP",
  description: "Unzip a ZIP archive and download the files inside.",
  accept: ["zip"],
  minFiles: 1,
  maxFiles: 1,
  action: "Extract",
  async run({ files, onProgress }: ToolInput): Promise<ToolResult> {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(await files[0].arrayBuffer());
    const entries = Object.values(zip.files).filter((e) => !e.dir);
    if (entries.length === 0) throw new Error("This ZIP archive is empty.");

    const out: ToolFile[] = [];
    for (let i = 0; i < entries.length; i++) {
      onProgress?.({ ratio: (i / entries.length) * 0.95, stage: entries[i].name });
      const blob = await entries[i].async("blob");
      out.push({ blob, filename: entries[i].name });
    }
    onProgress?.({ ratio: 1, stage: "Done" });
    return { files: out };
  },
};
