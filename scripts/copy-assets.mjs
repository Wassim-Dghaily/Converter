// Copies self-hosted browser assets out of node_modules into public/ so the app loads them
// from its own origin (no CDN, and for ffmpeg no cross-origin isolation needed).
// Runs via the predev/prebuild npm hooks. The copied folders are gitignored.
import { mkdirSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function copyOne(src, dest) {
  if (!existsSync(src)) {
    console.error(`[copy-assets] missing ${src} — is the dependency installed?`);
    process.exit(1);
  }
  copyFileSync(src, dest);
  console.log(`[copy-assets] copied ${dest.replace(root, "").replace(/\\/g, "/")}`);
}

// 1. ffmpeg.wasm single-thread core -> public/ffmpeg/
const ffmpegOut = join(root, "public", "ffmpeg");
mkdirSync(ffmpegOut, { recursive: true });
const coreDir = join(root, "node_modules", "@ffmpeg", "core", "dist", "esm");
for (const f of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) copyOne(join(coreDir, f), join(ffmpegOut, f));

// 2. ffmpeg class worker (ESM) + siblings -> public/ffmpeg/pkg/ (loaded via classWorkerURL so
//    webpack never processes the worker — see PROJECT_MEMORY Bugs Faced).
const pkgSrc = join(root, "node_modules", "@ffmpeg", "ffmpeg", "dist", "esm");
const pkgOut = join(ffmpegOut, "pkg");
mkdirSync(pkgOut, { recursive: true });
for (const f of readdirSync(pkgSrc).filter((n) => n.endsWith(".js"))) copyOne(join(pkgSrc, f), join(pkgOut, f));

// 3. pdf.js worker -> public/pdf/
const pdfOut = join(root, "public", "pdf");
mkdirSync(pdfOut, { recursive: true });
copyOne(
  join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"),
  join(pdfOut, "pdf.worker.min.mjs"),
);

console.log("[copy-assets] done");
