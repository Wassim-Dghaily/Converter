import type { Tool, ToolInput } from "./types";
import type { ConversionResult } from "@/lib/engine";
import { asBlob } from "@/lib/engine";

/** Merge several PDFs into one, in the given order, via pdf-lib (no worker). */
export const mergePdfTool: Tool = {
  id: "merge-pdf",
  slug: "merge-pdf",
  category: "pdf",
  title: "Merge PDF",
  description: "Combine several PDF files into a single document, in the order you choose.",
  accept: ["pdf"],
  minFiles: 2,
  maxFiles: 50,
  action: "Merge",
  async run({ files, onProgress }: ToolInput): Promise<ConversionResult> {
    const { PDFDocument } = await import("pdf-lib");
    const merged = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      onProgress?.({ ratio: (i / files.length) * 0.9, stage: `Adding ${files[i].name}` });
      const src = await PDFDocument.load(await files[i].arrayBuffer(), { ignoreEncryption: true });
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }

    onProgress?.({ ratio: 0.95, stage: "Saving" });
    const bytes = await merged.save();
    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob: asBlob(bytes, "application/pdf"), filename: "merged-yallaconvert.pdf" };
  },
};
