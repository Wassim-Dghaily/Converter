import type { CategoryId, Converter, FileFormat } from "./types";
import { getFormat } from "./formats";

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

  /** Distinct target formats reachable from a given source format id. */
  targetsFor(fromId: string): FileFormat[] {
    const ids = new Set<string>();
    for (const c of this.all()) {
      if (c.from.includes(fromId)) c.to.forEach((t) => ids.add(t));
    }
    return [...ids]
      .map((id) => getFormat(id))
      .filter((f): f is FileFormat => Boolean(f));
  }
}

export const registry = new ConverterRegistry();
