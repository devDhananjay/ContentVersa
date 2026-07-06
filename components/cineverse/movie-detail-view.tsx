import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Star } from "lucide-react";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { AddToMovieWatchlistButton } from "@/components/cineverse/add-to-movie-watchlist-button";
import { StreamingProviders } from "@/components/cineverse/streaming-providers";
import { TrailerNotifyToggle } from "@/components/cineverse/trailer-notify-toggle";
import { TrailerPlayer } from "@/components/cineverse/trailer-player";
import { SponsoredOttBanner } from "@/components/cineverse/sponsored-ott-banner";
import type { CineMovieDetail } from "@/lib/cineverse/types";

function formatDate(d?: string) {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function MovieDetailView({ movie }: { movie: CineMovieDetail }) {
  const release = formatDate(movie.releaseDate);

  return (
    <article>
      <div className="relative h-[220px] overflow-hidden md:h-[320px]">
        {movie.backdropUrl ? (
          <Image
            src={movie.backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      <div className="container relative -mt-24 max-w-4xl pb-16">
        <Link
          href="/cineverse"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to CineVerse
        </Link>

        <div className="flex flex-col gap-6 md:flex-row">
          {movie.posterUrl ? (
            <div className="relative mx-auto aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-2xl border border-border/60 shadow-2xl md:mx-0 md:w-48">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                sizes="192px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="flex-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {movie.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {movie.rating ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {movie.rating}
                </span>
              ) : null}
              {release ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {release}
                </span>
              ) : null}
              {movie.runtime ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {movie.runtime} min
                </span>
              ) : null}
            </div>

            {movie.genres.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {movie.overview}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <AddToMovieWatchlistButton tmdbId={movie.id} title={movie.title} />
              <TrailerNotifyToggle tmdbId={movie.id} />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {movie.trailers.length > 0 ? (
            <TrailerPlayer trailers={movie.trailers} />
          ) : null}

          <StreamingProviders providers={movie.providers} movieTitle={movie.title} />

          <GoogleAdSense format="horizontal" className="min-h-[90px]" />

          <SponsoredOttBanner />

          <p className="text-center text-[10px] text-muted-foreground">
            Data from TMDB · Streaming links are search/affiliate deep links for India
          </p>
        </div>
      </div>
    </article>
  );
}
