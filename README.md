# YallaConvert

> Convert anything. Yalla. — fast, free, and **private** file conversion that runs entirely
> in your browser. Your files never leave your device.

A Next.js app that converts images, audio, video, PDFs, documents and more, using in-browser
WebAssembly engines. See [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) for the full roadmap,
decisions, and progress log.

## Tech stack

- **Next.js (App Router) + TypeScript + React**
- **Tailwind CSS** for styling (CSS-variable theming, dark mode ready)
- **Web Workers + WebAssembly** for client-side conversion (added per phase)
- Deployed on **Netlify**

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run lint     # eslint
npm run typecheck
```

## Architecture

The heart of the app is the **Conversion Engine** in [`src/lib/engine`](./src/lib/engine):

- `formats.ts` — catalog of file formats (single source of truth).
- `categories.ts` — display metadata for each conversion category.
- `types.ts` — `Converter`, `FileFormat`, conversion I/O types.
- `registry.ts` — the registry the UI queries (it never imports converters directly).
- `seed.ts` — registers converters. Today they are `coming-soon` placeholders; each phase
  swaps in a real `available` converter with a `convert()` implementation.
- `run-conversion.ts` — runs a converter on a Web Worker (off the main thread).

Because the UI is driven entirely by the registry, adding a new conversion — or moving one
to a future **server-side** runtime — requires no UI changes. See `PROJECT_MEMORY.md` §4.

## Project layout

```
src/
  app/              # routes (home, /convert/[category], /ocr)
  components/       # UI: header, footer, dropzone, converter shell, …
  config/           # site/brand config
  lib/
    engine/         # the Conversion Engine (registry, formats, categories)
    workers/        # conversion Web Worker + message protocol
legacy/             # original Flask prototype, archived for reference only
```
