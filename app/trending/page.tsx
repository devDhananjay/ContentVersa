import type { Metadata } from "next";
import Link from "next/link";
import { Flame, ArrowRight, Newspaper } from "lucide-react";
import { buildMetadata, SITE } from "@/lib/seo";
import {
  fetchIndiaTrends,
  shortTrendBlurb,
} from "@/lib/trending/google-trends";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export const metadata: Metadata = buildMetadata({
  title: "Trending in India today",
  description:
    "What India is searching on Google right now — every live trend with a short description, related headlines, and ContentVerse briefings.",
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
      "Current Google Trends topics for India with short descriptions and ContentVerse briefings.",
    numberOfItems: trends.length,
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
          Google Trends · India · Live
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Trending in India <span className="text-gradient">today</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">
          Everything currently spiking on Google Trends for India — each topic
          with a short description from related coverage. Open any row for a
          fuller briefing and chat, without leaving ContentVerse.
        </p>
        {trends.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {trends.length} live topics · refreshed about every 30 minutes
          </p>
        ) : null}
      </header>

      <HubAdSense className="my-2" />

      {trends.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Trends feed is refreshing — check back in a minute.
        </p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2">
          {trends.map((t, i) => {
            const blurb = shortTrendBlurb(t);
            const extraNews = t.newsItems.slice(1, 3);
            return (
              <li key={t.slug}>
                <Link
                  href={t.href}
                  className="group flex h-full gap-3 rounded-2xl border border-border/50 bg-card/70 p-3.5 transition hover:border-orange-400/40 sm:p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-300 sm:h-9 sm:w-9 sm:text-sm">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug group-hover:text-orange-300">
                          {t.title}
                        </p>
                        {t.traffic ? (
                          <p className="mt-1 text-[11px] font-medium text-orange-400/90">
                            ~{t.traffic} searches
                          </p>
                        ) : null}
                      </div>
                      {t.picture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.picture}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-xl border border-border/40 object-cover bg-muted"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {blurb}
                    </p>
                    {extraNews.length > 0 ? (
                      <ul className="space-y-1">
                        {extraNews.map((n) => (
                          <li
                            key={n.url}
                            className="flex items-start gap-1.5 text-[11px] text-muted-foreground/90"
                          >
                            <Newspaper className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                            <span className="line-clamp-1">
                              {n.title}
                              {n.source ? ` · ${n.source}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-orange-300" />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
