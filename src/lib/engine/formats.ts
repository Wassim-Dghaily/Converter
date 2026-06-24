import type { FileFormat } from "./types";

/**
 * Catalog of known file formats. This is the single source of truth the UI and converters
 * reference by id. Add new formats here, then reference their ids in a Converter's
 * `from`/`to` arrays.
 */
const defineFormats = (formats: FileFormat[]) => {
  const byId = new Map<string, FileFormat>();
  for (const f of formats) {
    if (byId.has(f.id)) throw new Error(`Duplicate format id: ${f.id}`);
    byId.set(f.id, f);
  }
  return byId;
};

export const FORMATS = defineFormats([
  // --- Image ---
  { id: "jpg", label: "JPG", ext: ".jpg", mime: "image/jpeg", category: "image" },
  { id: "png", label: "PNG", ext: ".png", mime: "image/png", category: "image" },
  { id: "webp", label: "WebP", ext: ".webp", mime: "image/webp", category: "image" },
  { id: "avif", label: "AVIF", ext: ".avif", mime: "image/avif", category: "image" },
  { id: "gif", label: "GIF", ext: ".gif", mime: "image/gif", category: "image" },
  { id: "bmp", label: "BMP", ext: ".bmp", mime: "image/bmp", category: "image" },
  { id: "tiff", label: "TIFF", ext: ".tiff", mime: "image/tiff", category: "image" },
  { id: "ico", label: "ICO", ext: ".ico", mime: "image/x-icon", category: "image" },
  { id: "heic", label: "HEIC", ext: ".heic", mime: "image/heic", category: "image" },

  // --- Audio ---
  { id: "mp3", label: "MP3", ext: ".mp3", mime: "audio/mpeg", category: "audio" },
  { id: "wav", label: "WAV", ext: ".wav", mime: "audio/wav", category: "audio" },
  { id: "aac", label: "AAC", ext: ".aac", mime: "audio/aac", category: "audio" },
  { id: "m4a", label: "M4A", ext: ".m4a", mime: "audio/mp4", category: "audio" },
  { id: "ogg", label: "OGG", ext: ".ogg", mime: "audio/ogg", category: "audio" },
  { id: "opus", label: "Opus", ext: ".opus", mime: "audio/opus", category: "audio" },
  { id: "flac", label: "FLAC", ext: ".flac", mime: "audio/flac", category: "audio" },

  // --- Video ---
  { id: "mp4", label: "MP4", ext: ".mp4", mime: "video/mp4", category: "video" },
  { id: "webm", label: "WebM", ext: ".webm", mime: "video/webm", category: "video" },
  { id: "mkv", label: "MKV", ext: ".mkv", mime: "video/x-matroska", category: "video" },
  { id: "mov", label: "MOV", ext: ".mov", mime: "video/quicktime", category: "video" },
  { id: "avi", label: "AVI", ext: ".avi", mime: "video/x-msvideo", category: "video" },

  // --- PDF / document ---
  { id: "pdf", label: "PDF", ext: ".pdf", mime: "application/pdf", category: "pdf" },
  { id: "txt", label: "TXT", ext: ".txt", mime: "text/plain", category: "document" },
  { id: "html", label: "HTML", ext: ".html", mime: "text/html", category: "document" },
  { id: "md", label: "Markdown", ext: ".md", mime: "text/markdown", category: "document" },
  {
    id: "docx",
    label: "DOCX",
    ext: ".docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: "document",
  },

  // --- Spreadsheet / data ---
  { id: "csv", label: "CSV", ext: ".csv", mime: "text/csv", category: "spreadsheet" },
  { id: "json", label: "JSON", ext: ".json", mime: "application/json", category: "spreadsheet" },
  {
    id: "xlsx",
    label: "XLSX",
    ext: ".xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: "spreadsheet",
  },

  // --- Archive ---
  { id: "zip", label: "ZIP", ext: ".zip", mime: "application/zip", category: "archive" },
]);

export function getFormat(id: string): FileFormat | undefined {
  return FORMATS.get(id);
}

/** Throw-on-miss accessor for use inside trusted code (converter definitions). */
export function format(id: string): FileFormat {
  const f = FORMATS.get(id);
  if (!f) throw new Error(`Unknown format id: ${id}`);
  return f;
}
