import { NextResponse } from "next/server";
import { getSeriesDetailData, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const seriesId = Number(id);
  if (!Number.isFinite(seriesId)) {
    return NextResponse.json({ error: "Invalid series id" }, { status: 400 });
  }

  try {
    const data = await getSeriesDetailData(seriesId);
    if (!data) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err) },
      { status: 502 }
    );
  }
}
