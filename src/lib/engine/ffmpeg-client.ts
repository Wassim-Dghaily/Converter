import type { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * Shared ffmpeg.wasm instance (browser only).
 *
 * We self-host the single-thread core under /public/ffmpeg (copied from node_modules by
 * scripts/copy-ffmpeg.mjs). The single-thread core needs no SharedArrayBuffer, so we avoid
 * cross-origin isolation (COOP/COEP) and keep third-party scripts/ads working — see
 * PROJECT_MEMORY.md §7.
 *
 * ffmpeg.wasm runs the actual transcoding in its own internal Web Worker, so callers can
 * invoke it from the main thread without blocking the UI. The 32 MB core loads once and is
 * cached for the rest of the session.
 */
let ffmpegPromise: Promise<FFmpeg> | null = null;

export function loadFFmpeg(): Promise<FFmpeg> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("ffmpeg.wasm is only available in the browser."));
  }
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const base = "/ffmpeg";
      // Preflight: fetch the core ourselves so a missing/404 file gives a precise error
      // instead of a silent failure deep inside ffmpeg's worker.
      const coreURL = await toLocalBlobURL(`${base}/ffmpeg-core.js`, "text/javascript", "core JS");
      const wasmURL = await toLocalBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm", "core WASM");

      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = new FFmpeg();

      // classWorkerURL points at the self-hosted ffmpeg worker (public/ffmpeg/pkg/worker.js).
      // This keeps the worker out of webpack's hands so its dynamic `import(coreURL)` stays a
      // native import — webpack otherwise rewrites it and the blob-URL core fails to load.
      // It MUST be an absolute http URL: ffmpeg builds the worker URL with
      // `new URL(classWorkerURL, import.meta.url)`, and webpack replaces import.meta.url with a
      // file:// path, so a root-relative path would resolve to file:///… and be blocked.
      const classWorkerURL = `${window.location.origin}/ffmpeg/pkg/worker.js`;

      try {
        await withTimeout(
          ffmpeg.load({ coreURL, wasmURL, classWorkerURL }),
          60_000,
          "ffmpeg.load()",
        );
      } catch (err) {
        throw new Error(`ffmpeg core failed to initialize: ${describe(err)}`);
      }
      return ffmpeg;
    })().catch((err) => {
      // Reset so a later attempt can retry after a transient load failure.
      ffmpegPromise = null;
      throw err;
    });
  }
  return ffmpegPromise;
}

/** Fetch a same-origin asset and turn it into a blob URL, with a clear error on failure. */
async function toLocalBlobURL(url: string, type: string, label: string): Promise<string> {
  let resp: Response;
  try {
    resp = await fetch(url);
  } catch (err) {
    throw new Error(`Network error fetching ffmpeg ${label} (${url}): ${describe(err)}`);
  }
  if (!resp.ok) {
    throw new Error(
      `ffmpeg ${label} not found at ${url} (HTTP ${resp.status}). ` +
        `Restart the dev server with "npm run dev" so the core is copied into public/ffmpeg/.`,
    );
  }
  const buf = await resp.arrayBuffer();
  if (buf.byteLength < 1024) {
    throw new Error(`ffmpeg ${label} at ${url} looks invalid (${buf.byteLength} bytes).`);
  }
  return URL.createObjectURL(new Blob([buf], { type }));
}

function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${what} timed out after ${ms / 1000}s`)), ms),
    ),
  ]);
}

function describe(err: unknown): string {
  if (err instanceof Error) return err.message || err.name || "unknown error";
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/** True once the core has been loaded at least once this session. */
export function isFFmpegLoaded(): boolean {
  return ffmpegPromise !== null;
}
