import { NextResponse } from "next/server";
import {
  getPlayerBattingStats,
  getPlayerBowlingStats,
  getPlayerProfile,
  sportsApiErrorMessage,
} from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId)) {
    return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
  }

  try {
    const [profile, batting, bowling] = await Promise.all([
      getPlayerProfile(playerId),
      getPlayerBattingStats(playerId),
      getPlayerBowlingStats(playerId),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { profile, batting, bowling } });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err) },
      { status: 502 }
    );
  }
}
