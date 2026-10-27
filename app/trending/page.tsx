import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { buildMetadata, SITE } from "@/lib/seo";
import { getTrendingHub } from "@/lib/trending/hub";
import { BandAd } from "@/components/ads/band-ad";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { PageBack } from "@/components/site/page-back";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { Badge } from "@/components/ui/badge";
import { TrendingHub } from "@/components/trending/trending-hub";
import { LocaleLink } from "@/components/i18n/locale-link";
import { hubSeoJsonLdBlocks, TRENDING_HUB_SEO } from "@/lib/seo/hub-seo";
import { SHOW_THIRD_PARTY_CREDITS } from "@/lib/site/third-party-credits";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { withLocalePrefix } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";
export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const description = t(dict, "hubs.trendingSub");
  return buildMetadata({
    title: `${t(dict, "hubs.trendingTitle")} | ContentVerse India`,
    description,
    path: withLocalePrefix("/trending", locale),
    noIndex: true,
    keywords: [
      "Trending Now India",
      ...(SHOW_THIRD_PARTY_CREDITS ? ["Google Trends India"] : []),
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
    alternates: buildHreflangAlternates("/trending"),
  });
}

export default async function TrendingHubPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const { spikes, news, lanes, youtube } = await getTrendingHub();
  const laneCount = lanes.reduce((n, l) => n + l.items.length, 0);
  const description = t(dict, "hubs.trendingSub");

  const blocks = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${t(dict, "hubs.trendingTitle")} — India`,
      url: `${SITE.url}${withLocalePrefix("/trending", locale)}`,
      description,
      numberOfItems: spikes.length + news.length + laneCount + youtube.length,
      isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    },
    ...hubSeoJsonLdBlocks(TRENDING_HUB_SEO).slice(1),
  ];

  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      <HubJsonLd blocks={blocks} />

      <PageBack href="/" label={t(dict, "common.home")} />

      <header className="space-y-3">
        <Badge variant="neon" className="gap-1">
          <Flame className="h-3 w-3" />
          {t(dict, "hubs.trendingLiveIndia")}
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          <span className="text-gradient">{t(dict, "hubs.trendingTitle")}</span>
        </h1>
        <p className="max-w-2xl text-muted-foreground leading-relaxed">
          {t(dict, "hubs.trendingSub")}
        </p>
        <p className="text-xs text-muted-foreground">
          {spikes.length} search trends
          {news.length ? ` · ${news.length} news` : ""}
          {laneCount ? ` · ${laneCount} topic headlines` : ""}
          {youtube.length ? ` · ${youtube.length} videos` : ""} · refreshes
          about every 15 minutes
        </p>
      </header>

      <HubEditorialIntro title={t(dict, "hubs.trendingEditorialTitle")}>
        <p>{t(dict, "hubs.trendingEditorialBody")}</p>
        <p>
          {t(dict, "common.exploreMore")}:{" "}
          <LocaleLink href="/guides/trending" className="text-primary hover:underline">
            {t(dict, "nav.trending")}
          </LocaleLink>
          ,{" "}
          <LocaleLink href="/sports" className="text-primary hover:underline">
            {t(dict, "nav.sports")}
          </LocaleLink>
          ,{" "}
          <LocaleLink href="/finance" className="text-primary hover:underline">
            {t(dict, "nav.finance")}
          </LocaleLink>
          ,{" "}
          <LocaleLink href="/jobs" className="text-primary hover:underline">
            {t(dict, "nav.jobs")}
          </LocaleLink>
          ,{" "}
          <LocaleLink href="/ai" className="text-primary hover:underline">
            {t(dict, "footer.aiProduct")}
          </LocaleLink>
          .
        </p>
      </HubEditorialIntro>

      <BandAd slotKey="horizontal" />

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
