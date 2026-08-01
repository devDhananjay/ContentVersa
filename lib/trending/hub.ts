import {
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

export type HubNewsItem = {
  title: string;
  source?: string;
  publishedAt?: string;
  link?: string;
  slug: string;
  href: string;
  blurb: string;
  /** When headline soft-matches a live Google Trends spike */
  matchedSpikeSlug?: string;
};

export type TrendingHubData = {
  spikes: TrendItem[];
  news: HubNewsItem[];
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

/** Soft-match a news headline to a live Google Trends spike. */
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
    // Need meaningful overlap: at least 1 shared token for short titles,
    // or ~40% of spike tokens for longer ones.
    const need = sTokens.size <= 2 ? 1 : Math.max(2, Math.ceil(sTokens.size * 0.4));
    if (overlap < need) continue;
    const score = overlap / sTokens.size;
    if (!best || score > best.score) best = { spike, score };
  }
  return best?.spike ?? null;
}

function shortNewsBlurb(h: GoogleNewsHeadline): string {
  if (h.source) {
    return `Breaking coverage from ${h.source} — open for a short ContentVerse briefing.`;
  }
  return "In the India news cycle right now — open for context without leaving ContentVerse.";
}

function toHubNews(
  headlines: GoogleNewsHeadline[],
  spikes: TrendItem[]
): HubNewsItem[] {
  const usedSlugs = new Set(spikes.map((s) => s.slug));
  const out: HubNewsItem[] = [];

  for (const h of headlines) {
    const matched = matchHeadlineToSpike(h.title, spikes);
    let slug = matched?.slug ?? trendSlug(h.title);
    // Avoid colliding with an unrelated spike slug when unmatched
    if (!matched && usedSlugs.has(slug)) {
      slug = `${slug}-news`;
    }
    usedSlugs.add(slug);

    out.push({
      title: h.title,
      source: h.source,
      publishedAt: h.publishedAt,
      link: h.link,
      slug,
      href: matched ? matched.href : trendPath(slug),
      blurb: shortNewsBlurb(h),
      matchedSpikeSlug: matched?.slug,
    });
  }
  return out;
}

export async function getTrendingHub(): Promise<TrendingHubData> {
  if (hubCache && Date.now() - hubCache.ts < HUB_TTL_MS) {
    return hubCache.data;
  }

  const [spikes, headlines] = await Promise.all([
    fetchIndiaTrends(),
    fetchIndiaTopNews(16),
  ]);

  const data: TrendingHubData = {
    spikes,
    news: toHubNews(headlines, spikes),
  };
  hubCache = { data, ts: Date.now() };
  return data;
}

/** Resolve /trending/[slug] from spikes or news-backed hub items. */
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
    hub.news.find((n) => n.slug === decoded || n.slug === slug) ?? null;
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
