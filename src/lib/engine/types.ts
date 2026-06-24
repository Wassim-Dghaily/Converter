/**
 * Conversion Engine — core types.
 *
 * This is the architectural centerpiece of YallaConvert. Every conversion the app can
 * perform is described by a `Converter` registered in the registry. The UI is driven
 * entirely by this data: which categories exist, which source formats are accepted, and
 * which target formats are offered for a given input.
 *
 * Crucially, each converter declares a `runtime` ("client" | "server"). Today everything
 * runs `client`-side (in-browser WASM). When we add the server-side service (PROJECT_MEMORY
 * §11) for things the browser can't do, we register `server` converters here — and the UI
 * needs **no changes**. Converters that aren't built yet are registered with
 * `status: "coming-soon"` so the UI can show them transparently instead of over-promising.
 */

export type CategoryId =
  | "image"
  | "audio"
  | "video"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "archive"
  | "ocr";

/** Where a conversion executes. */
export type Runtime = "client" | "server";

/** Lifecycle of a converter, so the UI can be honest about what works today. */
export type ConverterStatus = "available" | "coming-soon";

/** A concrete file format (e.g. PNG). */
export interface FileFormat {
  /** Stable lowercase id, e.g. "png". */
  id: string;
  /** Display label, e.g. "PNG". */
  label: string;
  /** Canonical file extension including the dot, e.g. ".png". */
  ext: string;
  /** Primary MIME type, e.g. "image/png". */
  mime: string;
  category: CategoryId;
}

export interface ConversionProgress {
  /** 0..1 completion ratio. */
  ratio: number;
  /** Optional human-readable stage label, e.g. "Decoding". */
  stage?: string;
}

export interface ConversionInput {
  file: File;
  from: FileFormat;
  to: FileFormat;
  /** Converter-specific options (quality, bitrate, resolution, ...). */
  options?: Record<string, unknown>;
  onProgress?: (progress: ConversionProgress) => void;
  signal?: AbortSignal;
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
}

/**
 * A unit of conversion capability. A converter may support several source and target
 * formats (e.g. the image converter handles many raster formats at once).
 */
export interface Converter {
  /** Unique id, e.g. "image-raster". */
  id: string;
  category: CategoryId;
  runtime: Runtime;
  status: ConverterStatus;
  /** Format ids this converter accepts as input. */
  from: string[];
  /** Format ids this converter can produce. */
  to: string[];
  /**
   * Perform the conversion. Only required when `status === "available"`.
   * `coming-soon` converters may omit it (the registry guards against calling it).
   */
  convert?: (input: ConversionInput) => Promise<ConversionResult>;
}

/** Metadata used to render a category hub/landing card. */
export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Short marketing blurb. */
  blurb: string;
  /** Route to the category hub. */
  href: string;
  /** lucide-react icon name used by the UI layer. */
  icon: string;
}
