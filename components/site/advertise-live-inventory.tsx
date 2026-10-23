"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { useAdvertisePreview } from "@/components/site/advertise-preview-context";

const HUBS = [
  "Homepage",
  "Sports",
  "India Tools",
  "Finance",
  "Jobs",
  "GoldVerse",
] as const;

const FORMAT_HINT: Record<string, string> = {
  "display-banner": "leaderboard",
  "sidebar-rail": "rail",
  "sponsored-article": "in-article",
  homepage: "leaderboard",
  "hub-sponsor": "hubs",
  newsletter: "in-article",
  other: "",
};

function brandInitials(brand: string) {
  const parts = brand.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CV";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function hostFromWebsite(website: string) {
  const raw = website.trim();
  if (!raw) return "";
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProto).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//i, "").split("/")[0] || "";
  }
}

function selectedHubs(placements: string): Set<string> {
  const lower = placements.toLowerCase();
  const set = new Set<string>();
  for (const hub of HUBS) {
    if (lower.includes(hub.toLowerCase())) set.add(hub);
  }
  // Soft aliases
  if (/\btools?\b/.test(lower)) set.add("India Tools");
  if (/\bgold\b/.test(lower)) set.add("GoldVerse");
  if (/\bhome\b/.test(lower)) set.add("Homepage");
  return set;
}

export function AdvertiseLiveInventory() {
  const { brand, website, adType, placements, setPreview } =
    useAdvertisePreview();

  const displayBrand = brand.trim() || "Your brand";
  const host = hostFromWebsite(website);
  const initials = brandInitials(brand.trim() || "Your brand");
  const focus = FORMAT_HINT[adType] || "";
  const hubsOn = selectedHubs(placements);
  const hasDetails = Boolean(brand.trim() || website.trim() || adType || placements.trim());

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-[hsl(var(--saffron))]/25 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-card/80 p-4 shadow-[0_28px_64px_-36px_hsl(var(--primary)/0.55)] backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Live inventory
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {hasDetails ? "Preview" : "Open"}
          </span>
        </div>

        {/* Quick preview controls — also sync from the brief form below */}
        <div className="mb-3 grid gap-2 rounded-xl border border-border/50 bg-background/60 p-2.5">
          <label className="sr-only" htmlFor="adv-preview-brand">
            Brand for preview
          </label>
          <input
            id="adv-preview-brand"
            value={brand}
            onChange={(e) => setPreview({ brand: e.target.value })}
            placeholder="Brand name for preview"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={website}
              onChange={(e) => setPreview({ website: e.target.value })}
              placeholder="Website (optional)"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <select
              value={adType}
              onChange={(e) => setPreview({ adType: e.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Any format</option>
              <option value="display-banner">Display / leaderboard</option>
              <option value="sidebar-rail">Sidebar rail</option>
              <option value="sponsored-article">In-article / native</option>
              <option value="homepage">Homepage</option>
              <option value="hub-sponsor">Hub sponsorship</option>
            </select>
          </div>
          <p className="px-0.5 text-[10px] text-muted-foreground">
            Type here or fill the brief below — preview updates live.
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Leaderboard */}
          <div
            className={`rounded-xl border border-dashed px-3 py-3 transition ${
              focus === "leaderboard" || focus === ""
                ? "border-primary/40 bg-gradient-to-r from-primary/10 to-[hsl(var(--saffron))]/12"
                : "border-border/40 bg-background/40 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Leaderboard · Homepage
              </p>
              <p className="text-[9px] font-medium text-muted-foreground">
                728 × 90
              </p>
            </div>
            <div className="mt-2 flex min-h-[52px] items-center gap-3 rounded-lg bg-background/80 px-3 py-2 ring-1 ring-inset ring-border/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-[hsl(var(--saffron))] text-[11px] font-bold text-white">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold leading-tight">
                  {displayBrand}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {host
                    ? host
                    : "High-visibility homepage band · India readers"}
                </p>
              </div>
              <span className="hidden shrink-0 rounded-full bg-primary/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-primary sm:inline">
                Ad
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_96px] gap-2.5">
            {/* In-article */}
            <div
              className={`rounded-xl border p-3 transition ${
                focus === "in-article"
                  ? "border-primary/40 bg-primary/[0.07]"
                  : "border-border/50 bg-background/70"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                In-article
              </p>
              <div className="mt-2 rounded-lg border border-border/40 bg-card/80 p-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Sponsored
                </p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-snug">
                  {brand.trim()
                    ? `${displayBrand}: how India readers discover your offer`
                    : "Mid-read MREC + native story slots"}
                </p>
                {host ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-primary">
                    <ExternalLink className="h-3 w-3" />
                    {host}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Native story between paragraphs
                  </p>
                )}
              </div>
            </div>

            {/* Rail */}
            <div
              className={`flex flex-col rounded-xl border p-2 text-center transition ${
                focus === "rail"
                  ? "border-primary/40 bg-primary/[0.07]"
                  : "border-border/50 bg-background/70"
              }`}
            >
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rail
              </p>
              <div className="mt-1.5 flex flex-1 flex-col items-center justify-center rounded-lg bg-gradient-to-b from-primary/15 to-[hsl(var(--saffron))]/15 px-1 py-3 ring-1 ring-inset ring-border/30">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-[hsl(var(--saffron))] text-[10px] font-bold text-white">
                  {initials}
                </span>
                <p className="mt-1.5 line-clamp-2 px-0.5 font-display text-[10px] font-bold leading-tight">
                  {displayBrand}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">300×250</p>
              </div>
            </div>
          </div>

          {/* Hubs */}
          <div
            className={`rounded-xl border px-3 py-2.5 transition ${
              focus === "hubs"
                ? "border-primary/40 bg-primary/[0.07]"
                : "border-border/50 bg-background/70"
            }`}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Popular hubs
            </p>
            <div className="flex flex-wrap gap-1.5">
              {HUBS.map((h) => {
                const on = hubsOn.size ? hubsOn.has(h) : true;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      const next = new Set(hubsOn);
                      if (next.has(h)) next.delete(h);
                      else next.add(h);
                      setPreview({
                        placements: [...next].join(", "),
                      });
                    }}
                    className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                      on
                        ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
