import type {
  CategoryId,
  ConversionProgress,
  ConversionResult,
  ConverterOption,
} from "@/lib/engine";

/**
 * A "tool" is the multi-file / multi-output sibling of a Converter. Where a Converter is a
 * single-file format A→B transform driven by the format registry, a Tool takes one *or more*
 * input files and produces a single output (zipping internally when it makes many files).
 * Tools power things that don't fit the A→B model: merge, split, etc.
 */
export interface ToolInput {
  files: File[];
  options?: Record<string, unknown>;
  onProgress?: (progress: ConversionProgress) => void;
}

export interface Tool {
  id: string;
  /** URL slug under /tools, e.g. "merge-pdf". */
  slug: string;
  category: CategoryId;
  title: string;
  description: string;
  /** Accepted source format ids (used for the file picker filter). */
  accept: string[];
  minFiles: number;
  maxFiles: number;
  /** Verb for the action button, e.g. "Merge", "Split". */
  action: string;
  options?: ConverterOption[];
  run(input: ToolInput): Promise<ConversionResult>;
}
