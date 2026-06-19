import { Hero } from "@/components/home/hero";
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
import { Testimonials } from "@/components/home/testimonials";
import { SportsTeaser } from "@/components/home/sports-teaser";
import { ForYouSection } from "@/components/home/for-you-section";
import { getHomePageData } from "@/lib/data/home-data";
import { getSportsTeaserData } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, sportsTeaser] = await Promise.all([
    getHomePageData(),
    getSportsTeaserData(),
  ]);

  return (
    <>
      <div className="relative overflow-hidden">
        <AmbientPageBackground />
        <ReelsStripSection />
        <Hero stats={data.stats} categories={data.categories} />
      </div>
      <TrendingSection blogs={data.trending} />
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
      <Testimonials />
      <Newsletter />
    </>
  );
}
