import type { CategoryId, Converter, FileFormat } from "./types";
import { getFormat } from "./formats";

/** A concrete from→to conversion, used for SEO landing pages, links, and the sitemap. */
export interface ConversionPair {
  from: FileFormat;
  to: FileFormat;
  category: CategoryId;
  /** URL slug, e.g. "png-to-jpg". */
  slug: string;
  status: Converter["status"];
}

export const pairSlug = (fromId: string, toId: string) => `${fromId}-to-${toId}`;

/**
 * The conversion registry. Converters register themselves here (see `seed.ts`). The UI and
 * the conversion runner query this registry; they never import converters directly. This
 * indirection is what lets us add server-side converters later without touching the UI.
 */
class ConverterRegistry {
  private converters = new Map<string, Converter>();

  register(converter: Converter): void {
    if (this.converters.has(converter.id)) {
      throw new Error(`Converter already registered: ${converter.id}`);
    }
    this.converters.set(converter.id, converter);
  }

  all(): Converter[] {
    return [...this.converters.values()];
  }

  forCategory(category: CategoryId): Converter[] {
    return this.all().filter((c) => c.category === category);
  }

  /** True if at least one *available* converter exists for the category. */
  isCategoryAvailable(category: CategoryId): boolean {
    return this.forCategory(category).some((c) => c.status === "available");
  }

  /**
   * All source formats accepted by converters in a category — including cross-category inputs
   * (e.g. the PDF category accepts JPG/PNG for image→PDF). Used to build the file picker's
   * `accept` filter so users can drop those files.
   */
  sourceFormatsFor(category: CategoryId): FileFormat[] {
    const ids = new Set<string>();
    for (const c of this.forCategory(category)) c.from.forEach((f) => ids.add(f));
    return [...ids].map((id) => getFormat(id)).filter((f): f is FileFormat => Boolean(f));
  }

  /**
   * Find the converter that turns `fromId` into `toId`. Prefers an available client
   * converter, then available server, then anything (coming-soon) so callers can show
   * accurate status.
   */
  find(fromId: string, toId: string): Converter | undefined {
    const matches = this.all().filter(
      (c) => c.from.includes(fromId) && c.to.includes(toId),
    );
    return (
      matches.find((c) => c.status === "available" && c.runtime === "client") ??
      matches.find((c) => c.status === "available") ??
      matches[0]
    );
  }

  /**
   * Distinct target formats reachable from a given source format id, optionally limited to
   * converters in a single category (so e.g. the Image page only offers image targets).
   */
  targetsFor(fromId: string, category?: CategoryId): FileFormat[] {
    const ids = new Set<string>();
    for (const c of this.all()) {
      if (category && c.category !== category) continue;
      if (c.from.includes(fromId)) c.to.forEach((t) => ids.add(t));
    }
    return [...ids]
      .map((id) => getFormat(id))
      .filter((f): f is FileFormat => Boolean(f));
  }

  /**
   * Enumerate concrete from→to conversion pairs across all converters. Powers per-conversion
   * SEO landing pages (e.g. /png-to-jpg), internal links, and the sitemap.
   */
  pairs(opts?: { availableOnly?: boolean; category?: CategoryId }): ConversionPair[] {
    const seen = new Map<string, ConversionPair>();
    for (const c of this.all()) {
      if (opts?.availableOnly && c.status !== "available") continue;
      if (opts?.category && c.category !== opts.category) continue;
      for (const fromId of c.from) {
        for (const toId of c.to) {
          if (fromId === toId) continue;
          const slug = pairSlug(fromId, toId);
          if (seen.has(slug)) continue;
          const from = getFormat(fromId);
          const to = getFormat(toId);
          if (!from || !to) continue;
          seen.set(slug, { from, to, category: c.category, slug, status: c.status });
        }
      }
    }
    return [...seen.values()];
  }

  findPair(slug: string): ConversionPair | undefined {
    return this.pairs().find((p) => p.slug === slug);
  }
}

export const registry = new ConverterRegistry();
