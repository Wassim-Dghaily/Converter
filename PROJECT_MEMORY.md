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
- **Category nav dropdowns (mega-menu).** Each main category (Image/Audio/Video/PDF/Documents/
  Spreadsheets/OCR) in the header opens a dropdown (hover on desktop, tap on mobile) listing the general category page
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

### ☑ Phase 4 — Video conversion  *(done 2026-06-25)*
- ☑ Live video converter ([src/lib/engine/converters/video.ts](src/lib/engine/converters/video.ts))
  on the same ffmpeg.wasm core/loader as audio. One converter, three jobs by target:
  video→video (mp4/webm/mkv, optional downscale), video→**GIF** (fps + width), video→**audio**
  (mp3/wav/aac, "extract audio"). Inputs: mp4/webm/mkv/mov/avi.
- ☑ Added a generic **`select` option type** (used for the Resolution preset).
- ☑ Friendly error when extracting audio from a silent video ("no audio track to extract").
- ☑ **Browser-verified headlessly** (Playwright, canvas+MediaRecorder test clip): webm→mp4 ✅
  and webm→gif ✅ both downloaded; webm→mp3 correctly reported "no audio" (test clip was silent).
- **Limitations (logged §7):** single-thread ffmpeg.wasm is slow + memory-bound for large/long
  videos; webm (vp8/9) encoding especially slow. No trim UI yet. Needs real-file click-test for big videos.

### ◐ Phase 5 — PDF & document tools  *(5a done 2026-06-25; 5b pending)*
**Phase 5a — A→B conversions (no-worker libs) — DONE:**
- ☑ **Spreadsheets** ([spreadsheet.ts](src/lib/engine/converters/spreadsheet.ts)) — CSV ↔ XLSX ↔ JSON via SheetJS. Category LIVE.
- ☑ **Documents** ([document.ts](src/lib/engine/converters/document.ts)) — DOCX/MD/HTML → HTML or TXT
  (mammoth browser build + marked + DOMParser strip). Category LIVE. (DOCX→HTML is content-only; rich Office→PDF = §11.)
- ☑ **image→PDF** ([image-pdf.ts](src/lib/engine/converters/image-pdf.ts)) — JPG/PNG → 1-page PDF via pdf-lib. PDF category partially live.
- ☑ Fixed file-picker `accept` to use converter source formats (`registry.sourceFormatsFor`) so the
  PDF page accepts image inputs. Added shared `asBlob()` byte→Blob helper. Node smoke test 5/5.

**Phase 5b-1 — pdf.js conversions (fit A→B UI) — DONE (2026-06-25):**
- ☑ **PDF → Text** ([pdf-text.ts](src/lib/engine/converters/pdf-text.ts)) — pdf.js text layer extraction.
- ☑ **PDF → Images** ([pdf-image.ts](src/lib/engine/converters/pdf-image.ts)) — renders pages to PNG/JPG;
  single page → image, multi-page → **ZIP** (JSZip). Quality (scale) option.
- ☑ Self-hosted pdf.js worker (`public/pdf/`, via copy-assets.mjs); `pdf-client.ts` sets `workerSrc`
  to an absolute origin URL. **Headlessly verified** (Playwright): PDF→TXT extracted the right text;
  PDF→PNG produced a 2-page zip.

**Phase 5b-2 — PDF *tools* — DONE (2026-06-25):**
- ☑ New **tools** subsystem ([src/lib/tools/](src/lib/tools/)) — the multi-file/multi-output sibling of
  converters. A `Tool` takes N files → one output (zips internally). Registry + `/tools/[tool]` routes.
- ☑ **Merge PDF** (2–50 files → one, reorderable) and **Split PDF** (1 → zip of per-page PDFs), via
  pdf-lib + JSZip. New **`ToolShell`** UI (multi-file add, reorder ↑/↓, remove, progress, download).
- ☑ Tools surfaced on the category hub ("PDF tools" cards), in the nav dropdowns, and the sitemap.
- ☑ Node smoke test 3/3 (merge→6 pages; split→4 valid 1-page PDFs in a zip). Build green (129 pages).
- **Still later:** compress / rotate / reorder pages, ranges for split.

