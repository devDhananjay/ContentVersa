import type { Metadata } from "next";
import { FinanceBlogSection } from "@/components/finance/finance-blog-section";
import { MoneyTopicsGrid } from "@/components/finance/money-topics-grid";
import Link from "next/link";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubPushCta } from "@/components/engagement/hub-push-cta";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { FINANCE_HUB_SEO, hubSeoJsonLdBlocks } from "@/lib/seo/hub-seo";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: "/finance",
    titleKey: "seo.financeTitle",
    titleEn: "Finance — Nifty, Sensex, Gold, SIP & MoneyVerse India",
    titleHi: "Finance — Nifty, Sensex, Gold, SIP & MoneyVerse India",
    descriptionKey: "seo.financeDesc",
    descriptionEn: FINANCE_HUB_SEO.description,
    descriptionHi: FINANCE_HUB_SEO.description,
    keywords: [
      "finance India",
      "Nifty 50 live",
      "Sensex today",
      "gold price today",
      "silver price today",
      "SIP calculator",
      "mutual funds India",
      "FD interest rates India",
      "home loan EMI",
      "IPO apply India",
      "credit score India",
      "income tax India",
      "personal finance India",
      "MoneyVerse",
      "share market today",
    ],
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600",
  });
}

export default async function FinanceHubPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const blogs = await getBlogsByCategoryHybrid("finance");

  return (
    <>
      <HubJsonLd blocks={hubSeoJsonLdBlocks(FINANCE_HUB_SEO)} />
      <HubEditorialIntro title={t(dict, "hubs.financeEditorialTitle")}>
        <p>{t(dict, "hubs.financeEditorialBody")}</p>
        <p>
          Start with high-intent guides:{" "}
          <Link href="/goldverse" className="text-primary hover:underline">
            gold price today
          </Link>
          ,{" "}
          <Link href="/guides/money/sip-calculator-india-beginners-guide" className="text-primary hover:underline">
            SIP
          </Link>
          ,{" "}
          <Link href="/guides/money/fd-vs-rd-india-guide" className="text-primary hover:underline">
            FD vs RD
          </Link>
          ,{" "}
          <Link href="/guides/money/salary-tax-calculator-india-guide" className="text-primary hover:underline">
            income tax
          </Link>
          , plus{" "}
          <Link href="/moneyverse" className="text-primary hover:underline">
            MoneyVerse
          </Link>{" "}
          trackers and{" "}
          <Link href="/tools" className="text-primary hover:underline">
            free calculators
          </Link>
          .
        </p>
      </HubEditorialIntro>
      <HubAdSense />
      <MoneyTopicsGrid />
      <HubPushCta
        title={t(dict, "hubs.financePushTitle")}
        description={t(dict, "hubs.financePushDesc")}
      />
      <FinanceBlogSection blogs={blogs} />
      <RelatedHubs current="finance" contained />
    </>
  );
}
