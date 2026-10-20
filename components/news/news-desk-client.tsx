"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { MrecAd } from "@/components/ads/mrec-ad";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import type { LiveNewsCard } from "@/lib/data/live-news";
import { cn } from "@/lib/utils";

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Just now";
  const mins = Math.max(0, Math.round((Date.now() - t) / 60_000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function NewsDeskClient({ items }: { items: LiveNewsCard[] }) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((card) => {
      const hay = `${card.title} ${card.excerpt} ${card.categoryLabel} ${card.feedLabel}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q]);

  const mid = Math.max(2, Math.floor(filtered.length / 2));
  const briefings = filtered.filter((i) => i.hasBriefing);
  const pending = filtered.filter((i) => !i.hasBriefing);

  return (
    <>
      <div className="mb-5">
        <SiteVoiceSearch
          size="bar"
          placeholder="Search news… or tap the mic"
          searchPath="/news"
          navigateOnSubmit={false}
          navigateOnVoice={false}
          onQueryChange={setQ}
        />
      </div>

      <BandAd slotKey="horizontal" />

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          News desk is warming up — check back in a few minutes.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          No stories match “{q.trim()}”. Try another word or clear search.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.slice(0, mid).map((card) => (
              <NewsCard key={card.id} card={card} />
            ))}
          </div>

          <div className="my-8 flex justify-center">
            <MrecAd slotKey="inArticle" />
          </div>

          {filtered.length > mid ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.slice(mid).map((card) => (
                <NewsCard key={card.id} card={card} />
              ))}
            </div>
          ) : null}
        </>
      )}

      <div className="mt-10">
        <HubAdSense />
      </div>

      {pending.length > 0 && briefings.length > 0 ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Some live headlines are still being rewritten into ContentVerse
          briefings — they appear here as soon as they publish.
        </p>
      ) : null}
    </>
  );
}

function NewsCard({ card }: { card: LiveNewsCard }) {
  return (
    <Link
      href={card.hasBriefing ? card.href : "/news"}
      className={cn(
        "group flex gap-3 rounded-2xl border border-border/70 bg-background p-3.5 shadow-[var(--v2-shadow-sm)]",
        "transition-[border-color,box-shadow] hover:border-red-500/35 hover:shadow-[var(--v2-shadow-md)]"
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500/20 to-transparent">
            <span className="h-2 w-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            {card.hasBriefing ? "Briefing" : "Live"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatRelative(card.publishedAt)}
          </span>
        </div>
        <h2 className="font-display text-base font-bold leading-snug group-hover:text-red-600 dark:group-hover:text-red-400">
          {card.title}
        </h2>
        {card.excerpt ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {card.excerpt}
          </p>
        ) : null}
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {card.hasBriefing ? "Read briefing" : "Updating soon"}
          <ArrowRight className="h-3 w-3" />
        </p>
      </div>
    </Link>
  );
}
