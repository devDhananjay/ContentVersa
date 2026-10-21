/**
 * CineVerse movie URLs for sitemap — TMDB lists we already surface on the hub.
 */

import { fetchCineverseHubData } from "@/lib/cineverse/tmdb-hub";

type TmdbRow = {
  id: number;
  title?: string;
  release_date?: string;
};

function tmdbHeaders(): Record<string, string> | null {
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

function tmdbUrl(path: string, params?: Record<string, string>): string | null {
  const headers = tmdbHeaders();
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!headers && !apiKey) return null;
  const base = `https://api.themoviedb.org/3${path}`;
  const qs = new URLSearchParams(params ?? {});
  if (!headers && apiKey) qs.set("api_key", apiKey);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

async function fetchListIds(
  path: string,
  params: Record<string, string>,
  pages: number
): Promise<Map<string, Date>> {
  const out = new Map<string, Date>();
  const headers = tmdbHeaders() ?? { Accept: "application/json" };

  for (let page = 1; page <= pages; page++) {
    const url = tmdbUrl(path, { ...params, page: String(page) });
    if (!url) break;
    try {
      const res = await fetch(url, {
        headers,
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = (await res.json()) as { results?: TmdbRow[] };
      for (const row of data.results ?? []) {
        if (!row?.id) continue;
        const id = String(row.id);
        const d = row.release_date ? new Date(row.release_date) : new Date();
        const prev = out.get(id);
        if (!prev || d > prev) out.set(id, Number.isFinite(d.getTime()) ? d : new Date());
      }
    } catch {
      break;
    }
  }
  return out;
}

export type CineverseSitemapMovie = {
  path: string;
  lastModified: Date;
};

/**
 * Movie detail paths for sitemap — India-relevant hub lists only.
 * Skips deep popular/top_rated pagination (thin TMDB long-tail / AdSense risk).
 * Caps lower so Google discovers curated titles, not mass shells.
 */
export async function getCineverseMovieSitemapEntries(
  limit = 120
): Promise<CineverseSitemapMovie[]> {
  const byId = new Map<string, Date>();

  try {
    const hub = await fetchCineverseHubData();
    for (const m of [...hub.trending, ...hub.nowPlaying, ...hub.upcoming]) {
      if (!m.id) continue;
      byId.set(
        m.id,
        m.releaseDate ? new Date(m.releaseDate) : new Date(hub.updatedAt)
      );
    }
  } catch {
    // continue with list endpoints
  }

  const region = "IN";
  const lists = await Promise.all([
    fetchListIds("/trending/movie/week", {}, 1),
    fetchListIds("/movie/now_playing", { region, language: "en-US" }, 1),
    fetchListIds("/movie/upcoming", { region, language: "en-US" }, 1),
  ]);

  for (const map of lists) {
    for (const [id, date] of map) {
      const prev = byId.get(id);
      if (!prev || date > prev) byId.set(id, date);
    }
  }

  // lastmod = when our page is considered current — NEVER TMDB theatrical
  // release (future premieres / 1950s classics both trip GSC "Invalid date").
  const now = new Date();
  return [...byId.entries()]
    .sort((a, b) => b[1].getTime() - a[1].getTime())
    .slice(0, limit)
    .map(([id]) => ({
      path: `/cineverse/movie/${id}`,
      lastModified: now,
    }));
}
