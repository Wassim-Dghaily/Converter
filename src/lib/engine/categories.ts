import type { CategoryId, CategoryMeta } from "./types";

/**
 * Display metadata for each conversion category. Drives the homepage cards and category
 * hub pages. `icon` is a lucide-react icon name resolved in the UI layer.
 */
export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  image: {
    id: "image",
    label: "Image",
    blurb: "JPG, PNG, WebP, AVIF, HEIC and more. Resize and compress too.",
    href: "/convert/image",
    icon: "Image",
  },
  audio: {
    id: "audio",
    label: "Audio",
    blurb: "MP3, WAV, AAC, FLAC, OGG. Extract audio from video.",
    href: "/convert/audio",
    icon: "Music",
  },
  video: {
    id: "video",
    label: "Video",
    blurb: "MP4, WebM, MKV, MOV. Trim, compress, or turn clips into GIFs.",
    href: "/convert/video",
    icon: "Video",
  },
  pdf: {
    id: "pdf",
    label: "PDF",
    blurb: "Merge, split, compress, and convert images to and from PDF.",
    href: "/convert/pdf",
    icon: "FileText",
  },
  document: {
    id: "document",
    label: "Documents",
    blurb: "Word, Markdown, HTML and plain text conversions.",
    href: "/convert/document",
    icon: "FileType",
  },
  spreadsheet: {
    id: "spreadsheet",
    label: "Spreadsheets",
    blurb: "CSV, XLSX and JSON — switch between data formats.",
    href: "/convert/spreadsheet",
    icon: "Table",
  },
  archive: {
    id: "archive",
    label: "Archives",
    blurb: "Zip files up or extract them, right in your browser.",
    href: "/convert/archive",
    icon: "FolderArchive",
  },
  ocr: {
    id: "ocr",
    label: "OCR",
    blurb: "Pull editable text out of images and scans in 100+ languages.",
    href: "/ocr",
    icon: "ScanText",
  },
};

/** Ordered list for menus and the homepage grid. */
export const CATEGORY_ORDER: CategoryId[] = [
  "image",
  "audio",
  "video",
  "pdf",
  "document",
  "spreadsheet",
  "ocr",
  "archive",
];

export const categoryList = (): CategoryMeta[] =>
  CATEGORY_ORDER.map((id) => CATEGORIES[id]);
