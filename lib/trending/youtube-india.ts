/**
 * YouTube most-popular videos for India.
 * Prefer official Data API when YOUTUBE_API_KEY is set.
 * Fallback: Google News items sourced from YouTube (no thumbnails / ids).
 */

import { fetchGoogleNewsByQuery } from "@/lib/seo/google-news-trends";

export type HubYouTubeItem = {
  id: string;
  title: string;
  channel?: string;
  views?: string;
  thumb: string;
  href: string;
  blurb: string;
  source: "youtube-api" | "news";
};

let cache: { data: HubYouTubeItem[]; ts: number } | null = null;
const TTL_MS = 20 * 60 * 1000;

function youtubeKey(): string {
  return (
    process.env.YOUTUBE_API_KEY?.trim() ||
    process.env.YOUTUBE_DATA_API_KEY?.trim() ||
    ""
  );
}

function thumbForId(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

async function fetchViaDataApi(limit: number): Promise<HubYouTubeItem[]> {
  const key = youtubeKey();
  if (!key) return [];

  const params = new URLSearchParams({
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: "IN",
    maxResults: String(Math.min(limit, 12)),
    key,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`,
    {
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 1200 },
    }
  );
  if (!res.ok) {
    console.warn(`[youtube] Data API HTTP ${res.status}`);
    return [];
  }

  const data = (await res.json()) as {
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        channelTitle?: string;
        description?: string;
        thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
      };
      statistics?: { viewCount?: string };
    }>;
  };

  const out: HubYouTubeItem[] = [];
  for (const item of data.items ?? []) {
    if (!item.id || !item.snippet?.title) continue;
    const views = item.statistics?.viewCount
      ? `${Number(item.statistics.viewCount).toLocaleString("en-IN")} views`
      : undefined;
    const desc = item.snippet.description?.trim().replace(/\s+/g, " ") ?? "";
    out.push({
      id: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      views,
      thumb:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        thumbForId(item.id),
      href: `https://www.youtube.com/watch?v=${item.id}`,
      blurb: desc
        ? desc.slice(0, 120) + (desc.length > 120 ? "…" : "")
        : `Popular on YouTube India${item.snippet.channelTitle ? ` · ${item.snippet.channelTitle}` : ""}`,
      source: "youtube-api",
    });
  }
  return out;
}

/** Soft fallback when no API key — YouTube-sourced Google News headlines. */
async function fetchViaNewsFallback(limit: number): Promise<HubYouTubeItem[]> {
  const headlines = await fetchGoogleNewsByQuery(
    "YouTube India OR viral video India when:1d",
    limit,
    "youtube-news"
  );

  return headlines.map((h, i) => {
    const title = h.title.replace(/\s*-\s*YouTube\s*$/i, "").trim();
    const id = `news-${i}-${title.slice(0, 24)}`;
    return {
      id,
      title,
      channel: h.source || "YouTube",
      thumb: "",
      href: h.link || "https://www.youtube.com/feed/trending?gl=IN",
      blurb: h.source
        ? `Buzzing around YouTube / video news · ${h.source}`
        : "Viral video buzz in India — open to watch on YouTube.",
      source: "news" as const,
    };
  });
}

export async function fetchIndiaYouTubeTrending(
  limit = 8
): Promise<HubYouTubeItem[]> {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return cache.data.slice(0, limit);
  }

  try {
    let items = await fetchViaDataApi(limit);
    if (!items.length) {
      items = await fetchViaNewsFallback(limit);
    }
    cache = { data: items, ts: Date.now() };
    return items.slice(0, limit);
  } catch (err) {
    console.warn("[youtube]", err instanceof Error ? err.message : err);
    return cache?.data.slice(0, limit) ?? [];
  }
}
