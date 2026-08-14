"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Crop, ImagePlus, Loader2, X } from "lucide-react";
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
import { DEFAULT_LOGO_ICON } from "@/lib/branding/logo";
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
  if (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.startsWith("/")
  ) {
    return { src: url, revoke: false };
  }
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

  const [logoEnabled, setLogoEnabled] = React.useState(false);
  const [logoSrc, setLogoSrc] = React.useState<string | null>(null);
  const [logoRevoke, setLogoRevoke] = React.useState(false);
  const [logoSizePct, setLogoSizePct] = React.useState(0.18);
  const [logoOpacity, setLogoOpacity] = React.useState(0.9);
  /** Position of logo top-left inside crop area (0–1). */
  const [logoPos, setLogoPos] = React.useState({ x: 0.72, y: 0.72 });

  const cropStageRef = React.useRef<HTMLDivElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const dragRef = React.useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

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
      setLogoEnabled(false);
      setLogoPos({ x: 0.72, y: 0.72 });
      setLogoSizePct(0.18);
      setLogoOpacity(0.9);

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

  React.useEffect(() => {
    return () => {
      if (logoRevoke && logoSrc) URL.revokeObjectURL(logoSrc);
    };
  }, [logoRevoke, logoSrc]);

  const onCropComplete = React.useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const getCropAreaRect = () => {
    const stage = cropStageRef.current;
    if (!stage) return null;
    return stage.querySelector(".reactEasyCrop_CropArea") as HTMLElement | null;
  };

  const onLogoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: logoPos.x,
      originY: logoPos.y,
    };
  };

  const onLogoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const cropEl = getCropAreaRect();
    if (!cropEl) return;
    const rect = cropEl.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const dx = (e.clientX - dragRef.current.startX) / rect.width;
    const dy = (e.clientY - dragRef.current.startY) / rect.height;
    const maxX = Math.max(0, 1 - logoSizePct);
    // Height fraction depends on logo aspect; approximate square-ish clamp for drag
    const maxY = Math.max(0, 1 - logoSizePct * 0.6);
    setLogoPos({
      x: Math.min(maxX, Math.max(0, dragRef.current.originX + dx)),
      y: Math.min(maxY, Math.max(0, dragRef.current.originY + dy)),
    });
  };

  const onLogoPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const enableSiteLogo = () => {
    if (logoRevoke && logoSrc) URL.revokeObjectURL(logoSrc);
    setLogoRevoke(false);
    setLogoSrc(DEFAULT_LOGO_ICON);
    setLogoEnabled(true);
  };

  const onLogoFile = (f: File | null) => {
    if (!f) return;
    if (logoRevoke && logoSrc) URL.revokeObjectURL(logoSrc);
    const url = URL.createObjectURL(f);
    setLogoSrc(url);
    setLogoRevoke(true);
    setLogoEnabled(true);
  };

  const clearLogo = () => {
    if (logoRevoke && logoSrc) URL.revokeObjectURL(logoSrc);
    setLogoSrc(null);
    setLogoRevoke(false);
    setLogoEnabled(false);
  };

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const preferPng = sourceType === "image/png" || sourceType === "image/webp";
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, {
        mimeType: preferPng || (logoEnabled && logoSrc) ? "image/png" : "image/jpeg",
        quality: 0.92,
        maxWidth: variant === "cover" ? 2000 : 1800,
        logo:
          logoEnabled && logoSrc
            ? {
                src: logoSrc,
                xPct: logoPos.x,
                yPct: logoPos.y,
                widthPct: logoSizePct,
                opacity: logoOpacity,
              }
            : null,
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
    // If logo enabled, still run through canvas so logo is burned in (full image crop)
    if (logoEnabled && logoSrc) {
      setBusy(true);
      setError(null);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("Failed to load image"));
          el.src = imageSrc || URL.createObjectURL(file);
        });
        const blob = await getCroppedImageBlob(
          imageSrc || URL.createObjectURL(file),
          { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight },
          {
            mimeType: "image/png",
            quality: 0.92,
            maxWidth: variant === "cover" ? 2000 : 1800,
            logo: {
              src: logoSrc,
              xPct: logoPos.x,
              yPct: logoPos.y,
              widthPct: logoSizePct,
              opacity: logoOpacity,
            },
          }
        );
        await onCropped(blobToFile(blob, sourceName));
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      } finally {
        setBusy(false);
      }
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
            Drag to reposition, zoom with the slider. Optionally add your logo
            and drag it anywhere on the image before applying.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={cropStageRef}
          className="relative h-[min(52vh,360px)] w-full bg-black"
        >
          {imageSrc && !loadingSrc ? (
            <>
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
              {logoEnabled && logoSrc ? (
                <LogoOverlayLayer
                  stageRef={cropStageRef}
                  logoSrc={logoSrc}
                  pos={logoPos}
                  sizePct={logoSizePct}
                  opacity={logoOpacity}
                  onPointerDown={onLogoPointerDown}
                  onPointerMove={onLogoPointerMove}
                  onPointerUp={onLogoPointerUp}
                />
              ) : null}
            </>
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

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold">Add logo on image</p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  disabled={busy || !imageSrc}
                  onClick={enableSiteLogo}
                >
                  Site logo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] gap-1"
                  disabled={busy || !imageSrc}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <ImagePlus className="h-3 w-3" />
                  Upload logo
                </Button>
                {logoEnabled ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[11px] gap-1 text-destructive"
                    disabled={busy}
                    onClick={clearLogo}
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </Button>
                ) : null}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  onLogoFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            {logoEnabled && logoSrc ? (
              <>
                <p className="text-[10px] text-muted-foreground">
                  Drag the logo on the preview to place it anywhere.
                </p>
                <label className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="w-14 shrink-0">Size</span>
                  <input
                    type="range"
                    min={0.08}
                    max={0.4}
                    step={0.01}
                    value={logoSizePct}
                    disabled={busy}
                    onChange={(e) => setLogoSizePct(Number(e.target.value))}
                    className="h-1.5 w-full accent-neon-purple"
                  />
                </label>
                <label className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="w-14 shrink-0">Opacity</span>
                  <input
                    type="range"
                    min={0.3}
                    max={1}
                    step={0.05}
                    value={logoOpacity}
                    disabled={busy}
                    onChange={(e) => setLogoOpacity(Number(e.target.value))}
                    className="h-1.5 w-full accent-neon-purple"
                  />
                </label>
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                Optional — burn your brand logo into the cover or inline image.
              </p>
            )}
          </div>

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

/** Positions the logo over the crop area box inside react-easy-crop. */
function LogoOverlayLayer({
  stageRef,
  logoSrc,
  pos,
  sizePct,
  opacity,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  logoSrc: string;
  pos: { x: number; y: number };
  sizePct: number;
  opacity: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const [box, setBox] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const cropEl = stage.querySelector(
        ".reactEasyCrop_CropArea"
      ) as HTMLElement | null;
      if (!cropEl) {
        setBox(null);
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const cropRect = cropEl.getBoundingClientRect();
      setBox({
        left: cropRect.left - stageRect.left,
        top: cropRect.top - stageRect.top,
        width: cropRect.width,
        height: cropRect.height,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    const id = window.setInterval(measure, 200);
    return () => {
      ro.disconnect();
      window.clearInterval(id);
    };
  }, [stageRef, logoSrc]);

  if (!box) return null;

  const logoW = box.width * sizePct;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
      }}
    >
      <div
        className="pointer-events-auto absolute cursor-grab active:cursor-grabbing touch-none"
        style={{
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          width: logoW,
          opacity,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Logo"
          draggable={false}
          className="h-auto w-full select-none drop-shadow-md ring-2 ring-white/40 rounded-sm"
        />
      </div>
    </div>
  );
}
