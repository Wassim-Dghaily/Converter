import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles your files and data — in short, your files never leave your device.`,
};

export default function PrivacyPage() {
  return (
    <article className="container max-w-2xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="font-semibold text-foreground">The short version</h2>
          <p className="mt-2">
            {siteConfig.name} converts your files <strong className="text-foreground">entirely in your browser</strong>.
            Your files are never uploaded to a server — they stay on your device. We can&apos;t see them, store them,
            or share them, because they never reach us.
          </p>
        </section>

        <div>
          <h2 className="text-base font-semibold text-foreground">Your files</h2>
          <p className="mt-2">
            All conversions run locally using technology built into your browser. Files you select are processed in
            memory on your own computer or phone and are discarded when you close or reload the page.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Conversion engine assets</h2>
          <p className="mt-2">
            Some converters (e.g. video/audio and OCR) download a conversion engine and, for OCR, language data the
            first time you use them. These are public, open-source assets fetched over the network and cached by your
            browser; your files are not part of these requests.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Analytics &amp; cookies</h2>
          <p className="mt-2">
            We aim to keep tracking minimal. If we add privacy-respecting analytics or advertising in the future, we
            will update this policy and provide clear controls where required.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p className="mt-2">Questions about privacy? Reach out through the site and we&apos;ll be happy to help.</p>
        </div>
      </div>
    </article>
  );
}
