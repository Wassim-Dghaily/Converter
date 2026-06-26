/** Shared FAQ content — rendered in the homepage accordion and as FAQPage structured data. */
export const FAQS = [
  {
    q: "Is YallaConvert really free?",
    a: "Yes. Every tool is free to use with no watermarks and no account needed. Because conversions run in your browser, we don't pay for server processing — so we can keep it free.",
  },
  {
    q: "Are my files uploaded anywhere?",
    a: "No. Your files are processed locally on your device and never sent to a server. That's also why it's fast — there's no upload or download round-trip.",
  },
  {
    q: "What can I convert?",
    a: "Images (JPG, PNG, WebP, AVIF, HEIC…), audio, video, PDFs, Word/Markdown/HTML documents, spreadsheets (CSV/XLSX/JSON), archives (ZIP), plus OCR to pull text out of images.",
  },
  {
    q: "Is there a file size limit?",
    a: "There's no hard server limit since everything runs locally. Very large videos can be slow or memory-heavy because they're processed by your own device — but most files convert in seconds.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. YallaConvert runs in any modern browser on desktop or mobile. Nothing to install, nothing to sign up for.",
  },
] as const;
