import type { Metadata } from "next";
import { HubAdSense } from "@/components/ads/hub-adsense";
import { TeamsGrid } from "@/components/sports/teams-grid";
import { getInternationalTeams } from "@/lib/sports/data";
import { buildLocaleHubMetadata } from "@/lib/i18n/locale-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildLocaleHubMetadata({
    path: "/sports/teams",
    titleEn: "Cricket Teams",
    titleHi: "Cricket Teams",
    descriptionEn:
      "Browse international cricket teams, squads, schedules and results.",
    descriptionHi:
      "Browse international cricket teams, squads, schedules and results.",
    noIndex: true,
    bilingualIndex: false,
  });
}

export default async function TeamsPage() {
  const teams = await getInternationalTeams();

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-extrabold tracking-tight">
          International <span className="text-gradient">Teams</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a team to view squad, schedule and recent results.
        </p>
      </div>
      <TeamsGrid teams={teams} />
      <HubAdSense className="!px-0 mt-8" />
    </div>
  );
}
