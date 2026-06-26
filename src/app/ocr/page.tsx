import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/engine";
import { ConverterShell } from "@/components/converter-shell";

export const metadata: Metadata = {
  title: "OCR — Image to Text",
  description: CATEGORIES.ocr.blurb,
};

export default function OcrPage() {
  const category = CATEGORIES.ocr;
  return (
    <div className="container py-12 md:py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">OCR — Extract Text</h1>
        <p className="mt-2 text-muted-foreground">{category.blurb}</p>
      </header>
      <ConverterShell categoryId="ocr" />
    </div>
  );
}
