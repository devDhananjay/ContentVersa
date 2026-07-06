import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CineMovie } from "@/lib/cineverse/types";

function formatRelease(date?: string) {
  if (!date) return "TBA";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function OttReleasesStrip({ movies }: { movies: CineMovie[] }) {
  if (!movies.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-2">
        <div>
          <Badge variant="outline" className="mb-2 gap-1 text-[10px]">
            <Calendar className="h-3 w-3" /> India releases
          </Badge>
          <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
            Coming <span className="text-gradient">Soon</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Theatrical & OTT window dates via TMDB (India region)
          </p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={movie.href}
            className="group flex w-[140px] shrink-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/80 transition hover:border-red-500/40 sm:w-[160px]"
          >
            <div className="relative aspect-[2/3] bg-muted">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  sizes="160px"
                  className="object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Clapperboard className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
              <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {formatRelease(movie.releaseDate)}
              </span>
            </div>
            <p className="line-clamp-2 p-2 text-xs font-semibold leading-snug">
              {movie.title}
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        India release dates via TMDB · Tap a title for streaming & trailers
      </p>
    </section>
  );
}
