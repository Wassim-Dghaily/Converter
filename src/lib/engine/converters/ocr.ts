import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";

/** Curated subset of Tesseract's 100+ languages (code → label). */
const LANGUAGES: { value: string; label: string }[] = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "nld", label: "Dutch" },
  { value: "rus", label: "Russian" },
  { value: "ara", label: "Arabic" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
  { value: "hin", label: "Hindi" },
  { value: "tur", label: "Turkish" },
];

/**
 * OCR converter (Phase 6) — extracts text from an image with tesseract.js, in the browser.
 * The engine + selected language data load from CDN on first use (then browser-cached). The
 * worker is loaded as a blob URL by tesseract.js itself, so webpack isn't involved.
 */
export const ocrConverter: Converter = {
  id: "ocr-extract",
  category: "ocr",
  runtime: "client",
  status: "available",
  from: ["jpg", "png", "webp", "bmp", "tiff"],
  to: ["txt"],
  options: [
    { id: "lang", type: "select", label: "Language", default: "eng", options: LANGUAGES },
  ],
  async convert({ file, to, options, onProgress }: ConversionInput): Promise<ConversionResult> {
    const lang = String(options?.lang ?? "eng");
    onProgress?.({ ratio: 0, stage: "Loading OCR engine…" });

    const { createWorker, OEM } = await import("tesseract.js");
    const worker = await createWorker(lang, OEM.LSTM_ONLY, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === "recognizing text") {
          onProgress?.({ ratio: Math.min(1, m.progress), stage: "Recognizing text" });
        } else {
          onProgress?.({ ratio: 0.05, stage: m.status.replace(/_/g, " ") });
        }
      },
    });

    try {
      const { data } = await worker.recognize(file);
      const text = (data.text ?? "").trim();
      onProgress?.({ ratio: 1, stage: "Done" });
      return { blob: new Blob([text], { type: to.mime }), filename: brandedFilename(file.name, to.ext) };
    } finally {
      await worker.terminate();
    }
  },
};
