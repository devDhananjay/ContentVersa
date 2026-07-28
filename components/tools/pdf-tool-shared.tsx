"use client";

import * as React from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PDF_MAX_BYTES, formatBytes } from "@/lib/tools/pdf-client";

export function PdfPrivacyNote() {
  return (
    <p className="text-xs text-muted-foreground leading-relaxed">
      Processing happens in your browser. Files are not uploaded to ContentVerse
      servers. Max {formatBytes(PDF_MAX_BYTES)} per file.
    </p>
  );
}

export function FileList({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  if (!files.length) return null;
  return (
    <ul className="space-y-2">
      {files.map((f, i) => (
        <li
          key={`${f.name}-${f.size}-${i}`}
          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
        >
          <span className="min-w-0 truncate">
            {f.name}{" "}
            <span className="text-muted-foreground">({formatBytes(f.size)})</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${f.name}`}
            onClick={() => onRemove(i)}
            className="rounded-md p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function PdfFilePicker({
  accept,
  multiple,
  files,
  setFiles,
  label,
}: {
  accept: string;
  multiple?: boolean;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  label: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);

  const add = (list: FileList | File[] | null) => {
    if (!list) return;
    const arr = Array.from(list);
    setFiles((prev) => (multiple ? [...prev, ...arr] : arr.slice(0, 1)));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition",
          drag
            ? "border-neon-cyan bg-neon-cyan/5"
            : "border-border/70 hover:border-neon-purple/50 hover:bg-muted/20"
        )}
      >
        <FileUp className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          Click or drag & drop · max {formatBytes(PDF_MAX_BYTES)}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      <FileList
        files={files}
        onRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
      />
    </div>
  );
}

export function PdfToolCard({
  title,
  children,
  busy,
  error,
  onRun,
  runLabel,
  disabled,
}: {
  title: string;
  children: React.ReactNode;
  busy: boolean;
  error: string | null;
  onRun: () => void;
  runLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PdfPrivacyNote />
          {children}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button onClick={onRun} disabled={busy || disabled}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working…
              </>
            ) : (
              runLabel
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
