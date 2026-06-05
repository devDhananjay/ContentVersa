import type { Metadata } from "next";
import { PlayerSearch } from "@/components/sports/player-search";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Find Player",
  description: "Search cricket players and view profiles, career stats and more.",
  path: "/sports/players",
});

export default async function PlayersSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-extrabold tracking-tight">
          Find a <span className="text-gradient">Player</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Search by name to view player profiles and career statistics.
        </p>
      </div>
      <PlayerSearch autoFocus initialQuery={q ?? ""} />
    </div>
  );
}
