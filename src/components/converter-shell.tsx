"use client";

import * as React from "react";
import { ArrowRight, ChevronDown, Download, Loader2, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Dropzone } from "@/components/dropzone";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  FORMATS,
  registry,
  type CategoryId,
  type FileFormat,
  type ConversionResult,
  type ConverterOption,
} from "@/lib/engine";

type OptionValue = number | boolean | string;

// Common alternate extensions that map onto a canonical format id.
const EXT_ALIASES: Record<string, string> = {
  ".jpeg": "jpg",
  ".jfif": "jpg",
  ".tif": "tiff",
  ".htm": "html",
  ".markdown": "md",
};

function detectFormat(file: File): FileFormat | undefined {
  const name = file.name.toLowerCase();
  for (const [ext, id] of Object.entries(EXT_ALIASES)) {
    if (name.endsWith(ext)) return FORMATS.get(id);
  }
  for (const f of FORMATS.values()) if (name.endsWith(f.ext)) return f;
  for (const f of FORMATS.values()) if (f.mime && f.mime === file.type) return f;
  return undefined;
}

/**
 * The shared converter UI for a category. Entirely registry-driven: it discovers valid
 * target formats and converter availability from the engine, so when a real converter is
 * registered (Phase 2+) this screen lights up automatically — no changes needed here.
 */
