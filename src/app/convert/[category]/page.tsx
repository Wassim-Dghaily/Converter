import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Wrench } from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER, registry, type CategoryId } from "@/lib/engine";
import { toolsForCategory } from "@/lib/tools";
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
  const tools = toolsForCategory(id);
  const hasConverters = registry.forCategory(id).length > 0;

  return (
    <div className="container py-12 md:py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{category.label} Converter</h1>
        <p className="mt-2 text-muted-foreground">{category.blurb}</p>
      </header>
      {hasConverters && <ConverterShell categoryId={id} />}

      {tools.length > 0 && (
        <section className={`mx-auto max-w-2xl ${hasConverters ? "mt-12" : ""}`}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {category.label} tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="h-4 w-4" />
                </span>
                <span>
                  <span className="flex items-center gap-1 font-medium">
                    {tool.title}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{tool.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
