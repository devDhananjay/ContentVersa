import { NextResponse } from "next/server";
import { fetchTmdbFeed } from "@/lib/feeds/tmdb";

export const dynamic = "force-dynamic";

export async function GET() {
  const movies = await fetchTmdbFeed(12);
  return NextResponse.json(movies, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" },
  });
}
