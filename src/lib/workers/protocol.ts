/** Message protocol shared between the main thread and the conversion worker. */
import type { ConversionProgress } from "@/lib/engine/types";

export interface WorkerRequest {
  type: "convert";
  /** Correlation id so one worker can multiplex jobs. */
  jobId: string;
  /** Which worker-side implementation to run. */
  converterId: string;
  file: File;
  fromId: string;
  toId: string;
  options?: Record<string, unknown>;
}

export type WorkerResponse =
  | { type: "progress"; jobId: string; progress: ConversionProgress }
  | { type: "result"; jobId: string; blob: Blob; filename: string }
  | { type: "error"; jobId: string; message: string };
