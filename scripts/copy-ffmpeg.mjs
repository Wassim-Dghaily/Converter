// Copies the self-hosted, single-thread ffmpeg.wasm core into public/ffmpeg/ so the app can
// load it from its own origin (no CDN dependency, no cross-origin-isolation needed).
// Runs automatically via the predev/prebuild npm hooks. public/ffmpeg/ is gitignored.
import { mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "ffmpeg");

function copyOne(src, dest) {
  if (!existsSync(src)) {
    console.error(`[copy-ffmpeg] missing ${src} — are @ffmpeg/core and @ffmpeg/ffmpeg installed?`);
    process.exit(1);
  }
  copyFileSync(src, dest);
  console.log(`[copy-ffmpeg] copied ${dest.replace(root, "").replace(/\\/g, "/")}`);
}

// 1. Single-thread core -> public/ffmpeg/
mkdirSync(outDir, { recursive: true });
const coreDir = join(root, "node_modules", "@ffmpeg", "core", "dist", "esm");
for (const f of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  copyOne(join(coreDir, f), join(outDir, f));
}

// 2. ffmpeg class worker (ESM) + its siblings -> public/ffmpeg/pkg/
// We self-host the worker and pass it via `classWorkerURL` so webpack never processes it.
// Otherwise webpack rewrites the worker's dynamic `import(coreURL)` and breaks blob-URL loading.
const pkgSrc = join(root, "node_modules", "@ffmpeg", "ffmpeg", "dist", "esm");
const pkgOut = join(outDir, "pkg");
mkdirSync(pkgOut, { recursive: true });
for (const f of readdirSync(pkgSrc).filter((n) => n.endsWith(".js"))) {
  copyOne(join(pkgSrc, f), join(pkgOut, f));
}

console.log("[copy-ffmpeg] done");
