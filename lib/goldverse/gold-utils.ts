import type { GoldRateRow } from "./types";

/** Typical India city benchmarks (₹ per 10g) — used when no live API key is set. */
export const INDICATIVE_GOLD_RATES: GoldRateRow[] = [
  { city: "Mumbai", gold24k: 74820, gold22k: 68550, gold18k: 56115 },
  { city: "Delhi", gold24k: 74950, gold22k: 68670, gold18k: 56210 },
  { city: "Chennai", gold24k: 75100, gold22k: 68810, gold18k: 56325 },
  { city: "Kolkata", gold24k: 74780, gold22k: 68510, gold18k: 56085 },
  { city: "Bangalore", gold24k: 74860, gold22k: 68590, gold18k: 56145 },
  { city: "Hyderabad", gold24k: 74840, gold22k: 68570, gold18k: 56130 },
  { city: "Pune", gold24k: 74830, gold22k: 68560, gold18k: 56122 },
  { city: "Ahmedabad", gold24k: 74790, gold22k: 68520, gold18k: 56092 },
  { city: "Jaipur", gold24k: 74810, gold22k: 68540, gold18k: 56108 },
  { city: "Surat", gold24k: 74770, gold22k: 68500, gold18k: 56078 },
  { city: "Lucknow", gold24k: 74850, gold22k: 68580, gold18k: 56138 },
  { city: "Chandigarh", gold24k: 74870, gold22k: 68600, gold18k: 56152 },
  { city: "Kochi", gold24k: 75120, gold22k: 68830, gold18k: 56340 },
  { city: "Indore", gold24k: 74800, gold22k: 68530, gold18k: 56100 },
  { city: "Nagpur", gold24k: 74795, gold22k: 68525, gold18k: 56096 },
  { city: "Patna", gold24k: 74825, gold22k: 68555, gold18k: 56118 },
  { city: "Bhopal", gold24k: 74805, gold22k: 68535, gold18k: 56104 },
  { city: "Visakhapatnam", gold24k: 74835, gold22k: 68565, gold18k: 56126 },
  { city: "Coimbatore", gold24k: 75090, gold22k: 68800, gold18k: 56318 },
];

export const GOLD_CARATS = [
  { id: "24k", label: "24K", subtitle: "99.9% pure", purity: 1 },
  { id: "22k", label: "22K", subtitle: "91.6% (BIS 916)", purity: 0.916 },
  { id: "20k", label: "20K", subtitle: "83.3%", purity: 0.833 },
  { id: "18k", label: "18K", subtitle: "75% (BIS 750)", purity: 0.75 },
  { id: "14k", label: "14K", subtitle: "58.5%", purity: 0.585 },
] as const;

export type GoldCaratId = (typeof GOLD_CARATS)[number]["id"];

export const GOLD_PRICE_SOURCE_NOTE = {
  "5paisa":
    "India retail rates (per 10g) from 5paisa — city-wise 22K & 24K gold prices.",
  yahoo:
    "International gold (GC=F) × USD/INR — fallback when India feed is unavailable.",
  api: "Live spot gold (XAU/INR) via MetalpriceAPI.",
  indicative:
    "Offline benchmark rates — live feeds unavailable. Confirm with your jeweller.",
} as const;

/** City-wise ₹ spread vs Mumbai (typical local variation). */
export function cityGoldSpreads(): { city: string; spread: number }[] {
  const base = INDICATIVE_GOLD_RATES[0]?.gold24k ?? 0;
  return INDICATIVE_GOLD_RATES.map((r) => ({
    city: r.city,
    spread: r.gold24k - base,
  }));
}

export function roundGold10g(value: number) {
  return Math.round(value);
}

export function rowWithCarats(gold24k: number, city: string): GoldRateRow {
  return {
    city,
    gold24k,
    gold22k: roundGold10g(gold24k * 0.916),
    gold18k: roundGold10g(gold24k * 0.75),
  };
}

export function ratePer10gForCarat(gold24k: number, purity: number): number {
  return roundGold10g(gold24k * purity);
}

export function calculateGoldAmount(ratePer10g: number, grams: number): number {
  if (grams <= 0 || ratePer10g <= 0) return 0;
  return Math.round((ratePer10g / 10) * grams);
}

export function searchGoldCities(rates: GoldRateRow[], query: string): GoldRateRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rates;
  return rates.filter((r) => r.city.toLowerCase().includes(q));
}

export function findGoldCity(rates: GoldRateRow[], city: string): GoldRateRow | null {
  const q = city.trim().toLowerCase();
  return rates.find((r) => r.city.toLowerCase() === q) ?? null;
}

/** Per 10g rate using stored city values when available (22K/18K from India feed). */
export function ratePer10gFromRow(row: GoldRateRow, caratId: GoldCaratId): number {
  if (caratId === "24k") return row.gold24k;
  if (caratId === "22k") return row.gold22k;
  if (caratId === "18k") return row.gold18k;
  const meta = GOLD_CARATS.find((c) => c.id === caratId);
  return ratePer10gForCarat(row.gold24k, meta?.purity ?? 1);
}

export function perGram(ratePer10g: number): number {
  return Math.round(ratePer10g / 10);
}