**Still later:** HTML→PDF, html→md (turndown), ODS, richer Markdown.

### ☑ Phase 6 — OCR  *(done 2026-06-25)*
- ☑ Live OCR converter ([src/lib/engine/converters/ocr.ts](src/lib/engine/converters/ocr.ts)) via
  **tesseract.js 7** — image (jpg/png/webp/bmp/tiff) → text, with a **language picker** (14 common
  languages from Tesseract's 100+). Progress streams from the recognizer; OCR category now LIVE.
- ☑ **Browser-verified headlessly** (Playwright): rendered "HELLO OCR 12345" to a PNG → OCR returned
  the exact text. Engine + lang data load from CDN (blob-URL worker → no webpack issue).
- **Deferred:** searchable-PDF output, OCR-on-PDF (render pages then OCR), self-hosting the
  tesseract engine/lang data (currently CDN — revisit in Phase 8).

### ☑ Phase 7 — Archives  *(done 2026-06-25)*
- ☑ **Create ZIP** (any files → one .zip) and **Extract ZIP** (.zip → file list) tools via JSZip.
  Archive category is **tools-only** (no registry converters): the hub page skips `ConverterShell`
  and shows the tools; CategoryGrid/nav treat "has tools" as available.
- ☑ Extended the tools model to **multi-output** (`ToolResult.files[]`): `ToolShell` shows a single
  download for one file, or a file list (per-file download + "Download all .zip") for many — Extract
  ZIP uses this. Refactored merge/split to the new shape. Node smoke 3/3; build green (136 pages).
- **Stretch (later):** 7z/RAR extract (libarchive.js); data formats (XML/YAML).

### ◐ Phase 8 — UX polish, SEO, performance, a11y, legal
- ☑ **Per-conversion SEO landing pages** (registry-driven `/[conversion]`, per-pair meta + canonical,
  breadcrumb, related links, sitemap). Auto-generated for every category.
- ☑ **Full design overhaul (2026-06-25)** — "designer workover" per top-converter-site research
  (Smallpdf/iLovePDF/TinyWow + 2026 trends). Verified light+dark via headless screenshots.
  - **Foundation:** refined token system (palette, layered shadows, gradients, `bg-mesh`, `glass`),
    **display font** (Space Grotesk) + Inter body, **dark/light theme toggle** (next-themes),
    **framer-motion** motion primitives (`Reveal`/`RevealGroup`/`Lift`), `prefers-reduced-motion` honored.
  - **Header:** scroll-aware frosted header, animated logo, theme toggle, mega-menu dropdowns.
  - **Homepage:** animated hero (mesh + floating format chips + kinetic headline), richer category
    cards (gradient icon tiles, hover lift), "How it works", "Why" features, **FAQ accordion**, CTA band.
  - **Converter/Tool/Dropzone:** polished animated dropzone (drag glow, file card w/ format badge),
    gradient+shimmer progress, spring **success check**, gradient source pill + styled target select.
  - **Details:** upgraded `Button` (gradient/variants/active-scale), **branded 404**, **favicon**
    (`app/icon.svg`), **JSON-LD** (WebSite + SoftwareApplication + FAQPage), display-font page headers,
    **Privacy + Terms** pages. Build green (139 pages).
- ☐ Remaining (later): OG images, richer per-pair body copy, cookie-consent banner (with ads), a11y audit pass,
  optional self-hosting of OCR/ffmpeg CDN assets, performance audit.

### ◐ Phase 9 — Monetization  *(ads + consent done 2026-06-25; subscriptions deferred)*
**Decision:** ads + consent only for now — user has no Stripe/business tax ID yet, so accounts &
subscriptions are **deferred to post-launch**.
- ☑ **Env-gated, dormant monetization** — ships off by default; lights up when you set env vars
  (`.env.example`): `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. No external
  accounts needed to deploy.
- ☑ **Consent system** — `ConsentProvider` + `useConsent` (localStorage), `CookieBanner` (animated,
  Accept/Decline, links to Privacy). Banner only shows when ads/analytics are configured (or in dev).
- ☑ **`<AdSlot>`** component — renders real AdSense `<ins>` after consent when configured; a labelled
  dashed placeholder in dev; nothing in production when unconfigured (no empty boxes). Placed below
  the shell on conversion / category / tool / OCR pages.
- ☑ **`<SiteScripts>`** — loads AdSense + Plausible via `next/script` only after consent + only when
  configured. Privacy policy updated for cookies/ads. (No COEP set → AdSense unaffected, §7.)
- **Deferred to post-launch:** accounts, Stripe subscriptions, Pro gating, server-enforced free-tier limits.

### ☑ Phase 10 — Launch  *(LIVE 2026-06-27)*
- ☑ **Static export** (`output: "export"` → `out/`): pure HTML/JS, no Next runtime / Functions / Blobs.
  `netlify.toml`: publish `out`, dropped `@netlify/plugin-nextjs`, cache headers, `NODE_VERSION=20`.
- ☑ **Deployed via Netlify CLI** (collaborator, not repo owner → no git-connect): `netlify deploy --prod --dir=out`.
- ☑ **Custom domain LIVE: https://yallaconvert.com** (bought on Porkbun, + `.net` forwarding) with auto
  Let's Encrypt HTTPS via Netlify. `siteConfig.url` already pointed there.
- ☑ **AdSense live & in review** — Auto Ads ON, ads.txt **Authorized**, GDPR CMP (Google 3-choice) enabled.
  Publisher id `ca-pub-6688641591870090`. Approval status "Getting ready" (Google review pending). See `ADS.md`.
- ☐ Remaining: wait for AdSense approval; live cross-browser/mobile QA (ffmpeg/audio/video, pdf, OCR over
  HTTPS); optional error monitoring; future auto-deploys if owner connects the repo.

### ☐ Phase 11 — Server-side conversion service *(post-launch; details TBD at this phase)*
- Containerized backend with ffmpeg/LibreOffice/ImageMagick/Ghostscript/Calibre/Tesseract.
- High-fidelity Office↔PDF, PDF→Office, large video, RAW, CAD, fonts, vector, e-books.
- Job queue, temp storage + auto-delete, autoscaling, cost controls. Plugs into the
  Engine Registry (§4) with no front-end rewrite.

### ☐ Phase 12 — Mobile & responsive full pass *(future; keep the existing visual style)*
A dedicated mobile QA + polish pass — **no redesign**, just make everything sit right on small screens
and stop the homepage feeling like an "endless scroll of info."
- **Audit at 360–414px** (light + dark) every surface: homepage (hero, category grid, how-it-works,
  the 6 "Why" cards, FAQ, CTA), converter/tool/conversion pages, the nav dropdown + mobile menu,
  the dropzone, and the footer. Catch any grid/cards that misalign, overflow, or shrink to loose boxes.
- **Apply 2026 mobile best practices** (researched): mobile-first / single-column base (≥360px);
  **≥44×44px tap targets**; fluid type via `clamp()`/`rem`; cut above-the-fold clutter; keep primary
  actions reachable in the **bottom-third thumb zone**; tighten section vertical padding on mobile; and
  consider **2-column grids on mobile** (category cards, "Why" cards) to shorten the scroll.
- **Verify** with headless screenshots at phone widths before/after.
- Sources: web.dev / 2026 responsive-design guides (alfdesigngroup, we-interactive, americaneagle).

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
- **2026-06-25** — Added **"Convert another file"** + target-change refresh to the converter UI.
- **2026-06-25** — **Phase 4 complete.** Video conversion live (transcode + GIF + extract-audio)
  via ffmpeg.wasm; added generic `select` option (Resolution). Headlessly verified webm→mp4 and
  webm→gif. Build green. *(Next: Phase 5 — PDF & document tools, or polish.)*
- **2026-06-25** — **Phase 5a complete.** Spreadsheets (CSV/XLSX/JSON), Documents (DOCX/MD/HTML→HTML/TXT),
  and image→PDF now live (SheetJS, mammoth, marked, pdf-lib — all no-worker). Node smoke test 5/5,
  build green. New SEO pages auto-generated (csv-to-xlsx, docx-to-html, jpg-to-pdf, …).
  *(Next: Phase 6 — OCR (tesseract.js); or Phase 5b — PDF tools UI.)*
- **2026-06-25** — **Phase 5b-1 complete.** PDF→Text and PDF→Images (PNG/JPG, multi-page→zip) live
  via pdf.js 6 (self-hosted worker) + JSZip. Headlessly verified both. Renamed the asset-copy script
  to `copy-assets.mjs` (ffmpeg + pdf worker). 127 static pages. *(Next: Phase 5b-2 — Merge/Split tools UI.)*
- **2026-06-25** — **Phase 5b-2 complete.** PDF Merge + Split tools live via a new `tools` subsystem
  + `ToolShell` (multi-file). Node smoke 3/3, build green (129 pages). Phase 5 fully done.
  *(Next: Phase 6 — OCR (tesseract.js).)*
- **2026-06-25** — **Phase 6 complete.** OCR live via tesseract.js 7 (image→text, 14-language picker).
  Headlessly verified (recognized "HELLO OCR 12345" exactly). Build green, 134 static pages.
  *(Next: Phase 7 — Archives (zip/unzip); or Phase 8 — UX/SEO/perf/legal polish.)*
- **2026-06-25** — **Phase 7 complete.** Create ZIP + Extract ZIP tools (JSZip); tools model now
  supports multi-output (file list + download-all). Archives in nav. Build green, 136 pages.
  **All conversion/tool categories are now live.** *(Next: Phase 8 — polish: legal pages, SEO depth,
  perf, a11y, optional self-hosting of OCR/ffmpeg assets.)*
- **2026-06-25** — **Phase 8 design overhaul done.** Full visual redesign: design tokens, Space Grotesk
  display font, dark/light theme toggle (next-themes), framer-motion animations (hero, scroll reveals,
  hover, success), reworked homepage (+FAQ, Why, CTA), polished dropzone/converter/tool shells, branded
  404 + favicon, JSON-LD, Privacy/Terms. Verified light+dark headlessly. Build green (139 pages).
  Added deps: framer-motion, next-themes. *(Next: Phase 9 — freemium/monetization, or further polish.)*
- **2026-06-25** — Light theme set as default; hero "Start converting" now scrolls to the tools grid.
- **2026-06-25** — **Phase 9 (ads + consent) done.** Env-gated dormant ads/analytics + consent banner +
  `<AdSlot>` placements; subscriptions deferred post-launch (no Stripe/tax ID yet). Build green.
  *(Next: Phase 10 — launch prep: domain, deploy to Netlify, QA.)*
- **2026-06-27** — **🚀 LAUNCHED.** Static export → Netlify CLI deploy → custom domain
  **https://yallaconvert.com** (Porkbun, HTTPS). AdSense wired the right way (script + ads.txt
  Authorized + Auto Ads + Google CMP), now in Google review. Wrote `ADS.md`. YallaConvert is live.

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
- **Deploy as a static export (Phase 10).** Local `netlify deploy --build` of a Next.js site failed at
  the Blobs-upload step (`MissingBlobsEnvironmentError`) because the Next runtime wants Netlify Blobs.
  Fix: since the app is 100% static (every page SSG, all conversions client-side, no API/SSR), set
  `output: "export"`, publish the `out/` folder, and drop `@netlify/plugin-nextjs`. No functions/blobs,
  simpler + cheaper. Deploy with `netlify deploy --prod --dir=out`. (No `next/image` used, so export is clean.)
- **RSC: don't pass functions as client-component props (Phase 5b-2).** Passing a whole `Tool`
  (which has a `run()` method) from a Server Component to the client `ToolShell` made Next's static
  generation hang/timeout (it can't serialize functions). Fix: pass only the `slug` string and look
  the tool up from the client-side registry inside the component (same pattern `ConverterShell` uses
  with `categoryId`). General rule: client components get serializable props only.
- **pdf.js v6 API (Phase 5b):** `page.render()` takes `{ canvas, viewport }` (not `canvasContext`);
  destroy the document via `loadingTask.destroy()` (no `doc.destroy()`). Worker is a plain script
  (no dynamic blob import), so self-hosting + `GlobalWorkerOptions.workerSrc = ${origin}/pdf/...`
  works without the ffmpeg-style webpack pain. Format-id slugs: text is `txt`, so the SEO route is
  `/pdf-to-txt` (not `/pdf-to-text`).
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
