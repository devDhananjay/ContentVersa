import type { Metadata } from "next";
import { TeamsGrid } from "@/components/sports/teams-grid";
import { getInternationalTeams } from "@/lib/sports/data";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Cricket Teams",
  description: "Browse international cricket teams, squads, schedules and results.",
  path: "/sports/teams",
});

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
    </div>
  );
}
