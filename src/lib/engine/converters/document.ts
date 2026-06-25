import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";

/** Strip HTML to readable plain text using the browser's parser. */
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Document converter (Phase 5a) — DOCX / Markdown / HTML → HTML or plain text, in the browser.
 *  - DOCX via mammoth (browser build): convertToHtml, or extractRawText for clean text.
 *  - Markdown via marked.
 *  - HTML passthrough / strip to text.
 * Note: DOCX→HTML is content-focused (mammoth drops most styling). Rich Office→PDF fidelity is
 * a server-side concern (PROJECT_MEMORY §11).
 */
export const documentConverter: Converter = {
  id: "document-text",
  category: "document",
  runtime: "client",
  status: "available",
  from: ["docx", "md", "html"],
  to: ["html", "txt"],
  async convert({ file, from, to, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({ ratio: 0.2, stage: "Reading" });
    const buf = await file.arrayBuffer();

    let html = "";
    let rawText: string | null = null;

    if (from.id === "docx") {
      const { convertToHtml, extractRawText } = await import("mammoth");
      if (to.id === "txt") rawText = (await extractRawText({ arrayBuffer: buf })).value;
      else html = (await convertToHtml({ arrayBuffer: buf })).value;
    } else if (from.id === "md") {
      const { marked } = await import("marked");
      html = await marked.parse(new TextDecoder().decode(buf));
    } else {
      html = new TextDecoder().decode(buf);
    }

    onProgress?.({ ratio: 0.7, stage: "Writing" });
    const outText =
      to.id === "html" ? `<!DOCTYPE html>\n<meta charset="utf-8">\n${html}` : rawText ?? htmlToText(html);

    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob: new Blob([outText], { type: to.mime }), filename: brandedFilename(file.name, to.ext) };
  },
};
