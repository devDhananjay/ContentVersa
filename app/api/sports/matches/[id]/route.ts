import { NextResponse } from "next/server";
import { getMatchDetail, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "Invalid match id" }, { status: 400 });
  }

  try {
    const data = await getMatchDetail(matchId);
    if (!data) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err) },
      { status: 502 }
    );
  }
}
