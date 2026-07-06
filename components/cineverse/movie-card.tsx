import Link from "next/link";
import Image from "next/image";
import { Calendar, Star } from "lucide-react";
import type { CineMovie } from "@/lib/cineverse/types";
import { AddToMovieWatchlistButton } from "./add-to-movie-watchlist-button";
import { cn } from "@/lib/utils";

function formatRelease(date?: string) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MovieCard({
  movie,
  className,
  compact,
}: {
  movie: CineMovie;
  className?: string;
  compact?: boolean;
}) {
  const release = formatRelease(movie.releaseDate);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm transition hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10",
        className
      )}
    >
      <Link href={movie.href} className="block">
        <div
          className={cn(
            "relative aspect-[2/3] bg-muted/40 dark:bg-muted/60",
            compact && "aspect-[3/4]"
          )}
        >
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 45vw, 200px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No poster
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          {movie.rating ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {movie.rating}
            </span>
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug group-hover:text-red-400">
            {movie.title}
          </h3>
          {release ? (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {release}
            </p>
          ) : null}
          {!compact && movie.overview ? (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {movie.overview}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="absolute right-2 top-2 z-10">
        <AddToMovieWatchlistButton tmdbId={movie.id} title={movie.title} />
      </div>
    </article>
  );
}
