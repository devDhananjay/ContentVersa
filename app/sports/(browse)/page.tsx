import type { Metadata } from "next";
import { MatchesSection } from "@/components/sports/matches-section";
import { CricketNewsStrip } from "@/components/sports/cricket-news-card";
import { SportsBlogSection } from "@/components/sports/sports-blog-section";
import { SeriesCarousel } from "@/components/sports/series-carousel";
import { ScheduleBlock } from "@/components/sports/schedule-block";
import { SportsSectionHeader } from "@/components/sports/sports-section-header";
import Link from "next/link";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { MrecAd } from "@/components/ads/mrec-ad";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { CricketAlertSubscribe } from "@/components/sports/cricket-alert-subscribe";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { getSportsHubDataCached } from "@/lib/sports/data";
import { hubSeoJsonLdBlocks, SPORTS_HUB_SEO } from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Sports — Live Cricket Scores, Fixtures & News India",
  description:
    "Live cricket score India today, IPL fixtures, match results, Team India updates, T20 scorecards and original sports blogs on ContentVerse India.",
  path: "/sports",
  // Live score widgets are thin for AdSense indexing — keep crawlable, not indexed.
  noIndex: true,
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
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const [hub, blogs] = await Promise.all([
    getSportsHubDataCached(),
    getBlogsByCategoryHybrid("sports"),
  ]);

  return (
    <div className="space-y-8">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(SPORTS_HUB_SEO)} />
      <HubEditorialIntro title={t(dict, "hubs.sportsEditorialTitle")} className="container">
        <p>{t(dict, "hubs.sportsEditorialBody")}</p>
        <p>
          Live score widgets stay useful for fans but are not our SEO bet. For indexable depth, read{" "}
          <Link href="/guides/cricket/how-to-read-a-cricket-match-preview" className="text-primary hover:underline">
            match preview literacy
          </Link>
          ,{" "}
          <Link href="/guides/cricket/how-to-read-a-cricket-scorecard" className="text-primary hover:underline">
            scorecard basics
          </Link>
          ,{" "}
          <Link href="/category/sports" className="text-primary hover:underline">
            sports blogs
          </Link>
          , and the full{" "}
          <Link href="/guides/cricket" className="text-primary hover:underline">
            cricket guides hub
          </Link>
          .
        </p>
      </HubEditorialIntro>

      <CricketAlertSubscribe />

      <section>
        <SportsSectionHeader
          eyebrow={t(dict, "hubs.sportsMatches")}
          title={t(dict, "hubs.sportsLiveFixtures")}
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
            eyebrow={t(dict, "hubs.sportsCricketNews")}
            title={t(dict, "hubs.sportsLatestHeadlines")}
          />
          <CricketNewsStrip items={hub.news.slice(0, 10)} />
        </section>
      )}

      <SportsBlogSection blogs={blogs.slice(0, 6)} />

      {/* After editorial blogs — not beside live score widgets or alert CTA */}
      <div className="flex flex-col items-center gap-8 xl:flex-row xl:items-start xl:justify-center">
        <StickyRailAd slotKey="sidebar" sticky={false} label="Sponsored left" />
        <div className="flex w-full max-w-3xl flex-col items-center gap-6">
          <BandAd slotKey="horizontal" />
          <MrecAd slotKey="hub" />
          <HubAdSense />
        </div>
        <StickyRailAd slotKey="hub" sticky label="Sponsored right" />
      </div>

      <RelatedHubs current="sports" contained />
    </div>
  );
}
