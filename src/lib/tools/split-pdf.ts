import type { Tool, ToolInput } from "./types";
import type { ConversionResult } from "@/lib/engine";

/** Split a PDF into one PDF per page, returned as a ZIP (pdf-lib + JSZip, no worker). */
export const splitPdfTool: Tool = {
  id: "split-pdf",
  slug: "split-pdf",
  category: "pdf",
  title: "Split PDF",
  description: "Break a PDF into separate one-page PDF files, delivered as a ZIP.",
  accept: ["pdf"],
  minFiles: 1,
  maxFiles: 1,
  action: "Split",
  async run({ files, onProgress }: ToolInput): Promise<ConversionResult> {
    const file = files[0];
    const { PDFDocument } = await import("pdf-lib");
    const JSZip = (await import("jszip")).default;

    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const count = src.getPageCount();
    const base = file.name.replace(/\.[^.]+$/, "") || "pdf";
    const zip = new JSZip();

    for (let i = 0; i < count; i++) {
      onProgress?.({ ratio: (i / count) * 0.9, stage: `Page ${i + 1}/${count}` });
      const out = await PDFDocument.create();
      const [page] = await out.copyPages(src, [i]);
      out.addPage(page);
      zip.file(`${base}-page-${String(i + 1).padStart(3, "0")}.pdf`, await out.save());
    }

    onProgress?.({ ratio: 0.95, stage: "Zipping" });
    const blob = await zip.generateAsync({ type: "blob" });
    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob, filename: `${base}-yallaconvert-split.zip` };
  },
};
