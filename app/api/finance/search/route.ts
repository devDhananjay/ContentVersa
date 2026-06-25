import { NextResponse } from "next/server";
import { searchFinanceStocks } from "@/lib/finance/stock-search";

/** GET /api/finance/search?q=RELI — autocomplete for watchlist */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = searchFinanceStocks(q, 12);
  return NextResponse.json({ results });
}
