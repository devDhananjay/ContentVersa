import { isSportsApiConfigured } from "./cricbuzz-client";
import { SPORTS_CACHE } from "./cache-keys";
import {
  getSportsCacheSyncedAt,
  getSportsDbCache,
  logSportsSyncRun,
  setSportsDbCache,
} from "./db-cache";
import { formatQuotaMessage, getQuotaStatus } from "./quota";
import { rebuildPlayerIndexFromCache } from "./sync-helpers";
import { syncEndpoint } from "./sync-shared";

export {
  isRateLimitError,
  isMonthlyQuotaError,
} from "./sync-shared";

/** Basic plan: ~6 calls/day → 180/month with buffer (200 hard limit). */
const SYNC_DELAY_MS = Number(process.env.SPORTS_SYNC_DELAY_MS ?? 1500);
const MAX_CALLS_PER_RUN = Number(process.env.SPORTS_SYNC_MAX_CALLS ?? 1);

const COOLDOWN_KEY = "sports:sync:cooldown";
const CURSOR_KEY = "sports:sync:cursor";

/** Ordered by importance — hub first, then lists, then stats. */
const PRIORITY_QUEUE: { key: string; path: string; staleMs: number }[] = [
  { key: SPORTS_CACHE.live.key, path: "/matches/v1/live", staleMs: 30 * 60_000 },
  {
    key: SPORTS_CACHE.upcoming.key,
    path: "/matches/v1/upcoming",
    staleMs: 6 * 3600_000,
  },
  {
    key: SPORTS_CACHE.recent.key,
    path: "/matches/v1/recent",
    staleMs: 6 * 3600_000,
  },
  { key: SPORTS_CACHE.news.key, path: "/news/v1/index", staleMs: 6 * 3600_000 },
  {
    key: SPORTS_CACHE.schedule.key,
    path: "/schedule/v1/international",
    staleMs: 24 * 3600_000,
  },
  {
    key: SPORTS_CACHE.teams.key,
    path: "/teams/v1/international",
    staleMs: 24 * 3600_000,
  },
  {
    key: SPORTS_CACHE.series.key,
    path: "/series/v1/international",
    staleMs: 24 * 3600_000,
  },
  {
    key: SPORTS_CACHE.rankings("odi").key,
    path: "/stats/v1/rankings/batsmen?formatType=odi",
    staleMs: 7 * 24 * 3600_000,
  },
  {
    key: SPORTS_CACHE.rankings("t20").key,
    path: "/stats/v1/rankings/batsmen?formatType=t20",
    staleMs: 7 * 24 * 3600_000,
  },
  {
    key: SPORTS_CACHE.rankings("test").key,
    path: "/stats/v1/rankings/batsmen?formatType=test",
    staleMs: 7 * 24 * 3600_000,
  },
  {
    key: SPORTS_CACHE.trendingPlayers.key,
    path: "/stats/v1/player/trending",
    staleMs: 24 * 3600_000,
  },
];

async function isInRateLimitCooldown(): Promise<boolean> {
  const row = await getSportsDbCache<{ until?: string }>(COOLDOWN_KEY);
  if (!row?.until) return false;
  return new Date(row.until).getTime() > Date.now();
}

async function setRateLimitCooldown(ms = 3600_000): Promise<void> {
  await setSportsDbCache(COOLDOWN_KEY, "meta", {
    until: new Date(Date.now() + ms).toISOString(),
  });
}

async function getSyncCursor(): Promise<number> {
  const row = await getSportsDbCache<{ index?: number }>(CURSOR_KEY);
  return row?.index ?? 0;
}

async function setSyncCursor(index: number): Promise<void> {
  await setSportsDbCache(CURSOR_KEY, "meta", { index });
}

function isCacheFresh(syncedAt: Date | null, staleMs: number): boolean {
  if (!syncedAt) return false;
  return Date.now() - syncedAt.getTime() < staleMs;
}

