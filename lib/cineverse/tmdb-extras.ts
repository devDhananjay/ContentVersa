import { parseTmdbWatchProviders } from "./ott-affiliates";
import type { CineMovieDetail, CineTrailer } from "./types";

function tmdbHeaders(): Record<string, string> | null {
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  if (!token) return null;
  return { Authorization: `Bearer ${token}`, Accept: "application/json" };
}

function tmdbUrl(path: string, params?: Record<string, string>): string | null {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  const headers = tmdbHeaders();
  if (!headers && !apiKey) return null;
  const base = `https://api.themoviedb.org/3${path}`;
  const qs = new URLSearchParams(params ?? {});
  if (!headers && apiKey) qs.set("api_key", apiKey);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  const url = tmdbUrl(path, params);
  if (!url) return null;
  const headers = tmdbHeaders() ?? { Accept: "application/json" };
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

function parseTrailers(
  data: {
    results?: {
      key: string;
      name: string;
      site: string;
      type: string;
      official?: boolean;
    }[];
  } | null
): CineTrailer[] {
  const rows = data?.results ?? [];
  const trailers = rows.filter(
    (v) => v.site === "YouTube" && /Trailer|Teaser/i.test(v.type)
  );
  trailers.sort((a, b) => {
    if (a.official && !b.official) return -1;
    if (!a.official && b.official) return 1;
    return a.type === "Trailer" ? -1 : 1;
  });
  return trailers.slice(0, 3).map((v) => ({
    key: v.key,
    name: v.name,
    site: v.site,
    type: v.type,
    youtubeUrl: `https://www.youtube.com/watch?v=${v.key}`,
  }));
}

export function trailerFingerprint(trailers: CineTrailer[]): string | null {
  const first = trailers[0];
  return first ? `${first.key}:${first.name}` : null;
}

export async function fetchMovieDetail(tmdbId: string): Promise<CineMovieDetail | null> {
  const [movie, providersData, videosData] = await Promise.all([
    tmdbFetch<{
      id: number;
      title: string;
      overview: string;
      vote_average?: number;
      poster_path?: string | null;
      backdrop_path?: string | null;
      release_date?: string;
      runtime?: number;
      genres?: { name: string }[];
    }>(`/movie/${tmdbId}`, { language: "en-US" }),
    tmdbFetch<Parameters<typeof parseTmdbWatchProviders>[0]>(
      `/movie/${tmdbId}/watch/providers`
    ),
    tmdbFetch<Parameters<typeof parseTrailers>[0]>(`/movie/${tmdbId}/videos`, {
      language: "en-US",
    }),
  ]);

  if (!movie) return null;

  const trailers = parseTrailers(videosData);
  const providers = providersData
    ? parseTmdbWatchProviders(providersData, movie.title, "IN")
    : [];

  return {
    id: String(movie.id),
    title: movie.title,
    overview: movie.overview?.trim() ?? "",
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : undefined,
    releaseDate: movie.release_date,
    runtime: movie.runtime,
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined,
    backdropUrl: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : undefined,
    href: `/cineverse/movie/${movie.id}`,
    genres: movie.genres?.map((g) => g.name) ?? [],
    providers,
    trailers,
  };
}

export async function fetchMovieTrailers(tmdbId: string): Promise<CineTrailer[]> {
  const data = await tmdbFetch<Parameters<typeof parseTrailers>[0]>(
    `/movie/${tmdbId}/videos`,
    { language: "en-US" }
  );
  return parseTrailers(data);
}
