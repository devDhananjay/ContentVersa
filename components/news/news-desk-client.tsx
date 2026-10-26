"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, TrendingUp, X } from "lucide-react";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { MrecAd } from "@/components/ads/mrec-ad";
import { SiteVoiceSearch } from "@/components/search/site-voice-search";
import type { LiveNewsCard, NewsDeskPayload } from "@/lib/data/live-news";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

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

function chunkItems<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export function NewsDeskClient({ desk }: { desk: NewsDeskPayload }) {
  const { items, trendingKeywords, filters } = desk;
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [visible, setVisible] = React.useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((card) => {
      if (filter !== "all" && card.feedKey !== filter) return false;
      if (!needle) return true;
      const hay =
        `${card.title} ${card.excerpt} ${card.categoryLabel} ${card.feedLabel}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q, filter]);

  React.useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [q, filter]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;
  const chunks = chunkItems(shown, PAGE_SIZE);
  const briefings = filtered.filter((i) => i.hasBriefing);
  const pending = filtered.filter((i) => !i.hasBriefing);

  const loadMore = React.useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisible((n) => Math.min(n + PAGE_SIZE, filtered.length));
      setLoadingMore(false);
    }, 180);
  }, [filtered.length, hasMore, loadingMore]);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { root: null, rootMargin: "320px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  const applyKeyword = (keyword: string) => {
    setQ(keyword);
    setFilter("all");
  };

  const clearTrending = () => setQ("");
  const activeTrending = trendingKeywords.find(
    (kw) => q.trim().toLowerCase() === kw.toLowerCase()
  );
  const hasSearchOrFilter = Boolean(q.trim()) || filter !== "all";

  return (
    <>
      <div className="mb-3">
        <SiteVoiceSearch
          size="bar"
          placeholder="Search news… or tap the mic"
          searchPath="/news"
          navigateOnSubmit={false}
          navigateOnVoice={false}
          onQueryChange={setQ}
          value={q}
        />
      </div>

      {trendingKeywords.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-red-500" aria-hidden />
            Trending
          </span>
          {trendingKeywords.map((kw) => {
            const active = q.trim().toLowerCase() === kw.toLowerCase();
            return (
              <button
                key={kw}
                type="button"
                onClick={() => (active ? clearTrending() : applyKeyword(kw))}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-red-500/45 bg-red-500/10 text-red-700 dark:text-red-300"
                    : "border-border/70 bg-card text-foreground hover:border-red-500/35 hover:bg-muted/60"
                )}
              >
                <TrendingUp className="h-3 w-3 text-red-500" aria-hidden />
                {kw}
                {active ? <X className="h-3 w-3 opacity-70" aria-hidden /> : null}
              </button>
            );
          })}
          {activeTrending ? (
            <button
              type="button"
              onClick={clearTrending}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden />
              Clear
            </button>
          ) : null}
        </div>
      ) : null}

      {hasSearchOrFilter && !activeTrending ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {q.trim() ? (
            <span className="text-xs text-muted-foreground">
              Search: “{q.trim()}”
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFilter("all");
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <X className="h-3 w-3" aria-hidden />
            Clear filters
          </button>
        </div>
      ) : null}

      {filters.length > 1 ? (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300"
                    : "border-border/70 bg-muted/40 text-muted-foreground hover:border-red-500/30 hover:text-foreground"
                )}
              >
                {f.label}
                <span className="ml-1 tabular-nums opacity-70">{f.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <BandAd slotKey="horizontal" />

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          News desk is warming up — check back in a few minutes.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
          No stories match
          {q.trim() ? ` “${q.trim()}”` : ""}
          {filter !== "all" ? ` in this filter` : ""}. Try another word or clear
          filters.
        </p>
      ) : (
        <>
          <p className="mt-4 text-xs text-muted-foreground">
            Showing {shown.length} of {filtered.length}
            {filter !== "all" || q.trim() ? " (filtered)" : ""} · last 30 days
          </p>

          {chunks.map((chunk, chunkIndex) => (
            <React.Fragment key={`chunk-${chunkIndex}`}>
              <div
                className={cn(
                  "grid grid-cols-1 gap-4 sm:grid-cols-2",
                  chunkIndex === 0 ? "mt-4" : "mt-4"
                )}
              >
                {chunk.map((card) => (
                  <NewsCard key={card.id} card={card} />
                ))}
              </div>

              {/* Ad after every loaded batch (incl. infinite-scroll pages) */}
              <div className="my-8 flex justify-center">
                <MrecAd slotKey="inArticle" />
              </div>
            </React.Fragment>
          ))}

          <div ref={sentinelRef} className="h-8 w-full" aria-hidden />

          {hasMore ? (
            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              {loadingMore ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading more…
                </>
              ) : (
                "Scroll for more"
              )}
            </p>
          ) : (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              You’re all caught up for this view.
            </p>
          )}
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
