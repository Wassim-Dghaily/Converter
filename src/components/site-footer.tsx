import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import { categoryList } from "@/lib/engine";
import { TOOLS } from "@/lib/tools";

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const categories = categoryList().map((c) => ({ label: c.label, href: c.href }));

  return (
    <footer className="relative mt-24 border-t border-border/60 bg-muted/20">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Private by design — files stay on your device
          </p>
        </div>

        <Column title="Convert" links={categories} />
        <Column title="Tools" links={TOOLS.map((t) => ({ label: t.title, href: `/tools/${t.slug}` }))} />
        <Column
          title="Company"
          links={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Use", href: "/terms" },
          ]}
        />
      </div>

      <div className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Converts in your browser — no uploads, no sign-up.</p>
        </div>
      </div>
    </footer>
  );
}
