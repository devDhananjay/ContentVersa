import { NextResponse } from "next/server";
import { getSquadPlayers, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; squadId: string }> }
) {
  const { id, squadId } = await params;
  const seriesId = Number(id);
  const squad = Number(squadId);
  if (!Number.isFinite(seriesId) || !Number.isFinite(squad)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await getSquadPlayers(seriesId, squad);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err), data: [] },
      { status: 502 }
    );
  }
}
