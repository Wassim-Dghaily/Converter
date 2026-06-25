import { registry } from "./registry";
import type { CategoryId } from "./types";
import { imageConverter } from "./converters/image";
import { audioConverter } from "./converters/audio";

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

  // Phase 4 — Video
  comingSoon(
    "video-transcode",
    "video",
    ["mp4", "webm", "mkv", "mov", "avi"],
    ["mp4", "webm", "mkv", "gif"],
  );
  comingSoon("video-to-audio", "video", ["mp4", "webm", "mkv", "mov", "avi"], ["mp3", "wav", "aac"]);

  // Phase 5 — PDF / document / spreadsheet
  comingSoon("pdf-tools", "pdf", ["pdf"], ["pdf", "jpg", "png", "txt"]);
  comingSoon("image-to-pdf", "pdf", ["jpg", "png"], ["pdf"]);
  comingSoon("document-text", "document", ["docx", "md", "html", "txt"], ["html", "txt", "md"]);
  comingSoon("spreadsheet-data", "spreadsheet", ["csv", "xlsx", "json"], ["csv", "xlsx", "json"]);

  // Phase 6 — OCR
  comingSoon("ocr-extract", "ocr", ["jpg", "png", "webp", "bmp", "tiff", "pdf"], ["txt", "pdf"]);

  // Phase 7 — Archive
  comingSoon("archive-zip", "archive", ["zip"], ["zip"]);
}
