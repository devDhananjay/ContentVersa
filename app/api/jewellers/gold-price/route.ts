import { NextResponse } from "next/server";
import { getGoldPriceSnapshot } from "@/lib/jewellers/gold-price";
import { findGoldCity } from "@/lib/jewellers/gold-utils";

export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city")?.trim();
  const snapshot = await getGoldPriceSnapshot();

  if (city) {
    const row = findGoldCity(snapshot.rates, city);
    if (!row) {
      return NextResponse.json(
        { error: "City not found", cities: snapshot.rates.map((r) => r.city) },
        { status: 404 }
      );
    }
    return NextResponse.json({ ...snapshot, city: row });
  }

  return NextResponse.json(snapshot);
}
