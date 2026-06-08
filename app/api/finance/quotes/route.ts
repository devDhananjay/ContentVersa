import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { toStockQuote, normalizeSymbol } from "@/lib/finance/transformers";
import { cache } from "@/lib/redis";
import { FINANCE_CACHE_TTL } from "@/lib/finance/constants";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

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
    const quotes = await Promise.all(
      list.map(async (symbol) => {
        try {
          const cacheKey = `finance:quote:${symbol}`;
          const raw = await cache.wrap(cacheKey, FINANCE_CACHE_TTL, () =>
            yahooFinance.quote(symbol)
          );
          return toStockQuote(raw);
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      quotes: quotes.filter((q) => q !== null),
    });
  } catch (err) {
    console.error("[api/finance/quotes]", err);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
