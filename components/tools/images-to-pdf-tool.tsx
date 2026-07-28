"use client";

import * as React from "react";
import { PdfFilePicker, PdfToolCard } from "@/components/tools/pdf-tool-shared";
import { downloadPdfBytes, imagesToPdf } from "@/lib/tools/pdf-client";

export function ImagesToPdfTool() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onRun = async () => {
    setBusy(true);
    setError(null);
    try {
      const bytes = await imagesToPdf(files);
      downloadPdfBytes(bytes, "images.pdf");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PdfToolCard
      title="Convert images to PDF"
      busy={busy}
      error={error}
      onRun={onRun}
      runLabel="Create PDF & download"
      disabled={files.length < 1}
    >
      <PdfFilePicker
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        multiple
        files={files}
        setFiles={setFiles}
        label="Add JPG or PNG images (order = page order)"
      />
    </PdfToolCard>
  );
}
