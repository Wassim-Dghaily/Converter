import type { ConversionInput, ConversionResult } from "./types";
import type { WorkerRequest, WorkerResponse } from "@/lib/workers/protocol";

let jobCounter = 0;

/**
 * Run a conversion on a dedicated Web Worker. This is the bridge a real (available)
 * converter's `convert()` calls. Heavy WASM stays off the main thread, progress streams
 * back, and the worker is terminated when the job finishes or is aborted.
 *
 * Only callable in the browser.
 */
export function runConversion(
  converterId: string,
  input: ConversionInput,
): Promise<ConversionResult> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("runConversion can only run in the browser."));
  }

  return new Promise<ConversionResult>((resolve, reject) => {
    const jobId = `job-${++jobCounter}`;
    const worker = new Worker(
      new URL("../workers/conversion.worker.ts", import.meta.url),
    );

    const cleanup = () => {
      worker.terminate();
      input.signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Conversion aborted", "AbortError"));
    };

    if (input.signal?.aborted) return onAbort();
    input.signal?.addEventListener("abort", onAbort);

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.jobId !== jobId) return;
      switch (msg.type) {
        case "progress":
          input.onProgress?.(msg.progress);
          break;
        case "result":
          cleanup();
          resolve({ blob: msg.blob, filename: msg.filename });
          break;
        case "error":
          cleanup();
          reject(new Error(msg.message));
          break;
      }
    };

    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || "Worker error"));
    };

    const request: WorkerRequest = {
      type: "convert",
      jobId,
      converterId,
      file: input.file,
      fromId: input.from.id,
      toId: input.to.id,
      options: input.options,
    };
    worker.postMessage(request);
  });
}
