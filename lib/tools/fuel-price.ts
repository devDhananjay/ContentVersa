export type FuelRate = {
  fuel: string;
  price: number;
};

export type CityFuelPrice = {
  city: string;
  state: string;
  date?: string;
  rates: FuelRate[];
};

type OrizEntry = {
  city?: string;
  state?: string;
  petrol?: number | string;
  diesel?: number | string;
  date?: string;
};

type OrizPayload = {
  updated?: string;
  data?: OrizEntry[];
  cities?: OrizEntry[];
};

const FUEL_JSON_URL =
  "https://raw.githubusercontent.com/chirag127/oriz-india-petrol-diesel-api/main/data/latest.json";

let cache: { at: number; cities: CityFuelPrice[] } | null = null;
const CACHE_MS = 6 * 60 * 60 * 1000;

async function loadFuelData(): Promise<CityFuelPrice[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.cities;

  const res = await fetch(FUEL_JSON_URL, { next: { revalidate: 21600 } });
  if (!res.ok) throw new Error("Fuel price data unavailable");

  const raw = (await res.json()) as OrizPayload | OrizEntry[];
  const list = Array.isArray(raw) ? raw : raw.data ?? raw.cities ?? [];

  const cities: CityFuelPrice[] = list
    .filter((e) => e.city && e.state)
    .map((e) => {
      const rates: FuelRate[] = [];
      if (e.petrol != null) rates.push({ fuel: "Petrol", price: Number(e.petrol) });
      if (e.diesel != null) rates.push({ fuel: "Diesel", price: Number(e.diesel) });
      return {
        city: String(e.city),
        state: String(e.state),
        date: e.date,
        rates: rates.filter((r) => !Number.isNaN(r.price)),
      };
    })
    .filter((c) => c.rates.length > 0);

  cache = { at: Date.now(), cities };
  return cities;
}

export async function searchFuelPrices(query: string, limit = 20): Promise<CityFuelPrice[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const cities = await loadFuelData();
  return cities
    .filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export async function getFuelPriceByCity(
  city: string,
  state?: string
): Promise<CityFuelPrice | null> {
  const cities = await loadFuelData();
  const c = city.trim().toLowerCase();
  const s = state?.trim().toLowerCase();
  return (
    cities.find(
      (x) =>
        x.city.toLowerCase() === c &&
        (!s || x.state.toLowerCase() === s || x.state.toLowerCase().includes(s))
    ) ??
    cities.find((x) => x.city.toLowerCase() === c) ??
    null
  );
}
