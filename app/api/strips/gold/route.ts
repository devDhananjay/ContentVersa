import { NextResponse } from "next/server";
import { getGoldPriceSnapshot } from "@/lib/goldverse/gold-price";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getGoldPriceSnapshot();
  const items = snapshot.rates.slice(0, 8).map((r) => ({
    city: r.city,
    gold24k: r.gold24k,
    gold22k: r.gold22k,
  }));

  return NextResponse.json(
    { items, source: snapshot.source, updatedAt: snapshot.updatedAt },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } }
  );
}
