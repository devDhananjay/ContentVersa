import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { GUIDES_HUB_PATH } from "@/lib/guides/registry";
import { guidesHubJsonLd, top30GuidesItemListJsonLd } from "@/lib/guides/guides-seo";
import { GuidesSectionGrid, TopThirtyGuidesGrid } from "@/components/guides/guides-ui";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { TopicClustersHubStrip } from "@/components/seo/topic-cluster-links";
import { YmylDisclaimer } from "@/components/seo/ymyl-disclaimer";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PageBack } from "@/components/site/page-back";
import { Badge } from "@/components/ui/badge";
import {
  GUIDES_HUB_FAQS,
  hubBreadcrumbJsonLd,
  hubFaqJsonLd,
} from "@/lib/seo/hub-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { getRequestLocale } = await import("@/lib/i18n/locale-server");
  const { getDictionary, t } = await import("@/lib/i18n/get-dictionary");
  const { withLocalePrefix } = await import("@/lib/i18n/config");
  const { buildHreflangAlternates } = await import("@/lib/i18n/hreflang");
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: `${t(dict, "hubs.guidesBadge")} — ${t(dict, "hubs.guidesTitle")} ${t(dict, "hubs.guidesTitleAccent")}`,
    description: t(dict, "hubs.guidesSub"),
    path: withLocalePrefix(GUIDES_HUB_PATH, locale),
    alternates: buildHreflangAlternates(GUIDES_HUB_PATH),
    keywords: [
      "india guides",
      "fastag guide india",
      "emi calculator guide",
      "sip beginners india",
      "cibil score india",
      "ContentVerse India guides",
    ],
  });
}

export default async function GuidesHubPage() {
  const { getRequestLocale } = await import("@/lib/i18n/locale-server");
  const { getDictionary, t } = await import("@/lib/i18n/get-dictionary");
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const blocks = [
    guidesHubJsonLd(),
    top30GuidesItemListJsonLd(),
    hubFaqJsonLd(GUIDES_HUB_FAQS),
    hubBreadcrumbJsonLd(t(dict, "hubs.guidesBadge"), GUIDES_HUB_PATH),
  ];

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <HubJsonLd blocks={blocks} />

      <PageBack href="/" label={t(dict, "common.home")} />

      <header className="max-w-3xl space-y-3">
        <Badge variant="neon" className="gap-1">
          <BookOpen className="h-3 w-3" />
          {t(dict, "hubs.guidesBadge")}
        </Badge>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {t(dict, "hubs.guidesTitle")}{" "}
          <span className="text-gradient">{t(dict, "hubs.guidesTitleAccent")}</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {t(dict, "hubs.guidesSub")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t(dict, "common.exploreMore")}:{" "}
          <Link href="/tools" className="text-primary underline-offset-2 hover:underline">
            {t(dict, "nav.indiaTools")}
          </Link>
          ,{" "}
          <Link href="/jobs/govt" className="text-primary underline-offset-2 hover:underline">
            {t(dict, "hubs.jobsNavGovt")}
          </Link>
          ,{" "}
          <Link href="/sports" className="text-primary underline-offset-2 hover:underline">
            {t(dict, "nav.sports")}
          </Link>
          .
        </p>
      </header>

      <GuidesSectionGrid />

      <TopThirtyGuidesGrid />

      <TopicClustersHubStrip
        title={t(dict, "hubs.topicClusters")}
        subtitle={t(dict, "hubs.guidesSub")}
      />

      <YmylDisclaimer kind="schemes" />

      <HubEditorialIntro title={t(dict, "hubs.guidesEditorialTitle")}>
        <p>{t(dict, "hubs.guidesEditorialBody")}</p>
      </HubEditorialIntro>

      <HubAdSense />

      <RelatedHubs current="guides" />
    </div>
  );
}
