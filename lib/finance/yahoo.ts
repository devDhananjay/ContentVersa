import YahooFinance from "yahoo-finance2";
import { cache } from "@/lib/redis";
import {
  FINANCE_CACHE_TTL,
  NIFTY50_SYMBOLS,
  NIFTY_INDEX,
  SENSEX_INDEX,
  TOP10_STOCKS,
} from "./constants";
import { fetchIndianIndices } from "./indian-indices";
import {
  sortGainers,
  sortLosers,
  toStockQuote,
} from "./transformers";
import type {
  FinanceHubData,
  FinanceTickerData,
  IndexQuote,
  StockChartPoint,
  StockDetailData,
  StockQuote,
} from "./types";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

async function fetchQuote(symbol: string) {
  return yahooFinance.quote(symbol);
}

async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  if (symbols.length === 0) return [];
  try {
    const raw = await yahooFinance.quote([...symbols]);
    const rows = Array.isArray(raw) ? raw : [raw];
    return rows.map(toStockQuote).filter((q): q is StockQuote => q !== null);
  } catch {
    return [];
  }
}

/** Batch quotes for watchlist alert cron */
export async function fetchYahooQuotes(symbols: string[]): Promise<StockQuote[]> {
  return fetchQuotes(symbols);
}

function toIndexQuote(
  symbol: string,
  name: string,
  raw: Awaited<ReturnType<typeof fetchQuote>>
): IndexQuote {
  return {
    symbol,
    name,
    price: raw.regularMarketPrice ?? 0,
    change: raw.regularMarketChange ?? 0,
    changePercent: raw.regularMarketChangePercent ?? 0,
  };
}

async function loadNifty50Quotes(): Promise<StockQuote[]> {
  return cache.wrap("finance:nifty50-quotes", FINANCE_CACHE_TTL, () =>
    fetchQuotes([...NIFTY50_SYMBOLS])
  );
}

async function loadIndices(): Promise<{ nifty: IndexQuote; sensex: IndexQuote }> {
  return cache.wrap("finance:indices", FINANCE_CACHE_TTL, async () => {
    const official = await fetchIndianIndices();
    if (official) return official;

    const [niftyRaw, sensexRaw] = await Promise.all([
      fetchQuote(NIFTY_INDEX),
      fetchQuote(SENSEX_INDEX),
    ]);
    return {
      nifty: toIndexQuote(NIFTY_INDEX, "Nifty 50", niftyRaw),
      sensex: toIndexQuote(SENSEX_INDEX, "Sensex", sensexRaw),
    };
  });
}

export async function getFinanceTickerData(): Promise<FinanceTickerData> {
  return cache.wrap("finance:ticker", FINANCE_CACHE_TTL, async () => {
    const [{ nifty, sensex }, nifty50] = await Promise.all([
      loadIndices(),
      loadNifty50Quotes(),
    ]);
    return {
      nifty,
      sensex,
      topGainers: sortGainers(nifty50).slice(0, 10),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function getFinanceHubData(): Promise<FinanceHubData> {
  return cache.wrap("finance:hub", FINANCE_CACHE_TTL, async () => {
    const [{ nifty, sensex }, nifty50, top10] = await Promise.all([
      loadIndices(),
      loadNifty50Quotes(),
      fetchQuotes([...TOP10_STOCKS]),
    ]);

    const gainers = sortGainers(nifty50);
    const losers = sortLosers(nifty50);

    return {
      nifty,
      sensex,
      topGainers: gainers.slice(0, 10),
      topLosers: losers.slice(0, 10),
      top10,
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function getStockDetail(
  symbol: string
): Promise<StockDetailData | null> {
  const cacheKey = `finance:stock:${symbol}`;
  return cache.wrap(cacheKey, FINANCE_CACHE_TTL, async () => {
    try {
      const raw = await fetchQuote(symbol);
      const quote = toStockQuote(raw);
      if (!quote) return null;

      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);

      const chartResult = await yahooFinance.chart(symbol, {
        period1: start,
        period2: end,
        interval: "1d",
      });

      const chart: StockChartPoint[] = (chartResult.quotes ?? [])
        .filter((p) => p.close != null)
        .map((p) => ({
          date: new Date(p.date).toISOString().slice(0, 10),
          close: p.close as number,
        }));

      return { quote, chart };
    } catch {
      return null;
    }
  });
}
