import { SITE } from "@/lib/seo";
import type { CineMovieDetail } from "./types";

export function movieJsonLd(movie: CineMovieDetail) {
  const url = `${SITE.url}${movie.href}`;
  const actors = movie.cast.slice(0, 12).map((c) => ({
    "@type": "Person",
    name: c.name,
    ...(c.character ? { characterName: c.character } : {}),
  }));

  const trailer = movie.trailers[0];
  const providers = movie.providers.filter((p) => p.type === "stream").slice(0, 8);

  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.overview || `${movie.title} cast, OTT release, trailer and where to watch in India.`,
    url,
    image: movie.posterUrl ?? movie.backdropUrl,
    datePublished: movie.theatricalReleaseDate ?? movie.releaseDate,
    ...(movie.runtime ? { duration: `PT${movie.runtime}M` } : {}),
    genre: movie.genres,
    ...(actors.length ? { actor: actors } : {}),
    ...(movie.rating && movie.voteCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: movie.rating,
            bestRating: 10,
            worstRating: 0,
            ratingCount: movie.voteCount,
          },
        }
      : {}),
    ...(movie.imdbId
      ? { sameAs: [`https://www.imdb.com/title/${movie.imdbId}/`] }
      : {}),
    ...(trailer?.youtubeUrl
      ? {
          trailer: {
            "@type": "VideoObject",
            name: trailer.name,
            embedUrl: `https://www.youtube.com/embed/${trailer.key}`,
            url: trailer.youtubeUrl,
            thumbnailUrl: `https://i.ytimg.com/vi/${trailer.key}/hqdefault.jpg`,
          },
        }
      : {}),
    ...(providers.length
      ? {
          potentialAction: providers.map((p) => ({
            "@type": "WatchAction",
            target: p.watchUrl,
            name: `Watch on ${p.name}`,
          })),
        }
      : {}),
  };
}

export function movieBreadcrumbJsonLd(movie: CineMovieDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "CineVerse",
        item: `${SITE.url}/cineverse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: movie.title,
        item: `${SITE.url}${movie.href}`,
      },
    ],
  };
}

export function movieFaqJsonLd(movie: CineMovieDetail) {
  const where =
    movie.providers.filter((p) => p.type === "stream").map((p) => p.name).join(", ") ||
    "Check streaming availability below — platforms vary by region and licence.";
  const castNames = movie.cast
    .slice(0, 5)
    .map((c) => c.name)
    .join(", ");
  const ott =
    movie.ottReleaseDate ||
    "OTT / digital date for India is listed when TMDB publishes a digital release.";

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${movie.title} OTT release date India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `OTT / digital release info for ${movie.title}: ${ott}`,
        },
      },
      {
        "@type": "Question",
        name: `${movie.title} cast`,
        acceptedAnswer: {
          "@type": "Answer",
          text: castNames
            ? `Main cast of ${movie.title} includes ${castNames}.`
            : `Cast details for ${movie.title} are listed on this CineVerse page.`,
        },
      },
      {
        "@type": "Question",
        name: `${movie.title} where to watch`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Where to watch ${movie.title} in India: ${where}`,
        },
      },
    ],
  };
}
