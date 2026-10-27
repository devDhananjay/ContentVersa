import type { Metadata } from "next";
import Link from "next/link";
import { MoneyVerseHub } from "@/components/moneyverse/moneyverse-hub";
import { MoneyTopicsGrid } from "@/components/finance/money-topics-grid";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubJsonLd } from "@/components/seo/hub-json-ld";
import { RelatedHubs } from "@/components/seo/related-hubs";
import { hubSeoJsonLdBlocks, MONEYVERSE_HUB_SEO } from "@/lib/seo/hub-seo";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";
import { getRequestLocale } from "@/lib/i18n/locale-server";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: "/moneyverse",
    titleKey: "seo.moneyverseTitle",
    titleEn: "MoneyVerse — Expense Tracker, Budget Planner & Screenshot OCR India",
    titleHi: "MoneyVerse — Expense Tracker, Budget Planner & Screenshot OCR India",
    descriptionKey: "seo.moneyverseDesc",
    descriptionEn: MONEYVERSE_HUB_SEO.description,
    descriptionHi: MONEYVERSE_HUB_SEO.description,
    keywords: [
      "expense tracker India",
      "UPI expense manager",
      "budget planner India",
      "monthly expense report",
      "credit card reminder",
      "SIP reminder",
      "UPI screenshot OCR",
      "payment screenshot scan",
      "bank statement analyzer",
      "PhonePe expense tracker",
      "GPay screenshot OCR",
      "MoneyVerse",
      "personal finance app India",
    ],
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600",
  });
}

export default async function MoneyVersePage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-8">
      <HubJsonLd blocks={hubSeoJsonLdBlocks(MONEYVERSE_HUB_SEO)} />
      <HubEditorialIntro title={t(dict, "hubs.moneyEditorialTitle")}>
        <p>{t(dict, "hubs.moneyEditorialBody")}</p>
        <p>
          Use{" "}
          <Link href="/moneyverse/screenshot-scan" className="text-emerald-300 hover:underline">
            Screenshot Scan (OCR)
          </Link>{" "}
          and{" "}
          <Link
            href="/moneyverse/bank-statement-analyzer"
            className="text-emerald-300 hover:underline"
          >
            Bank Statement Analyzer
          </Link>
          , or explore{" "}
          <Link href="/finance#money-guides" className="text-emerald-300 hover:underline">
            MoneyVerse guides
          </Link>{" "}
          and{" "}
          <Link href="/ai" className="text-emerald-300 hover:underline">
            ContentVerse India AI
          </Link>
          .
        </p>
      </HubEditorialIntro>
      <MoneyVerseHub />
      <MoneyTopicsGrid title={t(dict, "hubs.moneyStrengthenTitle")} />
      {/* After money guides grid — not inside expense/OCR tool UI */}
      <HubAdSense />
      <RelatedHubs current="moneyverse" contained />
    </div>
  );
}
