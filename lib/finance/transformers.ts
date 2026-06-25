import type { StockQuote } from "./types";

type YahooQuote = {
  symbol?: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  regularMarketPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  marketCap?: number;
};

export function toStockQuote(raw: unknown): StockQuote | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as YahooQuote;
  const price = q.regularMarketPrice;
  if (price == null || !q.symbol) return null;

  return {
    symbol: q.symbol,
    shortName: q.shortName ?? q.longName ?? q.symbol.replace(".NS", ""),
    price,
    change: q.regularMarketChange ?? 0,
    changePercent: q.regularMarketChangePercent ?? 0,
    currency: q.currency ?? "INR",
    previousClose: q.regularMarketPreviousClose,
    dayHigh: q.regularMarketDayHigh,
    dayLow: q.regularMarketDayLow,
    volume: q.regularMarketVolume,
    marketCap: q.marketCap,
  };
}

export function sortGainers(quotes: StockQuote[]): StockQuote[] {
  return [...quotes].sort((a, b) => b.changePercent - a.changePercent);
}

export function sortLosers(quotes: StockQuote[]): StockQuote[] {
  return [...quotes].sort((a, b) => a.changePercent - b.changePercent);
}

export function displaySymbol(symbol: string): string {
  return symbol.replace(".NS", "").replace(".BO", "");
}

export function normalizeSymbol(input: string): string {
  const s = input.trim().toUpperCase();
  if (s.startsWith("^")) return s;
  if (s.endsWith(".NS") || s.endsWith(".BO")) return s;
  return `${s}.NS`;
}

/** Map retired / renamed tickers to current Yahoo symbols. */
const LEGACY_SYMBOL_ALIASES: Record<string, string> = {
  TATAMOTORS: "TMPV.NS",
};

export function resolveFinanceSymbol(input: string): string {
  const normalized = normalizeSymbol(input);
  const bare = displaySymbol(normalized);
  return LEGACY_SYMBOL_ALIASES[bare] ?? normalized;
}
