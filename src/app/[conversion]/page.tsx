import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { registry, CATEGORIES } from "@/lib/engine";
import { ConverterShell } from "@/components/converter-shell";
import { AdSlot } from "@/components/ads/ad-slot";
import { siteConfig } from "@/config/site";

// Only real, available conversions get a landing page; everything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.pairs({ availableOnly: true }).map((p) => ({ conversion: p.slug }));
}

export function generateMetadata({ params }: { params: { conversion: string } }): Metadata {
  const pair = registry.findPair(params.conversion);
  if (!pair) return {};
  const title = `${pair.from.label} to ${pair.to.label} Converter`;
  const description = `Convert ${pair.from.label} to ${pair.to.label} online for free. Fast and private — the conversion runs in your browser, so your files never leave your device.`;
  return {
    title,
    description,
    alternates: { canonical: `/${pair.slug}` },
    openGraph: { title: `${title} · ${siteConfig.name}`, description },
  };
}

export default function ConversionPage({ params }: { params: { conversion: string } }) {
  const pair = registry.findPair(params.conversion);
  if (!pair || pair.status !== "available") notFound();

  const category = CATEGORIES[pair.category];
  // A few sibling conversions in the same category for internal linking.
  const related = registry
    .pairs({ availableOnly: true, category: pair.category })
    .filter((p) => p.slug !== pair.slug)
    .slice(0, 8);

  return (
    <div className="container py-12 md:py-16">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="px-1.5">/</span>
        <Link href={category.href} className="hover:text-foreground">{category.label}</Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{pair.from.label} to {pair.to.label}</span>
      </nav>

      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Convert {pair.from.label} to {pair.to.label}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Free, fast, and private {pair.from.label}-to-{pair.to.label} conversion that runs entirely in your browser.
        </p>
      </header>

      <ConverterShell categoryId={pair.category} presetTargetId={pair.to.id} />

      <AdSlot slot="conversion-below" className="mt-10" />

      {/* Plain-language SEO content */}
      <section className="prose-sm mx-auto mt-12 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground">
        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            <span className="font-medium text-foreground">100% private.</span> Unlike most online
            converters, {siteConfig.name} never uploads your {pair.from.label} file. The conversion to{" "}
            {pair.to.label} happens locally on your device, so nothing is sent to a server.
          </p>
        </div>
        <p>
          To convert your {pair.from.label} file to {pair.to.label}, drop it in the box above (or click to
          browse), then download the result. There&apos;s no sign-up, no watermark, and no file-size paywall.
        </p>
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-12 max-w-2xl">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Related {category.label.toLowerCase()} conversions
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((p) => (
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
