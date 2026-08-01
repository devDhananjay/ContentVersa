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
  title: "🔥 Trending Now — India",
  description:
    "Trending Now in India: Google Trends, trending news, cricket, entertainment, AI & tech, jobs, and finance — auto-updated on ContentVerse India.",
  path: "/trending",
  keywords: [
    "Trending Now India",
    "Google Trends India",
    "trending news India",
    "cricket trending",
    "AI tech India",
    "jobs India trending",
    "finance Sensex Nifty",
  ],
});

export default async function TrendingHubPage() {
  const { spikes, news, lanes, youtube } = await getTrendingHub();
  const laneCount = lanes.reduce((n, l) => n + l.items.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "🔥 Trending Now — India",
    url: `${SITE.url}/trending`,
    description:
      "Google Trends, trending news, cricket, entertainment, AI & tech, jobs, and finance — live on ContentVerse India.",
    numberOfItems: spikes.length + news.length + laneCount + youtube.length,
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
          🔥 Trending <span className="text-gradient">Now</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">
          Automatically updated: Google Trends, Trending News, Cricket,
          Entertainment, AI &amp; Tech, Jobs, and Finance — each with a short
          description so you can skim fast on ContentVerse India.
        </p>
        <p className="text-xs text-muted-foreground">
          {spikes.length} Google Trends
          {news.length ? ` · ${news.length} news` : ""}
          {laneCount ? ` · ${laneCount} topic headlines` : ""}
          {youtube.length ? ` · ${youtube.length} YouTube` : ""} · refreshes
          about every 15 minutes
        </p>
      </header>

      <HubAdSense className="my-2" />

      <TrendingHub
        spikes={spikes}
        news={news}
        lanes={lanes}
        youtube={youtube}
      />
    </div>
  );
}
