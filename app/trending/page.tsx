import type { Metadata } from "next";
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { buildMetadata, SITE } from "@/lib/seo";
import { fetchIndiaTrends } from "@/lib/trending/google-trends";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Trending in India today",
  description:
    "India's Google Trends topics explained on ContentVerse — short briefings, related headlines, and chat. Stay on site.",
  path: "/trending",
  keywords: [
    "Google Trends India",
    "trending India today",
    "what is trending",
    "India search trends",
  ],
});

export default async function TrendingHubPage() {
  const trends = await fetchIndiaTrends();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trending in India today",
    url: `${SITE.url}/trending`,
    description:
      "Current Google Trends topics for India with ContentVerse briefings.",
  };

  return (
    <div className="container max-w-3xl space-y-8 py-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-3">
        <Badge variant="neon" className="gap-1">
          <Flame className="h-3 w-3" />
          Google Trends · India
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Trending in India <span className="text-gradient">today</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Live search spikes from Google Trends — open any topic for a
          ContentVerse briefing and ask our chat. You stay on site (better for
          reading + ads).
        </p>
      </header>

      <HubAdSense className="my-2" />

      {trends.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Trends feed is refreshing — check back in a minute.
        </p>
      ) : (
        <ul className="space-y-3">
          {trends.map((t, i) => (
            <li key={t.slug}>
              <Link
                href={t.href}
                className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-card/70 p-4 transition hover:border-orange-400/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-sm font-bold text-orange-300">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold group-hover:text-orange-300">
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.traffic ? `${t.traffic} · ` : ""}
                    {t.newsItems[0]?.title
                      ? t.newsItems[0].title.slice(0, 90)
                      : "Open briefing"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-orange-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
