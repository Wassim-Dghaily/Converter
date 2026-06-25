# PROJECT_MEMORY.md

> Living memory for the file-converter project. We log **decisions, progress, bugs faced,
> and lessons learned** here as we go. Update it at the end of every work session.
> Last updated: 2026-06-24

---

## 1. Vision

Turn the old university Flask project into a **professional, modern, semi-commercial
file-conversion website** that can convert **all common file types** — video, audio,
image, PDF, Word, PowerPoint, Excel, and more.

- Clean, modern, fast, trustworthy brand. **No trace of the original uni project** (names,
  contacts, "Note To Doctor" comments, ©2024, hardcoded local paths, leftover TODOs).
- **Privacy as a selling point:** conversions run *in the browser* — "your files never
  leave your device." This is both our launch architecture and a marketing angle.
- **Build the base first, monetize later.** Freemium + ads is the long-term model, but we
  only keep the architecture *ready* for it now; we decide monetization details when we
  reach that phase.

### Product requirements (added 2026-06-25)
- **Per-conversion SEO landing pages.** Every category must have a dedicated page for each
  specific conversion (e.g. `/png-to-jpg`, `/mp4-to-mp3`) so users searching for that exact
  conversion land directly on it. Built as a generic, **registry-driven** system — pages
  auto-generate for every available conversion pair (see `src/app/[conversion]/page.tsx`).
- **Branded output filenames.** Converted files keep the original base name plus a brand
  mark: `originalname-yallaconvert.ext` (e.g. `vacation.png` → `vacation-yallaconvert.jpg`).
  Shared helper `brandedFilename()` — all converters must use it.
- **Category nav dropdowns (mega-menu).** Each main category (Image/Audio/Video/PDF/OCR) in the
  header opens a dropdown (hover on desktop, tap on mobile) listing the general category page
  plus every specific conversion **grouped by source format** (all "PNG to …" under a PNG title,
  etc.). Driven by `buildNavMenus()`; component `nav-menu.tsx`. Done 2026-06-25.

---

## 2. Confirmed Decisions (locked 2026-06-24)

| Area | Decision |
|------|----------|
| **Stack** | Full rewrite → **Next.js (App Router) + TypeScript + React**. Old Flask app is retired (kept only as reference for the future server-side phase). |
| **Where conversions run** | **Client-side (in-browser WASM)** for everything feasible now. Anything that genuinely needs native tools is deferred to a **post-launch server-side phase** (see §11). |
| **Monetization** | **Freemium + ads for non-subscribers** is the target. Build clean & free first. Keep ad slots + account/payment seams in the architecture, but *decide the details when we reach that phase.* |
| **Hosting** | **Netlify** (free or paid plan), custom **domain via GoDaddy or Netlify**. Client-side conversion fits Netlify perfectly (no heavy server needed at launch). |

### ✅ Brand name: **YallaConvert** (locked 2026-06-24)
- "Yalla" = "let's go / come on" — energetic, fast, friendly, memorable. Fits a quick converter.
- Tone: fast, casual-but-trustworthy, modern. Tagline ideas (TBD): "Yalla, convert it." / "Convert anything, yalla."

### Open decisions (not blocking — resolve in Phase 1)
- **Domain name** — check availability: `yallaconvert.com` (preferred), `.io`, `.app`, `yalla.convert…`. Secure before launch (GoDaddy/Netlify).
- **UI kit / styling**: leaning **Tailwind CSS + shadcn/ui** (modern, fast, themeable). Confirm in Phase 1.

---

## 3. Tech Stack (planned)

