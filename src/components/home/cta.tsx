import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion";

export function Cta() {
  return (
    <section className="container pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 px-6 py-14 text-center shadow-soft md:py-20">
          <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold tracking-tight md:text-5xl">
            Ready to convert? <span className="brand-gradient">Yalla.</span>
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Drop a file and get your result in seconds — free, private, and right in your browser.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="#categories" className={buttonVariants({ size: "lg" })}>
              Start converting <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/convert/pdf" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Explore PDF tools
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
