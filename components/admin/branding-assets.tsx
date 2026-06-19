"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import type { BrandingAsset, BrandingKey } from "@/lib/data/site-branding";

type BrandingState = Record<BrandingKey, BrandingAsset>;

const LABELS: Record<BrandingKey, { title: string; hint: string }> = {
  logo: {
    title: "Website logo",
    hint: "Shown in the navbar and footer. PNG, JPG, WebP or SVG. Max 5MB.",
  },
  favicon: {
    title: "Favicon",
    hint: "Browser tab icon. Square PNG or ICO works best. Max 5MB.",
  },
  loader: {
    title: "Site loader",
    hint: "Splash animation while the site loads. PNG, GIF or WebP. Max 5MB.",
  },
};

function PreviewBox({
  label,
  url,
  emptyText,
}: {
  label: string;
  url: string | null;
  emptyText: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex h-28 items-center justify-center rounded-xl border border-dashed bg-muted/30 p-3">
        {url ? (
          <Image
            src={url}
            alt={label}
            width={120}
            height={120}
            className="max-h-24 w-auto max-w-full object-contain"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-5 w-5 opacity-50" />
            <span>{emptyText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandingRow({
  type,
  asset,
  onUpdated,
}: {
  type: BrandingKey;
  asset: BrandingAsset;
  onUpdated: (type: BrandingKey, next: BrandingAsset) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const meta = LABELS[type];
  const busy = uploading || removing;

  const handleFile = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const uploaded = await uploadImage(file);
      const res = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type, url: uploaded.url }),
      });
      const data = (await res.json()) as { error?: string; asset?: BrandingAsset };
      if (!res.ok || !data.asset) {
        setMessage(data.error || "Save failed");
        return;
      }
      onUpdated(type, data.asset);
      setMessage("Saved. Refresh the site to see changes.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!asset.current) return;
    if (!window.confirm(`Remove current ${meta.title.toLowerCase()} and use the default?`)) return;

    setRemoving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/branding", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type }),
      });
      const data = (await res.json()) as { error?: string; asset?: BrandingAsset };
      if (!res.ok || !data.asset) {
        setMessage(data.error || "Remove failed");
        return;
      }
      onUpdated(type, data.asset);
      setMessage("Removed. Default is active now — refresh the site.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold">{meta.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{meta.hint}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PreviewBox label="Current" url={asset.current} emptyText="Default in use" />
        <PreviewBox label="Previous" url={asset.previous} emptyText="No previous upload" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.ico"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload new
        </Button>
        {asset.current ? (
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={busy}
            onClick={() => void handleRemove()}
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remove current
          </Button>
        ) : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}

export function BrandingAssetsSetup() {
  const [assets, setAssets] = React.useState<BrandingState | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/branding", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { assets: BrandingState };
        setAssets(data.assets);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section className="rounded-2xl border bg-card p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading branding assets…
      </section>
    );
  }

  if (!assets) {
    return (
      <section className="rounded-2xl border bg-card p-6 text-sm text-destructive">
        Could not load branding settings.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Logo, favicon & loader</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload new assets from here. The current version goes live immediately; the last upload
          is kept as previous for preview. Use <strong>Remove current</strong> to go back to the
          default logo, favicon, or loader.
        </p>
      </div>
      {(["logo", "favicon", "loader"] as BrandingKey[]).map((type) => (
        <BrandingRow
          key={type}
          type={type}
          asset={assets[type]}
          onUpdated={(key, next) => setAssets((prev) => (prev ? { ...prev, [key]: next } : prev))}
        />
      ))}
    </section>
  );
}
