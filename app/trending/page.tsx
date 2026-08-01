import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";
import { buildMetadata, SITE } from "@/lib/seo";
import { getTrendingHub } from "@/lib/trending/hub";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { Badge } from "@/components/ui/badge";
import { TrendingHub } from "@/components/trending/trending-hub";
import { hubSeoJsonLdBlocks, TRENDING_HUB_SEO } from "@/lib/seo/hub-seo";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: "Trending Now India — Google Trends, News & Topics",
  description: TRENDING_HUB_SEO.description,
  path: "/trending",
  keywords: [
    "Trending Now India",
    "Google Trends India",
    "what's trending in India",
    "today trending India",
    "viral topics India",
    "trending news India",
    "cricket trending",
    "AI tech India",
    "jobs India trending",
    "finance Sensex Nifty",
    "Bollywood trending",
    "why is it trending",
  ],
});

export default async function TrendingHubPage() {
  const { spikes, news, lanes, youtube } = await getTrendingHub();
  const laneCount = lanes.reduce((n, l) => n + l.items.length, 0);

  const blocks = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Trending Now — India",
      url: `${SITE.url}/trending`,
      description: TRENDING_HUB_SEO.description,
      numberOfItems: spikes.length + news.length + laneCount + youtube.length,
      isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    },
    ...hubSeoJsonLdBlocks(TRENDING_HUB_SEO).slice(1),
  ];

  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      <HubJsonLd blocks={blocks} />

      <header className="space-y-3">
        <Badge variant="neon" className="gap-1">
          <Flame className="h-3 w-3" />
          Live · India
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Trending <span className="text-gradient">Now</span>
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

      <HubEditorialIntro title="What India is searching right now">
        <p>
          Trending Now aggregates India-focused spikes and headlines so you can skim
          fast, then dive into live hubs for depth.
        </p>
        <p>
          Continue on{" "}
          <Link href="/guides/trending" className="text-primary hover:underline">
            trending guides
          </Link>
          ,{" "}
          <Link href="/sports" className="text-primary hover:underline">
            Sports
          </Link>
          ,{" "}
          <Link href="/finance" className="text-primary hover:underline">
            Finance
          </Link>
          ,{" "}
          <Link href="/jobs" className="text-primary hover:underline">
            Jobs
          </Link>
          , or{" "}
          <Link href="/ai" className="text-primary hover:underline">
            ContentVerse India AI
          </Link>
          .
        </p>
      </HubEditorialIntro>

      <HubAdSense className="my-2" />

      <TrendingHub
        spikes={spikes}
        news={news}
        lanes={lanes}
        youtube={youtube}
      />

      <RelatedHubs current="trending" />
    </div>
  );
}
