import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK = [
  { city: "Delhi", petrol: 102.12, diesel: 95.2 },
  { city: "Mumbai", petrol: 105.66, diesel: 92.72 },
  { city: "Kolkata", petrol: 105.41, diesel: 92.76 },
  { city: "Chennai", petrol: 101.81, diesel: 93.78 },
  { city: "Bangalore", petrol: 103.71, diesel: 91.26 },
  { city: "Hyderabad", petrol: 109.66, diesel: 97.82 },
];

export async function GET() {
  try {
    const { getFuelPriceByCity } = await import("@/lib/tools/fuel-price");
    const metros = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad"];
    const results = await Promise.all(metros.map((c) => getFuelPriceByCity(c)));
    const items = results
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((row) => {
        const petrol = row.rates.find((f) => f.fuel === "Petrol")?.price ?? 0;
        const diesel = row.rates.find((f) => f.fuel === "Diesel")?.price ?? 0;
        return { city: row.city, petrol, diesel };
      });

    return NextResponse.json(items.length ? items : FALLBACK, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json(FALLBACK, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  }
}