export function ConverterShell({
  categoryId,
  presetTargetId,
}: {
  categoryId: CategoryId;
  /** When set (on a specific conversion page like /png-to-jpg), pre-selects this target. */
  presetTargetId?: string;
}) {
  const category = CATEGORIES[categoryId];
  const accept = React.useMemo(
    () => registry.sourceFormatsFor(categoryId).map((f) => f.ext).join(","),
    [categoryId],
  );

  const [file, setFile] = React.useState<File | null>(null);
  const [targetId, setTargetId] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ConversionResult | null>(null);

  const source = file ? detectFormat(file) : undefined;

  const targets = React.useMemo<FileFormat[]>(() => {
    if (source) return registry.targetsFor(source.id, categoryId).filter((f) => f.id !== source.id);
    return [...FORMATS.values()].filter((f) => f.category === categoryId);
  }, [source, categoryId]);

  React.useEffect(() => {
    const preferred = presetTargetId && targets.some((t) => t.id === presetTargetId)
      ? presetTargetId
      : targets[0]?.id ?? "";
    setTargetId(preferred);
    setResult(null);
    setError(null);
  }, [targets, presetTargetId]);

  const target = targets.find((t) => t.id === targetId);
  const converter = source && target ? registry.find(source.id, target.id) : undefined;
  const ready = converter?.status === "available" && Boolean(converter.convert);

  // Options applicable to the chosen target.
  const appliedOptions = React.useMemo<ConverterOption[]>(
    () =>
      (converter?.options ?? []).filter(
        (o) => !o.appliesTo || (target ? o.appliesTo.includes(target.id) : true),
      ),
    [converter, target],
  );

  const [optionValues, setOptionValues] = React.useState<Record<string, OptionValue>>({});
  React.useEffect(() => {
    const next: Record<string, OptionValue> = {};
    for (const o of appliedOptions) {
      if (o.type === "range") next[o.id] = o.default;
      else if (o.type === "toggle") next[o.id] = o.default;
      else if (o.type === "select") next[o.id] = o.default;
      else if (o.type === "number" && o.default != null) next[o.id] = o.default;
    }
    setOptionValues(next);
  }, [appliedOptions]);

  async function handleConvert() {
    if (!file || !source || !target || !converter?.convert) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setStage("");
    try {
      const res = await converter.convert({
        file,
        from: source,
        to: target,
        options: optionValues,
        onProgress: (p) => {
          setProgress(p.ratio);
          if (p.stage) setStage(p.stage);
        },
      });
      setResult(res);
    } catch (err) {
      console.error("[YallaConvert] conversion error:", err);
      setError(err instanceof Error ? err.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Reset back to the dropzone for another file, keeping the same conversion selected. */
  function convertAnother() {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setStage("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Dropzone accept={accept} file={file} onFileSelected={setFile} />

      {file && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          {!source && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              We couldn&apos;t recognize this file type for {category.label.toLowerCase()} conversion. Try another file.
            </p>
          )}

          {source && (
            <>
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 px-3.5 py-1.5 font-semibold text-primary">
                  {source.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="relative">
                  <select
                    value={targetId}
                    onChange={(e) => {
                      // Picking a different target after a conversion refreshes to that conversion.
                      setTargetId(e.target.value);
                      setResult(null);
                      setError(null);
                    }}
                    className="cursor-pointer appearance-none rounded-lg border border-input bg-background px-3.5 py-1.5 pr-9 font-semibold transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {targets.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {ready && appliedOptions.length > 0 && !result && (
                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                  {appliedOptions.map((o) => (
                    <div key={o.id} className="space-y-1.5">
                      {o.type === "range" && (
                        <>
                          <label className="flex items-center justify-between text-sm font-medium">
                            <span>{o.label}</span>
                            <span className="text-muted-foreground">
                              {Number(optionValues[o.id] ?? o.default)}
                              {o.unit ?? ""}
                            </span>
                          </label>
                          <input
                            type="range"
                            min={o.min}
                            max={o.max}
                            step={o.step}
                            value={Number(optionValues[o.id] ?? o.default)}
                            onChange={(e) =>
                              setOptionValues((v) => ({ ...v, [o.id]: Number(e.target.value) }))
                            }
                            className="w-full accent-[hsl(var(--primary))]"
                          />
                        </>
                      )}
                      {o.type === "number" && (
                        <label className="block space-y-1.5">
                          <span className="text-sm font-medium">{o.label}</span>
                          <input
                            type="number"
                            min={o.min}
                            max={o.max}
                            placeholder={o.placeholder}
                            value={optionValues[o.id] === undefined ? "" : String(optionValues[o.id])}
                            onChange={(e) =>
                              setOptionValues((v) => ({
                                ...v,
                                [o.id]: e.target.value === "" ? "" : Number(e.target.value),
                              }))
                            }
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </label>
                      )}
                      {o.type === "select" && (
                        <label className="block space-y-1.5">
                          <span className="text-sm font-medium">{o.label}</span>
                          <select
                            value={String(optionValues[o.id] ?? o.default)}
                            onChange={(e) => setOptionValues((v) => ({ ...v, [o.id]: e.target.value }))}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {o.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {o.type === "toggle" && (
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={Boolean(optionValues[o.id] ?? o.default)}
                            onChange={(e) =>
                              setOptionValues((v) => ({ ...v, [o.id]: e.target.checked }))
                            }
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                          />
                          {o.label}
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {busy && (
                <div className="space-y-1.5">
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(286_85%_58%)] transition-all duration-300"
                      style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
                    />
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>
                  {stage && (
                    <p className="text-center text-xs text-muted-foreground">
                      {stage}
                      {progress > 0 && progress < 1 ? ` · ${Math.round(progress * 100)}%` : ""}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <p className="whitespace-pre-line rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 py-1 text-sm font-medium text-success">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.05 }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.span>
                    Done! Your file is ready.
                  </div>
                  <Button onClick={download} className="w-full" size="lg">
                    <Download className="h-4 w-4" /> Download {result.filename}
                  </Button>
                  <Button onClick={convertAnother} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4" /> Convert another file
                  </Button>
                </motion.div>
              ) : ready ? (
                <Button onClick={handleConvert} disabled={busy} className="w-full" size="lg">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {busy ? "Converting…" : `Convert to ${target?.label}`}
                </Button>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                  This conversion is <span className="font-medium text-foreground">coming soon</span>. The interface is
                  ready — the engine for {category.label.toLowerCase()} lands in an upcoming phase.
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Files are processed locally in your browser and never uploaded.
      </p>
    </div>
  );
}
