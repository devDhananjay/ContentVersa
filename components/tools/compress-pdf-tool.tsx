"use client";

import * as React from "react";
import { PdfFilePicker, PdfToolCard } from "@/components/tools/pdf-tool-shared";
import {
  compressPdf,
  downloadPdfBytes,
  formatBytes,
} from "@/lib/tools/pdf-client";

export function CompressPdfTool() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    before: number;
    after: number;
  } | null>(null);

  const file = files[0] ?? null;

  const onRun = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const { bytes, before, after } = await compressPdf(file);
      setResult({ before, after });
      downloadPdfBytes(bytes, file.name.replace(/\.pdf$/i, "") + "-compressed.pdf");
      if (after >= before * 0.98) {
        setError(
          "Size barely changed — this PDF may already be optimized or mostly scanned images. Try a different file for better savings."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compress failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PdfToolCard
      title="Compress PDF"
      busy={busy}
      error={error}
      onRun={onRun}
      runLabel="Compress & download"
      disabled={!file}
    >
      <PdfFilePicker
        accept="application/pdf,.pdf"
        files={files}
        setFiles={(next) => {
          setResult(null);
          setFiles(next);
        }}
        label="Choose a PDF to compress"
      />
      <p className="text-xs text-muted-foreground">
        Basic rewrite in your browser. Large savings are not guaranteed on every
        file (especially image-heavy scans).
      </p>
      {result ? (
        <p className="text-sm">
          {formatBytes(result.before)} → {formatBytes(result.after)}
          {result.after < result.before ? (
            <span className="text-neon-cyan">
              {" "}
              (−{Math.round((1 - result.after / result.before) * 100)}%)
            </span>
          ) : null}
        </p>
      ) : null}
    </PdfToolCard>
  );
}
