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
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Finance — Nifty, Sensex, Gold, SIP & MoneyVerse India",
  description: FINANCE_HUB_SEO.description,
  path: "/finance",
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

export default async function FinanceHubPage() {
  const blogs = await getBlogsByCategoryHybrid("finance");

  return (
    <>
      <HubJsonLd blocks={hubSeoJsonLdBlocks(FINANCE_HUB_SEO)} />
      <HubEditorialIntro title="Indian markets, gold rates & money guides">
        <p>
          The Finance Hub shows live Indian market indices, top movers, and stock charts for
          quick reference. These data widgets are not standalone articles — they support readers
          who follow our finance writers. ContentVerse India publishes original explainers on investing,
          personal finance, markets, and the Indian economy, written by creators and reviewed
          against our content policy.
        </p>
        <p>
          Start with high-intent guides:{" "}
          <Link href="/finance/gold-price-today" className="text-primary hover:underline">
            gold price today
          </Link>
          ,{" "}
          <Link href="/finance/sip" className="text-primary hover:underline">
            SIP
          </Link>
          ,{" "}
          <Link href="/finance/mutual-funds" className="text-primary hover:underline">
            mutual funds
          </Link>
          ,{" "}
          <Link href="/finance/fd" className="text-primary hover:underline">
            FD
          </Link>
          ,{" "}
          <Link href="/finance/tax" className="text-primary hover:underline">
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
        title="Market open & close alerts"
        description="Push when your watchlist stocks move at open and close (IST)."
      />
      <FinanceBlogSection blogs={blogs} />
      <RelatedHubs current="finance" contained />
    </>
  );
}
