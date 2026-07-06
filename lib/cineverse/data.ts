import { cache } from "@/lib/redis";
import { fetchCineverseHubData } from "./tmdb-hub";
import type { CineverseHubData } from "./types";

const HUB_CACHE_KEY = "cineverse:hub:v1";
const HUB_TTL = 900;

const EMPTY_HUB: CineverseHubData = {
  trending: [],
  nowPlaying: [],
  upcoming: [],
  updatedAt: new Date().toISOString(),
};

export async function getCineverseHubDataCached(): Promise<CineverseHubData> {
  const cached = await cache.get<CineverseHubData>(HUB_CACHE_KEY);
  if (cached) return cached;

  try {
    const data = await fetchCineverseHubData();
    await cache.set(HUB_CACHE_KEY, data, HUB_TTL);
    return data;
  } catch {
    return EMPTY_HUB;
  }
}
