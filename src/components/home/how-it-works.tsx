import { UploadCloud, SlidersHorizontal, Download } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";

const STEPS = [
  { icon: UploadCloud, title: "Drop your file", text: "Pick a file from your device — or drag it straight in. It never leaves your browser." },
  { icon: SlidersHorizontal, title: "Choose a format", text: "Select what you want and fine-tune quality, size, or language where it helps." },
  { icon: Download, title: "Download", text: "We convert it locally in seconds and hand you the finished file. No queue, no email." },
];

export function HowItWorks() {
  return (
    <section id="how" className="container scroll-mt-20 py-20 md:py-24">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Three steps, zero friction
        </h2>
        <p className="mt-3 text-muted-foreground">No accounts, no uploads, no waiting in a queue.</p>
      </Reveal>

      <RevealGroup className="relative mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-3">
        {/* connecting line on desktop */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block"
        />
        {STEPS.map((step, i) => (
          <RevealItem key={step.title}>
            <div className="relative h-full rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-soft">
              <span className="relative z-10 mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(286_85%_58%)] text-primary-foreground shadow-glow">
                <step.icon className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-xs font-bold text-foreground">
                  {i + 1}
                </span>
              </span>
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
