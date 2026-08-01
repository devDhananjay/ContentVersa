import { parseTmdbWatchProviders } from "./ott-affiliates";
import type {
  CineCastMember,
  CineMovieDetail,
  CineReview,
  CineTrailer,
} from "./types";

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

function parseCast(
  data: {
    cast?: {
      id: number;
      name: string;
      character?: string;
      profile_path?: string | null;
      order?: number;
    }[];
  } | null
): CineCastMember[] {
  const rows = data?.cast ?? [];
  return rows
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, 16)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character?.trim() || undefined,
      profileUrl: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : undefined,
      order: c.order ?? 0,
    }));
}

function parseReviews(
  data: {
    results?: {
      id: string;
      author: string;
      content: string;
      url?: string;
      created_at?: string;
      author_details?: { rating?: number | null };
    }[];
  } | null
): CineReview[] {
  const rows = data?.results ?? [];
  return rows.slice(0, 6).map((r) => ({
    id: r.id,
    author: r.author,
    content: r.content.trim(),
    rating: r.author_details?.rating ?? undefined,
    createdAt: r.created_at,
    url: r.url,
  }));
}

/** TMDB release type: 1 Premiere, 2 Theatrical (limited), 3 Theatrical, 4 Digital, 5 Physical, 6 TV */
function parseIndiaReleaseDates(
  data: {
    results?: {
      iso_3166_1: string;
      release_dates?: { type: number; release_date: string }[];
    }[];
  } | null
): { theatrical?: string; ott?: string } {
  const india = data?.results?.find((r) => r.iso_3166_1 === "IN");
  const dates = india?.release_dates ?? [];
  const theatrical = dates.find((d) => d.type === 3 || d.type === 2)?.release_date;
  const ott = dates.find((d) => d.type === 4)?.release_date;
  return {
    theatrical: theatrical?.slice(0, 10),
    ott: ott?.slice(0, 10),
  };
}

export function trailerFingerprint(trailers: CineTrailer[]): string | null {
  const first = trailers[0];
  return first ? `${first.key}:${first.name}` : null;
}

export async function fetchMovieDetail(tmdbId: string): Promise<CineMovieDetail | null> {
  const [movie, providersData, videosData, creditsData, reviewsData, releaseDates, externalIds] =
    await Promise.all([
      tmdbFetch<{
        id: number;
        title: string;
        overview: string;
        vote_average?: number;
        vote_count?: number;
        poster_path?: string | null;
        backdrop_path?: string | null;
        release_date?: string;
        runtime?: number;
        tagline?: string;
        original_language?: string;
        genres?: { name: string }[];
      }>(`/movie/${tmdbId}`, { language: "en-US" }),
      tmdbFetch<Parameters<typeof parseTmdbWatchProviders>[0]>(
        `/movie/${tmdbId}/watch/providers`
      ),
      tmdbFetch<Parameters<typeof parseTrailers>[0]>(`/movie/${tmdbId}/videos`, {
        language: "en-US",
      }),
      tmdbFetch<Parameters<typeof parseCast>[0]>(`/movie/${tmdbId}/credits`),
      tmdbFetch<Parameters<typeof parseReviews>[0]>(`/movie/${tmdbId}/reviews`, {
        language: "en-US",
      }),
      tmdbFetch<Parameters<typeof parseIndiaReleaseDates>[0]>(
        `/movie/${tmdbId}/release_dates`
      ),
      tmdbFetch<{ imdb_id?: string | null }>(`/movie/${tmdbId}/external_ids`),
    ]);

  if (!movie) return null;

  const trailers = parseTrailers(videosData);
  const providers = providersData
    ? parseTmdbWatchProviders(providersData, movie.title, "IN")
    : [];
  const indiaDates = parseIndiaReleaseDates(releaseDates);

  return {
    id: String(movie.id),
    title: movie.title,
    overview: movie.overview?.trim() ?? "",
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : undefined,
    voteCount: movie.vote_count,
    releaseDate: movie.release_date,
    theatricalReleaseDate: indiaDates.theatrical ?? movie.release_date,
    ottReleaseDate: indiaDates.ott,
    runtime: movie.runtime,
    tagline: movie.tagline?.trim() || undefined,
    originalLanguage: movie.original_language,
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
    cast: parseCast(creditsData),
    reviews: parseReviews(reviewsData),
    imdbId: externalIds?.imdb_id?.trim() || undefined,
  };
}

export async function fetchMovieTrailers(tmdbId: string): Promise<CineTrailer[]> {
  const data = await tmdbFetch<Parameters<typeof parseTrailers>[0]>(
    `/movie/${tmdbId}/videos`,
    { language: "en-US" }
  );
  return parseTrailers(data);
}
