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

  return buildMetadata({
    title: `${movie.title} — Watch & Trailers India`,
    description: movie.overview.slice(0, 160) || `Stream ${movie.title} in India on ContentVerse CineVerse.`,
    path: `/cineverse/movie/${id}`,
    image: movie.backdropUrl ?? movie.posterUrl,
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
