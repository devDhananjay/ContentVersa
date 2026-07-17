/**
 * India petrol/diesel prices by city.
 *
 * Primary: Goodreturns public city price tables (free, no API key).
 * Fallback: bundled metro snapshot so the tool never fully breaks.
 */
export type FuelRate = {
  fuel: string;
  price: number;
};

export type CityFuelPrice = {
  city: string;
  state: string;
  date?: string;
  rates: FuelRate[];
  source?: string;
};

const PETROL_URL = "https://www.goodreturns.in/petrol-price.html";
const DIESEL_URL = "https://www.goodreturns.in/diesel-price.html";

/** Metro snapshot — PPAC / public retail rates (updated periodically). */
const FALLBACK_METROS: CityFuelPrice[] = [
  {
    city: "New Delhi",
    state: "Delhi",
    date: "2026-07-16",
    source: "PPAC / IOCL (metro RSP)",
    rates: [
      { fuel: "Petrol", price: 102.12 },
      { fuel: "Diesel", price: 95.2 },
    ],
  },
  {
    city: "Delhi",
    state: "Delhi",
    date: "2026-07-16",
    source: "PPAC / IOCL (metro RSP)",
    rates: [
      { fuel: "Petrol", price: 102.12 },
      { fuel: "Diesel", price: 95.2 },
    ],
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 105.66 },
      { fuel: "Diesel", price: 92.72 },
    ],
  },
  {
    city: "Kolkata",
    state: "West Bengal",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 105.41 },
      { fuel: "Diesel", price: 92.76 },
    ],
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 101.81 },
      { fuel: "Diesel", price: 93.78 },
    ],
  },
  {
    city: "Bangalore",
    state: "Karnataka",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 102.86 },
      { fuel: "Diesel", price: 90.45 },
    ],
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 109.66 },
      { fuel: "Diesel", price: 97.82 },
    ],
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 96.04 },
      { fuel: "Diesel", price: 89.0 },
    ],
  },
  {
    city: "Pune",
    state: "Maharashtra",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 105.41 },
      { fuel: "Diesel", price: 91.86 },
    ],
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 105.53 },
      { fuel: "Diesel", price: 91.26 },
    ],
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 96.56 },
      { fuel: "Diesel", price: 89.6 },
    ],
  },
  {
    city: "Chandigarh",
    state: "Chandigarh",
    date: "2026-07-16",
    source: "Public metro RSP snapshot",
    rates: [
      { fuel: "Petrol", price: 97.95 },
      { fuel: "Diesel", price: 87.91 },
    ],
  },
];

let cache: { at: number; cities: CityFuelPrice[] } | null = null;
const CACHE_MS = 3 * 60 * 60 * 1000;

function parseCityPriceRows(html: string): Map<string, number> {
  const map = new Map<string, number>();
  // title="City">City</a></td> ... &#x20b9;PRICE or ₹PRICE
  const re =
    /title="([^"]+)">[^<]*<\/a><\/td>\s*<td[^>]*>\s*(?:&#x20b9;|₹|&\#8377;)\s*([\d.]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const city = m[1].trim();
    const price = Number(m[2]);
    if (city && !Number.isNaN(price)) map.set(city, price);
  }
  return map;
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "ContentVerseFuelBot/1.0 (+https://contentverse.co.in; fuel price lookup)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 10800 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function guessState(city: string): string {
  const c = city.toLowerCase();
  const map: Record<string, string> = {
    delhi: "Delhi",
    "new delhi": "Delhi",
    mumbai: "Maharashtra",
    pune: "Maharashtra",
    nagpur: "Maharashtra",
    nashik: "Maharashtra",
    kolkata: "West Bengal",
    chennai: "Tamil Nadu",
    coimbatore: "Tamil Nadu",
    bangalore: "Karnataka",
    bengaluru: "Karnataka",
    mysore: "Karnataka",
    mysuru: "Karnataka",
    hyderabad: "Telangana",
    ahmedabad: "Gujarat",
    surat: "Gujarat",
    vadodara: "Gujarat",
    jaipur: "Rajasthan",
    lucknow: "Uttar Pradesh",
    noida: "Uttar Pradesh",
    gurgaon: "Haryana",
    gurugram: "Haryana",
    chandigarh: "Chandigarh",
    patna: "Bihar",
    bhubaneswar: "Odisha",
    "thiruvananthapuram": "Kerala",
    trivandrum: "Kerala",
  };
  return map[c] ?? "India";
}

async function loadLiveFuelData(): Promise<CityFuelPrice[] | null> {
  const [petrolHtml, dieselHtml] = await Promise.all([
    fetchHtml(PETROL_URL),
    fetchHtml(DIESEL_URL),
  ]);
  if (!petrolHtml && !dieselHtml) return null;

  const petrol = petrolHtml ? parseCityPriceRows(petrolHtml) : new Map();
  const diesel = dieselHtml ? parseCityPriceRows(dieselHtml) : new Map();
  const cities = new Set([...petrol.keys(), ...diesel.keys()]);
  if (cities.size === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const out: CityFuelPrice[] = [];
  for (const city of cities) {
    const rates: FuelRate[] = [];
    const p = petrol.get(city);
    const d = diesel.get(city);
    if (p != null) rates.push({ fuel: "Petrol", price: p });
    if (d != null) rates.push({ fuel: "Diesel", price: d });
    if (!rates.length) continue;
    out.push({
      city,
      state: guessState(city),
      date: today,
      rates,
      source: "Goodreturns public fuel tables",
    });
  }
  return out;
}

async function loadFuelData(): Promise<CityFuelPrice[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.cities;

  const live = await loadLiveFuelData();
  const cities =
    live && live.length > 0
      ? live
      : FALLBACK_METROS.map((c) => ({ ...c, rates: [...c.rates] }));

  if (!live?.length) {
    console.warn("[fuel-price] live fetch failed — using metro snapshot fallback");
  }

  cache = { at: Date.now(), cities };
  return cities;
}

export async function searchFuelPrices(query: string, limit = 25): Promise<CityFuelPrice[]> {
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
    cities.find((x) => x.city.toLowerCase().includes(c)) ??
    null
  );
}
