import YahooFinance from "yahoo-finance2";
import { cache } from "@/lib/redis";
import type { GoldRateRow } from "./types";
import { cityGoldSpreads, roundGold10g, rowWithCarats } from "./gold-utils";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

/** Troy ounce → grams */
const TROY_OZ_GRAMS = 31.1034768;

const GOLD_FUTURES = "GC=F";
const USD_INR = "INR=X";
const CACHE_KEY = "goldverse:gold:yahoo";
const CACHE_TTL = 300;

export type YahooGoldSpot = {
  goldUsdPerOz: number;
  usdInr: number;
  base24kPer10g: number;
};

export async function fetchYahooGoldSpot(): Promise<YahooGoldSpot | null> {
  try {
    const [gold, inr] = await Promise.all([
      yahooFinance.quote(GOLD_FUTURES),
      yahooFinance.quote(USD_INR),
    ]);

    const goldUsdPerOz = gold.regularMarketPrice;
    const usdInr = inr.regularMarketPrice;

    if (!goldUsdPerOz || !usdInr || goldUsdPerOz <= 0 || usdInr <= 0) {
      return null;
    }

    const inrPerGram24k = (goldUsdPerOz * usdInr) / TROY_OZ_GRAMS;
    const base24kPer10g = roundGold10g(inrPerGram24k * 10);

    return { goldUsdPerOz, usdInr, base24kPer10g };
  } catch {
    return null;
  }
}

export async function fetchYahooGoldRatesCached(): Promise<{
  rates: GoldRateRow[];
  spot: YahooGoldSpot;
} | null> {
  const hit = await cache.get<{ rates: GoldRateRow[]; spot: YahooGoldSpot }>(CACHE_KEY);
  if (hit) return hit;

  const spot = await fetchYahooGoldSpot();
  if (!spot) return null;

  const rates = cityGoldSpreads().map(({ city, spread }) =>
    rowWithCarats(spot.base24kPer10g + spread, city)
  );

  const payload = { rates, spot };
  await cache.set(CACHE_KEY, payload, CACHE_TTL);
  return payload;
}
