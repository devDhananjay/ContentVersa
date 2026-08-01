import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clapperboard,
  Cpu,
  ExternalLink,
  Flame,
  Medal,
  Newspaper,
  Play,
  Search,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { shortTrendBlurb, type TrendItem } from "@/lib/trending/google-trends";
import type {
  HubNewsItem,
  HubTopicLane,
  HubYouTubeItem,
} from "@/lib/trending/hub";
import { Badge } from "@/components/ui/badge";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { TrendThumb } from "@/components/trending/trend-thumb";

const LANE_ICONS: Record<string, LucideIcon> = {
  cricket: Medal,
  entertainment: Clapperboard,
  "ai-tech": Cpu,
  jobs: Briefcase,
  finance: Wallet,
};

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

  if (featured) {
    return (
      <Link
        href={trend.href}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 transition hover:border-orange-400/40"
      >
        <div className="relative">
          <TrendThumb src={trend.picture} className="aspect-[16/10] w-full" />
          <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-bold text-orange-300 backdrop-blur">
            {rank}
          </span>
          {trend.traffic ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-medium text-orange-200 backdrop-blur">
              ~{trend.traffic} searches
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
          <p className="font-display text-lg font-bold leading-snug group-hover:text-orange-300 sm:text-xl">
            {trend.title}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
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
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={trend.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/70 transition hover:border-orange-400/40"
    >
      <div className="flex gap-3 p-3.5 sm:p-4">
        <div className="relative w-[6.5rem] shrink-0 sm:w-28">
          <TrendThumb
            src={trend.picture}
            className="aspect-[4/3] w-full rounded-xl border border-border/40"
          />
          <span className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-orange-300 backdrop-blur">
            {rank}
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-semibold leading-snug group-hover:text-orange-300 line-clamp-2">
            {trend.title}
          </p>
          {trend.traffic ? (
            <p className="text-[11px] font-medium text-orange-400/90">
              ~{trend.traffic} searches
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {blurb}
          </p>
        </div>
      </div>
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
        <p className="font-semibold leading-snug group-hover:text-sky-300 line-clamp-2">
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

function YouTubeCard({ item }: { item: HubYouTubeItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/70 transition hover:border-red-400/40"
    >
      <div className="relative">
        <TrendThumb
          src={item.thumb || null}
          className="aspect-video w-full bg-gradient-to-br from-red-500/20 to-orange-500/10"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg transition group-hover:scale-105">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <p className="font-semibold leading-snug group-hover:text-red-300 line-clamp-2">
          {item.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.blurb}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {item.channel ? <span className="truncate">{item.channel}</span> : null}
          <span className="inline-flex items-center gap-0.5 text-red-300/90">
            Watch
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </a>
  );
}

function SectionJump({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  return (
    <a
      href={`#${id}`}
      className="shrink-0 rounded-full border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-semibold transition hover:border-orange-400/50 hover:text-orange-300"
    >
      {label}
    </a>
  );
}

export function TrendingHub({
  spikes,
  news,
  lanes,
  youtube,
}: {
  spikes: TrendItem[];
  news: HubNewsItem[];
  lanes: HubTopicLane[];
  youtube: HubYouTubeItem[];
}) {
  const hero = spikes.slice(0, 3);
  const rest = spikes.slice(3);
  const filledLanes = lanes.filter((l) => l.items.length > 0);

  const empty =
    spikes.length === 0 &&
    news.length === 0 &&
    youtube.length === 0 &&
    filledLanes.length === 0;

  return (
    <div className="space-y-12">
      <nav
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        aria-label="Trending sections"
      >
        <SectionJump id="google-trends" label="Google Trends" />
        <SectionJump id="trending-news" label="Trending News" />
        {filledLanes.map((l) => (
          <SectionJump key={l.id} id={l.id} label={l.title} />
        ))}
        {youtube.length > 0 ? (
          <SectionJump id="youtube-india" label="YouTube" />
        ) : null}
      </nav>

      <section id="google-trends" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-orange-400" />
          <h2 className="font-display text-xl font-bold tracking-tight">
            Google Trends
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Live search spikes from Google Trends India — what people are
          searching right now.
        </p>
        {hero.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {hero.map((t, i) => (
              <SpikeCard key={t.slug} trend={t} rank={i + 1} featured />
            ))}
          </div>
        ) : null}
        {rest.length > 0 ? (
          <ol className="grid gap-4 sm:grid-cols-2">
            {rest.map((t, i) => (
              <li key={t.slug}>
                <SpikeCard trend={t} rank={i + 4} />
              </li>
            ))}
          </ol>
        ) : null}
        {spikes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Google Trends feed is refreshing…
          </p>
        ) : null}
      </section>

      <HubAdSense className="my-2" />

      <section id="trending-news" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-sky-400" />
          <h2 className="font-display text-xl font-bold tracking-tight">
            Trending News
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Top India headlines right now — short blurbs on ContentVerse.
        </p>
        {news.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {news.map((item) => (
              <li key={item.slug}>
                <NewsCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">News feed refreshing…</p>
        )}
      </section>

      {filledLanes.map((lane) => {
        const Icon = LANE_ICONS[lane.id] || Flame;
        return (
          <section
            key={lane.id}
            id={lane.id}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-orange-400" />
              <h2 className="font-display text-xl font-bold tracking-tight">
                {lane.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">{lane.description}</p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {lane.items.map((item) => (
                <li key={item.slug}>
                  <NewsCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {youtube.length > 0 ? (
        <section id="youtube-india" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-red-400" />
            <h2 className="font-display text-xl font-bold tracking-tight">
              YouTube India
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Fresh uploads from top India channels — watch on YouTube.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {youtube.map((item) => (
              <li key={item.id}>
                <YouTubeCard item={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {empty ? (
        <p className="text-sm text-muted-foreground">
          Trends feed is refreshing — check back in a minute.
        </p>
      ) : null}

      <HubAdSense className="my-2" />
    </div>
  );
}
