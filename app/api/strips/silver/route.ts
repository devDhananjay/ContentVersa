import { NextResponse } from "next/server";
import { getSilverPriceSnapshot } from "@/lib/goldverse/silver-price";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getSilverPriceSnapshot();
  return NextResponse.json(
    {
      items: [
        { label: "per gram", value: snapshot.perGram },
        { label: "per 10g", value: snapshot.per10g },
        { label: "per kg", value: snapshot.perKg },
      ],
      source: snapshot.source,
      updatedAt: snapshot.updatedAt,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    }
  );
}
