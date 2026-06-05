import { NextResponse } from "next/server";
import { getCricketNews, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 12) || 12, 30);

  try {
    const data = await getCricketNews(limit);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err), data: [] },
      { status: 502 }
    );
  }
}
