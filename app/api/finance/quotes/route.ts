import { NextResponse } from "next/server";
import { normalizeSymbol } from "@/lib/finance/transformers";
import { fetchQuotesCached } from "@/lib/finance/fetch-quotes";
import { financeJsonResponse } from "@/lib/finance/api-response";

export async function GET(req: Request) {
  const symbols = new URL(req.url).searchParams.get("symbols");
  if (!symbols) {
    return NextResponse.json({ error: "symbols required" }, { status: 400 });
  }

  const list = symbols
    .split(",")
    .map((s) => normalizeSymbol(s.trim()))
    .filter(Boolean)
    .slice(0, 20);

  try {
    const quotes = await fetchQuotesCached(list);
    return financeJsonResponse({ quotes });
  } catch (err) {
    console.error("[api/finance/quotes]", err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
