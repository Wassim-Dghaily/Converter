import { ShieldCheck, Zap, Gift, Layers, Sparkles, Smartphone } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";

const FEATURES = [
  { icon: ShieldCheck, title: "Truly private", text: "Conversions run on your device. Your files are never uploaded to a server — not ours, not anyone's." },
  { icon: Zap, title: "Lightning fast", text: "No upload, no download round-trip. Files are processed locally, so most conversions finish in seconds." },
  { icon: Gift, title: "Always free", text: "Every tool is free to use, with no watermarks and no account required to get started." },
  { icon: Layers, title: "All-in-one", text: "Images, audio, video, PDF, documents, spreadsheets, archives and OCR — one place for all of it." },
  { icon: Sparkles, title: "No watermarks", text: "Your output is clean. We only add a friendly name tag so you remember where it came from." },
  { icon: Smartphone, title: "Works everywhere", text: "Runs in any modern browser on desktop or mobile. Nothing to install, nothing to set up." },
];

export function Why() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/20 py-20 md:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-60" />
      <div className="container">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Why YallaConvert</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Built to be fast, private, and effortless
          </h2>
        </Reveal>

        <RevealGroup className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <RevealItem key={f.title}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
