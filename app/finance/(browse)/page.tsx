import type { Metadata } from "next";
import { FinanceBlogSection } from "@/components/finance/finance-blog-section";
import { HubEditorialIntro } from "@/components/seo/hub-editorial-intro";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Finance — Nifty, Sensex & Indian Markets",
  description:
    "Live Nifty 50, Sensex, top gainers, losers and stock charts on ContentVerse India.",
  path: "/finance",
  image:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600",
});

export default async function FinanceHubPage() {
  const blogs = await getBlogsByCategoryHybrid("finance");

  return (
    <>
      <HubEditorialIntro title="Finance on ContentVerse">
        <p>
          The Finance Hub shows live Indian market indices, top movers, and stock charts for
          quick reference. These data widgets are not standalone articles — they support readers
          who follow our finance writers. ContentVerse publishes original explainers on investing,
          personal finance, markets, and the Indian economy, written by creators and reviewed
          against our content policy.
        </p>
        <p>
          Stock quote pages display third-party market data. For in-depth analysis, read the
          finance blogs below or explore all articles in the Finance category.
        </p>
      </HubEditorialIntro>
      <FinanceBlogSection blogs={blogs} />
    </>
  );
}
