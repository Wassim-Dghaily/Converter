import { registry } from "./registry";
import type { CategoryId } from "./types";
import { imageConverter } from "./converters/image";
import { audioConverter } from "./converters/audio";
import { videoConverter } from "./converters/video";
import { spreadsheetConverter } from "./converters/spreadsheet";
import { documentConverter } from "./converters/document";
import { imageToPdfConverter } from "./converters/image-pdf";
import { pdfToTextConverter } from "./converters/pdf-text";
import { pdfToImageConverter } from "./converters/pdf-image";
import { ocrConverter } from "./converters/ocr";

/**
 * Phase 1 seed: registers placeholder "coming-soon" converters so the UI can present the
 * planned capability map honestly (nothing is marked "available" until its phase ships).
 *
 * As each phase lands, replace the relevant entry here with a real converter that has
 * `status: "available"` and a `convert()` implementation (typically dispatched to a Web
 * Worker via `runConversion`).
 */
const comingSoon = (
  id: string,
  category: CategoryId,
  from: string[],
  to: string[],
) => registry.register({ id, category, runtime: "client", status: "coming-soon", from, to });

let seeded = false;

export function seedRegistry(): void {
  if (seeded) return;
  seeded = true;

  // Phase 2 — Image (LIVE)
  registry.register(imageConverter);
  // Image targets we don't encode client-side yet (gif/bmp/tiff/ico output).
  comingSoon("image-extra-out", "image", ["jpg", "png", "webp", "avif", "tiff", "ico"], ["gif", "bmp", "tiff", "ico"]);

  // Phase 3 — Audio (LIVE)
  registry.register(audioConverter);

  // Phase 4 — Video (LIVE) — transcode + GIF + extract-audio
  registry.register(videoConverter);

  // Phase 5a — Spreadsheet, Document, image→PDF (LIVE)
  registry.register(spreadsheetConverter);
  registry.register(documentConverter);
  registry.register(imageToPdfConverter);
  // Phase 5b-1 — PDF → text / images (LIVE) via pdf.js
  registry.register(pdfToTextConverter);
  registry.register(pdfToImageConverter);
  // Phase 5b-2 — Merge / Split (multi-file/multi-output) ship as dedicated "tools", not registry converters.

  // Phase 6 — OCR (LIVE) — image → text in 100+ languages via tesseract.js
  registry.register(ocrConverter);

  // Phase 7 — Archive: handled by tools (Create ZIP / Extract ZIP), not registry converters.
}
