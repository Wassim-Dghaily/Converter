/** Central brand + site configuration for YallaConvert. */
export const siteConfig = {
  name: "YallaConvert",
  /** On-site motto (hero, etc.) — stays as the brand voice. */
  tagline: "Convert anything. Yalla.",
  /** Descriptive, keyword-rich title used for the homepage <title> + OG (search results). */
  seoTitle: "YallaConvert – Free Online File Converter (PDF, JPG, PNG, MP4, MP3 & More)",
  description:
    "Fast, free, and private file conversion that runs right in your browser. " +
    "Convert images, audio, video, PDFs and documents — your files never leave your device.",
  url: "https://yallaconvert.com",
  // Primary navigation, driven by conversion categories.
  nav: [
    { label: "Image", href: "/convert/image" },
    { label: "Audio", href: "/convert/audio" },
    { label: "Video", href: "/convert/video" },
    { label: "PDF", href: "/convert/pdf" },
    { label: "Documents", href: "/convert/document" },
    { label: "Spreadsheets", href: "/convert/spreadsheet" },
    { label: "Archives", href: "/convert/archive" },
    { label: "OCR", href: "/ocr" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
