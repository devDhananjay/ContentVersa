import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { BandAd } from "@/components/ads/band-ad";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { PageBack } from "@/components/site/page-back";
import { getLeaderboardCached } from "@/lib/data/leaderboard";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Leaderboard",
  description: "Top ContentVerse India creators ranked by reach, engagement and growth.",
  path: "/leaderboard",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const creators = await getLeaderboardCached();

  return (
    <div className="container py-12 max-w-4xl">
      <PageBack href="/" label="Home" className="mb-6" />
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 text-neon-orange mb-2">
          <Trophy className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            Top creators
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
          The <span className="text-gradient">leaderboard</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Live ranking by views, likes, followers and published posts — refreshed from the database.
        </p>
      </div>

      <LeaderboardView creators={creators} />
      <BandAd slotKey="horizontal" className="mt-8" />
      <HubAdSense className="!px-0" />
    </div>
  );
}