- **Framework:** Next.js (App Router), TypeScript, React.
- **Styling/UI:** Tailwind CSS + shadcn/ui (TBD), dark mode, responsive-first.
- **Conversion engines (client-side WASM):**
  - `@ffmpeg/ffmpeg` (ffmpeg.wasm) — video & audio.
  - `jSquash` (`@jsquash/*`) — modern image codecs (AVIF, WebP, JXL, PNG, JPEG).
  - `heic2any` — HEIC/HEIF (iPhone photos) → JPEG/PNG.
  - `pdf-lib` — create/modify/merge/split/rotate PDFs, images→PDF, forms.
  - `pdf.js` (`pdfjs-dist`) — render/preview, PDF→image, text extraction.
  - `tesseract.js` v6 — OCR (100+ languages).
  - `SheetJS` (xlsx) — spreadsheets/data (CSV/XLSX/ODS/JSON).
  - `mammoth.js` — DOCX → HTML/text (lossy, client-side).
  - `JSZip` (+ `libarchive.js` later) — archives.
- **Heavy work runs in Web Workers**; WASM cores are **lazy-loaded** only on first use.
- **Deploy:** Netlify, `netlify.toml` for headers/build.

---

## 4. Architecture Overview

- **Mostly client-rendered** conversion pages (work happens in the browser).
- **Conversion Engine Registry** — a central abstraction mapping each `from→to` format pair
  to a handler with a `runtime: 'client' | 'server'` flag and an async `convert()` fn.
  - UI is driven by this registry (which targets are offered, progress, validation).
  - **Why it matters:** when we add the server-side phase (§11), new conversions plug in
    with **zero UI changes** — just register server handlers.
- **Web Worker pool** for conversions → UI never freezes; progress events stream back.
- **Routing:**
  - Category hubs: `/convert/image`, `/convert/audio`, `/convert/video`, `/convert/pdf`,
    `/convert/document`, `/convert/spreadsheet`, `/ocr`, `/archive`.
  - SEO landing pages per popular pair: `/heic-to-jpg`, `/mp4-to-mp3`, `/png-to-webp`, … (Phase 8).
- **No file uploads to a server at launch** → privacy + cheap hosting.

---

## 5. File-Type / Conversion Catalog

Reference benchmark: CloudConvert supports ~212 formats across ~13 categories (Documents,
Images, Video, Audio, Spreadsheets, Slides, E-books, Archives, Vector, CAD, Fonts, Data,
Hash). We will **not** match that at launch; we cover what's reliably doable in-browser and
queue the rest for the server-side phase.

### ✅ Feasible CLIENT-SIDE now (launch scope)
| Category | Formats / operations | Engine |
|----------|----------------------|--------|
| **Image** | JPEG, PNG, WebP, AVIF, GIF (static), BMP, TIFF, ICO, JXL; **HEIC/HEIF→JPEG/PNG**; resize, compress, quality | jSquash, heic2any, Canvas |
| **Audio** | MP3, WAV, AAC/M4A, OGG (Vorbis/Opus), FLAC, ALAC, WMA; bitrate/sample-rate; **extract audio from video** | ffmpeg.wasm |
| **Video** | MP4(H.264/H.265), WebM(VP8/VP9), MKV, MOV(in), AVI(in), WMV; **video→GIF**, trim, compress, change resolution, extract frames | ffmpeg.wasm |
| **PDF** | merge, split, reorder/delete/rotate pages, compress, **images↔PDF**, **PDF→images**, text extraction, form fill | pdf-lib, pdf.js |
| **Spreadsheet/Data** | CSV ↔ XLSX ↔ ODS ↔ JSON (and TSV); basic XML/YAML | SheetJS |
| **Document (lossy)** | DOCX→HTML/Text, Markdown↔HTML, HTML→PDF | mammoth.js, jsPDF |
| **OCR** | image → text; image → **searchable PDF** (extra work); 100+ languages | tesseract.js |
| **Archive** | ZIP create/extract; (7z/RAR extract via libarchive.js — stretch) | JSZip |

### 🔜 Needs SERVER-SIDE (deferred → §11, post-launch)
- **High-fidelity Office ↔ PDF**: DOCX/PPTX/XLSX → PDF and **PDF → DOCX/PPTX/XLSX**.
  (Reliable client-side only via paid SDKs like Apryse/Nutrient — open-source in-browser is
  lossy/unreliable. Native path = **LibreOffice headless**.)
