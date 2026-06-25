import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";

/**
 * PDF → Images (Phase 5b) — renders each page to PNG/JPG via pdf.js. A single-page PDF returns
 * one image; a multi-page PDF returns a ZIP of page images (JSZip). Resolution is selectable.
 */
export const pdfToImageConverter: Converter = {
  id: "pdf-to-image",
  category: "pdf",
  runtime: "client",
  status: "available",
  from: ["pdf"],
  to: ["png", "jpg"],
  options: [
    {
      id: "scale",
      type: "select",
      label: "Quality",
      default: "2",
      options: [
        { value: "1", label: "Screen (1x)" },
        { value: "2", label: "High (2x)" },
        { value: "3", label: "Print (3x)" },
      ],
    },
  ],
  async convert({ file, to, options, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({ ratio: 0.05, stage: "Opening PDF" });
    const { loadPdfjs } = await import("../pdf-client");
    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await file.arrayBuffer());
    const loadingTask = pdfjs.getDocument({ data });
    const doc = await loadingTask.promise;

    const scale = Number(options?.scale ?? 2);
    const mime = to.id === "png" ? "image/png" : "image/jpeg";
    const pages: { name: string; blob: Blob }[] = [];

    try {
      for (let i = 1; i <= doc.numPages; i++) {
        onProgress?.({ ratio: (i / doc.numPages) * 0.9, stage: `Rendering page ${i}/${doc.numPages}` });
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, viewport }).promise;
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to render page."))), mime, 0.92),
        );
        pages.push({ name: `page-${String(i).padStart(3, "0")}${to.ext}`, blob });
        page.cleanup();
      }
    } finally {
      await loadingTask.destroy();
    }

    // Single page → the image itself; multiple pages → a zip.
    if (pages.length === 1) {
      onProgress?.({ ratio: 1, stage: "Done" });
      return { blob: pages[0].blob, filename: brandedFilename(file.name, to.ext) };
    }

    onProgress?.({ ratio: 0.95, stage: "Zipping pages" });
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const p of pages) zip.file(p.name, p.blob);
    const zipBlob = await zip.generateAsync({ type: "blob" });

    const base = file.name.replace(/\.[^.]+$/, "") || "pdf";
    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob: zipBlob, filename: `${base}-yallaconvert-${to.id}-pages.zip` };
  },
};
