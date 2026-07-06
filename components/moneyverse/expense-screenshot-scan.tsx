"use client";

import * as React from "react";
import { ImageUp, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ScreenshotScanResult } from "@/lib/moneyverse/screenshot-scan";
import { cn } from "@/lib/utils";

type Props = {
  disabled?: boolean;
  onScan: (data: ScreenshotScanResult) => void;
};

export function ExpenseScreenshotScan({ disabled, onScan }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file || disabled) return;

    setScanning(true);
    setPreview(URL.createObjectURL(file));

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch("/api/moneyverse/scan", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Scan failed");
        return;
      }

      onScan(data as ScreenshotScanResult);
      toast.success("OCR scan complete — review details and save");
    } catch {
      toast.error("Upload failed");
    } finally {
      setScanning(false);
    }
  }

  return (
    <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-card to-card p-5 md:p-6">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
        <ScanLine className="h-3.5 w-3.5" />
        Screenshot Scan (OCR)
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload a UPI or payment screenshot — OCR scans the image and auto-fills amount,
        merchant, category & payment method.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || scanning}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          void handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || scanning}
          className="gap-2 border-violet-500/40"
          onClick={() => inputRef.current?.click()}
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageUp className="h-4 w-4" />
          )}
          {scanning ? "Scanning…" : "Upload screenshot"}
        </Button>
        {preview ? (
          <div
            className={cn(
              "relative h-16 w-16 overflow-hidden rounded-lg border border-violet-500/30",
              scanning && "opacity-60"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Screenshot preview" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
