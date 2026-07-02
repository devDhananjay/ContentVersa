import type { Metadata } from "next";
import { MatchesSection } from "@/components/sports/matches-section";
import { CricketNewsStrip } from "@/components/sports/cricket-news-card";
import { SportsBlogSection } from "@/components/sports/sports-blog-section";
import { SeriesCarousel } from "@/components/sports/series-carousel";
import { ScheduleBlock } from "@/components/sports/schedule-block";
import { SportsSectionHeader } from "@/components/sports/sports-section-header";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { getSportsHubDataCached } from "@/lib/sports/data";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Sports — Live Cricket Scores & News",
  description:
    "Live cricket scores, upcoming fixtures, match results and sports news from ContentVerse India.",
  path: "/sports",
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
      <HubEditorialIntro title="Sports on ContentVerse" className="container">
        <p>
          ContentVerse Sports Hub combines live cricket scores, fixtures, and headlines with
          original sports writing from our community. Match pages and player stats are real-time
          utilities for fans — our primary value for readers and search engines is editorial:
          match previews, analysis, and long-form stories published by verified creators.
        </p>
        <p>
          Explore sports blogs below or browse live matches. Writers can publish match reports,
          opinion, and tutorials under the Sports category after signing up.
        </p>
      </HubEditorialIntro>

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
    </div>
  );
}
