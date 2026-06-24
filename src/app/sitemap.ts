import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { registry, categoryList } from "@/lib/engine";

/** Generated sitemap: home, category hubs, OCR, and every available conversion landing page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes = ["", "/ocr"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryRoutes = categoryList().map((c) => ({
    url: `${base}${c.href}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const conversionRoutes = registry.pairs({ availableOnly: true }).map((p) => ({
    url: `${base}/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...conversionRoutes];
}
