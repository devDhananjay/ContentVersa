import type { Metadata } from "next";
import { FinanceBlogSection } from "@/components/finance/finance-blog-section";
import { MoneyTopicsGrid } from "@/components/finance/money-topics-grid";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { HubPushCta } from "@/components/engagement/hub-push-cta";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Finance — Nifty, Sensex, Gold, SIP & MoneyVerse India",
  description:
    "Live Nifty 50 & Sensex plus MoneyVerse guides: gold price today, silver, SIP, mutual funds, stocks, IPO, FD, RD, loans, credit cards, credit score and tax India.",
  path: "/finance",
  keywords: [
    "finance India",
    "Nifty Sensex",
    "gold price today",
    "SIP calculator",
    "mutual funds India",
    "MoneyVerse",
  ],
  image:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600",
});

export default async function FinanceHubPage() {
  const blogs = await getBlogsByCategoryHybrid("finance");

  return (
    <>
      <HubEditorialIntro title="Finance on ContentVerse India">
        <p>
          The Finance Hub shows live Indian market indices, top movers, and stock charts for
          quick reference. These data widgets are not standalone articles — they support readers
          who follow our finance writers. ContentVerse India publishes original explainers on investing,
          personal finance, markets, and the Indian economy, written by creators and reviewed
          against our content policy.
        </p>
        <p>
          MoneyVerse guides below cover gold, silver, SIP, mutual funds, stocks, IPO, FD, RD,
          loans, credit cards, credit score, and tax — with free calculators and tracker tools.
        </p>
      </HubEditorialIntro>
      <HubAdSense />
      <MoneyTopicsGrid />
      <HubPushCta
        title="Market open & close alerts"
        description="Push when your watchlist stocks move at open and close (IST)."
      />
      <FinanceBlogSection blogs={blogs} />
    </>
  );
}
