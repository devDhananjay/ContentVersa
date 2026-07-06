import type { GoldPriceSnapshot } from "./types";
import { fetch5paisaGoldRates } from "./gold-5paisa-fetch";
import {
  INDICATIVE_GOLD_RATES,
  roundGold10g,
  rowWithCarats,
} from "./gold-utils";
import { fetchYahooGoldRatesCached } from "./gold-yahoo";
import { cache } from "@/lib/redis";

const INDIA_CACHE_KEY = "jewellers:gold:5paisa";
const INDIA_CACHE_TTL = 1800;

async function fetchIndiaGoldCached(): Promise<GoldPriceSnapshot | null> {
  const hit = await cache.get<GoldPriceSnapshot>(INDIA_CACHE_KEY);
  if (hit) return hit;

  const rates = await fetch5paisaGoldRates();
  if (!rates?.length) return null;

  const snapshot: GoldPriceSnapshot = {
    rates,
    unit: "per 10g",
    currency: "INR",
    updatedAt: new Date().toISOString(),
    source: "5paisa",
  };

  await cache.set(INDIA_CACHE_KEY, snapshot, INDIA_CACHE_TTL);
  return snapshot;
}

/** India retail gold rates (per 10g) via 5paisa. */
export async function getGoldPriceSnapshot(): Promise<GoldPriceSnapshot> {
  const india = await fetchIndiaGoldCached();
  if (india) return india;

  const yahoo = await fetchYahooGoldRatesCached();
  if (yahoo) {
    return {
      rates: yahoo.rates,
      unit: "per 10g",
      currency: "INR",
      updatedAt: new Date().toISOString(),
      source: "yahoo",
    };
  }

  const apiKey = process.env.METALPRICE_API_KEY?.trim();
  const base =
    process.env.METALPRICE_API_BASE?.trim() || "https://api.metalpriceapi.com/v1";

  if (apiKey) {
    try {
      const url = `${base}/latest?api_key=${apiKey}&base=INR&currencies=XAU`;
      const res = await fetch(url, { next: { revalidate: 1800 } });
      if (res.ok) {
        const json = (await res.json()) as { rates?: { XAU?: number } };
        const xauInr = json.rates?.XAU;
        if (xauInr && xauInr > 0) {
          const perGram24k = 1 / xauInr;
          const per10g24k = roundGold10g(perGram24k * 10);
          const rates = INDICATIVE_GOLD_RATES.map((row) => {
            const spread = row.gold24k - INDICATIVE_GOLD_RATES[0].gold24k;
            return rowWithCarats(per10g24k + spread, row.city);
          });
          return {
            rates,
            unit: "per 10g",
            currency: "INR",
            updatedAt: new Date().toISOString(),
            source: "api",
          };
        }
      }
    } catch {
      /* fall through */
    }
  }

  return {
    rates: INDICATIVE_GOLD_RATES,
    unit: "per 10g",
    currency: "INR",
    updatedAt: new Date().toISOString(),
    source: "indicative",
  };
}
