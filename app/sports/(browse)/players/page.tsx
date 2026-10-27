import type { Metadata } from "next";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { PlayerSearch } from "@/components/sports/player-search";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: "/sports/players",
    titleEn: "Find Player",
    titleHi: "Find Player",
    descriptionEn: "Search cricket players and view profiles, career stats and more.",
    descriptionHi: "Search cricket players and view profiles, career stats and more.",
    noIndex: true,
    bilingualIndex: false,
  });
}

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
      <HubAdSense className="!px-0 mt-8" />
    </div>
  );
}