async function syncRotatingQueue(
  errors: string[],
  synced: { count: number }
): Promise<"ok" | "rate_limited" | "quota_exhausted"> {
  let cursor = await getSyncCursor();
  let calls = 0;
  let scanned = 0;
  const maxScan = PRIORITY_QUEUE.length * 2;

  while (calls < MAX_CALLS_PER_RUN && scanned < maxScan) {
    const ep = PRIORITY_QUEUE[cursor % PRIORITY_QUEUE.length];
    cursor += 1;
    scanned += 1;

    const syncedAt = await getSportsCacheSyncedAt(ep.key);
    if (isCacheFresh(syncedAt, ep.staleMs)) continue;

    const result = await syncEndpoint(ep.key, ep.path, errors, SYNC_DELAY_MS);

    if (result === "ok") {
      synced.count += 1;
      calls += 1;
    } else if (result === "quota_exhausted") {
      await setSyncCursor(cursor % PRIORITY_QUEUE.length);
      return "quota_exhausted";
    } else if (result === "rate_limited") {
      await setRateLimitCooldown();
      await setSyncCursor(cursor % PRIORITY_QUEUE.length);
      return "rate_limited";
    }
  }

  await setSyncCursor(cursor % PRIORITY_QUEUE.length);
  return "ok";
}

export interface SportsSyncResult {
  ok: boolean;
  status: "success" | "partial" | "failed" | "skipped";
  endpoints: number;
  errors: string[];
  durationMs: number;
  message?: string;
  quota?: Awaited<ReturnType<typeof getQuotaStatus>>;
}

export async function syncSportsData(): Promise<SportsSyncResult> {
  const started = Date.now();
  const errors: string[] = [];
  const synced = { count: 0 };
  const quota = await getQuotaStatus();

  if (!isSportsApiConfigured()) {
    return {
      ok: false,
      status: "failed",
      endpoints: 0,
      errors: ["RAPIDAPI_KEY is not configured"],
      durationMs: Date.now() - started,
      quota,
    };
  }

  if (quota.monthExhausted) {
    await rebuildPlayerIndexFromCache();
    return {
      ok: true,
      status: "skipped",
      endpoints: 0,
      errors: [],
      durationMs: Date.now() - started,
      quota,
      message: `Monthly API quota exhausted (${formatQuotaMessage(quota)}). Using cached DB data until next month.`,
    };
  }

  if (await isInRateLimitCooldown()) {
    await rebuildPlayerIndexFromCache();
    return {
      ok: true,
      status: "skipped",
      endpoints: 0,
      errors: [],
      durationMs: Date.now() - started,
      quota,
      message: "Hourly rate limit cooldown — using cached DB data.",
    };
  }

  const outcome = await syncRotatingQueue(errors, synced);
  await rebuildPlayerIndexFromCache();

  const finalQuota = await getQuotaStatus();
  const durationMs = Date.now() - started;

  let message: string | undefined;
  if (outcome === "quota_exhausted") {
    message = `Monthly quota reached (${formatQuotaMessage(finalQuota)}). Cached data served until reset.`;
  } else if (outcome === "rate_limited") {
    message = `Hourly limit hit after ${synced.count} call(s). Will retry later.`;
  } else if (synced.count === 0) {
    message = "All priority endpoints fresh in DB — no API calls needed.";
  }

  const status: SportsSyncResult["status"] =
    outcome === "rate_limited" && synced.count === 0
      ? "failed"
      : outcome === "quota_exhausted" && synced.count === 0
        ? "skipped"
        : errors.length === 0
          ? "success"
          : synced.count > 0
            ? "partial"
            : "failed";

  await logSportsSyncRun({
    status: status === "skipped" ? "partial" : status,
    endpoints: synced.count,
    errors,
    durationMs,
  });

  return {
    ok: status !== "failed",
    status,
    endpoints: synced.count,
    errors,
    durationMs,
    message,
    quota: finalQuota,
  };
}
