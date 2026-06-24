/// <reference lib="webworker" />
/**
 * Conversion worker — runs heavy WASM conversions off the main thread.
 *
 * Phase 1: the implementation map is empty; the worker replies with a clear error for any
 * job. Each later phase adds an entry to `IMPLEMENTATIONS` (e.g. an ffmpeg.wasm transcoder
 * keyed by "audio-transcode"). The UI never calls this until a converter is marked
 * "available", so an empty map is safe.
 */
import type { WorkerRequest, WorkerResponse } from "./protocol";
import type { ConversionProgress } from "@/lib/engine/types";

export interface WorkerJob {
  file: File;
  fromId: string;
  toId: string;
  options?: Record<string, unknown>;
  onProgress: (p: ConversionProgress) => void;
}

export type WorkerImplementation = (
  job: WorkerJob,
) => Promise<{ blob: Blob; filename: string }>;

/** converterId -> implementation. Populated as phases ship. */
const IMPLEMENTATIONS: Record<string, WorkerImplementation> = {};

const post = (message: WorkerResponse) => (self as DedicatedWorkerGlobalScope).postMessage(message);

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  if (req.type !== "convert") return;

  const impl = IMPLEMENTATIONS[req.converterId];
  if (!impl) {
    post({
      type: "error",
      jobId: req.jobId,
      message: `Converter "${req.converterId}" is not implemented yet.`,
    });
    return;
  }

  try {
    const { blob, filename } = await impl({
      file: req.file,
      fromId: req.fromId,
      toId: req.toId,
      options: req.options,
      onProgress: (progress) => post({ type: "progress", jobId: req.jobId, progress }),
    });
    post({ type: "result", jobId: req.jobId, blob, filename });
  } catch (err) {
    post({
      type: "error",
      jobId: req.jobId,
      message: err instanceof Error ? err.message : "Conversion failed.",
    });
  }
});
