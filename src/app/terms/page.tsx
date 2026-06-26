import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms for using ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <article className="container max-w-2xl py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-base font-semibold text-foreground">Acceptance</h2>
          <p className="mt-2">
            By using {siteConfig.name}, you agree to these terms. If you don&apos;t agree, please don&apos;t use the
            service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">The service</h2>
          <p className="mt-2">
            {siteConfig.name} provides free, in-browser file conversion tools. Because conversions run on your own
            device, results depend on your browser and hardware. The service is provided{" "}
            <strong className="text-foreground">&quot;as is&quot;</strong> without warranties of any kind.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Acceptable use</h2>
          <p className="mt-2">
            You are responsible for the files you convert and must have the rights to do so. Don&apos;t use the service
            for unlawful purposes or to infringe others&apos; rights.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, {siteConfig.name} is not liable for any loss or damage arising from
            your use of the service, including any loss of data. Always keep backups of important files.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">Changes</h2>
          <p className="mt-2">We may update these terms from time to time. Continued use means you accept the changes.</p>
        </div>
      </div>
    </article>
  );
}
