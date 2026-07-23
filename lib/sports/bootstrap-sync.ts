import { isSportsApiConfigured } from "./cricbuzz-client";
import { SPORTS_CACHE } from "./cache-keys";
import {
  getSportsDbCache,
  logSportsSyncRun,
  setSportsDbCache,
} from "./db-cache";
import {
  formatQuotaMessage,
  getQuotaStatus,
} from "./quota";
import { rebuildPlayerIndexFromCache } from "./sync-helpers";
import { syncEndpoint, type SyncStepResult } from "./sync-shared";
import {
  parseMatchesResponse,
  parseNewsIndex,
  parseSeriesList,
  parseTeamPlayers,
  parseTeamsList,
  parseTrendingPlayers,
} from "./transformers";

const BOOTSTRAP_CURSOR_KEY = "sports:sync:bootstrap-cursor";
const SYNC_DELAY_MS = Number(process.env.SPORTS_SYNC_DELAY_MS ?? 1500);

/** Max calls per bootstrap run — spread 200/month across several days. */
const BOOTSTRAP_MAX_CALLS = Number(process.env.SPORTS_BOOTSTRAP_MAX_CALLS ?? 15);

const STATIC_ENDPOINTS = [
  { key: SPORTS_CACHE.live.key, path: "/matches/v1/live" },
  { key: SPORTS_CACHE.upcoming.key, path: "/matches/v1/upcoming" },
  { key: SPORTS_CACHE.recent.key, path: "/matches/v1/recent" },
  { key: SPORTS_CACHE.news.key, path: "/news/v1/index" },
  { key: SPORTS_CACHE.schedule.key, path: "/schedule/v1/international" },
  { key: SPORTS_CACHE.teams.key, path: "/teams/v1/international" },
  { key: SPORTS_CACHE.series.key, path: "/series/v1/international" },
  {
    key: SPORTS_CACHE.rankings("test").key,
    path: "/stats/v1/rankings/batsmen?formatType=test",
  },
  {
    key: SPORTS_CACHE.rankings("odi").key,
    path: "/stats/v1/rankings/batsmen?formatType=odi",
  },
  {
    key: SPORTS_CACHE.rankings("t20").key,
    path: "/stats/v1/rankings/batsmen?formatType=t20",
  },
  {
    key: SPORTS_CACHE.trendingPlayers.key,
    path: "/stats/v1/player/trending",
  },
];

interface BootstrapCursor {
  phase: 1 | 2;
  index: number;
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values.filter((n) => Number.isFinite(n) && n > 0))];
}

function collectMatchIds(raw: unknown): number[] {
  if (!raw) return [];
  return uniqueNumbers(parseMatchesResponse(raw).map((m) => m.id));
}

function dedupeEndpoints(
  endpoints: { key: string; path: string }[]
): { key: string; path: string }[] {
  const seen = new Set<string>();
  return endpoints.filter((ep) => {
    if (seen.has(ep.key)) return false;
    seen.add(ep.key);
    return true;
  });
}

