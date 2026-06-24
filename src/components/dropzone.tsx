"use client";

import * as React from "react";
import { UploadCloud, FileIcon, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

interface DropzoneProps {
  /** Accept attribute / hint, e.g. "image/*". */
  accept?: string;
  file: File | null;
  onFileSelected: (file: File | null) => void;
  className?: string;
}

/** Reusable drag-and-drop + click-to-select file input. Selection only — no upload. */
export function Dropzone({ accept, file, onFileSelected, className }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const pick = (files: FileList | null) => {
    if (files && files.length > 0) onFileSelected(files[0]);
  };

  if (file) {
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-border bg-card p-4", className)}>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onFileSelected(null)}
          aria-label="Remove file"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
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
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
        className,
      )}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UploadCloud className="h-7 w-7" />
      </span>
      <div>
        <p className="font-medium">Drag &amp; drop a file here</p>
        <p className="text-sm text-muted-foreground">or click to browse</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}
