"use client";

import * as React from "react";
import { UploadCloud, X, ArrowUp, ArrowDown, Download, Loader2, ShieldCheck, FileIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormat } from "@/lib/engine";
import { toolBySlug, type ToolResult, type ToolFile } from "@/lib/tools";
import { cn, formatBytes } from "@/lib/utils";

const safeName = (name: string) => name.replace(/[\\/]/g, "_");

/**
 * Receives only the tool `slug` (a string) and resolves the actual tool — including its `run`
 * function — from the client-side registry. We can't pass the Tool object as a prop because
 * functions aren't serializable across the server→client boundary.
 */
export function ToolShell({ slug }: { slug: string }) {
  const tool = toolBySlug(slug);

  const accept = React.useMemo(
    () =>
      tool && tool.accept.length
        ? tool.accept.map((id) => getFormat(id)?.ext).filter(Boolean).join(",")
        : "",
    [tool],
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ToolResult | null>(null);

  if (!tool) return null;
  const t = tool; // narrowed to Tool — safe inside callbacks/JSX below

  const canRun = files.length >= t.minFiles && !busy;

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setResult(null);
    setError(null);
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, t.maxFiles));
  }
  const removeAt = (i: number) => setFiles((f) => f.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setFiles((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.length) return f;
      const next = [...f];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function run() {
    if (!canRun) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setStage("");
    try {
      const res = await t.run({
        files,
        onProgress: (p) => {
          setProgress(p.ratio);
          if (p.stage) setStage(p.stage);
        },
      });
      setResult(res);
    } catch (err) {
      console.error("[YallaConvert] tool error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function downloadFile(file: ToolFile) {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName(file.filename);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAll() {
    if (!result) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    result.files.forEach((f) => zip.file(safeName(f.filename), f.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadFile({ blob, filename: "files-yallaconvert.zip" });
  }

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setStage("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Add-files dropzone */}
      {files.length < t.maxFiles && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </span>
          <p className="font-medium">
            {files.length === 0 ? "Add files" : "Add more files"}
            {t.maxFiles > 1 ? "" : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag &amp; drop or click{t.minFiles > 1 ? ` · at least ${t.minFiles} files` : ""}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={t.maxFiles > 1}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              {t.maxFiles > 1 && (
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={i === files.length - 1}
                    onClick={() => move(i, 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              )}
              <button
                type="button"
                aria-label="Remove"
                onClick={() => removeAt(i)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {busy && (
        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          {stage && <p className="text-center text-xs text-muted-foreground">{stage}</p>}
        </div>
      )}

      {error && (
        <p className="whitespace-pre-line rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {result ? (
        <div className="space-y-2">
          {result.files.length === 1 ? (
            <Button onClick={() => downloadFile(result.files[0])} className="w-full" size="lg">
              <Download className="h-4 w-4" /> Download {result.files[0].filename}
            </Button>
          ) : (
            <>
              <div className="rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-sm font-medium">{result.files.length} files</span>
                  <button onClick={downloadAll} className="text-sm font-medium text-primary hover:underline">
                    Download all (.zip)
                  </button>
                </div>
                <ul className="max-h-72 divide-y divide-border overflow-y-auto">
                  {result.files.map((file, i) => (
                    <li key={`${file.filename}-${i}`} className="flex items-center gap-3 px-4 py-2">
                      <span className="min-w-0 flex-1 truncate text-sm">{file.filename}</span>
                      <span className="text-xs text-muted-foreground">{formatBytes(file.blob.size)}</span>
                      <button
                        onClick={() => downloadFile(file)}
                        aria-label={`Download ${file.filename}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <Button onClick={reset} variant="outline" className="w-full">
            <RotateCcw className="h-4 w-4" /> Start over
          </Button>
        </div>
      ) : (
        <Button onClick={run} disabled={!canRun} className="w-full" size="lg">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Working…" : `${t.action} ${files.length > 0 ? `(${files.length})` : ""}`.trim()}
        </Button>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Files are processed locally in your browser and never uploaded.
      </p>
    </div>
  );
}
