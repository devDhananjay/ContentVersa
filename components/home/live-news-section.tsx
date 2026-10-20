"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import type { LiveNewsCard } from "@/lib/data/live-news";
import { markReturnToLiveNews } from "@/components/home/live-news-return-scroll";
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

function LiveNewsHeading({ reduce }: { reduce: boolean | null }) {
  return (
    <h2 className="font-display flex flex-nowrap items-center gap-2.5 text-3xl font-bold tracking-tight md:text-4xl">
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500",
          !reduce && "live-news-dot"
        )}
        aria-hidden
      />
      <span className="whitespace-nowrap">
        <span
          className={cn(
            "text-red-600 dark:text-red-400",
            !reduce && "live-news-title-blink"
          )}
        >
          Live
        </span>{" "}
        <span className="text-foreground">News</span>
      </span>
    </h2>
  );
}

function NewsBox({
  card,
  index,
  reduce,
}: {
  card: LiveNewsCard;
  index: number;
  reduce: boolean | null;
}) {
  return (
    <motion.div
      className="h-full"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.04 }}
    >
      <Link
        href={card.hasBriefing ? card.href : "/news"}
        onClick={() => {
          if (card.hasBriefing) markReturnToLiveNews();
        }}
        className={cn(
          "group relative flex h-full min-h-[176px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/90 p-3.5 shadow-[var(--v2-shadow-sm)]",
          "transition-[border-color,box-shadow,transform] duration-300",
          "hover:border-red-500/35 hover:shadow-[var(--v2-shadow-md)]",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-red-500/0 before:via-red-500/70 before:to-red-500/0"
        )}
      >
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-red-500",
                !reduce && "animate-pulse"
              )}
            />
            Live
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatRelative(card.publishedAt)}
          </span>
        </div>

        <div className="flex flex-1 gap-3">
          {card.imageUrl ? (
            <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted">
              <Image
                src={card.imageUrl}
                alt=""
                fill
                sizes="72px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-red-500/15 bg-gradient-to-br from-red-500/15 via-muted to-transparent"
              aria-hidden
            >
              <span className="h-2 w-2 rounded-full bg-red-500/70" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {card.feedLabel}
              {card.categoryLabel && card.categoryLabel !== card.feedLabel
                ? ` · ${card.categoryLabel}`
                : ""}
            </p>
            <h3 className="font-display text-[0.95rem] font-bold leading-snug tracking-tight transition-colors group-hover:text-red-600 dark:group-hover:text-red-400 md:text-base">
              {card.title}
            </h3>
            {card.excerpt ? (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {card.excerpt}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs font-medium">
          <span className="text-muted-foreground">
            {card.hasBriefing ? "Read briefing" : "Open News desk"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-red-500/80 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

interface Props {
  items: LiveNewsCard[];
}

/** Home Live News — TOI headlines + ContentVerse briefings, under Reels. */
export function LiveNewsSection({ items }: Props) {
  const reduce = useReducedMotion();
  if (!items.length) return null;

  return (
    <section
      id="home-live-news"
      className="scroll-mt-[calc(var(--site-header-offset)+1rem)] border-b border-border/50 bg-gradient-to-b from-red-500/[0.04] via-transparent to-transparent"
      aria-label="Live News"
    >
      <div className="container py-10 md:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="v2-eyebrow mb-2 inline-flex items-center gap-1.5 text-red-600/90 dark:text-red-400/90">
              <Radio className="h-3.5 w-3.5" />
              Updating from India desk
            </p>
            <LiveNewsHeading reduce={reduce} />
            <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
              Fresh headlines every few minutes — open a box for our original
              ContentVerse briefing.
            </p>
          </div>
          <Link
            href="/news"
            className="hidden shrink-0 sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            All news <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((card, i) => (
            <NewsBox key={card.id} card={card} index={i} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}
