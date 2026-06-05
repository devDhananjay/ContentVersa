import { NextResponse } from "next/server";
import { getTrendingPlayers, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTrendingPlayers();
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err), data: [] },
      { status: 502 }
    );
  }
}
