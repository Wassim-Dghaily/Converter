import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER, registry, type CategoryId } from "@/lib/engine";
import { ConverterShell } from "@/components/converter-shell";

// Pages for categories that have a dedicated route (OCR has its own top-level route).
const ROUTED: CategoryId[] = CATEGORY_ORDER.filter((c) => c !== "ocr");

export function generateStaticParams() {
  return ROUTED.map((category) => ({ category }));
}

function resolve(param: string): CategoryId | undefined {
  return ROUTED.find((c) => c === param);
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const id = resolve(params.category);
  if (!id) return {};
  const c = CATEGORIES[id];
  return { title: `${c.label} Converter`, description: c.blurb };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const id = resolve(params.category);
  if (!id) notFound();
  const category = CATEGORIES[id];
  const popular = registry.pairs({ availableOnly: true, category: id });

  return (
    <div className="container py-12 md:py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{category.label} Converter</h1>
        <p className="mt-2 text-muted-foreground">{category.blurb}</p>
      </header>
      <ConverterShell categoryId={id} />

      {popular.length > 0 && (
        <section className="mx-auto mt-12 max-w-2xl">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Popular {category.label.toLowerCase()} conversions
          </h2>
          <div className="flex flex-wrap gap-2">
            {popular.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary/40 hover:text-primary"
              >
                {p.from.label} <ArrowRight className="h-3 w-3" /> {p.to.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
