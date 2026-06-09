import { NextResponse } from "next/server";
import { getCategoryFeed } from "@/lib/feeds/data";
import { hasCategoryFeed } from "@/lib/feeds/constants";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!hasCategoryFeed(slug) || slug === "finance") {
    return NextResponse.json({ error: "No feed for category" }, { status: 404 });
  }

  const feed = await getCategoryFeed(slug);
  if (!feed) {
    return NextResponse.json({ error: "Feed unavailable" }, { status: 503 });
  }

  return NextResponse.json(feed, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
