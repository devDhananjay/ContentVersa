import type { Metadata } from "next";
import { SarkariResultsHub } from "@/components/results/sarkari-results-hub";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PageBack } from "@/components/site/page-back";
import { LocaleLink } from "@/components/i18n/locale-link";
import { hubSeoJsonLdBlocks, RESULTS_HUB_SEO } from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { buildHreflangAlternates } from "@/lib/i18n/hreflang";
import { withLocalePrefix } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: `${t(dict, "hubs.resultsTitle")} | ContentVerse India`,
    description: t(dict, "hubs.resultsSub"),
    path: withLocalePrefix("/results", locale),
    noIndex: true,
    keywords: [
      "sarkari result",
      "sarkari result 2026",
      "ssc result",
      "cbse result",
      "upsc result",
      "ibps result",
      "rrb result",
      "nta result",
      "neet result",
      "jee main result",
      "railway result",
      "board result India",
      "admit card result portal",
    ],
    alternates: buildHreflangAlternates("/results"),
  });
}

export default async function ResultsPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="container max-w-5xl space-y-8 py-8 md:py-10">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(RESULTS_HUB_SEO)} />
      <PageBack href="/" label={t(dict, "common.home")} />

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {t(dict, "hubs.resultsTitle")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t(dict, "hubs.resultsSub")}</p>
      </header>

      <HubEditorialIntro title={t(dict, "hubs.resultsEditorialTitle")}>
        <p>{t(dict, "hubs.resultsEditorialBody")}</p>
        <p>
          {t(dict, "common.exploreMore")}:{" "}
          <LocaleLink href="/jobs/govt" className="text-primary hover:underline">
            {t(dict, "nav.jobs")}
          </LocaleLink>
          ,{" "}
          <LocaleLink href="/guides/jobs" className="text-primary hover:underline">
            {t(dict, "nav.indiaGuides")}
          </LocaleLink>
          ,{" "}
          <LocaleLink href="/tools" className="text-primary hover:underline">
            {t(dict, "nav.indiaTools")}
          </LocaleLink>
          .
        </p>
      </HubEditorialIntro>

      <SarkariResultsHub />
      <HubAdSense />
      <RelatedHubs current="results" />
    </div>
  );
}
