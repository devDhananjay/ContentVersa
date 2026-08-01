import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { buildMetadata, SITE } from "@/lib/seo";
import { getTrendingHub } from "@/lib/trending/hub";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";
import { TrendingHub } from "@/components/trending/trending-hub";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: "Trending in India today",
  description:
    "What India is searching, watching, and reading right now — Google Trends, YouTube India, and news headlines with short descriptions on ContentVerse.",
  path: "/trending",
  keywords: [
    "Google Trends India",
    "trending India today",
    "YouTube trending India",
    "what is trending",
    "India search trends",
    "India news headlines",
  ],
});

export default async function TrendingHubPage() {
  const { spikes, news, youtube } = await getTrendingHub();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trending in India today",
    url: `${SITE.url}/trending`,
    description:
      "Current Google Trends, YouTube India, and news headlines with short descriptions on ContentVerse.",
    numberOfItems: spikes.length + news.length + youtube.length,
  };

  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-3">
        <Badge variant="neon" className="gap-1">
          <Flame className="h-3 w-3" />
          Live · India
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Trending in India <span className="text-gradient">today</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">
          Search spikes, YouTube popular videos, and India news — each with a
          short description so you can skim fast and stay on ContentVerse for
          briefings.
        </p>
        {(spikes.length > 0 || news.length > 0 || youtube.length > 0) && (
          <p className="text-xs text-muted-foreground">
            {spikes.length} search spikes
            {youtube.length ? ` · ${youtube.length} YouTube` : ""}
            {news.length ? ` · ${news.length} news` : ""} · refreshed about
            every 15 minutes
          </p>
        )}
      </header>

      <HubAdSense className="my-2" />

      <TrendingHub spikes={spikes} news={news} youtube={youtube} />
    </div>
  );
}
