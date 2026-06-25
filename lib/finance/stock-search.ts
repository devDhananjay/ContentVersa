import { NIFTY50_SYMBOLS, TOP10_STOCKS } from "@/lib/finance/constants";
import { displaySymbol } from "@/lib/finance/transformers";

export type StockSearchResult = {
  symbol: string;
  label: string;
};

const DIRECTORY: StockSearchResult[] = [
  ...new Set([...NIFTY50_SYMBOLS, ...TOP10_STOCKS]),
].map((symbol) => ({
  symbol,
  label: displaySymbol(symbol),
}));

/** Search Nifty 50 / featured stocks by symbol or company ticker prefix. */
export function searchFinanceStocks(query: string, limit = 10): StockSearchResult[] {
  const q = query.trim().toUpperCase().replace(/\s+/g, "");
  if (q.length < 1) return [];

  const scored = DIRECTORY.map((row) => {
    const label = row.label.toUpperCase();
    let score = 0;
    if (label === q) score = 100;
    else if (label.startsWith(q)) score = 80;
    else if (label.includes(q)) score = 60;
    else if (row.symbol.toUpperCase().includes(q)) score = 40;
    return { row, score };
  }).filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score || a.row.label.localeCompare(b.row.label));

  return scored.slice(0, limit).map((item) => item.row);
}

export function isKnownFinanceSymbol(symbolInput: string): boolean {
  const normalized = symbolInput.trim().toUpperCase();
  if (!normalized) return false;
  const withSuffix = normalized.endsWith(".NS") ? normalized : `${normalized}.NS`;
  return DIRECTORY.some((row) => row.symbol === withSuffix || row.label === normalized);
}
