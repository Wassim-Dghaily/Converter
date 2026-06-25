import type * as PdfjsLib from "pdfjs-dist";

/**
 * Shared pdf.js loader (browser only). Self-hosts the worker from /public/pdf (copied by
 * scripts/copy-assets.mjs) and points pdf.js at it via an absolute URL. Unlike ffmpeg, pdf.js's
 * worker is a plain script (no dynamic blob import), so webpack doesn't break it.
 */
let pdfjs: typeof PdfjsLib | null = null;

export async function loadPdfjs(): Promise<typeof PdfjsLib> {
  if (typeof window === "undefined") {
    throw new Error("pdf.js is only available in the browser.");
  }
  if (!pdfjs) {
    const lib = await import("pdfjs-dist");
    lib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf/pdf.worker.min.mjs`;
    pdfjs = lib;
  }
  return pdfjs;
}
