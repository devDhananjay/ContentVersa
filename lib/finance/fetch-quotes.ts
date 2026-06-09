import YahooFinance from "yahoo-finance2";
import { cache } from "@/lib/redis";
import { FINANCE_CACHE_TTL } from "./constants";
import { toStockQuote } from "./transformers";
import type { StockQuote } from "./types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/** One Yahoo request for many symbols, with server-side cache. */
export async function fetchQuotesCached(symbols: string[]): Promise<StockQuote[]> {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const cacheKey = `finance:quotes:${unique.sort().join(",")}`;
  return cache.wrap(cacheKey, FINANCE_CACHE_TTL, () => fetchQuotesFromYahoo(unique));
}

async function fetchQuotesFromYahoo(symbols: string[]): Promise<StockQuote[]> {
  try {
    const raw = await yahooFinance.quote(symbols);
    const rows = Array.isArray(raw) ? raw : [raw];
    return rows.map(toStockQuote).filter((q): q is StockQuote => q !== null);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[finance] batch quote failed", err);
    }
    return [];
  }
}
