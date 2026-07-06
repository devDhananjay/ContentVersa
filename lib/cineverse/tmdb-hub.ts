import type { CineMovie, CineverseHubData } from "./types";

type TmdbRow = {
  id: number;
  title: string;
  overview?: string;
  vote_average?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
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

function mapMovie(row: TmdbRow): CineMovie {
  return {
    id: String(row.id),
    title: row.title,
    overview: row.overview?.trim() ?? "",
    rating: row.vote_average ? Number(row.vote_average.toFixed(1)) : undefined,
    releaseDate: row.release_date || undefined,
    posterUrl: row.poster_path
      ? `https://image.tmdb.org/t/p/w342${row.poster_path}`
      : undefined,
    backdropUrl: row.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${row.backdrop_path}`
      : undefined,
    href: `/cineverse/movie/${row.id}`,
  };
}

async function fetchTmdbList(
  path: string,
  params: Record<string, string>,
  limit: number
): Promise<CineMovie[]> {
  const url = tmdbUrl(path, params);
  if (!url) return [];

  const headers = tmdbHeaders() ?? { Accept: "application/json" };
  const res = await fetch(url, {
    headers,
    next: { revalidate: 900 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: TmdbRow[] };
  return (data.results ?? []).slice(0, limit).map(mapMovie);
}

export async function fetchCineverseHubData(): Promise<CineverseHubData> {
  const region = "IN";
  const [trending, nowPlaying, upcoming] = await Promise.all([
    fetchTmdbList("/trending/movie/day", {}, 12),
    fetchTmdbList("/movie/now_playing", { region, language: "en-US" }, 10),
    fetchTmdbList("/movie/upcoming", { region, language: "en-US" }, 10),
  ]);

  return {
    trending,
    nowPlaying,
    upcoming,
    updatedAt: new Date().toISOString(),
  };
}

/** Fetch a single movie by TMDB id (watchlist hydration). */
export async function fetchTmdbMoviesByIds(ids: string[]): Promise<CineMovie[]> {
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const movies = await Promise.all(
    unique.map(async (id) => {
      const url = tmdbUrl(`/movie/${id}`, { language: "en-US" });
      if (!url) return null;
      const headers = tmdbHeaders() ?? { Accept: "application/json" };
      const res = await fetch(url, { headers, next: { revalidate: 3600 } });
      if (!res.ok) return null;
      const row = (await res.json()) as TmdbRow;
      return mapMovie(row);
    })
  );
  return movies.filter((m): m is CineMovie => m !== null);
}
