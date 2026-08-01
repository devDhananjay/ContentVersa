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

  return buildMetadata({
    title: `${movie.title} OTT Release Date, Cast & Where to Watch India`,
    description:
      movie.overview.slice(0, 140) ||
      `${movie.title} cast, trailer, story, rating, OTT release date and where to watch in India on ContentVerse CineVerse.`,
    path: `/cineverse/movie/${id}`,
    image: movie.backdropUrl ?? movie.posterUrl,
    keywords: [
      `${movie.title} OTT release date`,
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
