import { isDatabaseConfigured } from "@/lib/prisma";
import { cache as redisCache } from "@/lib/redis";
import { getSportsDbCache, isSportsDbReady } from "./db-cache";
import { scheduleSportsSync } from "./auto-sync";
import { cricbuzzFetch, SportsApiError } from "./cricbuzz-client";

export function isSportsDbCacheEnabled(): boolean {
  return (
    isDatabaseConfigured() && process.env.SPORTS_DISABLE_DB_CACHE !== "1"
  );
}

async function useDbSportsCache(): Promise<boolean> {
  if (!isSportsDbCacheEnabled()) return false;
  return isSportsDbReady();
}

async function fetchWithStaleCache<T>(
  key: string,
  ttl: number,
  staleTtl: number,
  loader: () => Promise<T>
): Promise<T> {
  const staleKey = `${key}:stale`;
  try {
    const value = await redisCache.wrap(key, ttl, loader);
    await redisCache.set(staleKey, value as object, staleTtl);
    return value;
  } catch (err) {
    const stale = await redisCache.get<T>(staleKey);
    if (stale !== null && stale !== undefined) return stale;
    throw err;
  }
}

/**
 * Reads sports API payload from DB (synced hourly). User-facing code never
 * calls RapidAPI when DB cache is enabled.
 */
export async function readSportsPayload<T>(
  cacheKey: string,
  ttl: number,
  staleTtl: number,
  loader: () => Promise<T>
): Promise<T | null> {
  if (await useDbSportsCache()) {
    const cached = await getSportsDbCache<T>(cacheKey);
    if (cached !== null) return cached;

    scheduleSportsSync("cache-miss");

    if (process.env.SPORTS_ALLOW_LIVE_FALLBACK === "1") {
      const value = await loader();
      const { setSportsDbCache } = await import("./db-cache");
      await setSportsDbCache(cacheKey, "live-fallback", value);
      return value;
    }

    return null;
  }

  try {
    return await fetchWithStaleCache(cacheKey, ttl, staleTtl, loader);
  } catch {
    return null;
  }
}

export async function requireSportsPayload<T>(
  cacheKey: string,
  ttl: number,
  staleTtl: number,
  loader: () => Promise<T>
): Promise<T> {
  const data = await readSportsPayload(cacheKey, ttl, staleTtl, loader);
  if (data === null) {
    throw new SportsApiError(
      "Sports data is syncing automatically. Please refresh in a minute.",
      503
    );
  }
  return data;
}
