import { NextResponse } from "next/server";
import { getInternationalTeams, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getInternationalTeams();
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err), data: [] },
      { status: 502 }
    );
  }
}
