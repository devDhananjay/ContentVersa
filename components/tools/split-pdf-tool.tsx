"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfFilePicker, PdfToolCard } from "@/components/tools/pdf-tool-shared";
import {
  downloadPdfBytes,
  getPdfPageCount,
  splitPdf,
} from "@/lib/tools/pdf-client";

export function SplitPdfTool() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [from, setFrom] = React.useState("1");
  const [to, setTo] = React.useState("1");
  const [pages, setPages] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const file = files[0] ?? null;

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!file) {
        setPages(null);
        return;
      }
      try {
        const n = await getPdfPageCount(file);
        if (!cancelled) {
          setPages(n);
          setFrom("1");
          setTo(String(n));
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setPages(null);
          setError(e instanceof Error ? e.message : "Could not read PDF");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const onRun = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await splitPdf(file, Number(from), Number(to));
      downloadPdfBytes(bytes, `split-p${from}-${to}.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PdfToolCard
      title="Split PDF — extract pages"
      busy={busy}
      error={error}
      onRun={onRun}
      runLabel="Extract & download"
      disabled={!file || !pages}
    >
      <PdfFilePicker
        accept="application/pdf,.pdf"
        files={files}
        setFiles={setFiles}
        label="Choose a PDF to split"
      />
      {pages != null ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="from-page">From page</Label>
            <Input
              id="from-page"
              type="number"
              min={1}
              max={pages}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to-page">To page (of {pages})</Label>
            <Input
              id="to-page"
              type="number"
              min={1}
              max={pages}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
      ) : null}
    </PdfToolCard>
  );
}
