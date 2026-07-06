import type { Metadata } from "next";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { CineverseAiRecommend } from "@/components/cineverse/cineverse-ai-recommend";
import { CineverseBlogSection } from "@/components/cineverse/cineverse-blog-section";
import { CineverseNewsletter } from "@/components/cineverse/cineverse-newsletter";
import { MovieWatchlistSection } from "@/components/cineverse/movie-watchlist-section";
import { MovieGrid } from "@/components/cineverse/movie-grid";
import { OttReleasesStrip } from "@/components/cineverse/ott-releases-strip";
import { SponsoredOttBanner } from "@/components/cineverse/sponsored-ott-banner";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { getCineverseHubDataCached } from "@/lib/cineverse/data";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "CineVerse — Movies, OTT & Watchlist India",
  description:
    "Trending movies, India release dates, personal watchlist and movie news on ContentVerse — your AI movie & OTT companion.",
  path: "/cineverse",
  image:
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600",
});

export default async function CineverseHubPage() {
  const [hub, blogs] = await Promise.all([
    getCineverseHubDataCached(),
    getBlogsByCategoryHybrid("movies"),
  ]);

  return (
    <div className="space-y-10">
      <HubEditorialIntro title="CineVerse on ContentVerse">
        <p>
          CineVerse is ContentVerse&apos;s movie and OTT companion — trending films,
          theatrical release windows for India, and a personal watchlist you can build
          while signed in. Movie metadata is powered by TMDB; our editorial value is
          original reviews, lists, and explainers from Indian creators in the Movies
          category.
        </p>
        <p>
          Save titles to your watchlist, get trailer alerts, see where to stream in India
          (Netflix, Prime, Hotstar & more), and read the latest movie blogs below.
        </p>
      </HubEditorialIntro>

      <MovieWatchlistSection />

      <GoogleAdSense format="horizontal" className="min-h-[90px]" />

      <CineverseAiRecommend />

      <SponsoredOttBanner />

      <CineverseNewsletter />

      {hub.nowPlaying.length > 0 ? (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold md:text-2xl">
            Now <span className="text-gradient">Playing</span> in India
          </h2>
          <MovieGrid movies={hub.nowPlaying} />
        </section>
      ) : null}

      <OttReleasesStrip movies={hub.upcoming} />

      <GoogleAdSense format="horizontal" className="min-h-[90px]" />

      <CineverseBlogSection blogs={blogs} />

      <p className="text-center text-[10px] text-muted-foreground">
        Movie data provided by{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          TMDB
        </a>
        . ContentVerse is not endorsed or certified by TMDB.
      </p>
    </div>
  );
}