- **Large video files** beyond browser memory limits.
- **RAW camera images** (CR2, NEF, ARW…), **CAD** (DWG/DXF), **Fonts** (TTF/OTF/WOFF),
  **Vector** (AI/EPS/SVG↔), **E-books** (EPUB↔MOBI↔AZW3↔PDF via Calibre).
- Native tools for this phase: **ffmpeg, LibreOffice, ImageMagick, Ghostscript, Calibre,
  Tesseract** in a container.

---

## 6. Roadmap / Phases

Status legend: ☐ not started · ◐ in progress · ☑ done

### ☑ Phase 0 — De-brand & decommission the old project  *(done 2026-06-24)*
- ☑ Archived the original Flask app to `legacy/` (with `legacy/README.md` — reference only,
  not built/deployed) instead of carefully de-branding code we're replacing wholesale.
- ☑ Removed root `.idea` and IDE cruft; repo strategy = new Next.js app at root, old code in `legacy/`.
- Note: the uni identifiers (names, emails, "Note To Doctor", ©2024, `C:\Users\wassi\...`) now
  live only in `legacy/` and git history; **none appear in the new app**.

### ☑ Phase 1 — Foundation & architecture  *(done 2026-06-24)*
- ☑ Scaffolded **Next.js 14.2 (App Router) + TypeScript + Tailwind** (+ tailwindcss-animate),
  CSS-variable theming with dark mode, violet brand. Production build passes (12 routes).
- ☑ **YallaConvert** brand: logo/wordmark, header, footer, homepage (hero + category grid +
  how-it-works + privacy messaging). Site/brand config in `src/config/site.ts`.
- ☑ **Conversion Engine Registry** (`src/lib/engine`): types, format catalog, category meta,
  registry, and a `seed.ts` of honest "coming-soon" converters. UI is fully registry-driven.
- ☑ **Web Worker infra** (`src/lib/workers`) + `runConversion` proxy; reusable `Dropzone`,
  `ConverterShell` (progress/download wired), navigable `/convert/[category]` + `/ocr` routes.
- ☑ `netlify.toml` + dev headers; COOP/COEP intentionally NOT global (see §7) — deferred to audio/video phases.
- **Deferred to later (not blocking):** CI/preview deploys + shadcn/ui proper init can come
  with the Netlify connection in Phase 10 (or sooner if useful).

### ☑ Phase 2 — Image conversion (first shippable win)  *(done 2026-06-24)*
- ☑ Real in-browser image converter live ([src/lib/engine/converters/image.ts](src/lib/engine/converters/image.ts)),
  registered as `status: "available"`. The Image category now shows **Ready** automatically.
- ☑ Decode: jSquash (jpg/png/webp/avif), heic2any (HEIC), canvas/`createImageBitmap` (gif/bmp).
  Encode: jSquash → jpg/png/webp/avif. Options: **Quality** (lossy targets) + **Max dimension** resize.
- ☑ Generic, registry-driven **converter options schema** (`ConverterOption`) + UI controls in `ConverterShell`.
- ☑ All heavy libs loaded via dynamic `import()` inside `convert()` → never in the server bundle;
  jSquash codecs lazy-load on first use (convert pages stay ~102 kB First Load JS).
