import { Hero } from "@/components/home/hero";
import { TrendingSection } from "@/components/home/trending";
import { FeaturedCreators } from "@/components/home/featured-creators";
import { PopularCategories } from "@/components/home/popular-categories";
import { AIRecommended } from "@/components/home/ai-recommended";
import { LatestSection } from "@/components/home/latest-section";
import { EditorPick } from "@/components/home/editor-pick";
import { CommunityPosts } from "@/components/home/community-posts";
import { WeeklyTrending } from "@/components/home/weekly-trending";
import { Newsletter } from "@/components/home/newsletter";
import { Testimonials } from "@/components/home/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrendingSection />
      <FeaturedCreators />
      <PopularCategories />
      <AIRecommended />
      <LatestSection />
      <EditorPick />
      <CommunityPosts />
      <WeeklyTrending />
      <Testimonials />
      <Newsletter />
    </>
  );
}
