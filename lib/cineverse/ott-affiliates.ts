import type { StreamingProvider } from "./types";

/** TMDB provider_id → India affiliate / search URLs */
const PROVIDER_LINKS: Record<
  number,
  { name: string; logoPath: string; buildUrl: (title: string) => string }
> = {
  8: {
    name: "Netflix",
    logoPath: "/t/p/original/t2yyOv40HZJ1J9ASOk2gjH94v1R.png",
    buildUrl: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
  },
  119: {
    name: "Prime Video",
    logoPath: "/t/p/original/emthp39XA2YScoYL1p0sdbAW2l4.png",
    buildUrl: (t) =>
      `https://www.primevideo.com/search/ref=atv_sr?q=${encodeURIComponent(t)}`,
  },
  122: {
    name: "Disney+ Hotstar",
    logoPath: "/t/p/original/dme0zaz4jlxbk6p8oitpnt3uyik.png",
    buildUrl: (t) =>
      `https://www.hotstar.com/in/search?q=${encodeURIComponent(t)}`,
  },
  232: {
    name: "ZEE5",
    logoPath: "/t/p/original/2Epg89qZlDrlf9apmxY1fCXvNXI.png",
    buildUrl: (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}`,
  },
  237: {
    name: "Sony LIV",
    logoPath: "/t/p/original/6HmGW1-4b2oi3NR4NGiY0t2fcAW.png",
    buildUrl: (t) =>
      `https://www.sonyliv.com/search?searchPayload=${encodeURIComponent(t)}`,
  },
  350: {
    name: "Apple TV",
    logoPath: "/t/p/original/peURlLlr8yggUNiwIrXxGyFgIqX.png",
    buildUrl: (t) =>
      `https://tv.apple.com/in/search?term=${encodeURIComponent(t)}`,
  },
  315: {
    name: "JioCinema",
    logoPath: "/t/p/original/8z7rwc8UdM1XjiND4O4Zot5U1QZ.png",
    buildUrl: (t) =>
      `https://www.jiocinema.com/search/${encodeURIComponent(t)}`,
  },
};

type TmdbProviderRow = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

function mapProvider(
  row: TmdbProviderRow,
  movieTitle: string,
  type: StreamingProvider["type"]
): StreamingProvider | null {
  const known = PROVIDER_LINKS[row.provider_id];
  const name = known?.name ?? row.provider_name;
  const logoUrl = row.logo_path
    ? `https://image.tmdb.org/t/p/w92${row.logo_path}`
    : known?.logoPath
      ? `https://image.tmdb.org/t/p/w92${known.logoPath}`
      : undefined;

  const watchUrl = known
    ? known.buildUrl(movieTitle)
    : `https://www.google.com/search?q=${encodeURIComponent(`${movieTitle} watch online India`)}`;

  return {
    id: row.provider_id,
    name,
    logoUrl,
    type,
    watchUrl,
  };
}

export function parseTmdbWatchProviders(
  data: {
    results?: Record<
      string,
      {
        flatrate?: TmdbProviderRow[];
        rent?: TmdbProviderRow[];
        buy?: TmdbProviderRow[];
      }
    >;
  },
  movieTitle: string,
  region = "IN"
): StreamingProvider[] {
  const regionData = data.results?.[region];
  if (!regionData) return [];

  const out: StreamingProvider[] = [];
  const seen = new Set<number>();

  for (const row of regionData.flatrate ?? []) {
    if (seen.has(row.provider_id)) continue;
    seen.add(row.provider_id);
    const p = mapProvider(row, movieTitle, "stream");
    if (p) out.push(p);
  }
  for (const row of regionData.rent ?? []) {
    if (seen.has(row.provider_id)) continue;
    seen.add(row.provider_id);
    const p = mapProvider(row, movieTitle, "rent");
    if (p) out.push(p);
  }

  return out.slice(0, 8);
}

/** Generic JustWatch-style search fallback */
export function justWatchSearchUrl(title: string) {
  return `https://www.justwatch.com/in/search?q=${encodeURIComponent(title)}`;
}