async function buildDynamicEndpoints(): Promise<{ key: string; path: string }[]> {
  const endpoints: { key: string; path: string }[] = [];

  const liveRaw = await getSportsDbCache(SPORTS_CACHE.live.key);
  const upcomingRaw = await getSportsDbCache(SPORTS_CACHE.upcoming.key);
  const recentRaw = await getSportsDbCache(SPORTS_CACHE.recent.key);
  const newsRaw = await getSportsDbCache(SPORTS_CACHE.news.key);
  const seriesRaw = await getSportsDbCache(SPORTS_CACHE.series.key);
  const teamsRaw = await getSportsDbCache(SPORTS_CACHE.teams.key);
  const trendingRaw = await getSportsDbCache(SPORTS_CACHE.trendingPlayers.key);

  const matchIds = uniqueNumbers(
    [
      ...collectMatchIds(liveRaw),
      ...collectMatchIds(upcomingRaw),
      ...collectMatchIds(recentRaw),
    ].slice(0, 5)
  );

  for (const id of matchIds) {
    endpoints.push(
      { key: SPORTS_CACHE.matchDetail(id).key, path: `/mcenter/v1/${id}` },
      {
        key: SPORTS_CACHE.matchScorecard(id).key,
        path: `/mcenter/v1/${id}/scard`,
      }
    );
  }

  if (newsRaw) {
    for (const id of uniqueNumbers(
      parseNewsIndex(newsRaw).slice(0, 12).map((n) => n.id)
    )) {
      endpoints.push({
        key: SPORTS_CACHE.newsDetail(id).key,
        path: `/news/v1/detail/${id}`,
      });
    }
  }

  if (seriesRaw) {
    for (const seriesId of uniqueNumbers(
      parseSeriesList(seriesRaw).map((s) => s.id)
    ).slice(0, 3)) {
      endpoints.push({
        key: SPORTS_CACHE.seriesDetail(seriesId).key,
        path: `/series/v1/${seriesId}`,
      });
    }
  }

  if (teamsRaw) {
    for (const teamId of uniqueNumbers(
      parseTeamsList(teamsRaw).map((t) => t.id)
    ).slice(0, 5)) {
      endpoints.push({
        key: SPORTS_CACHE.teamPlayers(teamId).key,
        path: `/teams/v1/${teamId}/players`,
      });
    }
  }

  if (trendingRaw) {
    for (const p of parseTrendingPlayers(trendingRaw).slice(0, 3)) {
      endpoints.push({
        key: SPORTS_CACHE.playerProfile(p.id).key,
        path: `/stats/v1/player/${p.id}`,
      });
    }
  }

  if (teamsRaw) {
    for (const team of parseTeamsList(teamsRaw).slice(0, 3)) {
      const playersRaw = await getSportsDbCache(
        SPORTS_CACHE.teamPlayers(team.id).key
      );
      if (!playersRaw) continue;
      for (const p of parseTeamPlayers(playersRaw).slice(0, 2)) {
        endpoints.push({
          key: SPORTS_CACHE.playerProfile(p.id).key,
          path: `/stats/v1/player/${p.id}`,
        });
      }
    }
  }

  return dedupeEndpoints(endpoints);
}

async function getBootstrapCursor(): Promise<BootstrapCursor> {
  const row = await getSportsDbCache<BootstrapCursor>(BOOTSTRAP_CURSOR_KEY);
  return row ?? { phase: 1, index: 0 };
}

async function setBootstrapCursor(cursor: BootstrapCursor): Promise<void> {
  await setSportsDbCache(BOOTSTRAP_CURSOR_KEY, "meta", cursor);
}

async function syncQueueWithQuotaCap(
  queue: { key: string; path: string }[],
  startIndex: number,
  force: boolean,
  maxCalls: number,
  errors: string[],
  stats: { synced: number; skipped: number },
  onProgress?: (index: number) => Promise<void>
): Promise<{ nextIndex: number; complete: boolean; stopped: SyncStepResult | "ok" }> {
  let index = startIndex;
  let calls = 0;

  while (index < queue.length && calls < maxCalls) {
    const ep = queue[index];

    if (!force) {
      const existing = await getSportsDbCache(ep.key);
      if (existing !== null) {
        stats.skipped += 1;
        index += 1;
        await onProgress?.(index);
        continue;
      }
    }

    const result: SyncStepResult = await syncEndpoint(
      ep.key,
      ep.path,
      errors,
      SYNC_DELAY_MS
    );

    if (result === "ok") {
      stats.synced += 1;
      calls += 1;
      index += 1;
      await onProgress?.(index);
      continue;
    }

    if (result === "quota_exhausted" || result === "rate_limited") {
      await onProgress?.(index);
      return { nextIndex: index, complete: false, stopped: result };
    }

    index += 1;
    calls += 1;
    await onProgress?.(index);
  }

  return {
    nextIndex: index,
    complete: index >= queue.length,
    stopped: "ok",
  };
}

export interface BootstrapSyncResult {
  ok: boolean;
  synced: number;
  skipped: number;
  total: number;
  errors: string[];
  durationMs: number;
  complete: boolean;
  quotaMessage?: string;
}

