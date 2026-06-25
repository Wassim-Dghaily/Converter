import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";
import { loadPdfjs } from "../pdf-client";

/**
 * PDF → Text (Phase 5b) — extracts the text layer from a PDF via pdf.js, page by page.
 * (Scanned PDFs with no text layer yield little/nothing — that's an OCR job, Phase 6.)
 */
export const pdfToTextConverter: Converter = {
  id: "pdf-to-text",
  category: "pdf",
  runtime: "client",
  status: "available",
  from: ["pdf"],
  to: ["txt"],
  async convert({ file, to, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({ ratio: 0.05, stage: "Opening PDF" });
    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data });
    const doc = await loadingTask.promise;

    const parts: string[] = [];
    try {
      for (let i = 1; i <= doc.numPages; i++) {
        onProgress?.({ ratio: (i / doc.numPages) * 0.95, stage: `Page ${i}/${doc.numPages}` });
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
        parts.push(text.replace(/\s+\n/g, "\n").trim());
        page.cleanup();
      }
    } finally {
      await loadingTask.destroy();
    }

    const out = parts.join("\n\n").trim();
    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob: new Blob([out], { type: to.mime }), filename: brandedFilename(file.name, to.ext) };
  },
};
