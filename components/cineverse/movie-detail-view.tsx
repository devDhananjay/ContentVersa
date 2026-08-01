import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ExternalLink, Star, Tv } from "lucide-react";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { AddToMovieWatchlistButton } from "@/components/cineverse/add-to-movie-watchlist-button";
import { StreamingProviders } from "@/components/cineverse/streaming-providers";
import { TrailerNotifyToggle } from "@/components/cineverse/trailer-notify-toggle";
import { TrailerPlayer } from "@/components/cineverse/trailer-player";
import { SponsoredOttBanner } from "@/components/cineverse/sponsored-ott-banner";
import {
  movieBreadcrumbJsonLd,
  movieFaqJsonLd,
  movieJsonLd,
} from "@/lib/cineverse/movie-seo";
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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function MovieDetailView({ movie }: { movie: CineMovieDetail }) {
  const release = formatDate(movie.theatricalReleaseDate ?? movie.releaseDate);
  const ott = formatDate(movie.ottReleaseDate);
  const streamNames = movie.providers
    .filter((p) => p.type === "stream")
    .map((p) => p.name);

  const jsonBlocks = [movieJsonLd(movie), movieFaqJsonLd(movie), movieBreadcrumbJsonLd(movie)];

  return (
    <article>
      {jsonBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

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
                alt={`${movie.title} poster`}
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
            {movie.tagline ? (
              <p className="mt-1 text-sm italic text-muted-foreground">{movie.tagline}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {movie.rating ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {movie.rating}/10 TMDB
                  {movie.voteCount ? (
                    <span className="font-normal text-muted-foreground">
                      ({movie.voteCount.toLocaleString("en-IN")} votes)
                    </span>
                  ) : null}
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
              {ott ? (
                <span className="inline-flex items-center gap-1 text-violet-300">
                  <Tv className="h-4 w-4" />
                  OTT {ott}
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

            <nav className="mt-4 flex flex-wrap gap-2 text-xs">
              {[
                ["release-date", "Release Date"],
                ["cast", "Cast"],
                ["trailer", "Trailer"],
                ["story", "Story"],
                ["rating", "Rating"],
                ["ott-release", "OTT Release"],
                ["where-to-watch", "Where to Watch"],
                ["reviews", "Reviews"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full border border-border/50 px-2.5 py-1 text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <AddToMovieWatchlistButton tmdbId={movie.id} title={movie.title} />
              <TrailerNotifyToggle tmdbId={movie.id} />
              {movie.imdbId ? (
                <a
                  href={`https://www.imdb.com/title/${movie.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
                >
                  IMDb page
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          <Section id="release-date" title={`${movie.title} Release Date`}>
            <p className="text-sm text-muted-foreground">
              {release
                ? `Theatrical / primary release: ${release}.`
                : "Release date not listed yet."}
              {ott ? ` India OTT / digital release: ${ott}.` : null}
            </p>
          </Section>

          <Section id="cast" title={`${movie.title} Cast`}>
            {movie.cast.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {movie.cast.map((c) => (
                  <div
                    key={c.id}
                    className="overflow-hidden rounded-xl border border-border/50 bg-muted/20"
                  >
                    <div className="relative aspect-[2/3] bg-muted/40">
                      {c.profileUrl ? (
                        <Image
                          src={c.profileUrl}
                          alt={c.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold leading-tight">{c.name}</p>
                      {c.character ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                          as {c.character}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Cast details will appear when available.</p>
            )}
          </Section>

          <Section id="trailer" title={`${movie.title} Trailer`}>
            {movie.trailers.length > 0 ? (
              <TrailerPlayer trailers={movie.trailers} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Official trailer not available yet — turn on trailer alerts from the buttons above.
              </p>
            )}
          </Section>

          <Section id="story" title={`${movie.title} Story`}>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              {movie.overview || "Plot synopsis will appear when published."}
            </p>
          </Section>

          <Section id="rating" title={`${movie.title} Rating`}>
            <p className="text-sm text-muted-foreground">
              {movie.rating
                ? `TMDB community rating: ${movie.rating}/10${
                    movie.voteCount
                      ? ` from ${movie.voteCount.toLocaleString("en-IN")} votes`
                      : ""
                  }.`
                : "Rating not available yet."}
              {movie.imdbId ? (
                <>
                  {" "}
                  Open the{" "}
                  <a
                    href={`https://www.imdb.com/title/${movie.imdbId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline"
                  >
                    IMDb page for {movie.title}
                  </a>{" "}
                  for IMDb score and user reviews.
                </>
              ) : null}
            </p>
          </Section>

          <Section id="ott-release" title={`${movie.title} OTT Release Date`}>
            <p className="text-sm text-muted-foreground">
              {ott
                ? `${movie.title} OTT / digital release date (India): ${ott}.`
                : `${movie.title} OTT release date for India is not listed yet. Check Where to Watch when platforms go live.`}
            </p>
          </Section>

          <Section id="where-to-watch" title={`${movie.title} Where to Watch`}>
            <p className="mb-3 text-sm text-muted-foreground">
              {streamNames.length
                ? `Currently linked for India streaming: ${streamNames.join(", ")}. Availability changes — confirm on the platform.`
                : `Where to watch ${movie.title} in India — streaming links appear when TMDB lists India providers.`}
            </p>
            <StreamingProviders providers={movie.providers} movieTitle={movie.title} />
          </Section>

          <GoogleAdSense slotKey="horizontal" format="horizontal" />

          <SponsoredOttBanner />

          <Section id="reviews" title={`${movie.title} Reviews`}>
            {movie.reviews.length ? (
              <div className="space-y-4">
                {movie.reviews.map((r) => (
                  <blockquote
                    key={r.id}
                    className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3"
                  >
                    <p className="text-sm font-semibold">
                      {r.author}
                      {r.rating != null ? (
                        <span className="ml-2 font-normal text-amber-400">
                          {r.rating}/10
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {r.content}
                    </p>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-xs text-violet-300 hover:underline"
                      >
                        Read full review
                      </a>
                    ) : null}
                  </blockquote>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Public reviews will show here when available. Add {movie.title} to your watchlist
                and share your take after watching.
              </p>
            )}
          </Section>

          <p className="text-center text-[10px] text-muted-foreground">
            Data from TMDB · Streaming links are search/affiliate deep links for India · Not
            affiliated with IMDb
          </p>
        </div>
      </div>
    </article>
  );
}
