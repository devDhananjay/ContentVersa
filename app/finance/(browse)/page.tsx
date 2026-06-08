import type { Metadata } from "next";
import { FinanceBlogSection } from "@/components/finance/finance-blog-section";
import { getBlogsByCategoryHybrid } from "@/lib/data/blog-db";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Finance Hub — Live Indian Markets",
  description:
    "Live Nifty 50, Sensex, top gainers, losers and stock charts. Plus finance blogs from ContentVerse.",
  path: "/finance",
  image:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600",
});

export default async function FinanceHubPage() {
  const blogs = await getBlogsByCategoryHybrid("finance");

  return <FinanceBlogSection blogs={blogs} />;
}
