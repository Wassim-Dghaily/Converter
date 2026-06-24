import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_ORDER, type CategoryId } from "@/lib/engine";
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

  return (
    <div className="container py-12 md:py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{category.label} Converter</h1>
        <p className="mt-2 text-muted-foreground">{category.blurb}</p>
      </header>
      <ConverterShell categoryId={id} />
    </div>
  );
}
