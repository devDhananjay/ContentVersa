import { NextResponse } from "next/server";
import { getSilverPriceSnapshot } from "@/lib/goldverse/silver-price";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getSilverPriceSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
