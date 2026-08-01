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
    "What India is searching and reading right now — Google Trends spikes plus India news headlines, each with a short description on ContentVerse.",
  path: "/trending",
  keywords: [
    "Google Trends India",
    "trending India today",
    "what is trending",
    "India search trends",
    "India news headlines",
  ],
});

export default async function TrendingHubPage() {
  const { spikes, news } = await getTrendingHub();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trending in India today",
    url: `${SITE.url}/trending`,
    description:
      "Current Google Trends and India news headlines with short descriptions on ContentVerse.",
    numberOfItems: spikes.length + news.length,
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
          Search spikes from Google Trends and headlines from Indian news —
          each with a short description. Open any topic for a briefing and
          chat without leaving ContentVerse.
        </p>
        {(spikes.length > 0 || news.length > 0) && (
          <p className="text-xs text-muted-foreground">
            {spikes.length} search spikes
            {news.length ? ` · ${news.length} news headlines` : ""} · refreshed
            about every 15 minutes
          </p>
        )}
      </header>

      <HubAdSense className="my-2" />

      <TrendingHub spikes={spikes} news={news} />
    </div>
  );
}
