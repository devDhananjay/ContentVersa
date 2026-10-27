import type { Metadata } from "next";
import Link from "next/link";
import { ToolsHubGrid, ToolsHubIntro } from "@/components/tools/tools-hub-grid";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { BandAd } from "@/components/ads/band-ad";
import { MrecAd } from "@/components/ads/mrec-ad";
import { StickyRailAd } from "@/components/ads/sticky-rail-ad";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { TopicClustersHubStrip } from "@/components/seo/topic-cluster-links";
import { PageBack } from "@/components/site/page-back";
import {
  hubBreadcrumbJsonLd,
  hubFaqJsonLd,
  TOOLS_HUB_FAQS,
} from "@/lib/seo/hub-seo";
import { buildMetadata } from "@/lib/seo";
import { TOOLS_HUB_PATH } from "@/lib/tools/registry";
import { toolsHubJsonLd } from "@/lib/tools/tools-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { getRequestLocale } = await import("@/lib/i18n/locale-server");
  const { getDictionary, t } = await import("@/lib/i18n/get-dictionary");
  const { withLocalePrefix } = await import("@/lib/i18n/config");
  const { buildHreflangAlternates } = await import("@/lib/i18n/hreflang");
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  return buildMetadata({
    title: t(dict, "hubs.toolsTitle"),
    description: t(dict, "hubs.toolsSub"),
    path: withLocalePrefix(TOOLS_HUB_PATH, locale),
    alternates: buildHreflangAlternates(TOOLS_HUB_PATH),
    keywords: [
      "india utility tools",
      "income tax calculator india",
      "IFSC finder",
      "EMI calculator india",
      "ContentVerse India tools",
    ],
  });
}

export default async function ToolsHubPage() {
  const { getRequestLocale } = await import("@/lib/i18n/locale-server");
  const { getDictionary, t } = await import("@/lib/i18n/get-dictionary");
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const blocks = [
    toolsHubJsonLd(),
    hubFaqJsonLd(TOOLS_HUB_FAQS),
    hubBreadcrumbJsonLd(t(dict, "nav.indiaTools"), TOOLS_HUB_PATH),
  ];

  return (
    <div className="container space-y-10 py-8 md:py-10">
      <HubJsonLd blocks={blocks} />
      <PageBack href="/" label={t(dict, "common.home")} />
      <ToolsHubIntro />
      <HubEditorialIntro title={t(dict, "hubs.toolsEditorialTitle")}>
        <p>{t(dict, "hubs.toolsEditorialBody")}</p>
        <p>
          {t(dict, "hubs.toolsPopularStarts")}{" "}
          <Link href="/tools/salary-tax-calculator" className="text-primary hover:underline">
            salary tax calculator
          </Link>
          ,{" "}
          <Link href="/tools/merge-pdf" className="text-primary hover:underline">
            merge PDF
          </Link>
          ,{" "}
          <Link href="/tools/pnr-status" className="text-primary hover:underline">
            PNR status
          </Link>
          ,{" "}
          <Link href="/tools/ifsc-finder" className="text-primary hover:underline">
            IFSC finder
          </Link>
          , plus{" "}
          <Link href="/moneyverse" className="text-primary hover:underline">
            MoneyVerse
          </Link>{" "}
          and{" "}
          <Link href="/ai" className="text-primary hover:underline">
            ContentVerse India AI
          </Link>
          .
        </p>
      </HubEditorialIntro>

      {/* Horizontal band ATF */}
      <BandAd slotKey="horizontal" />

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-10">
          <ToolsHubGrid />

          {/* Rectangle MREC after grid */}
          <div className="flex justify-center">
            <MrecAd slotKey="hub" />
          </div>

          <TopicClustersHubStrip
            title={t(dict, "hubs.topicClusters")}
            subtitle={t(dict, "hubs.toolsTopicClustersSub")}
          />

          <HubAdSense />

          <section className="max-w-3xl rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {t(dict, "hubs.toolsOfficialPortalsTitle")}
            </p>
            <p className="mt-2">{t(dict, "hubs.toolsOfficialPortalsBody")}</p>
            <p className="mt-2">
              For live vehicle RC, challan, or DL records use official MoRTH services:{" "}
              <a
                href="https://vahan.parivahan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Vahan
              </a>
              ,{" "}
              <a
                href="https://echallan.parivahan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                e-Challan
              </a>
              , and{" "}
              <a
                href="https://parivahan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Parivahan Sewa
              </a>
              . ContentVerse India tools use free public data and format checks only.
            </p>
          </section>

          <RelatedHubs current="tools" />
        </div>

        {/* Vertical side rail on hub */}
        <StickyRailAd slotKey="sidebar" sticky label="Sponsored on tools hub" />
      </div>

      {/* Closing wide band */}
      <BandAd slotKey="horizontal" />
    </div>
  );
}
