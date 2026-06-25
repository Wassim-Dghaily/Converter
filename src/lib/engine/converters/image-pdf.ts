import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";
import { asBlob } from "../bytes";

/**
 * Image → PDF (Phase 5a) — wraps a single JPG/PNG into a one-page PDF sized to the image,
 * via pdf-lib (pure JS, no worker). Multi-image merge and PDF page tools come in Phase 5b.
 */
export const imageToPdfConverter: Converter = {
  id: "image-to-pdf",
  category: "pdf",
  runtime: "client",
  status: "available",
  from: ["jpg", "png"],
  to: ["pdf"],
  async convert({ file, from, to, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({ ratio: 0.2, stage: "Reading" });
    const { PDFDocument } = await import("pdf-lib");
    const buf = await file.arrayBuffer();

    const pdf = await PDFDocument.create();
    const image = from.id === "png" ? await pdf.embedPng(buf) : await pdf.embedJpg(buf);
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });

    onProgress?.({ ratio: 0.7, stage: "Writing PDF" });
    const bytes = await pdf.save();

    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob: asBlob(bytes, "application/pdf"), filename: brandedFilename(file.name, to.ext) };
  },
};
