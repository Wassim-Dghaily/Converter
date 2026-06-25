import type { CategoryId } from "./types";
import { CATEGORIES } from "./categories";
import { registry } from "./registry";

/** Categories shown in the main navigation, in order. */
export const NAV_CATEGORIES: CategoryId[] = [
  "image",
  "audio",
  "video",
  "pdf",
  "document",
  "spreadsheet",
  "archive",
  "ocr",
];

export interface NavMenuItem {
  label: string;
  href: string;
}

export interface NavMenuGroup {
  /** Source-format title, e.g. "PNG" — all "PNG to …" conversions live under it. */
  title: string;
  items: NavMenuItem[];
}

export interface NavMenu {
  id: CategoryId;
  label: string;
  /** General category page, e.g. /convert/image. */
  href: string;
  /** Multi-file/multi-output tools for this category (e.g. Merge PDF). Filled by the UI layer. */
  tools: NavMenuItem[];
  /** Conversions grouped by source format (empty for categories not live yet). */
  groups: NavMenuGroup[];
}

/**
 * Build the navigation menu data: for each nav category, its general page plus every available
 * conversion grouped by source format and sorted by title. Drives the header dropdowns.
 */
export function buildNavMenus(): NavMenu[] {
  return NAV_CATEGORIES.map((id) => {
    const category = CATEGORIES[id];
    const bySource = new Map<string, NavMenuItem[]>();

    for (const pair of registry.pairs({ availableOnly: true, category: id })) {
      const items = bySource.get(pair.from.label) ?? [];
      items.push({ label: `${pair.from.label} to ${pair.to.label}`, href: `/${pair.slug}` });
      bySource.set(pair.from.label, items);
    }

    const groups: NavMenuGroup[] = [...bySource.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, items]) => ({
        title,
        items: items.sort((a, b) => a.label.localeCompare(b.label)),
      }));

    // `tools` is populated by the UI layer (SiteHeader) to keep the engine free of a
    // dependency on the tools registry.
    return { id, label: category.label, href: category.href, tools: [], groups };
  });
}
