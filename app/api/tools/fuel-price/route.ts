import { NextResponse } from "next/server";
import { getFuelPriceByCity, searchFuelPrices } from "@/lib/tools/fuel-price";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const city = url.searchParams.get("city")?.trim();
  const state = url.searchParams.get("state")?.trim();

  try {
    if (city) {
      const data = await getFuelPriceByCity(city, state);
      if (!data) {
        return NextResponse.json({ ok: false, error: "City not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, data });
    }

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: "Provide q (search) or city param" },
        { status: 400 }
      );
    }

    const results = await searchFuelPrices(q);
    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[tools/fuel-price]", err);
    return NextResponse.json({ error: "Fuel data unavailable" }, { status: 502 });
  }
}
