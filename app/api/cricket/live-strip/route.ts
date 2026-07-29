import { NextResponse } from "next/server";
import { isSportsApiConfigured } from "@/lib/sports/cricbuzz-client";

export const dynamic = "force-dynamic";

interface StripMatch {
  id: string;
  title: string;
  status: string;
  team1: { name: string; score?: string };
  team2: { name: string; score?: string };
  isLive: boolean;
  href: string;
}

function formatScore(scores: { runs: number; wickets: number; overs: number }[]): string {
  return scores.map((s) => `${s.runs}/${s.wickets} (${s.overs})`).join(" & ");
}

async function fromCricbuzz(): Promise<StripMatch[]> {
  const { getLiveMatches, getUpcomingMatches, getRecentMatches } = await import("@/lib/sports/data");
  const [live, upcoming, recent] = await Promise.all([
    getLiveMatches(),
    getUpcomingMatches(),
    getRecentMatches(),
  ]);

  const all = [...live, ...upcoming.slice(0, 4), ...recent.slice(0, 4)];
  return all.map((m) => ({
    id: String(m.id),
    title: `${m.team1.shortName} vs ${m.team2.shortName}`,
    status: m.status || m.stateTitle,
    team1: { name: m.team1.shortName, score: m.team1Scores.length ? formatScore(m.team1Scores) : undefined },
    team2: { name: m.team2.shortName, score: m.team2Scores.length ? formatScore(m.team2Scores) : undefined },
    isLive: m.isLive,
    href: `/sports/match/${m.id}`,
  }));
}

async function fromEspnFallback(): Promise<StripMatch[]> {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/personalized/v2/scoreboard/header?sport=cricket",
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const leagues = json?.sports?.[0]?.leagues ?? [];
    const matches: StripMatch[] = [];

    for (const league of leagues) {
      for (const ev of league.events ?? []) {
        const comps = ev.competitions ?? [];
        for (const comp of comps) {
          const teams = comp.competitors ?? [];
          const t1 = teams[0];
          const t2 = teams[1];
          if (!t1 || !t2) continue;

          matches.push({
            id: String(ev.id),
            title: `${t1.abbreviation ?? t1.team?.abbreviation ?? "TBA"} vs ${t2.abbreviation ?? t2.team?.abbreviation ?? "TBA"}`,
            status: ev.status?.type?.shortDetail ?? ev.status?.type?.detail ?? comp.status?.type?.shortDetail ?? "",
            team1: { name: t1.abbreviation ?? t1.team?.abbreviation ?? "TBA", score: t1.score ?? undefined },
            team2: { name: t2.abbreviation ?? t2.team?.abbreviation ?? "TBA", score: t2.score ?? undefined },
            isLive: ev.status?.type?.state === "in" || comp.status?.type?.state === "in",
            href: `/sports`,
          });
        }
      }
    }
    return matches.slice(0, 12);
  } catch {
    return [];
  }
}

export async function GET() {
  const matches = isSportsApiConfigured()
    ? await fromCricbuzz().catch(() => fromEspnFallback())
    : await fromEspnFallback();

  return NextResponse.json(matches, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
  });
}
