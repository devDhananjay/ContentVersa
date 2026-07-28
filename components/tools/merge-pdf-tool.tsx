"use client";

import * as React from "react";
import { PdfFilePicker, PdfToolCard } from "@/components/tools/pdf-tool-shared";
import { downloadPdfBytes, mergePdfs } from "@/lib/tools/pdf-client";

export function MergePdfTool() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onRun = async () => {
    setBusy(true);
    setError(null);
    try {
      const bytes = await mergePdfs(files);
      downloadPdfBytes(bytes, "merged.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PdfToolCard
      title="Merge PDF files"
      busy={busy}
      error={error}
      onRun={onRun}
      runLabel="Merge & download"
      disabled={files.length < 2}
    >
      <PdfFilePicker
        accept="application/pdf,.pdf"
        multiple
        files={files}
        setFiles={setFiles}
        label="Add PDFs to merge (order = page order)"
      />
      {files.length === 1 ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Add one more PDF to merge.
        </p>
      ) : null}
    </PdfToolCard>
  );
}
