import type { Converter, ConversionInput, ConversionResult } from "../types";
import { format } from "../formats";
import { brandedFilename } from "../filename";

/**
 * Image converter (Phase 2) — runs entirely in the browser.
 *
 * Decoding: jSquash WASM codecs for jpg/png/webp/avif; heic2any for HEIC (iPhone photos);
 * the browser's native decoder (via createImageBitmap + canvas) for gif/bmp.
 * Encoding: jSquash codecs to jpg/png/webp/avif, with optional quality and resize.
 *
 * All heavy libraries are loaded with dynamic `import()` *inside* `convert()` so they are
 * never pulled into the server bundle — they only load in the browser, on demand.
 */

const LOSSY_TARGETS = ["jpg", "webp", "avif"];

async function decodeViaCanvas(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function decode(fromId: string, file: File): Promise<ImageData> {
  const buffer = await file.arrayBuffer();
  switch (fromId) {
    case "jpg":
      return (await import("@jsquash/jpeg")).decode(buffer);
    case "png":
      return (await import("@jsquash/png")).decode(buffer);
    case "webp":
      return (await import("@jsquash/webp")).decode(buffer);
    case "avif": {
      const decoded = await (await import("@jsquash/avif")).decode(buffer);
      if (!decoded) throw new Error("Failed to decode AVIF image.");
      return decoded;
    }
    case "heic": {
      const heic2any = (await import("heic2any")).default;
      const png = (await heic2any({ blob: file, toType: "image/png" })) as Blob;
      return decodeViaCanvas(png);
    }
    default:
      // gif (first frame), bmp, and anything else the browser can natively decode.
      return decodeViaCanvas(new Blob([buffer], { type: format(fromId).mime }));
  }
}

async function resizeToMax(image: ImageData, maxDimension: number): Promise<ImageData> {
  const longest = Math.max(image.width, image.height);
  if (!maxDimension || maxDimension <= 0 || longest <= maxDimension) return image;
  const scale = maxDimension / longest;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const resize = (await import("@jsquash/resize")).default;
  return resize(image, { width, height });
}

async function encode(toId: string, image: ImageData, quality: number): Promise<ArrayBuffer> {
  switch (toId) {
    case "jpg":
      return (await import("@jsquash/jpeg")).encode(image, { quality });
    case "png":
      return (await import("@jsquash/png")).encode(image);
    case "webp":
      return (await import("@jsquash/webp")).encode(image, { quality });
    case "avif":
      // jSquash AVIF quality is 0..100 (higher = better); maps directly.
      return (await import("@jsquash/avif")).encode(image, { quality });
    default:
      throw new Error(`Cannot encode to ${toId}.`);
  }
}

export const imageConverter: Converter = {
  id: "image-raster",
  category: "image",
  runtime: "client",
  status: "available",
  from: ["jpg", "png", "webp", "avif", "heic", "gif", "bmp"],
  to: ["jpg", "png", "webp", "avif"],
  options: [
    {
      id: "quality",
      type: "range",
      label: "Quality",
      min: 1,
      max: 100,
      step: 1,
      default: 80,
      unit: "%",
      appliesTo: LOSSY_TARGETS,
    },
    {
      id: "maxDimension",
      type: "number",
      label: "Max width/height (px) — optional, keeps aspect ratio",
      min: 1,
      placeholder: "e.g. 1920",
    },
  ],
  async convert({ file, from, to, options, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({ ratio: 0.1, stage: "Decoding" });
    let image = await decode(from.id, file);

    const maxDimension = Number(options?.maxDimension) || 0;
    if (maxDimension > 0) {
      onProgress?.({ ratio: 0.45, stage: "Resizing" });
      image = await resizeToMax(image, maxDimension);
    }

    onProgress?.({ ratio: 0.65, stage: "Encoding" });
    const quality = Number(options?.quality ?? 80);
    const buffer = await encode(to.id, image, quality);

    onProgress?.({ ratio: 1, stage: "Done" });
    const blob = new Blob([buffer], { type: to.mime });
    return { blob, filename: brandedFilename(file.name, to.ext) };
  },
};
