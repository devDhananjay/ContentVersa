import type { FeedItem } from "./types";

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  poster_path: string | null;
};

function tmdbHeaders(): Record<string, string> | null {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
  }
  return null;
}

export async function fetchTmdbFeed(limit = 8): Promise<FeedItem[]> {
  const headers = tmdbHeaders();
  const apiKey = process.env.TMDB_API_KEY;
  if (!headers && !apiKey) return [];

  const url = headers
    ? "https://api.themoviedb.org/3/trending/movie/day"
    : `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`;

  const res = await fetch(url, {
    headers: headers ?? { Accept: "application/json" },
    next: { revalidate: 900 },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as { results?: TmdbMovie[] };
  return (data.results ?? []).slice(0, limit).map((movie) => ({
    id: String(movie.id),
    title: movie.title,
    externalUrl: `https://www.themoviedb.org/movie/${movie.id}`,
    subtitle: movie.overview?.slice(0, 120) || undefined,
    description: movie.overview || undefined,
    meta: movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : undefined,
    image: movie.poster_path
      ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
      : undefined,
  }));
}
