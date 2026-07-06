import type { CineMovie } from "@/lib/cineverse/types";
import { MovieCard } from "./movie-card";

export function MovieGrid({
  movies,
  emptyMessage = "No titles right now — check back soon.",
}: {
  movies: CineMovie[];
  emptyMessage?: string;
}) {
  if (!movies.length) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
