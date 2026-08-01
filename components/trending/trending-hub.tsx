import Link from "next/link";
import { ArrowRight, Flame, Newspaper, Search } from "lucide-react";
import { shortTrendBlurb, type TrendItem } from "@/lib/trending/google-trends";
import type { HubNewsItem } from "@/lib/trending/hub";
import { Badge } from "@/components/ui/badge";

function SpikeCard({
  trend,
  rank,
  featured = false,
}: {
  trend: TrendItem;
  rank: number;
  featured?: boolean;
}) {
  const blurb = shortTrendBlurb(trend);
  const extraNews = trend.newsItems.slice(1, featured ? 3 : 2);

  return (
    <Link
      href={trend.href}
      className={
        featured
          ? "group flex h-full flex-col gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 transition hover:border-orange-400/40 sm:p-5"
          : "group flex h-full gap-3 rounded-2xl border border-border/50 bg-card/70 p-3.5 transition hover:border-orange-400/40 sm:p-4"
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-sm font-bold text-orange-300">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={
              featured
                ? "font-display text-lg font-bold leading-snug group-hover:text-orange-300 sm:text-xl"
                : "font-semibold leading-snug group-hover:text-orange-300"
            }
          >
            {trend.title}
          </p>
          {trend.traffic ? (
            <p className="mt-1 text-[11px] font-medium text-orange-400/90">
              ~{trend.traffic} searches
            </p>
          ) : null}
        </div>
        {trend.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trend.picture}
            alt=""
            className={
              featured
                ? "h-20 w-20 shrink-0 rounded-xl border border-border/40 object-cover bg-muted sm:h-24 sm:w-24"
                : "h-14 w-14 shrink-0 rounded-xl border border-border/40 object-cover bg-muted"
            }
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </div>
      <p
        className={
          featured
            ? "text-sm leading-relaxed text-muted-foreground line-clamp-3"
            : "text-sm leading-relaxed text-muted-foreground line-clamp-2"
        }
      >
        {blurb}
      </p>
      {extraNews.length > 0 ? (
        <ul className="mt-auto space-y-1">
          {extraNews.map((n) => (
            <li
              key={n.url}
              className="flex items-start gap-1.5 text-[11px] text-muted-foreground/90"
            >
              <Newspaper className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
              <span className="line-clamp-1">
                {n.title}
                {n.source ? ` · ${n.source}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-300/90 opacity-0 transition group-hover:opacity-100">
        Open briefing
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function NewsCard({ item }: { item: HubNewsItem }) {
  return (
    <Link
      href={item.href}
      className="group flex h-full gap-3 rounded-2xl border border-border/50 bg-card/70 p-3.5 transition hover:border-sky-400/40 sm:p-4"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
        <Newspaper className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-semibold leading-snug group-hover:text-sky-300">
          {item.title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {item.blurb}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {item.source ? <span>{item.source}</span> : null}
          {item.matchedSpikeSlug ? (
            <Badge variant="secondary" className="text-[10px]">
              Also searching
            </Badge>
          ) : null}
        </div>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-sky-300" />
    </Link>
  );
}

export function TrendingHub({
  spikes,
  news,
}: {
  spikes: TrendItem[];
  news: HubNewsItem[];
}) {
  const hero = spikes.slice(0, 3);
  const rest = spikes.slice(3);

  return (
    <div className="space-y-10">
      {hero.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h2 className="font-display text-xl font-bold tracking-tight">
              Top spikes right now
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {hero.map((t, i) => (
              <SpikeCard key={t.slug} trend={t} rank={i + 1} featured />
            ))}
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-orange-400" />
            <h2 className="font-display text-xl font-bold tracking-tight">
              Google search spikes
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Live from Google Trends India — what people are searching right now.
          </p>
          <ol className="grid gap-3 sm:grid-cols-2">
            {rest.map((t, i) => (
              <li key={t.slug}>
                <SpikeCard trend={t} rank={i + 4} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {news.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-sky-400" />
            <h2 className="font-display text-xl font-bold tracking-tight">
              News headlines India
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            What&apos;s moving in Indian news — short context on ContentVerse,
            full articles on publisher sites.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {news.map((item) => (
              <li key={item.slug}>
                <NewsCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {spikes.length === 0 && news.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Trends feed is refreshing — check back in a minute.
        </p>
      ) : null}
    </div>
  );
}
