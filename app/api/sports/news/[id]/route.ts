import { NextResponse } from "next/server";
import { getCricketNewsDetail, sportsApiErrorMessage } from "@/lib/sports/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const newsId = Number(id);
  if (!Number.isFinite(newsId)) {
    return NextResponse.json({ error: "Invalid news id" }, { status: 400 });
  }

  try {
    const data = await getCricketNewsDetail(newsId);
    if (!data) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: sportsApiErrorMessage(err) },
      { status: 502 }
    );
  }
}
