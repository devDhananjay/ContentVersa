import type { IndexQuote } from "./types";
import { NIFTY_INDEX, SENSEX_INDEX } from "./constants";

const NSE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.nseindia.com/",
};

const BSE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  Referer: "https://www.bseindia.com/",
};

function parseIndianNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

async function fetchWithCookies(
  warmupUrl: string,
  apiUrl: string,
  headers: Record<string, string>
): Promise<Response> {
  const jar = new Map<string, string>();

  const warmup = await fetch(warmupUrl, { headers, redirect: "follow" });
  for (const cookie of warmup.headers.getSetCookie?.() ?? []) {
    const [pair] = cookie.split(";");
    const [name, ...rest] = pair.split("=");
    if (name && rest.length) jar.set(name.trim(), rest.join("=").trim());
  }

  const cookieHeader = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  return fetch(apiUrl, {
    headers: cookieHeader ? { ...headers, Cookie: cookieHeader } : headers,
    cache: "no-store",
  });
}

type NseIndexRow = {
  index?: string;
  last?: number;
  variation?: number;
  percentChange?: number;
};

type BseSensexRow = {
  ltp?: string;
  chg?: string;
  perchg?: string;
  Prev_Close?: string;
};

export async function fetchNiftyFromNse(): Promise<IndexQuote | null> {
  try {
    const res = await fetchWithCookies(
      "https://www.nseindia.com/",
      "https://www.nseindia.com/api/allIndices",
      NSE_HEADERS
    );
    if (!res.ok) return null;

    const body = (await res.json()) as { data?: NseIndexRow[] };
    const row = body.data?.find((r) => r.index === "NIFTY 50");
    if (!row?.last) return null;

    return {
      symbol: NIFTY_INDEX,
      name: "Nifty 50",
      price: row.last,
      change: row.variation ?? 0,
      changePercent: row.percentChange ?? 0,
    };
  } catch {
    return null;
  }
}

export async function fetchSensexFromBse(): Promise<IndexQuote | null> {
  try {
    const res = await fetchWithCookies(
      "https://www.bseindia.com/",
      "https://api.bseindia.com/RealTimeBseIndiaAPI/api/GetSensexData/w",
      BSE_HEADERS
    );
    if (!res.ok) return null;

    const body = (await res.json()) as BseSensexRow[];
    const row = Array.isArray(body) ? body[0] : null;
    if (!row?.ltp) return null;

    return {
      symbol: SENSEX_INDEX,
      name: "Sensex",
      price: parseIndianNumber(row.ltp),
      change: parseIndianNumber(row.chg),
      changePercent: parseIndianNumber(row.perchg),
    };
  } catch {
    return null;
  }
}

export async function fetchIndianIndices(): Promise<{
  nifty: IndexQuote;
  sensex: IndexQuote;
} | null> {
  const [nifty, sensex] = await Promise.all([
    fetchNiftyFromNse(),
    fetchSensexFromBse(),
  ]);

  if (!nifty || !sensex) return null;
  return { nifty, sensex };
}
