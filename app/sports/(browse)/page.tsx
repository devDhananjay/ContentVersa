import type { Metadata } from "next";
import { MatchesSection } from "@/components/sports/matches-section";
import { CricketNewsStrip } from "@/components/sports/cricket-news-card";
import { SportsBlogSection } from "@/components/sports/sports-blog-section";
import { SeriesCarousel } from "@/components/sports/series-carousel";
import { ScheduleBlock } from "@/components/sports/schedule-block";
import { SportsSectionHeader } from "@/components/sports/sports-section-header";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { getSportsHubDataCached } from "@/lib/sports/data";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Sports Hub",
  description:
    "Live cricket scores, upcoming fixtures, match results and sports news — plus editorial blogs from ContentVerse writers.",
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