- ☑ Verified: `next build` green; **Node codec smoke test 9/9 pass** (png/jpeg/webp/avif encode+decode, resize).
- **Still coming-soon (this category):** gif/bmp/tiff/ico **output**, animated GIF, batch/multi-file.
- **Needs a real browser click-test** (can't headlessly): the canvas (gif/bmp) and HEIC paths.

### ☑ Phase 3 — Audio conversion  *(done 2026-06-25)*
- ☑ Live audio transcoder ([src/lib/engine/converters/audio.ts](src/lib/engine/converters/audio.ts))
  via **ffmpeg.wasm 0.12** (single-thread core). Formats: mp3/wav/aac/m4a/ogg/opus/flac interconvert.
  Bitrate option for lossy targets. Codec inferred from output extension; `-vn` drops any video stream.
- ☑ **Self-hosted single-thread core** in `public/ffmpeg/` (copied from node_modules by
  `scripts/copy-ffmpeg.mjs` via `predev`/`prebuild` hooks; gitignored, ~32 MB). No CDN dependency,
  no cross-origin isolation needed → ads/fonts stay unblocked (§7).
- ☑ Singleton loader (`ffmpeg-client.ts`) loads the core once per session; progress + a "stage"
  label surfaced in `ConverterShell` (shows the first-run 32 MB load).
- ☑ Build green (79 static pages; +42 audio conversion landing pages).
- **Extract-audio-from-video** stays under Video (Phase 4).
- ☑ **Browser-verified end-to-end** (2026-06-25) via headless Chromium: WAV→MP3 produced a real
  download. Required a worker-loading fix — see Bugs Faced (webpack + ffmpeg worker `import`).

### ☐ Phase 4 — Video conversion
- ffmpeg.wasm; video formats, video→GIF, video→audio, compress/trim/resolution;
  memory/size guardrails, clear progress + warnings for big files.

### ☐ Phase 5 — PDF & document tools
- pdf-lib + pdf.js (merge/split/compress/rotate/reorder, images↔PDF, PDF→images, extract text).
- DOCX→HTML/text (mammoth), Markdown/HTML, HTML→PDF.
- Spreadsheets/data via SheetJS (CSV/XLSX/ODS/JSON).

### ☐ Phase 6 — OCR
- tesseract.js image→text + searchable PDF; language picker; web-worker.

### ☐ Phase 7 — Archives & data formats
- ZIP create/extract (JSZip); stretch: 7z/RAR extract (libarchive.js); JSON/CSV/XML/YAML.

### ◐ Phase 8 — UX polish, SEO, performance, a11y, legal
- ☑ **Per-conversion SEO landing pages** built early (2026-06-25): registry-driven
  `/[conversion]` route, per-pair title/meta + canonical, breadcrumb, related links,
  "popular conversions" on category pages, and `sitemap.ts`. Live for Image (24 pages);
  future categories generate theirs automatically.
- ☐ Remaining: structured data (JSON-LD), richer per-pair copy, OG images, meta polish.
- Lazy WASM loading, bundle splitting, mobile perf, accessibility, error states.
- Privacy-first messaging; Privacy Policy, Terms, cookie/consent banner.

### ☐ Phase 9 — Freemium & monetization scaffolding *(decide details when we reach here)*
- Even-the-free-tier limits (file size, daily count, batch size, concurrency).
- Ad slots (e.g. AdSense) for non-subscribers + resolve the **COEP↔ads** conflict (§7).
- Accounts + Stripe + premium gating; analytics. **Details TBD at this phase.**

### ☐ Phase 10 — Launch
- Domain (GoDaddy/Netlify) + DNS + HTTPS, production env, monitoring + error tracking (Sentry),
  pre-launch QA checklist, cross-browser/mobile testing.

### ☐ Phase 11 — Server-side conversion service *(post-launch; details TBD at this phase)*
- Containerized backend with ffmpeg/LibreOffice/ImageMagick/Ghostscript/Calibre/Tesseract.
- High-fidelity Office↔PDF, PDF→Office, large video, RAW, CAD, fonts, vector, e-books.
- Job queue, temp storage + auto-delete, autoscaling, cost controls. Plugs into the
  Engine Registry (§4) with no front-end rewrite.

---

## 7. Key Technical Risks & Notes
- **COOP/COEP ↔ ads conflict (important).** Multi-threaded ffmpeg.wasm needs
  `SharedArrayBuffer`, which requires cross-origin isolation
  (`Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp`).
  But `require-corp` **breaks third-party cross-origin resources** — including **AdSense**,
  Google Fonts, embeds, analytics. Options: (a) ship **single-thread ffmpeg** (slower, no
  isolation needed) to keep ads simple; (b) use `COEP: credentialless` (Chromium); (c) apply
  isolation headers **only on converter routes**, keep ad pages non-isolated. **Decide in Phase 1/9.**
- **WASM bundle weight.** ffmpeg core is ~22–32 MB → mobile/4G users wait 10–20 s. Always
  lazy-load on first conversion, show a clear progress/spinner, and prefer the audio-only
  build (~3–5 MB) where possible.
- **Browser memory limits.** Big videos can crash a tab. Enforce size caps, warn early,
  process in workers, and clean up Blob URLs (`URL.revokeObjectURL`) to avoid mobile crashes.
- **Office→PDF fidelity.** Open-source client-side is lossy. Don't over-promise; route
  high-fidelity Office conversions to the server phase.
- **Freemium norms (benchmark):** competitors free tiers ~100 MB–1 GB/file, batch 5–8 files,
  ~15–25 conversions/day, ~5 min processing cap. Use as a starting point in Phase 9.

---

## 8. Progress Log
- **2026-06-24** — Repo cleanup: flattened `Project-Web-Final/` to root, removed duplicate
  root `.idea`. Read & understood the old Flask app. Locked the 4 founding decisions (§2).
  Researched client-side conversion feasibility. Wrote this file. *(Next: Phase 0.)*
- **2026-06-24** — Brand name chosen: **YallaConvert**.
- **2026-06-24** — **Phase 0 + Phase 1 complete.** Installed Node.js (v24) via winget — it
  wasn't on the machine. Archived Flask app to `legacy/`. Scaffolded the Next.js + TS +
  Tailwind app with YallaConvert branding, the Conversion Engine Registry, Web Worker infra,
  Dropzone/ConverterShell, and navigable category + OCR routes. `npm install` + `next build`
  both pass. *(Next: Phase 2 — implement real image conversion to make the first category live.)*
- **2026-06-24** — **Phase 2 complete.** Image conversion is live and in-browser via jSquash +
  heic2any (jpg/png/webp/avif + HEIC/gif/bmp input), with quality + resize options and a generic
  options system. Build green; codec smoke test 9/9. *(Next: Phase 3 — audio conversion via ffmpeg.wasm,
  which is where the Web Worker infra finally gets used in anger.)*
- **2026-06-25** — User tested Image in-browser: **works**. Added two product requirements
  (above) and built them: registry-driven per-conversion **SEO landing pages** (`/[conversion]`,
  24 image pages live + sitemap + internal links) and **branded output filenames**
  (`name-yallaconvert.ext`). Build green (37 static pages). *(Next: Phase 3 — audio.)*
- **2026-06-25** — **Phase 3 complete.** Audio conversion live via ffmpeg.wasm (self-hosted
  single-thread core, 7 formats, bitrate option). Build green, 79 static pages.
- **2026-06-25** — Added **category nav dropdown mega-menus** (grouped by source format).
- **2026-06-25** — **Fixed the audio "conversion failed" bug** (webpack breaking ffmpeg's worker
  `import`). Reproduced + verified the fix headlessly with Playwright/Chromium (WAV→MP3 download).
  Self-hosted ffmpeg worker via `classWorkerURL`. *(Next: Phase 4 — video, same ffmpeg core/loader,
  so this fix carries over.)*

## 9. Bugs Faced
- **2026-06-25 — Audio conversion fails in the browser (RESOLVED).** mp3 → any format returned
  "conversion failed." Root cause (found by reproducing headlessly with Playwright + Chromium):
  **webpack rewrites the dynamic `import(coreURL)` inside ffmpeg's bundled worker**, so the blob-URL
  core couldn't load → `Cannot find module 'blob:…'`. The core files themselves served fine (200).
  **Fix:** self-host ffmpeg's ESM worker + siblings to `public/ffmpeg/pkg/` (via copy-ffmpeg.mjs) and
  pass `classWorkerURL` so webpack never touches the worker and its `import()` stays native. Second
  gotcha: `classWorkerURL` must be an **absolute http URL** (`${location.origin}/ffmpeg/pkg/worker.js`),
  because ffmpeg resolves it with `new URL(classWorkerURL, import.meta.url)` and webpack replaces
  `import.meta.url` with a `file://` path (a root-relative path resolved to `file:///…` → blocked).
  **Verified end-to-end** (WAV→MP3 produced a real download in headless Chromium).

## 10. Lessons Learned
- The old app's UI **over-promised** (fake format menus, dead `convertTo()`, "batch
  processing" that didn't exist). Lesson: only surface conversions the engine actually
  supports → enforced via the registry's `status: "available" | "coming-soon"` flag.
- **Node.js wasn't installed** on this machine; installed Node v24 LTS via `winget`. New
  shells need the machine PATH refreshed (`$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ...`).
- **next@14.2.18 shipped with a security advisory** (2025-12-11). Pinned to `^14.2.35`
  (latest patched 14.2.x). Revisit a jump to Next 15 / React 19 once the conversion libs are in.
- **Custom Button needs Radix `Slot` for an `asChild` prop** — we don't have it yet, so use
  `buttonVariants({...})` on a `<Link>` for link-styled buttons.
- **jSquash gotchas (Phase 2):** `@jsquash/avif` `decode()` returns `ImageData | null` (must
  null-check; the others don't). Needs `experiments.asyncWebAssembly` in next.config. Its
  multi-thread AVIF worker triggers benign webpack warnings (`Critical dependency` / circular
  chunks) — silenced via `config.ignoreWarnings`; the single-thread fallback is used at runtime
  since we don't enable cross-origin isolation.
- **Codecs must be loaded via dynamic `import()` inside `convert()`**, not top-level imports —
  otherwise jSquash/heic2any get evaluated during SSR/build and break.
- **Testing WASM codecs in Node:** they `fetch` their `.wasm`, which Node can't do for `file://`.
  Pass the bytes manually: wasm-bindgen (png/resize) via `init(bytes)`; emscripten (jpeg/webp/avif)
  via `init({ wasmBinary: bytes })`, with separate enc/dec modules. Browser is unaffected (real fetch).
- **ffmpeg.wasm (Phase 3) notes:** (1) Its worker is always `type: "module"`, so it loads the
  **ESM** core via `import()` — self-host `@ffmpeg/core/dist/esm/*` and pass blob URLs from
  `toBlobURL`. (2) ffmpeg runs transcoding in its **own** internal worker, so converters call it
  from the main thread — our generic `conversion.worker.ts` is NOT needed for ffmpeg (kept for
  future CPU-bound JS work). (3) TS 5.6 types `ffmpeg.readFile()`'s `Uint8Array` as possibly
  `SharedArrayBuffer`-backed, which isn't a valid `BlobPart` — copy into a fresh `new Uint8Array(len)`
  before `new Blob([...])`. (4) Core is ~32 MB → first conversion shows a "Loading…" stage.

## 11. Process / Working Rules
- **The user handles ALL git actions** (commit/push). Claude makes file changes only and
  never runs git.

## 12. Research Sources
- ffmpeg.wasm — https://github.com/ffmpegwasm/ffmpeg.wasm · https://ffmpegwasm.netlify.app/
- jSquash image codecs / heic2any — https://github.com/alexcorvi/heic2any
- Office→PDF client-side (paid SDKs) — https://apryse.com/blog/convert-docx-to-pdf-javascript-v2 · https://www.nutrient.io/guides/web/conversion/office-to-pdf/
- pdf-lib — https://pdf-lib.js.org/ · PDF.js
- tesseract.js — https://tesseract.projectnaptha.com/ · https://github.com/naptha/tesseract.js
- COOP/COEP cross-origin isolation — https://web.dev/articles/coop-coep
- Format catalog benchmark (CloudConvert) — https://cloudconvert.com/
- Freemium limits benchmark — https://mconverter.eu/blog/top-file-converters/
