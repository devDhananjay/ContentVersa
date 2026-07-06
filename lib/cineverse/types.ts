/** Normalized movie card for CineVerse hub & watchlist. */
export type CineMovie = {
  id: string;
  title: string;
  overview: string;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: number;
  releaseDate?: string;
  href: string;
};

export type StreamingProvider = {
  id: number;
  name: string;
  logoUrl?: string;
  type: "stream" | "rent" | "buy";
  /** Affiliate or search deep link */
  watchUrl: string;
};

export type CineTrailer = {
  key: string;
  name: string;
  site: string;
  type: string;
  youtubeUrl?: string;
};

export type CineMovieDetail = CineMovie & {
  runtime?: number;
  genres: string[];
  providers: StreamingProvider[];
  trailers: CineTrailer[];
};

export type CineverseHubData = {
  trending: CineMovie[];
  nowPlaying: CineMovie[];
  upcoming: CineMovie[];
  updatedAt: string;
};

export type CineRecommendPick = {
  movie: CineMovie;
  reason: string;
};

export type CineRecommendResult = {
  blurb: string;
  picks: CineRecommendPick[];
  source: "gemini" | "local";
};
