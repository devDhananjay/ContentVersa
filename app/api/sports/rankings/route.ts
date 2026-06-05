import { NextResponse } from "next/server";
import { getBatsmanRankings, sportsApiErrorMessage } from "@/lib/sports/data";
import type { RankingFormat } from "@/lib/sports/types";

export const dynamic = "force-dynamic";

const VALID: RankingFormat[] = ["test", "odi", "t20"];

export async function GET(req: Request) {
  const format = (new URL(req.url).searchParams.get("format") ??
    "odi") as RankingFormat;
  const safe = VALID.includes(format) ? format : "odi";

  try {
    const data = await getBatsmanRankings(safe);
    return NextResponse.json({ data, format: safe });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err), data: [] },
      { status: 502 }
    );
  }
}
