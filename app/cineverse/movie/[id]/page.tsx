import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMovieDetail } from "@/lib/cineverse/tmdb-extras";
import { buildMetadata } from "@/lib/seo";
import { MovieDetailView } from "@/components/cineverse/movie-detail-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movie = await fetchMovieDetail(id);
  if (!movie) return buildMetadata({ title: "Movie not found", noIndex: true });

  const castHint = movie.cast
    .slice(0, 3)
    .map((c) => c.name)
    .join(", ");

  // AdSense-safe: only index movies with a real overview (raise bar vs thin TMDB shells).
  const thin = !movie.overview || movie.overview.trim().length < 160;

  return buildMetadata({
    title: `${movie.title} OTT Release Date, Cast & Where to Watch India`,
    description:
      movie.overview.slice(0, 140) ||
      `${movie.title} cast, trailer, story, rating, OTT release date and where to watch in India on ContentVerse India CineVerse.`,
    path: `/cineverse/movie/${id}`,
    image: movie.backdropUrl ?? movie.posterUrl,
    noIndex: thin,
    keywords: [
      `${movie.title} OTT Release Date`,
      `${movie.title} cast`,
      `${movie.title} where to watch`,
      `${movie.title} trailer`,
      `${movie.title} review`,
      ...(castHint ? [`${movie.title} ${castHint}`] : []),
      "CineVerse India",
    ],
  });
}

export default async function CineverseMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const movie = await fetchMovieDetail(id);
  if (!movie) notFound();

  return <MovieDetailView movie={movie} />;
}
