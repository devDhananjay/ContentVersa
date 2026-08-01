import type { Metadata } from "next";
import { MatchesSection } from "@/components/sports/matches-section";
import { CricketNewsStrip } from "@/components/sports/cricket-news-card";
import { SportsBlogSection } from "@/components/sports/sports-blog-section";
import { SeriesCarousel } from "@/components/sports/series-carousel";
import { ScheduleBlock } from "@/components/sports/schedule-block";
import { SportsSectionHeader } from "@/components/sports/sports-section-header";
import Link from "next/link";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubPushCta } from "@/components/engagement/hub-push-cta";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { getSportsHubDataCached } from "@/lib/sports/data";
import { hubSeoJsonLdBlocks, SPORTS_HUB_SEO } from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Sports — Live Cricket Scores, Fixtures & News India",
  description:
    "Live cricket score India today, IPL fixtures, match results, Team India updates, T20 scorecards and original sports blogs on ContentVerse India.",
  path: "/sports",
  keywords: [
    "live cricket score India",
    "IPL live score",
    "cricket match today",
    "cricket fixtures India",
    "cricket news India",
    "live scorecard",
    "Team India cricket",
    "T20 cricket score",
    "World Cup cricket score",
    "cricket match preview",
    "sports blogs India",
    "ContentVerse India sports",
  ],
  image:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600",
});

export default async function SportsHubPage() {
  const [hub, blogs] = await Promise.all([
    getSportsHubDataCached(),
    getBlogsByCategoryHybrid("sports"),
  ]);

  return (
    <div className="space-y-8">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(SPORTS_HUB_SEO)} />
      <HubEditorialIntro title="Live cricket scores & sports writing for India" className="container">
        <p>
          ContentVerse India Sports Hub combines live cricket scores, fixtures, and headlines with
          original sports writing from our community. Match pages and player stats are real-time
          utilities for fans — our primary value for readers and search engines is editorial:
          match previews, analysis, and long-form stories published by verified creators.
        </p>
        <p>
          Browse live matches below, read{" "}
          <Link href="/category/sports" className="text-primary hover:underline">
            sports blogs
          </Link>
          , or open{" "}
          <Link href="/guides/cricket" className="text-primary hover:underline">
            cricket guides
          </Link>{" "}
          and{" "}
          <Link href="/trending" className="text-primary hover:underline">
            Trending Now
          </Link>{" "}
          for what fans are searching today.
        </p>
      </HubEditorialIntro>

      <HubAdSense />
      <HubPushCta
        title="Cricket match alerts"
        description="Get a push 30 minutes before big matches — never miss toss or first ball."
      />

      <section>
        <SportsSectionHeader
          eyebrow="Matches"
          title="Live &"
          highlight="Fixtures"
        />
        <MatchesSection
          initialLive={hub.live}
          initialUpcoming={hub.upcoming}
          initialRecent={hub.recent}
        />
      </section>

      {hub.series.length > 0 && <SeriesCarousel series={hub.series} />}

      {hub.schedule.length > 0 && <ScheduleBlock schedule={hub.schedule} />}

      {hub.news.length > 0 && (
        <section>
          <SportsSectionHeader
            eyebrow="Cricket news"
            title="Latest"
            highlight="Headlines"
          />
          <CricketNewsStrip items={hub.news.slice(0, 10)} />
        </section>
      )}

      <SportsBlogSection blogs={blogs.slice(0, 6)} />
      <RelatedHubs current="sports" contained />
    </div>
  );
}
