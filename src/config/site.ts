/** Central brand + site configuration for YallaConvert. */
export const siteConfig = {
  name: "YallaConvert",
  tagline: "Convert anything. Yalla.",
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
    { label: "OCR", href: "/ocr" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
