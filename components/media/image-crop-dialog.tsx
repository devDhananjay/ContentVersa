"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Crop, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { blobToFile, getCroppedImageBlob } from "@/lib/image-crop";
import { cn } from "@/lib/utils";

export type CropAspectOption = {
  label: string;
  value: number | undefined;
};

const COVER_ASPECTS: CropAspectOption[] = [
  { label: "Cover 16:9", value: 16 / 9 },
  { label: "Wide 2:1", value: 2 },
  { label: "Square", value: 1 },
  { label: "Free", value: undefined },
];

const INLINE_ASPECTS: CropAspectOption[] = [
  { label: "Free", value: undefined },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "Square", value: 1 },
];

type ImageCropDialogProps = {
  open: boolean;
  /** New upload from device */
  file?: File | null;
  /** Re-crop an already uploaded / pasted image URL (create + edit) */
  sourceUrl?: string | null;
  /** Cover defaults to 16:9; inline editor defaults to free. */
  variant?: "cover" | "inline";
  onOpenChange: (open: boolean) => void;
  onCropped: (file: File) => void | Promise<void>;
};

async function urlToObjectUrl(url: string): Promise<{ src: string; revoke: boolean }> {
  // Same-origin / data / blob can be used directly
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/")
  ) {
    return { src: url, revoke: false };
  }
  // Cross-origin: fetch → blob URL so canvas can crop (needs CORS on remote)
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load image for cropping");
  const blob = await res.blob();
  return { src: URL.createObjectURL(blob), revoke: true };
}

export function ImageCropDialog({
  open,
  file = null,
  sourceUrl = null,
  variant = "cover",
  onOpenChange,
  onCropped,
}: ImageCropDialogProps) {
  const aspects = variant === "cover" ? COVER_ASPECTS : INLINE_ASPECTS;
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [sourceName, setSourceName] = React.useState("image.jpg");
  const [sourceType, setSourceType] = React.useState("image/jpeg");
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [aspect, setAspect] = React.useState<number | undefined>(
    variant === "cover" ? 16 / 9 : undefined
  );
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
    null
  );
  const [busy, setBusy] = React.useState(false);
  const [loadingSrc, setLoadingSrc] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let revoke = false;
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspect(variant === "cover" ? 16 / 9 : undefined);
      setCroppedAreaPixels(null);
      setError(null);

      if (file) {
        const url = URL.createObjectURL(file);
        objectUrl = url;
        revoke = true;
        setImageSrc(url);
        setSourceName(file.name);
        setSourceType(file.type || "image/jpeg");
        setLoadingSrc(false);
        return;
      }

      if (sourceUrl) {
        setLoadingSrc(true);
        try {
          const loaded = await urlToObjectUrl(sourceUrl);
          if (cancelled) {
            if (loaded.revoke) URL.revokeObjectURL(loaded.src);
            return;
          }
          objectUrl = loaded.src;
          revoke = loaded.revoke;
          setImageSrc(loaded.src);
          setSourceName("cover-cropped.jpg");
          setSourceType("image/jpeg");
        } catch (err) {
          if (!cancelled) {
            setImageSrc(null);
            setError(err instanceof Error ? err.message : "Failed to load image");
          }
        } finally {
          if (!cancelled) setLoadingSrc(false);
        }
        return;
      }

      setImageSrc(null);
      setLoadingSrc(false);
    }

    if (open) void load();
    else {
      setImageSrc(null);
      setLoadingSrc(false);
    }

    return () => {
      cancelled = true;
      if (revoke && objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, file, sourceUrl, variant]);

  const onCropComplete = React.useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const preferPng = sourceType === "image/png" || sourceType === "image/webp";
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        mimeType: preferPng ? "image/png" : "image/jpeg",
        quality: 0.92,
        maxWidth: variant === "cover" ? 2000 : 1800,
      });
      const cropped = blobToFile(blob, sourceName);
      await onCropped(cropped);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed");
    } finally {
      setBusy(false);
    }
  };

  const useOriginal = async () => {
    if (!file) {
      onOpenChange(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCropped(file);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="space-y-1 border-b px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Crop className="h-4 w-4 text-neon-purple" />
            Crop image
          </DialogTitle>
          <DialogDescription className="text-xs">
            Drag to reposition, pinch or use the slider to zoom. Works on create
            and edit — apply crop before upload.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[min(52vh,360px)] w-full bg-black">
          {imageSrc && !loadingSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
              objectFit="contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {loadingSrc ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading image…
                </span>
              ) : (
                "No image"
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {aspects.map((opt) => (
              <button
                key={opt.label}
                type="button"
                disabled={busy}
                onClick={() => setAspect(opt.value)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                  aspect === opt.value
                    ? "border-neon-purple/50 bg-neon-purple/15 text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="w-10 shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              disabled={busy || !imageSrc}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full accent-neon-purple"
            />
          </label>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {file ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={useOriginal}
              >
                Use original
              </Button>
            ) : null}
            <Button
              type="button"
              variant="gradient"
              size="sm"
              disabled={busy || !croppedAreaPixels || loadingSrc}
              onClick={applyCrop}
            >
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working…
                </>
              ) : (
                "Apply crop"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
