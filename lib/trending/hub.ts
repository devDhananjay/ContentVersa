import {
  fetchGoogleNewsByQuery,
  fetchIndiaTopNews,
  type GoogleNewsHeadline,
} from "@/lib/seo/google-news-trends";
import {
  fetchIndiaTrends,
  getTrendBySlug,
  trendPath,
  trendSlug,
  type TrendItem,
  type TrendNewsItem,
} from "@/lib/trending/google-trends";
import {
  fetchIndiaYouTubeTrending,
  type HubYouTubeItem,
} from "@/lib/trending/youtube-india";

export type { HubYouTubeItem };

export type HubNewsItem = {
  title: string;
  source?: string;
  publishedAt?: string;
  link?: string;
  slug: string;
  href: string;
  blurb: string;
  matchedSpikeSlug?: string;
};

export type HubTopicLane = {
  id: string;
  title: string;
  description: string;
  items: HubNewsItem[];
};

export type TrendingHubData = {
  spikes: TrendItem[];
  news: HubNewsItem[];
  lanes: HubTopicLane[];
  youtube: HubYouTubeItem[];
};

export type ResolvedTrendingTopic =
  | {
      kind: "spike";
      trend: TrendItem;
    }
  | {
      kind: "news";
      title: string;
      slug: string;
      publishedAt?: string;
      newsItems: TrendNewsItem[];
    };

/** Auto sections on /trending (besides Google Trends + top news). */
export const TRENDING_TOPIC_LANES = [
  {
    id: "cricket",
    title: "Cricket",
    description: "IPL, Team India, and match-day buzz.",
    query: "cricket India OR IPL OR Team India when:1d",
  },
  {
    id: "entertainment",
    title: "Entertainment",
    description: "Bollywood, OTT, and celebrity chatter.",
    query: "Bollywood OR OTT India OR Netflix India OR Tollywood when:1d",
  },
  {
    id: "ai-tech",
    title: "AI & Tech",
    description: "AI launches, gadgets, and India tech news.",
    query:
      "artificial intelligence India OR ChatGPT OR Gemini AI OR technology India when:1d",
  },
  {
    id: "jobs",
    title: "Jobs",
    description: "Hiring, exams, and career updates.",
    query: "jobs India OR hiring India OR SSC OR UPSC OR placement when:1d",
  },
  {
    id: "finance",
    title: "Finance",
    description: "Markets, Sensex/Nifty, and money news.",
    query: "Sensex OR Nifty OR stock market India OR RBI OR personal finance India when:1d",
  },
] as const;

let hubCache: { data: TrendingHubData; ts: number } | null = null;
const HUB_TTL_MS = 15 * 60 * 1000;

function tokens(text: string): Set<string> {
  const parts = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  return new Set(parts);
}

export function matchHeadlineToSpike(
  headline: string,
  spikes: TrendItem[]
): TrendItem | null {
  const hTokens = tokens(headline);
  if (hTokens.size === 0) return null;

  let best: { spike: TrendItem; score: number } | null = null;
  for (const spike of spikes) {
    const sTokens = tokens(spike.title);
    if (sTokens.size === 0) continue;
    let overlap = 0;
    for (const t of sTokens) {
      if (hTokens.has(t)) overlap += 1;
    }
    const need = sTokens.size <= 2 ? 1 : Math.max(2, Math.ceil(sTokens.size * 0.4));
    if (overlap < need) continue;
    const score = overlap / sTokens.size;
    if (!best || score > best.score) best = { spike, score };
  }
  return best?.spike ?? null;
}

function shortNewsBlurb(h: GoogleNewsHeadline, laneTitle?: string): string {
  if (h.source && laneTitle) {
    return `${laneTitle} buzz from ${h.source} — open for a short ContentVerse India briefing.`;
  }
  if (h.source) {
    return `Breaking coverage from ${h.source} — open for a short ContentVerse India briefing.`;
  }
  return "In the India news cycle right now — open for context without leaving ContentVerse India.";
}

function toHubNews(
  headlines: GoogleNewsHeadline[],
  spikes: TrendItem[],
  usedSlugs: Set<string>,
  laneTitle?: string,
  slugPrefix?: string
): HubNewsItem[] {
  const out: HubNewsItem[] = [];

  for (const h of headlines) {
    const matched = matchHeadlineToSpike(h.title, spikes);
    let slug = matched?.slug ?? trendSlug(h.title);
    if (!matched) {
      if (slugPrefix) slug = `${slugPrefix}-${slug}`.slice(0, 96);
      if (usedSlugs.has(slug)) slug = `${slug}-n`;
    }
    usedSlugs.add(slug);

    out.push({
      title: h.title,
      source: h.source,
      publishedAt: h.publishedAt,
      link: h.link,
      slug,
      href: matched ? matched.href : trendPath(slug),
      blurb: shortNewsBlurb(h, laneTitle),
      matchedSpikeSlug: matched?.slug,
    });
  }
  return out;
}

function allNewsItems(data: TrendingHubData): HubNewsItem[] {
  return [...data.news, ...data.lanes.flatMap((l) => l.items)];
}

export async function getTrendingHub(): Promise<TrendingHubData> {
  if (hubCache && Date.now() - hubCache.ts < HUB_TTL_MS) {
    return hubCache.data;
  }

  const [spikes, headlines, youtube, ...laneHeadlines] = await Promise.all([
    fetchIndiaTrends(),
    fetchIndiaTopNews(12),
    fetchIndiaYouTubeTrending(8),
    ...TRENDING_TOPIC_LANES.map((lane) =>
      fetchGoogleNewsByQuery(lane.query, 8, lane.id)
    ),
  ]);

  const usedSlugs = new Set(spikes.map((s) => s.slug));
  const news = toHubNews(headlines, spikes, usedSlugs);

  const lanes: HubTopicLane[] = TRENDING_TOPIC_LANES.map((lane, i) => ({
    id: lane.id,
    title: lane.title,
    description: lane.description,
    items: toHubNews(
      laneHeadlines[i] ?? [],
      spikes,
      usedSlugs,
      lane.title,
      lane.id
    ),
  }));

  const data: TrendingHubData = {
    spikes,
    news,
    lanes,
    youtube,
  };
  hubCache = { data, ts: Date.now() };
  return data;
}

export async function resolveTrendingTopic(
  slug: string
): Promise<ResolvedTrendingTopic | null> {
  const spike = await getTrendBySlug(slug);
  if (spike) return { kind: "spike", trend: spike };

  const hub = await getTrendingHub();
  const decoded = (() => {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  })().normalize("NFC");

  const news =
    allNewsItems(hub).find((n) => n.slug === decoded || n.slug === slug) ??
    null;
  if (news) {
    const newsItems: TrendNewsItem[] = news.link
      ? [
          {
            title: news.title,
            url: news.link,
            source: news.source || "Google News",
          },
        ]
      : [];
    return {
      kind: "news",
      title: news.title,
      slug: news.slug,
      publishedAt: news.publishedAt,
      newsItems,
    };
  }

  return null;
}
