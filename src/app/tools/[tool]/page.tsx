import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, toolBySlug } from "@/lib/tools";
import { CATEGORIES } from "@/lib/engine";
import { ToolShell } from "@/components/tool-shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }));
}

export function generateMetadata({ params }: { params: { tool: string } }): Metadata {
  const tool = toolBySlug(params.tool);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
  };
}

export default function ToolPage({ params }: { params: { tool: string } }) {
  const tool = toolBySlug(params.tool);
  if (!tool) notFound();
  const category = CATEGORIES[tool.category];

  return (
    <div className="container py-12 md:py-16">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="px-1.5">/</span>
        <Link href={category.href} className="hover:text-foreground">{category.label}</Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{tool.title}</span>
      </nav>

      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{tool.title}</h1>
        <p className="mt-2 text-muted-foreground">{tool.description}</p>
      </header>

      <ToolShell slug={tool.slug} />
    </div>
  );
}
