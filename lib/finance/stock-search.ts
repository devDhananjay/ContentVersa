import { NIFTY50_SYMBOLS, TOP10_STOCKS } from "@/lib/finance/constants";
import { displaySymbol, resolveFinanceSymbol } from "@/lib/finance/transformers";

export type StockSearchResult = {
  symbol: string;
  label: string;
  hint?: string;
};

type StockEntry = {
  symbol: string;
  label: string;
  hint?: string;
  aliases: string[];
};

const SYMBOL_META: Record<string, { hint?: string; aliases?: string[] }> = {
  "TMPV.NS": {
    hint: "Tata Motors (Passenger / JLR)",
    aliases: ["TATAMOTORS", "TATA MOTORS", "TATA MOTORS PV", "TATAMOTOR"],
  },
  "TMCV.NS": {
    hint: "Tata Motors (Commercial Vehicles)",
    aliases: ["TATA MOTORS CV", "TATA MOTORS COMMERCIAL"],
  },
};

const DIRECTORY: StockEntry[] = [
  ...new Set([...NIFTY50_SYMBOLS, ...TOP10_STOCKS]),
].map((symbol) => {
  const meta = SYMBOL_META[symbol];
  return {
    symbol,
    label: displaySymbol(symbol),
    hint: meta?.hint,
    aliases: meta?.aliases ?? [],
  };
});

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function scoreEntry(entry: StockEntry, q: string): number {
  const label = entry.label.toUpperCase();
  const symbol = entry.symbol.toUpperCase();
  let score = 0;

  if (label === q) score = 100;
  else if (label.startsWith(q)) score = 80;
  else if (label.includes(q)) score = 60;
  else if (symbol.includes(q)) score = 40;

  for (const alias of entry.aliases) {
    const a = alias.toUpperCase();
    if (a === q) score = Math.max(score, 95);
    else if (a.startsWith(q)) score = Math.max(score, 85);
    else if (a.includes(q)) score = Math.max(score, 70);
    else if (q.length >= 4 && levenshtein(a, q) <= 2) score = Math.max(score, 65);
  }

  if (score === 0 && q.length >= 4) {
    if (levenshtein(label, q) <= 2) score = 55;
    else if (label.length > q.length && levenshtein(label.slice(0, q.length + 1), q) <= 2) {
      score = 50;
    }
  }

  return score;
}

/** Search Nifty 50 / featured stocks by symbol, alias, or close typo match. */
export function searchFinanceStocks(query: string, limit = 10): StockSearchResult[] {
  const q = query.trim().toUpperCase().replace(/\s+/g, " ");
  const compact = q.replace(/\s+/g, "");
  if (compact.length < 1) return [];

  const queries = compact === q ? [compact] : [compact, q.replace(/\s+/g, "")];

  const scored = DIRECTORY.flatMap((row) => {
    const score = Math.max(...queries.map((item) => scoreEntry(row, item)));
    return score > 0 ? [{ row, score }] : [];
  });

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.row.label.localeCompare(b.row.label) ||
      a.row.symbol.localeCompare(b.row.symbol)
  );

  const seen = new Set<string>();
  const results: StockSearchResult[] = [];

  for (const { row } of scored) {
    if (seen.has(row.symbol)) continue;
    seen.add(row.symbol);
    results.push({
      symbol: row.symbol,
      label: row.label,
      hint: row.hint,
    });
    if (results.length >= limit) break;
  }

  return results;
}

export function isKnownFinanceSymbol(symbolInput: string): boolean {
  const resolved = resolveFinanceSymbol(symbolInput);
  return DIRECTORY.some((row) => row.symbol === resolved);
}
