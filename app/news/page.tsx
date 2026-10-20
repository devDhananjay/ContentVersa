import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { getNewsDesk } from "@/lib/data/live-news";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Live News — India desk briefings | ContentVerse India",
  description:
    "Live India news briefings rewritten for ContentVerse readers — politics, business, sports and top stories, updated through the day.",
  path: "/news",
  keywords: [
    "India live news",
    "ContentVerse news",
    "India headlines",
    "news briefings India",
    "TOI rewrite India",
  ],
});

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

export default async function NewsHubPage() {
  const items = await getNewsDesk(24);
  const briefings = items.filter((i) => i.hasBriefing);
  const pending = items.filter((i) => !i.hasBriefing);

  return (
    <div className="space-y-10 pb-16">
      <HubEditorialIntro title="Live News desk">
        <p>
          Original ContentVerse India briefings for the stories moving right now.
          We rewrite from public headlines — not wire copy — so you get a clear
          India-first read without leaving the site.
        </p>
        <p>
          Prefer longer explainers? Browse{" "}
          <Link href="/blogs" className="text-primary hover:underline">
            Articles
          </Link>{" "}
          or{" "}
          <Link href="/guides" className="text-primary hover:underline">
            Guides
          </Link>
          .
        </p>
      </HubEditorialIntro>

      <HubAdSense />

      <section className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="v2-eyebrow mb-2 inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Radio className="h-3.5 w-3.5" />
              India desk
            </p>
            <h1 className="font-display flex flex-nowrap items-center gap-2.5 text-3xl font-bold tracking-tight md:text-4xl">
              <span
                className="relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 live-news-dot"
                aria-hidden
              />
              <span className="whitespace-nowrap">
                <span className="live-news-title-blink text-red-600 dark:text-red-400">
                  Live
                </span>{" "}
                <span className="text-foreground">News</span>
              </span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {briefings.length} briefing{briefings.length === 1 ? "" : "s"} · updates
            every 30 min
          </p>
        </div>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-muted/30 p-8 text-center text-muted-foreground">
            News desk is warming up — check back in a few minutes.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((card) => (
              <Link
                key={card.id}
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
            ))}
          </div>
        )}

        {pending.length > 0 && briefings.length > 0 ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Some live headlines are still being rewritten into ContentVerse
            briefings — they appear here as soon as they publish.
          </p>
        ) : null}
      </section>
    </div>
  );
}
