import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/category-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { Why } from "@/components/home/why";
import { Faq } from "@/components/home/faq";
import { Cta } from "@/components/home/cta";
import { Reveal } from "@/components/motion";
import { HomeStructuredData } from "@/components/structured-data";

export default function HomePage() {
  return (
    <>
      <HomeStructuredData />
      <Hero />

      <section id="categories" className="container scroll-mt-24 py-10 md:py-14">
        <Reveal className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">All your tools</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Pick a category to get started
          </h2>
          <p className="mt-3 text-muted-foreground">Everything you need, organized and ready to go.</p>
        </Reveal>
        <CategoryGrid />
      </section>

      <HowItWorks />
      <Why />
      <Faq />
      <Cta />
    </>
  );
}
