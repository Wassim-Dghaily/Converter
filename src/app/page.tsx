import Link from "next/link";
import { ShieldCheck, Zap, Gift, UploadCloud, Settings2, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CategoryGrid } from "@/components/category-grid";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            100% private — your files never leave your device
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Convert anything. <span className="brand-gradient">Yalla.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/convert/image" className={buttonVariants({ size: "lg" })}>
              Start converting
            </Link>
            <Link href="#categories" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Browse tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Gift className="h-4 w-4 text-primary" /> Free to use</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Runs in your browser</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> No uploads, no sign-up</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container scroll-mt-20 pb-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Conversion tools</h2>
            <p className="text-sm text-muted-foreground">Pick a category to get started.</p>
          </div>
        </div>
        <CategoryGrid />
      </section>

      {/* How it works */}
      <section className="container py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { icon: UploadCloud, title: "1. Drop your file", text: "Add a file from your device. It stays on your device." },
            { icon: Settings2, title: "2. Choose a format", text: "Pick what you want and tweak the options." },
            { icon: Download, title: "3. Download", text: "We convert it locally and hand you the result." },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-6 text-center">
              <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
