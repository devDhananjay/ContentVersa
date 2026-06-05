import { NextResponse } from "next/server";
import {
  getTeamById,
  getTeamPlayers,
  getTeamResults,
  getTeamSchedule,
  sportsApiErrorMessage,
} from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isFinite(teamId)) {
    return NextResponse.json({ error: "Invalid team id" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");

  try {
    if (section === "players") {
      const data = await getTeamPlayers(teamId);
      return NextResponse.json({ data });
    }
    if (section === "schedule") {
      const data = await getTeamSchedule(teamId);
      return NextResponse.json({ data });
    }
    if (section === "results") {
      const data = await getTeamResults(teamId);
      return NextResponse.json({ data });
    }

    const [team, players, schedule, results] = await Promise.all([
      getTeamById(teamId),
      getTeamPlayers(teamId),
      getTeamSchedule(teamId),
      getTeamResults(teamId),
    ]);

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { team, players, schedule, results } });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err) },
      { status: 502 }
    );
  }
}
