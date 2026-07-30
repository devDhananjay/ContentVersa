import { cache } from "@/lib/redis";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const TROY_OZ_GRAMS = 31.1034768;
const SILVER_FUTURES = "SI=F";
const USD_INR = "INR=X";
const CACHE_KEY = "goldverse:silver:yahoo";
const CACHE_TTL = 300;

export type SilverPriceSnapshot = {
  perGram: number;
  per10g: number;
  perKg: number;
  usdPerOz: number;
  usdInr: number;
  currency: "INR";
  updatedAt: string;
  source: "yahoo" | "indicative";
};

/** Offline fallback ≈ ₹/g when feeds fail (updated periodically). */
const INDICATIVE_SILVER_PER_GRAM = 95;

export async function getSilverPriceSnapshot(): Promise<SilverPriceSnapshot> {
  const hit = await cache.get<SilverPriceSnapshot>(CACHE_KEY);
  if (hit) return hit;

  try {
    const [silver, inr] = await Promise.all([
      yahooFinance.quote(SILVER_FUTURES),
      yahooFinance.quote(USD_INR),
    ]);
    const usdPerOz = silver.regularMarketPrice;
    const usdInr = inr.regularMarketPrice;
    if (usdPerOz && usdInr && usdPerOz > 0 && usdInr > 0) {
      const perGram = Math.round(((usdPerOz * usdInr) / TROY_OZ_GRAMS) * 100) / 100;
      const snapshot: SilverPriceSnapshot = {
        perGram,
        per10g: Math.round(perGram * 10),
        perKg: Math.round(perGram * 1000),
        usdPerOz,
        usdInr,
        currency: "INR",
        updatedAt: new Date().toISOString(),
        source: "yahoo",
      };
      await cache.set(CACHE_KEY, snapshot, CACHE_TTL);
      return snapshot;
    }
  } catch {
    /* fall through */
  }

  const perGram = INDICATIVE_SILVER_PER_GRAM;
  return {
    perGram,
    per10g: perGram * 10,
    perKg: perGram * 1000,
    usdPerOz: 0,
    usdInr: 0,
    currency: "INR",
    updatedAt: new Date().toISOString(),
    source: "indicative",
  };
}