export async function syncSportsBootstrap(options?: {
  force?: boolean;
}): Promise<BootstrapSyncResult> {
  const started = Date.now();
  const errors: string[] = [];
  const stats = { synced: 0, skipped: 0 };
  const force = options?.force ?? process.env.SPORTS_BOOTSTRAP_FORCE === "1";

  const quotaBefore = await getQuotaStatus();
  if (!isSportsApiConfigured()) {
    return {
      ok: false,
      synced: 0,
      skipped: 0,
      total: 0,
      errors: ["RAPIDAPI_KEY is not configured"],
      durationMs: Date.now() - started,
      complete: false,
    };
  }

  if (quotaBefore.monthExhausted) {
    return {
      ok: false,
      synced: 0,
      skipped: 0,
      total: 0,
      errors: [`Monthly quota exhausted (${formatQuotaMessage(quotaBefore)})`],
      durationMs: Date.now() - started,
      complete: false,
      quotaMessage: formatQuotaMessage(quotaBefore),
    };
  }

  const budget = Math.min(quotaBefore.monthRemaining, BOOTSTRAP_MAX_CALLS);
  let callsLeft = budget;

  let cursor = await getBootstrapCursor();
  let phase = cursor.phase;
  let index = cursor.index;
  let complete = false;

  if (phase === 1 && callsLeft > 0) {
    const syncedBefore = stats.synced;
    const staticResult = await syncQueueWithQuotaCap(
      STATIC_ENDPOINTS,
      index,
      force,
      callsLeft,
      errors,
      stats,
      async (i) => setBootstrapCursor({ phase: 1, index: i })
    );
    index = staticResult.nextIndex;
    callsLeft -= stats.synced - syncedBefore;

    if (staticResult.stopped !== "ok" || !staticResult.complete) {
      await rebuildPlayerIndexFromCache();
      const quota = await getQuotaStatus();
      return {
        ...(await finishBootstrap(
          started,
          stats,
          errors,
          false,
          STATIC_ENDPOINTS.length
        )),
        quotaMessage: formatQuotaMessage(quota),
      };
    }

    phase = 2;
    index = 0;
  }

  const dynamicQueue = await buildDynamicEndpoints();
  const total = STATIC_ENDPOINTS.length + dynamicQueue.length;

  if (phase === 2 && callsLeft > 0) {
    const syncedBefore = stats.synced;
    const dynamicResult = await syncQueueWithQuotaCap(
      dynamicQueue,
      index,
      force,
      callsLeft,
      errors,
      stats,
      async (i) => setBootstrapCursor({ phase: 2, index: i })
    );

    callsLeft -= stats.synced - syncedBefore;
    complete = dynamicResult.complete && dynamicResult.stopped === "ok";

    if (complete) {
      await setBootstrapCursor({ phase: 1, index: 0 });
    } else {
      await setBootstrapCursor({ phase: 2, index: dynamicResult.nextIndex });
    }
  }

  await rebuildPlayerIndexFromCache();
  const quota = await getQuotaStatus();
  return {
    ...(await finishBootstrap(started, stats, errors, complete, total)),
    quotaMessage: formatQuotaMessage(quota),
  };
}

async function finishBootstrap(
  started: number,
  stats: { synced: number; skipped: number },
  errors: string[],
  complete: boolean,
  total: number
): Promise<BootstrapSyncResult> {
  const durationMs = Date.now() - started;
  const quota = await getQuotaStatus();

  await logSportsSyncRun({
    status: complete ? "success" : stats.synced > 0 ? "partial" : "failed",
    endpoints: stats.synced,
    errors,
    durationMs,
  });

  return {
    ok: stats.synced > 0 || complete,
    synced: stats.synced,
    skipped: stats.skipped,
    total,
    errors,
    durationMs,
    complete,
    quotaMessage: formatQuotaMessage(quota),
  };
}

export async function getBootstrapQueueSize(): Promise<number> {
  return STATIC_ENDPOINTS.length + (await buildDynamicEndpoints()).length;
}

export function estimateBootstrapDays(totalEndpoints: number): number {
  return Math.ceil(totalEndpoints / BOOTSTRAP_MAX_CALLS);
}
