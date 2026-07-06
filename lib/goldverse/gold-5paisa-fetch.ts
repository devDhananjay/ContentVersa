import type { GoldRateRow } from "./types";
import { roundGold10g } from "./gold-utils";

const FIVEPAISA_GOLD_HOME =
  "https://www.5paisa.com/commodity-trading/gold-rate-today";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; ContentVerse/1.0; +https://contentverse.co.in/goldverse)",
  Accept: "text/html,application/json",
};

/** Indian grouping e.g. 1,46,730 → 146730 */
function parseInr10g(value: string): number {
  const n = parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

const CITY_ROW_RE =
  /<a[^>]*>([^<]+)<\/a><\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/gi;

function parseCityRows(html: string): GoldRateRow[] {
  const rows: GoldRateRow[] = [];
  let match: RegExpExecArray | null;
  CITY_ROW_RE.lastIndex = 0;
  while ((match = CITY_ROW_RE.exec(html)) !== null) {
    const city = match[1].trim();
    const gold24k = parseInr10g(match[2]);
    const gold22k = parseInr10g(match[3]);
    if (!city || !gold24k || !gold22k) continue;
    rows.push({
      city,
      gold24k,
      gold22k,
      gold18k: roundGold10g(gold24k * 0.75),
    });
  }
  return rows;
}

function parseInitialCityTable(html: string): GoldRateRow[] {
  const marker = 'id="all-city-table"';
  const start = html.indexOf(marker);
  if (start === -1) return [];

  const tbodyStart = html.indexOf("<tbody>", start);
  const tbodyEnd = html.indexOf("</tbody>", tbodyStart);
  if (tbodyStart === -1 || tbodyEnd === -1) return [];

  return parseCityRows(html.slice(tbodyStart, tbodyEnd));
}

async function fetchLoadMorePage(page: number): Promise<string> {
  const url = `https://www.5paisa.com/gold-rates/load-more?page=${page}&url=/commodity-trading/gold-rate-today`;
  const res = await fetch(url, { headers: FETCH_HEADERS, cache: "no-store" });
  if (!res.ok) return "";
  const json = (await res.json()) as { html?: string };
  return json.html ?? "";
}

function dedupeByCity(rows: GoldRateRow[]): GoldRateRow[] {
  const byCity = new Map<string, GoldRateRow>();
  for (const row of rows) {
    byCity.set(row.city.toLowerCase(), row);
  }
  return [...byCity.values()].sort((a, b) => a.city.localeCompare(b.city));
}

/**
 * India retail gold rates from 5paisa (per 10g on source).
 * National page + paginated city table (~300+ cities).
 */
export async function fetch5paisaGoldRates(): Promise<GoldRateRow[] | null> {
  try {
    const res = await fetch(FIVEPAISA_GOLD_HOME, {
      headers: FETCH_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const initial = parseInitialCityTable(html);

    const pages = Array.from({ length: 40 }, (_, i) => i + 1);
    const chunks = await Promise.all(pages.map((page) => fetchLoadMorePage(page)));

    const merged = dedupeByCity([
      ...initial,
      ...chunks.flatMap((chunk) => (chunk ? parseCityRows(chunk) : [])),
    ]);

    return merged.length >= 10 ? merged : null;
  } catch {
    return null;
  }
}
