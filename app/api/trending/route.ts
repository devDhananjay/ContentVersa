import { NextResponse } from "next/server";
import { fetchIndiaTrends } from "@/lib/trending/google-trends";

export const dynamic = "force-dynamic";

export async function GET() {
  const trends = await fetchIndiaTrends();
  return NextResponse.json(trends, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
