import type { Metadata } from "next";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { CineverseAiRecommend } from "@/components/cineverse/cineverse-ai-recommend";
import { CineverseBlogSection } from "@/components/cineverse/cineverse-blog-section";
import { CineverseNewsletter } from "@/components/cineverse/cineverse-newsletter";
import { MovieWatchlistSection } from "@/components/cineverse/movie-watchlist-section";
import { MovieGrid } from "@/components/cineverse/movie-grid";
import { OttReleasesStrip } from "@/components/cineverse/ott-releases-strip";
import { SponsoredOttBanner } from "@/components/cineverse/sponsored-ott-banner";
import Link from "next/link";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { getCineverseHubDataCached } from "@/lib/cineverse/data";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { CINEVERSE_HUB_SEO, hubSeoJsonLdBlocks } from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "CineVerse — Movies, OTT Release Dates, Cast & Where to Watch India",
  description:
    "Search movies for India: OTT release date, cast, trailer, story, ratings, where to watch and reviews. Trending films and personal watchlist on ContentVerse India CineVerse.",
  path: "/cineverse",
  keywords: [
    "OTT release date India",
    "where to watch movie India",
    "Bollywood movies",
    "Netflix India movies",
    "Prime Video India",
    "JioCinema release date",
    "movie cast",
    "movie trailer India",
    "movie watchlist India",
    "web series where to watch",
    "Hollywood movies OTT India",
    "movie reviews India",
    "CineVerse",
  ],
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
      <HubJsonLd blocks={hubSeoJsonLdBlocks(CINEVERSE_HUB_SEO)} />
      <HubEditorialIntro title="Movies, OTT dates & where to watch in India">
        <p>
          CineVerse is ContentVerse India&apos;s movie search companion for India — every film page
          covers release date, cast, trailer, story, ratings, OTT release date, where to watch,
          and reviews. Metadata is powered by TMDB; editorial reviews and lists live in the
          Movies category.
        </p>
        <p>
          Search intents like &quot;Movie Name OTT Release Date&quot; or where to watch. Also see{" "}
          <Link href="/guides/movies" className="text-primary hover:underline">
            movie guides
          </Link>
          ,{" "}
          <Link href="/trending" className="text-primary hover:underline">
            Trending Now
          </Link>
          , and{" "}
          <Link href="/reels" className="text-primary hover:underline">
            Reels
          </Link>
          .
        </p>
      </HubEditorialIntro>

      <MovieWatchlistSection />

      <GoogleAdSense slotKey="hub" format="horizontal" />

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

      <GoogleAdSense slotKey="hub" format="horizontal" />

      <CineverseBlogSection blogs={blogs} />

      <RelatedHubs current="cineverse" contained />

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
        . ContentVerse India is not endorsed or certified by TMDB.
      </p>
    </div>
  );
}
