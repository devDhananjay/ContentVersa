import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { PlatformModulesStrip } from "@/components/home/platform-modules-strip";
import { ReelsStripSection } from "@/components/reels/reels-strip-section";
import { AmbientPageBackground } from "@/components/site/ambient-page-background";
import { TrendingSection } from "@/components/home/trending";
import { FeaturedCreators } from "@/components/home/featured-creators";
import { PopularCategories } from "@/components/home/popular-categories";
import { AIRecommended } from "@/components/home/ai-recommended";
import { LatestSection } from "@/components/home/latest-section";
import { EditorPick } from "@/components/home/editor-pick";
import { CommunityPosts } from "@/components/home/community-posts";
import { WeeklyTrending } from "@/components/home/weekly-trending";
import { QuickPollSection } from "@/components/home/quick-poll";
import { DailyQuizSection } from "@/components/home/daily-quiz";
import { NewsIn60Section } from "@/components/home/news-in-60";
import { Newsletter } from "@/components/home/newsletter";
import { StayEngagedStrip } from "@/components/home/stay-engaged-strip";
import { Testimonials } from "@/components/home/testimonials";
import { SportsTeaser } from "@/components/home/sports-teaser";
import { ForYouSection } from "@/components/home/for-you-section";
import { HomeEditorialSection } from "@/components/home/home-editorial-section";
import { getHomePageData } from "@/lib/data/home-data";
import { getSportsTeaserData } from "@/lib/sports/data";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "ContentVerse India — Blogs, Sports, Finance, Jobs & Reels",
  description:
    "India's creator platform. Read blogs, watch reels, follow live cricket scores, track Nifty & Sensex, and find government & private jobs — all at contentverse.co.in.",
  path: "/",
  keywords: [
    "ContentVerse India",
    "contentverse.co.in",
    "Indian blogs",
    "sports scores India",
    "Nifty Sensex live",
    "sarkari jobs",
    "creator reels India",
  ],
});

export default async function HomePage() {
  const [data, sportsTeaser] = await Promise.all([
    getHomePageData(),
    getSportsTeaserData(),
  ]);

  return (
    <>
      <SiteJsonLd />
      <div className="relative overflow-hidden">
        <AmbientPageBackground />
        <ReelsStripSection />
        <Hero stats={data.stats} categories={data.categories} />
      </div>
      <PlatformModulesStrip />
      <TrendingSection blogs={data.trending} />
      <HomeEditorialSection />
      <ForYouSection />
      <SportsTeaser data={sportsTeaser} />
      <NewsIn60Section blogs={data.trending} />
      <FeaturedCreators creators={data.creators} />
      <PopularCategories categories={data.categories} />
      <AIRecommended blogs={data.aiRecommended} />
      <LatestSection blogs={data.latest} />
      <EditorPick blogs={data.editorPicks} />
      <CommunityPosts posts={data.communityPosts} />
      <QuickPollSection />
      <DailyQuizSection />
      <WeeklyTrending topics={data.weeklyTopics} />
      <StayEngagedStrip />
      <Testimonials />
      <Newsletter />
    </>
  );
}
