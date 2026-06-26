"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { UploadCloud, X, FileIcon } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

interface DropzoneProps {
  accept?: string;
  file: File | null;
  onFileSelected: (file: File | null) => void;
  className?: string;
}

const ext = (name: string) => {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1].toUpperCase() : "FILE";
};

/** Reusable drag-and-drop + click-to-select file input. Selection only — no upload. */
export function Dropzone({ accept, file, onFileSelected, className }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const pick = (files: FileList | null) => {
    if (files && files.length > 0) onFileSelected(files[0]);
  };

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn("flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft", className)}
      >
        <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary">
          <FileIcon className="h-5 w-5" />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-md bg-primary px-1 py-px text-[9px] font-bold tracking-wide text-primary-foreground">
            {ext(file.name)}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onFileSelected(null)}
          aria-label="Remove file"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
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
        pick(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
        dragging
          ? "scale-[1.01] border-primary bg-primary/5 shadow-glow"
          : "border-border hover:border-primary/50 hover:bg-muted/40",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-mesh transition-opacity duration-300",
          dragging ? "opacity-100" : "opacity-0 group-hover:opacity-60",
        )}
      />
      <span
        className={cn(
          "inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary transition-transform duration-300",
          dragging ? "scale-110" : "group-hover:-translate-y-1",
        )}
      >
        <UploadCloud className="h-7 w-7" />
      </span>
      <div>
        <p className="font-medium">{dragging ? "Drop to add it" : "Drag & drop a file here"}</p>
        <p className="text-sm text-muted-foreground">or click to browse</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
