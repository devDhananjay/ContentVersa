/**
 * YouTube India for the Trending hub.
 * 1) Official Data API (mostPopular IN) when YOUTUBE_API_KEY works
 * 2) Public channel Atom feeds — always give real video IDs + thumbnails (no key)
 */

export type HubYouTubeItem = {
  id: string;
  title: string;
  channel?: string;
  views?: string;
  thumb: string;
  href: string;
  blurb: string;
  source: "youtube-api" | "rss";
};

let cache: { data: HubYouTubeItem[]; ts: number } | null = null;
const TTL_MS = 20 * 60 * 1000;

/** Popular India-facing channels — public RSS, no API key. */
const INDIA_CHANNEL_IDS = [
  "UCq-Fj5jknLsUf-MWSy4_brA", // T-Series
  "UCRWFSbif-RFENbBrSiez1DA", // ABP News
  "UCYPvAwZP8pZhSMW8qs7cVCw", // India Today
  "UC6-F5tO8uklgE9Zy8IvbdFw", // Sony SAB
  "UCj22tfcQrWG7EMEKS0qHeEg", // CarryMinati
  "UC8md0UEPaUVfuM44opWnwgQ", // FilterCopy (India)
];


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

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function tag(block: string, name: string): string {
  const m =
    block.match(new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`, "i")) ||
    block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m?.[1] ? decodeXml(m[1].replace(/<[^>]+>/g, "")) : "";
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

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${params}`,
      {
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      }
    );
    const data = (await res.json()) as {
      error?: { message?: string; errors?: Array<{ reason?: string }> };
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

    if (!res.ok || data.error) {
      console.warn(
        `[youtube] Data API ${res.status}: ${data.error?.message || "blocked"} (${data.error?.errors?.[0]?.reason || "n/a"}) — using RSS fallback`
      );
      return [];
    }

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
  } catch (err) {
    console.warn("[youtube] Data API fetch failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

async function fetchChannelFeed(
  channelId: string,
  take = 3
): Promise<Array<HubYouTubeItem & { publishedAt: number }>> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: {
        Accept: "application/atom+xml, application/xml, text/xml, */*",
        "User-Agent": "ContentVerse IndiaTrends/1.0 (+https://contentverse.co.in)",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/gi) || [];
    const out: Array<HubYouTubeItem & { publishedAt: number }> = [];

    for (const entry of entries.slice(0, take)) {
      const id =
        tag(entry, "yt:videoId") ||
        (entry.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/) || [])[1] ||
        "";
      const title = tag(entry, "title");
      if (!id || !title) continue;
      const channel = tag(entry, "name") || undefined;
      const published = tag(entry, "published");
      const publishedAt = published ? Date.parse(published) : Date.now();
      const mediaThumb =
        entry.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] || "";
      const desc = tag(entry, "media:description") || tag(entry, "summary");

      out.push({
        id,
        title,
        channel,
        thumb: mediaThumb || thumbForId(id),
        href: `https://www.youtube.com/watch?v=${id}`,
        blurb: desc
          ? desc.slice(0, 120) + (desc.length > 120 ? "…" : "")
          : `Fresh upload on YouTube${channel ? ` · ${channel}` : ""}`,
        source: "rss",
        publishedAt: Number.isFinite(publishedAt) ? publishedAt : Date.now(),
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchViaChannelRss(limit: number): Promise<HubYouTubeItem[]> {
  const feeds = await Promise.all(
    INDIA_CHANNEL_IDS.filter(Boolean).map((id) => fetchChannelFeed(id, 3))
  );
  const merged = feeds.flat();
  const seen = new Set<string>();
  const unique: Array<HubYouTubeItem & { publishedAt: number }> = [];
  for (const v of merged.sort((a, b) => b.publishedAt - a.publishedAt)) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    unique.push(v);
  }
  return unique.slice(0, limit).map(({ publishedAt: _p, ...rest }) => rest);
}

export async function fetchIndiaYouTubeTrending(
  limit = 8
): Promise<HubYouTubeItem[]> {
  if (cache && Date.now() - cache.ts < TTL_MS && cache.data.length > 0) {
    return cache.data.slice(0, limit);
  }

  try {
    let items = await fetchViaDataApi(limit);
    if (!items.length) {
      items = await fetchViaChannelRss(limit);
    }
    if (items.length) {
      cache = { data: items, ts: Date.now() };
    }
    return items.slice(0, limit);
  } catch (err) {
    console.warn("[youtube]", err instanceof Error ? err.message : err);
    if (cache?.data.length) return cache.data.slice(0, limit);
    return fetchViaChannelRss(limit);
  }
}
